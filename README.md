# Content Analyzer AI

Next.js app that extracts text from PDFs/images and provides AI-powered optimization for social media content. Supports optional Deep Analysis via OpenRouter models.

## Features

- **File Upload**: Drag-and-drop interface for PDF and image files
- **Text Extraction**:
  - PDF heuristics-based text summary (fast-sized-based analysis)
  - Real OCR for images using OCR.space API
- **Content Analysis**: 
  - Word count and character count
  - Readability scoring
  - Engagement improvement suggestions
- **Deep Analysis (Optional)**:
  - One-click “Deep Analysis” toggle
  - Calls OpenRouter models (default: `openai/gpt-oss-20b:free`, fallback to `deepseek/deepseek-r1-0528:free`)
  - Robust retries and graceful UI fallbacks
- **Modern UI**: Clean, responsive, mobile-friendly (Tailwind CSS)

## Technical Approach

This project demonstrates a full-stack Next.js application with the following architecture:

- **Frontend**: React components with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes for file processing and AI calls
- **File Handling**: Temporary file storage with automatic cleanup
- **Error Handling**: Comprehensive validation and error states
- **Loading States**: User-friendly loading indicators

The current implementation includes:
- **PDF Analysis**: Smart PDF content analysis that provides social media optimization insights
- **Real OCR**: Text extraction from images using OCR.space free API
- **Content Analysis**: Optimization with platform-specific recommendations
- **Fallback Analysis**: Intelligent fallback when OCR fails, providing insights based on image characteristics

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd socialmediacontent-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open http://localhost:3002 (or whatever port your dev script uses) in your browser

### Environment Variables

Create one or more `.env.local` files with the following keys (single-line values, no quotes):

Required for Deep Analysis (OpenRouter):
```
OPENROUTER_API_KEY=sk-or-...your_key
SITE_URL=http://localhost:3002
```

Optional (Basic OCR for images):
```
OCR_API_KEY=your_ocr_space_key
```

Note: Some environments infer a parent workspace root. If your server logs don’t detect the key, also place `.env.local` at `C:\Users\<YourUser>\.env.local`.

## Usage

1. **Upload Content**: Drag and drop a PDF or image file onto the upload area
2. **File Validation**: The app validates file type and size (max 10MB)
3. **Analysis**: Click "Analyze Content" to process your file
4. **View Results**: See extracted text, statistics, and engagement suggestions

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts                # Basic OCR/PDF + analysis
│   │   ├── analyze-deep/route.ts       # Deep analysis given extracted text (OpenRouter)
│   │   └── analyze-deep-file/route.ts  # One-call deep analysis: file → OCR/PDF → OpenRouter
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page component
├── components/
│   ├── FileUpload.tsx            # File upload component
│   └── ContentAnalysis.tsx       # Results display component
├── package.json                  # Dependencies
└── README.md                     # This file
```

## API Endpoints

### POST /api/analyze

Processes uploaded files and returns analysis results.

Request: `multipart/form-data` with `file`
Response: JSON `{ extractedText, analysis, fileType, fileName }`

### POST /api/analyze-deep

Runs deep analysis on already-extracted text via OpenRouter.

Request: JSON `{ extractedText, fileName, fileType }`
Response: JSON `{ success: true, analysis: { ...deep fields } }`

### POST /api/analyze-deep-file

Uploads a file and performs OCR/PDF + OpenRouter in one go (recommended when Deep Analysis is toggled).

Request: `multipart/form-data` with `file`
Response: JSON `{ extractedText, analysis, deepAnalysis, fileType, fileName }`

## Future Enhancements

- Real PDF parsing with `pdf-parse` or `pdfjs`
- On-device OCR with `Tesseract.js` as an alternative
- Advanced content analysis (sentiment, keyword density)
- Social media platform-specific recommendations
- User authentication and content history
- Export functionality for analysis reports

## Technologies Used

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Node.js runtime)
- **File Handling**: Node.js fs/promises
- **PDF Processing**: pdf-parse library
- **UI Components**: react-dropzone for file uploads
 - **AI Providers**: OpenRouter (Chat Completions API)

## Deployment (Vercel)

1. Remove inline keys: ensure `INLINE_OPENROUTER_API_KEY` is empty in both deep routes.
2. Push to GitHub.
3. Import the repo in Vercel, framework auto-detects Next.js.
4. Add Environment Variables:
   - `OPENROUTER_API_KEY`
   - `OCR_API_KEY` (optional)
   - `SITE_URL` (e.g., `https://your-app.vercel.app`)
5. Deploy. You’ll get a live URL like `https://your-app.vercel.app`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or issues, please open an issue in the GitHub repository.
