import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync } from 'fs';

export const runtime = 'nodejs';

// Inline fallback (paste your OpenRouter key locally if env fails)
// Do NOT commit real keys
const INLINE_OPENROUTER_API_KEY = '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';

// OCR via OCR.space (same approach as basic route, simplified)
async function performOCR(imagePath: string): Promise<string> {
  try {
    const imageBuffer = await readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const apiUrl = 'https://api.ocr.space/parse/image';

    const formData = new URLSearchParams();
    formData.append('apikey', 'K81824188988957');
    formData.append('base64Image', `data:image/png;base64,${base64Image}`);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('filetype', 'png');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`OCR API request failed: ${response.status}`);
    const result = await response.json();
    if (result.IsErroredOnProcessing) throw new Error(`OCR processing error: ${result.ErrorMessage}`);

    const extractedText = result.ParsedResults?.map((x: any) => x.ParsedText)?.join(' ')?.trim();
    return extractedText && extractedText.length > 0 ? extractedText : '';
  } catch {
    return '';
  }
}

async function extractPDFText(pdfPath: string): Promise<string> {
  try {
    const pdfBuffer = await readFile(pdfPath);
    const pdfSize = pdfBuffer.length;
    if (pdfSize < 100000) {
      return 'Concise PDF detected. Likely focused content (tips/checklists). Great for short social posts.';
    } else if (pdfSize < 500000) {
      return 'Medium-sized PDF detected. Suitable for a multi-post content series across platforms.';
    }
    return 'Large PDF detected. Likely rich, detailed content. Ideal for long-form posts and multi-week strategy.';
  } catch {
    return '';
  }
}

function analyzeContent(text: string) {
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const characterCount = text.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = sentences > 0 ? wordCount / sentences : 0;
  const readabilityScore = Math.max(0, Math.min(100, 100 - Math.abs(avgWordsPerSentence - 15) * 2));

  const suggestions: string[] = [];
  if (wordCount < 30) suggestions.push('Perfect for Twitter/X. Add 2-3 relevant hashtags.');
  else if (wordCount < 100) suggestions.push('Great for Instagram captions. Add emojis for appeal.');
  else if (wordCount < 200) suggestions.push('Strong for LinkedIn posts. Keep paragraphs short.');
  else if (wordCount > 300) suggestions.push('Consider a multi-part series or carousel for better engagement.');
  if (avgWordsPerSentence > 25) suggestions.push('Break long sentences into punchier lines for mobile readability.');
  if (text.includes('?')) suggestions.push('Good use of a question to drive comments.');
  else suggestions.push('End with a question to boost comments and discussion.');
  if (wordCount > 50) suggestions.push('Add 3-5 niche hashtags to increase discoverability.');
  if (!/(share|comment|like)/i.test(text)) suggestions.push('Include a clear CTA (Share/Comment/Like).');

  return { wordCount, characterCount, readabilityScore: Math.round(readabilityScore), suggestions };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempFileName = `${uuidv4()}-${file.name}`;
    const tempFilePath = join(tmpdir(), tempFileName);
    await writeFile(tempFilePath, buffer);

    const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';
    let extractedText = '';
    if (fileType === 'pdf') extractedText = await extractPDFText(tempFilePath);
    else extractedText = await performOCR(tempFilePath);

    // Cleanup best-effort
    try { const { unlink } = await import('fs/promises'); await unlink(tempFilePath); } catch {}

    // Resolve OpenRouter API key (env + fallbacks)
    let openrouterApiKey = process.env.OPENROUTER_API_KEY as string | undefined;
    if (!openrouterApiKey) {
      try {
        const content = readFileSync(join(process.cwd(), '.env.local'), 'utf8');
        const match = content.match(/^OPENROUTER_API_KEY=(.+)$/m);
        if (match?.[1]) openrouterApiKey = match[1].trim();
      } catch {}
      if (!openrouterApiKey) {
        try {
          const content = readFileSync('C:/Users/Priyansh/.env.local', 'utf8');
          const match = content.match(/^OPENROUTER_API_KEY=(.+)$/m);
          if (match?.[1]) openrouterApiKey = match[1].trim();
        } catch {}
      }
    }

    if (!openrouterApiKey && INLINE_OPENROUTER_API_KEY) {
      openrouterApiKey = INLINE_OPENROUTER_API_KEY;
    }

    if (!openrouterApiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const prompt = `Analyze this social media content for deep insights and optimization:\n\nContent: "${extractedText}"\nFile: ${file.name} (${fileType})\n\nPlease provide a comprehensive analysis including:\n\n1. Content Quality (0-100)\n2. Engagement Potential (0-100)\n3. Brand Voice\n4. Target Audience\n5. Platform-Specific Recommendations (Twitter, Instagram, LinkedIn, Facebook)\n6. Hashtag Strategy (5-10)\n7. Optimal Posting Times\n8. Improvement Suggestions (3-5)\n9. Competitive Analysis\n10. ROI Potential\n\nReturn valid JSON with keys: contentQualityScore, engagementPotentialScore, brandVoice, targetAudience, platformRecommendations { twitter, instagram, linkedin, facebook }, hashtagStrategy[], optimalPostingTimes[], improvementSuggestions[], competitiveAnalysis, roiPotential.`;

    const oaController = new AbortController();
    const oaTimeout = setTimeout(() => oaController.abort(), 60000);
    let oaRes: Response | null = null;
    let lastErrorText = '';
    const models = ['deepseek/deepseek-r1-0528:free'];
    for (let attempt = 0; attempt < 3; attempt++) {
      const model = models[Math.min(attempt, models.length - 1)];
      oaRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3002',
          'X-Title': 'Content Analyzer AI'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are an expert social media content analyst and strategist.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: 'json_object' }
        }),
        signal: oaController.signal
      });
      if (oaRes.ok) break;
      lastErrorText = await oaRes.text();
      if (oaRes.status === 429) {
        const delay = 800 * Math.pow(2, attempt);
        console.warn(`OpenRouter 429 (combined route), retrying in ${delay}ms (attempt ${attempt + 1}/3)`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      break;
    }
    clearTimeout(oaTimeout);

    if (!oaRes || !oaRes.ok) {
      const errorText = typeof lastErrorText === 'string' && lastErrorText.length ? lastErrorText : await oaRes?.text?.() ?? '';
      console.error('OpenRouter request failed (combined route):', oaRes?.status, errorText);
      return NextResponse.json({ error: `OpenRouter request failed: ${oaRes?.status} - ${errorText}` }, { status: 500 });
    }

    const data = await oaRes.json();
    const analysisText = data.choices?.[0]?.message?.content as string;
    let deepAnalysis: any;
    try { deepAnalysis = JSON.parse(analysisText); } catch { deepAnalysis = { rawAnalysis: analysisText }; }

    const basicAnalysis = analyzeContent(extractedText || '');

    return NextResponse.json({
      extractedText,
      analysis: basicAnalysis,
      deepAnalysis,
      fileType,
      fileName: file.name
    });
  } catch (err: any) {
    console.error('Deep analysis combined route error:', err);
    const message = typeof err?.message === 'string' ? err.message : 'Deep analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


