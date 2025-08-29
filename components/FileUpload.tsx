'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import type { AnalysisResult } from '@/types';

interface FileUploadProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export default function FileUpload({ onAnalysisStart, onAnalysisComplete }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDeepAnalysis, setIsDeepAnalysis] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('');
    const file = acceptedFiles[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid PDF or image file (JPEG, PNG, JPG)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setUploadedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    onAnalysisStart();

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      let finalResult: AnalysisResult | null = null;

      // If Deep Analysis is selected, do OCR + OpenAI in one request
      if (isDeepAnalysis) {
        const formData = new FormData();
        formData.append('file', uploadedFile);

        // Show progress beyond 90% while deep analysis runs
        setUploadProgress(95);

        // Add a timeout so the UI doesn't hang forever
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s

        const deepFileResponse = await fetch('/api/analyze-deep-file', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (deepFileResponse.ok) {
          finalResult = (await deepFileResponse.json()) as AnalysisResult;
        } else {
          // Fallback to two-step flow if the combined route fails
          console.warn('Combined deep analysis failed, falling back to two-step flow');

          const basicForm = new FormData();
          basicForm.append('file', uploadedFile);
          const basicResp = await fetch('/api/analyze', { method: 'POST', body: basicForm });
          if (!basicResp.ok) throw new Error('Basic analysis failed');
          const basicResult = (await basicResp.json()) as AnalysisResult;

          const deepResp = await fetch('/api/analyze-deep', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              extractedText: basicResult.extractedText,
              fileName: uploadedFile.name,
              fileType: basicResult.fileType
            })
          });

          if (deepResp.ok) {
            const deepJson = (await deepResp.json()) as { analysis: AnalysisResult['deepAnalysis'] };
            finalResult = { ...basicResult, deepAnalysis: deepJson.analysis } as AnalysisResult;
          } else {
            console.warn('Deep analysis fallback failed, attaching placeholder deep results');
            finalResult = {
              ...basicResult,
              deepAnalysis: {
                contentQualityScore: 0,
                engagementPotentialScore: 0,
                brandVoice: 'Unavailable',
                targetAudience: 'Unavailable',
                platformRecommendations: {
                  twitter: 'Deep analysis unavailable',
                  instagram: 'Deep analysis unavailable',
                  linkedin: 'Deep analysis unavailable',
                  facebook: 'Deep analysis unavailable'
                },
                hashtagStrategy: [],
                optimalPostingTimes: [],
                improvementSuggestions: ['Deep analysis temporarily unavailable. Please try again.'],
                competitiveAnalysis: 'Unavailable',
                roiPotential: 'Unavailable'
              }
            };
          }
        }
      } else {
        // Basic analysis only
        const formData = new FormData();
        formData.append('file', uploadedFile);
        const basicResponse = await fetch('/api/analyze', { method: 'POST', body: formData });
        if (!basicResponse.ok) throw new Error('Basic analysis failed');
        finalResult = await basicResponse.json();
      }

      setUploadProgress(100);

      setTimeout(() => {
        if (finalResult) onAnalysisComplete(finalResult);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (err: unknown) {
      const message = typeof (err as { message?: string })?.message === 'string' ? (err as { message: string }).message : 'Failed to analyze file. Please try again.';
      setError(message);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setError('');
    setUploadProgress(0);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Upload Your Content</h2>
        <p className="text-gray-300 text-lg">Drop your PDF or image file to get started with AI-powered analysis</p>
      </div>

      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
          isDragActive && !isDragReject
            ? 'border-purple-400 bg-purple-500/10 scale-105'
            : isDragReject
            ? 'border-red-400 bg-red-500/10'
            : 'border-gray-400 hover:border-purple-400 hover:bg-white/5'
        }`}
      >
        <input {...getInputProps()} />
        <div className="mb-6">
          {isDragActive ? (
            <div className="w-20 h-20 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto bg-gray-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xl font-semibold text-white">
            {isDragActive ? (isDragReject ? 'Invalid file type!' : 'Drop your file here!') : 'Drag & drop your file here'}
          </p>
          <p className="text-gray-400">{isDragActive ? (isDragReject ? 'Please upload a PDF or image file' : 'Release to upload') : 'or click to browse files'}</p>
          <p className="text-sm text-gray-500">Supports PDF, JPEG, PNG, JPG (max 10MB)</p>
        </div>
        {isDragActive && <div className="absolute inset-0 bg-purple-500/5 rounded-2xl border-2 border-purple-400/50"></div>}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div>
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {uploadedFile && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                {uploadedFile.type === 'application/pdf' ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                )}
              </div>
              <div>
                <p className="text-white font-semibold">{uploadedFile.name}</p>
                <p className="text-gray-400 text-sm">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button onClick={removeFile} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-300"><span>Uploading...</span><span>{uploadProgress}%</span></div>
            <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div></div>
          </div>
        </div>
      )}

             {/* Analysis Type Toggle */}
       <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Analysis Type</h3>
              <p className="text-gray-400 text-sm">
                {isDeepAnalysis ? 'Deep AI Analysis (OpenRouter)' : 'Basic Analysis'}
              </p>
            </div>
          </div>
                     <button
             type="button"
             onClick={() => setIsDeepAnalysis(!isDeepAnalysis)}
             className="relative inline-flex items-center cursor-pointer"
           >
             <div className={`w-11 h-6 rounded-full transition-all duration-300 ${isDeepAnalysis ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-600'}`}>
               <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 transform ${isDeepAnalysis ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
             </div>
           </button>
        </div>
        {isDeepAnalysis && (
          <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-purple-300 text-sm">
              💡 Deep analysis provides advanced insights including content quality scores, 
              engagement potential, brand voice analysis, hashtag strategy, and platform-specific recommendations.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={handleAnalyze} disabled={!uploadedFile || isUploading} className={`flex-1 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform ${uploadedFile && !isUploading ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105 shadow-lg hover:shadow-xl' : 'bg-gray-600 cursor-not-allowed'} text-white`}>
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>{isDeepAnalysis ? 'Deep Analyzing...' : 'Analyzing...'}</span></div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>{isDeepAnalysis ? 'Deep Analyze' : 'Analyze Content'}</span>
            </div>
          )}
        </button>
        {uploadedFile && !isUploading && (
          <button onClick={removeFile} className="px-8 py-4 border border-gray-500 text-gray-300 hover:text-white hover:bg-gray-500/20 rounded-xl font-semibold transition-colors">Clear</button>
        )}
      </div>
    </div>
  );
}


