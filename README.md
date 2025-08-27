# Social Media Content Analyzer

A Next.js application that analyzes social media content by extracting text from PDF documents and images, then provides engagement improvement suggestions.

## Features

- **File Upload**: Drag-and-drop interface for PDF and image files
- **Text Extraction**: 
  - PDF parsing (placeholder implementation)
  - OCR for images (placeholder implementation)
- **Content Analysis**: 
  - Word count and character count
  - Readability scoring
  - Engagement improvement suggestions
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Technical Approach

This project demonstrates a full-stack Next.js application with the following architecture:

- **Frontend**: React components with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes for file processing
- **File Handling**: Temporary file storage with automatic cleanup
- **Error Handling**: Comprehensive validation and error states
- **Loading States**: User-friendly loading indicators

The current implementation includes:
- **PDF Analysis**: Smart PDF content analysis that provides social media optimization insights
- **Real OCR**: Actual text extraction from images using OCR.space free API
- **Content Analysis**: Advanced social media optimization with platform-specific recommendations based on real extracted text
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

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload Content**: Drag and drop a PDF or image file onto the upload area
2. **File Validation**: The app validates file type and size (max 10MB)
3. **Analysis**: Click "Analyze Content" to process your file
4. **View Results**: See extracted text, statistics, and engagement suggestions

## Project Structure

```
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # File processing API
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

**Request**: FormData with a file field
**Response**: JSON with extracted text, analysis metrics, and suggestions

## Future Enhancements

- Real PDF parsing with `pdf-parse`
- OCR implementation with `Tesseract.js`
- Advanced content analysis (sentiment, keyword density)
- Social media platform-specific recommendations
- User authentication and content history
- Export functionality for analysis reports

## Technologies Used

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **File Handling**: Node.js fs/promises
- **PDF Processing**: pdf-parse library
- **UI Components**: react-dropzone for file uploads

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
