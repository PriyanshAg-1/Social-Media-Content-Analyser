import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

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

Format the response as JSON with these exact keys:
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
    const models = ['deepseek/deepseek-r1-0528:free'];
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
    const analysisText = data.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No analysis received from OpenAI');
    }

    // Try to parse JSON response, fallback to text if needed
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      // If JSON parsing fails, return the raw text
      analysis = {
        rawAnalysis: analysisText,
        contentQualityScore: 75,
        engagementPotentialScore: 70,
        brandVoice: 'Professional',
        targetAudience: 'General audience',
        platformRecommendations: {
          twitter: 'Content analysis available',
          instagram: 'Content analysis available',
          linkedin: 'Content analysis available',
          facebook: 'Content analysis available'
        },
        hashtagStrategy: ['#content', '#socialmedia', '#analysis'],
        optimalPostingTimes: ['9 AM', '12 PM', '6 PM'],
        improvementSuggestions: ['Review the detailed analysis above'],
        competitiveAnalysis: 'Analysis provided in raw format',
        roiPotential: 'Moderate to high potential'
      };
    }

    return NextResponse.json({
      success: true,
      analysis,
      fileName,
      fileType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Deep analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to perform deep analysis' },
      { status: 500 }
    );
  }
}
