import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { DeepAnalysis } from '@/types';

// Ensure Node.js runtime so process.env and fs are available
export const runtime = 'nodejs';

// Inline fallback (paste your OpenRouter key below if env loading fails)
// Do NOT commit real keys. Keep this local.
const INLINE_OPENROUTER_API_KEY = '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';

export async function POST(request: NextRequest) {
  try {
    const { extractedText, fileName, fileType } = await request.json();
    
    if (!extractedText) {
      return NextResponse.json( 
        { error: 'No text provided for analysis' },
        { status: 400 }
      );
    }

    // Resolve OpenRouter API key from env with robust fallbacks
    let openrouterApiKey = process.env.OPENROUTER_API_KEY as string | undefined;
    if (!openrouterApiKey) {
      try {
        const tryPaths = [
          join(process.cwd(), '.env.local'),
          'C:/Users/Priyansh/.env.local',
          'C:/Users/Priyansh/Desktop/socialmediacontent/.env.local'
        ];
        for (const p of tryPaths) {
          try {
            const content = readFileSync(p, 'utf8');
            const match = content.match(/^OPENROUTER_API_KEY=(.+)$/m);
            if (match && match[1]) {
              openrouterApiKey = match[1].trim();
              break;
            }
          } catch {}
        }
      } catch {}
    }

    // Final inline fallback if nothing else worked
    if (!openrouterApiKey && INLINE_OPENROUTER_API_KEY) {
      openrouterApiKey = INLINE_OPENROUTER_API_KEY;
    }

    console.log('OpenRouter API Key exists:', !!openrouterApiKey);
    console.log('OpenRouter API Key length:', openrouterApiKey?.length);

    if (!openrouterApiKey) {
      console.error('OpenRouter API key not found from env or .env.local fallbacks');
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `Analyze this social media content for deep insights and optimization:

Content: "${extractedText}"
File: ${fileName} (${fileType})

Please provide a comprehensive analysis including:

1. **Content Quality Assessment** (0-100 score)
2. **Engagement Potential** (0-100 score)
3. **Brand Voice Analysis** (Professional, Casual, Friendly, etc.)
4. **Target Audience Identification**
5. **Platform-Specific Recommendations** (Twitter, Instagram, LinkedIn, Facebook)
6. **Hashtag Strategy** (suggest 5-10 relevant hashtags)
7. **Optimal Posting Time Suggestions**
8. **Content Improvement Suggestions** (3-5 specific recommendations)
9. **Competitive Analysis** (how it compares to similar content)
10. **ROI Potential** (estimated engagement rates)

Respond ONLY with a single JSON object and nothing else. No prose or explanations. Use this exact schema and valid JSON:
{
  "contentQualityScore": number,
  "engagementPotentialScore": number,
  "brandVoice": string,
  "targetAudience": string,
  "platformRecommendations": {
    "twitter": string,
    "instagram": string,
    "linkedin": string,
    "facebook": string
  },
  "hashtagStrategy": string[],
  "optimalPostingTimes": string[],
  "improvementSuggestions": string[],
  "competitiveAnalysis": string,
  "roiPotential": string
}`;

    // Retry up to 3 times on 429 rate-limit with exponential backoff
    let response: Response | null = null;
    const models = ['deepseek/deepseek-r1-0528:free','deepseek/deepseek-chat-v3.1:free'];
    let lastErrorText = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      const model = models[Math.min(attempt, models.length - 1)];
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3002',
          'X-Title': 'Content Analyzer AI'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are an expert social media content analyst and strategist. Provide detailed, actionable insights for content optimization.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: 'json_object' }
        })
      });
      if (response.ok) break;
      lastErrorText = await response.text();
      if (response.status === 429) {
        const delay = 800 * Math.pow(2, attempt);
        console.warn(`OpenRouter 429, retrying in ${delay}ms (attempt ${attempt + 1}/3)`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      break;
    }

    if (!response || !response.ok) {
      const errorText = typeof lastErrorText === 'string' && lastErrorText.length ? lastErrorText : await response?.text?.() ?? '';
      console.error('OpenRouter API request failed:', response?.status, errorText);
      throw new Error(`OpenRouter API request failed: ${response?.status} - ${errorText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content as string | undefined;

    if (!analysisText) {
      throw new Error('No analysis received from OpenAI');
    }

    // Robust JSON extraction and normalization
    const tryParseJson = (text: string): unknown => {
      try { return JSON.parse(text); } catch {}
      const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i)?.[1]
        || text.match(/```\s*([\s\S]*?)\s*```/i)?.[1];
      if (fenced) { try { return JSON.parse(fenced); } catch {} }
      const first = text.indexOf('{');
      const last = text.lastIndexOf('}');
      if (first !== -1 && last !== -1 && last > first) {
        const slice = text.slice(first, last + 1);
        try { return JSON.parse(slice); } catch {}
      }
      return { rawAnalysis: text } as unknown;
    };

    const clamp01 = (n: number) => Math.min(100, Math.max(0, Math.round(n)));
    const normalizeDeep = (input: unknown): DeepAnalysis => {
      const base: DeepAnalysis = {
        contentQualityScore: 0,
        engagementPotentialScore: 0,
        brandVoice: 'Unavailable',
        targetAudience: 'Unavailable',
        platformRecommendations: {
          twitter: 'Unavailable',
          instagram: 'Unavailable',
          linkedin: 'Unavailable',
          facebook: 'Unavailable'
        },
        hashtagStrategy: [],
        optimalPostingTimes: [],
        improvementSuggestions: [],
        competitiveAnalysis: 'Unavailable',
        roiPotential: 'Unavailable'
      };
      const src = (typeof input === 'object' && input) ? input as Record<string, unknown> : {};
      const num = (v: unknown) => (typeof v === 'number' ? v : (typeof v === 'string' ? Number(v) : 0));
      const str = (v: unknown) => (typeof v === 'string' ? v : 'Unavailable');
      const arrStr = (v: unknown) => Array.isArray(v) ? v.map(x => String(x)).filter(Boolean) : [];
      const pr = (v: unknown) => {
        const o = (typeof v === 'object' && v) ? v as Record<string, unknown> : {};
        return {
          twitter: str(o.twitter),
          instagram: str(o.instagram),
          linkedin: str(o.linkedin),
          facebook: str(o.facebook)
        };
      };
      return {
        contentQualityScore: clamp01(num(src.contentQualityScore)),
        engagementPotentialScore: clamp01(num(src.engagementPotentialScore)),
        brandVoice: str(src.brandVoice),
        targetAudience: str(src.targetAudience),
        platformRecommendations: pr(src.platformRecommendations),
        hashtagStrategy: arrStr(src.hashtagStrategy),
        optimalPostingTimes: arrStr(src.optimalPostingTimes),
        improvementSuggestions: arrStr(src.improvementSuggestions),
        competitiveAnalysis: str(src.competitiveAnalysis),
        roiPotential: str(src.roiPotential),
        ...(src.rawAnalysis ? { rawAnalysis: String(src.rawAnalysis) } : {})
      };
    };

    const parsed = tryParseJson(analysisText);
    const normalized = normalizeDeep(parsed);

    return NextResponse.json({
      success: true,
      analysis: normalized,
      fileName,
      fileType,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('Deep analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to perform deep analysis' },
      { status: 500 }
    );
  }
}
