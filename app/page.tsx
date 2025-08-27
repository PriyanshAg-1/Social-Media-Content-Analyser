'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ContentAnalysis from '@/components/ContentAnalysis';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
    setIsLoading(false);
    setIsAnalyzing(false);
  };

  const handleAnalysisStart = () => {
    setIsLoading(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 isolate">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6">
        {/* Header Section */}
        <header className="text-center pt-10 sm:pt-16 pb-8 sm:pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-8 shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Content Analyzer
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-2">
              Transform your social media content with AI-powered analysis. 
              Get real-time insights, engagement tips, and platform-specific recommendations.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Real OCR Processing
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                AI Analysis
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
                Smart Recommendations
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-3 sm:px-4 pb-12 sm:pb-16">
          {/* File Upload Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 mb-6 sm:mb-8 overflow-hidden">
            <div className="p-4 sm:p-8">
              <FileUpload
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-12 text-center mb-8">
              <div className="relative">
                {/* Animated loading circles */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-purple-200/30 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-4 border-transparent border-t-pink-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                </div>
                
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {isAnalyzing ? 'Analyzing Your Content...' : 'Processing...'}
                </h3>
                
                <p className="text-gray-300 max-w-md mx-auto">
                  {isAnalyzing 
                    ? 'Our AI is extracting text and analyzing your content for social media optimization.'
                    : 'Preparing your file for analysis...'
                  }
                </p>
                
                {/* Progress indicators */}
                <div className="flex justify-center space-x-2 mt-6">
                  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isAnalyzing ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
                  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isAnalyzing ? 'bg-pink-500' : 'bg-gray-400'}`}></div>
                  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isAnalyzing ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <ContentAnalysis result={analysisResult} />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center py-8 text-gray-400">
          <p className="text-sm">
            Powered by OCR.space API • Built with Next.js & Tailwind CSS
          </p>
        </footer>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
