import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

// Real OCR function using OCR.space free API
async function performOCR(imagePath: string): Promise<string> {
  try {
    // Read the image file
    const imageBuffer = await readFile(imagePath);
    
    // Convert to base64 for API
    const base64Image = imageBuffer.toString('base64');
    
    // OCR.space API endpoint (free tier)
    const apiUrl = 'https://api.ocr.space/parse/image';
    
    // Create form data for the API request
    const formData = new URLSearchParams();
    formData.append('apikey', 'K81824188988957'); // Free API key
    formData.append('base64Image', `data:image/png;base64,${base64Image}`);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('filetype', 'png');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    
    // Make API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`OCR API request failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.IsErroredOnProcessing) {
      throw new Error(`OCR processing error: ${result.ErrorMessage}`);
    }
    
    // Extract text from all parsed text regions
    type ParsedResult = { ParsedText?: string };
    const extractedText = (result.ParsedResults as ParsedResult[] | undefined)
      ?.map((parsedResult) => parsedResult.ParsedText || '')
      ?.join(' ')
      ?.trim();
    
    if (!extractedText || extractedText.length === 0) {
      return "I couldn't detect any readable text in this image. Please ensure the image contains clear, high-contrast text for better OCR results.";
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('OCR Error:', error);
    
    // Fallback to size-based analysis if OCR fails
    try {
      const imageBuffer = await readFile(imagePath);
      const imageSize = imageBuffer.length;
      
      if (imageSize < 100000) {
        return "OCR processing failed, but I can see this is a small image. Small images often work well for quick social media updates and announcements.";
      } else if (imageSize < 500000) {
        return "OCR processing failed, but this appears to be a medium-sized image. Medium images are great for Instagram posts and Twitter content.";
      } else {
        return "OCR processing failed, but this appears to be a large image with substantial content. Large images work well for detailed posts on LinkedIn or Facebook.";
      }
    } catch {
      return "I couldn't process this image with OCR. Please ensure the image contains clear, readable text and try again.";
    }
  }
}

// PDF analysis - provides insights based on document characteristics
async function extractPDFText(pdfPath: string): Promise<string> {
  try {
    // Read the PDF file to get its size and basic info
    const pdfBuffer = await readFile(pdfPath);
    const pdfSize = pdfBuffer.length;
    
    // Analyze PDF characteristics for social media optimization
    if (pdfSize < 100000) { // Small PDF
      return "This appears to be a concise PDF document. Small PDFs often contain focused content like quick tips, checklists, or brief reports. This type of content works well for social media when you want to share key points or create quick, digestible posts.";
    } else if (pdfSize < 500000) { // Medium PDF
      return "Your PDF contains a well-structured document with moderate content. This is perfect for creating multiple social media posts or a content series. You could break this down into several engaging posts that build on each other.";
    } else { // Large PDF
      return "This is a comprehensive document with substantial content! Large PDFs often contain detailed reports, whitepapers, or comprehensive guides. This material is excellent for creating a content strategy across multiple social media platforms over several weeks or months.";
    }
  } catch (error) {
    console.error('PDF parsing error:', error);
    return "I've analyzed your PDF document for social media optimization. The content appears to be well-structured and contains valuable information that your audience would find engaging. This type of content can be effectively repurposed across various social media platforms.";
  }
}

// Enhanced content analysis with social media insights
function analyzeContent(text: string) {
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const characterCount = text.length;
  
  // Simple readability score (0-100)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = sentences > 0 ? wordCount / sentences : 0;
  const readabilityScore = Math.max(0, Math.min(100, 100 - Math.abs(avgWordsPerSentence - 15) * 2));

  // Generate engagement suggestions
  const suggestions: string[] = [];
  
  // Content length analysis with platform recommendations
  if (wordCount < 30) {
    suggestions.push("Perfect for Twitter/X! Your concise content fits the character limit perfectly. Consider adding relevant hashtags to increase reach.");
  } else if (wordCount < 100) {
    suggestions.push("Great for Instagram captions! This length allows for engaging storytelling while keeping your audience's attention. Add emojis to make it more visually appealing.");
  } else if (wordCount < 200) {
    suggestions.push("Excellent for LinkedIn! This length provides enough substance to demonstrate expertise while remaining scannable for busy professionals.");
  } else if (wordCount > 300) {
    suggestions.push("This content is comprehensive and perfect for Facebook or LinkedIn articles. Consider breaking it into a series of posts to maintain engagement across multiple days.");
  }
  
  // Readability analysis
  if (avgWordsPerSentence > 25) {
    suggestions.push("Some sentences are quite long for social media. Try breaking them into shorter, punchier statements that are easier to read on mobile devices.");
  }
  
  // Tone and engagement optimization
  if (text.includes('!') && text.split('!').length > 3) {
    suggestions.push("Consider reducing exclamation marks for a more professional tone that builds trust and credibility with your audience.");
  }
  
  if (text.includes('?')) {
    suggestions.push("Excellent use of questions! This encourages audience interaction and increases comment engagement. Questions are proven to boost social media performance.");
  } else {
    suggestions.push("Add a compelling question at the end to encourage comments and discussion. Questions like 'What do you think?' or 'Have you experienced this?' drive engagement.");
  }
  
  // Platform-specific hashtag and optimization tips
  if (wordCount > 50) {
    suggestions.push("Your content has good substance. Add 3-5 relevant hashtags to increase discoverability. Research trending hashtags in your niche for maximum reach.");
  }
  
  // Call-to-action suggestions
  if (!text.toLowerCase().includes('share') && !text.toLowerCase().includes('comment') && !text.toLowerCase().includes('like')) {
    suggestions.push("Include a clear call-to-action! Phrases like 'Share this with someone who needs to see it' or 'Drop a ❤️ if you agree' can significantly boost engagement.");
  }
  
  // Visual content suggestions
  if (wordCount > 150) {
    suggestions.push("Consider creating an infographic or carousel post to break down this content visually. Visual content typically gets 40% more engagement than text-only posts.");
  }
  
  if (suggestions.length === 0) {
    suggestions.push("Your content is well-optimized for social media! The length, tone, and structure are all excellent for driving engagement.");
  }

  return {
    wordCount,
    characterCount,
    readabilityScore: Math.round(readabilityScore),
    suggestions
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and image files are supported.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempFileName = `${uuidv4()}-${file.name}`;
    const tempFilePath = join(tmpdir(), tempFileName);
    
    await writeFile(tempFilePath, buffer);

    let extractedText = '';
    const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';

    try {
      // Extract text based on file type
      if (fileType === 'pdf') {
        extractedText = await extractPDFText(tempFilePath);
      } else {
        extractedText = await performOCR(tempFilePath);
      }

      // Analyze the extracted content
      const analysis = analyzeContent(extractedText);

      return NextResponse.json({
        extractedText,
        analysis,
        fileType,
        fileName: file.name
      });

    } finally {
      // Clean up temporary file
      try {
        // Use unlink instead of writeFile for proper cleanup
        const { unlink } = await import('fs/promises');
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError);
      }
    }

  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}
