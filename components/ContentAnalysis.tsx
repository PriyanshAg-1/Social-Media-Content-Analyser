'use client';

import { useState } from 'react';
import type { AnalysisResult } from '@/types';

interface ContentAnalysisProps { result: AnalysisResult }

export default function ContentAnalysis({ result }: ContentAnalysisProps) {
  const { extractedText, analysis, fileType, fileName } = result;
  const [activeTab, setActiveTab] = useState<'overview' | 'text' | 'suggestions' | 'deep'>('overview');

  // Safe deep analysis defaults to avoid runtime errors when fields are missing
  const toNumber01 = (v: unknown) => {
    const n = typeof v === 'number' ? v : (typeof v === 'string' ? Number(v) : 0);
    return Math.max(0, Math.min(100, Math.round(isFinite(n) ? n : 0)));
  };

  const deep = result.deepAnalysis ?? {
    contentQualityScore: 0,
    engagementPotentialScore: 0,
    brandVoice: 'Unavailable',
    targetAudience: 'Unavailable',
    platformRecommendations: {
      twitter: 'Unavailable',
      instagram: 'Unavailable',
      linkedin: 'Unavailable',
      facebook: 'Unavailable',
    },
    hashtagStrategy: [] as string[],
    optimalPostingTimes: [] as string[],
    improvementSuggestions: [] as string[],
    competitiveAnalysis: 'Unavailable',
    roiPotential: 'Unavailable',
  };
  // Defensive clamps in case API returns out-of-range numbers
  deep.contentQualityScore = toNumber01(deep.contentQualityScore);
  deep.engagementPotentialScore = toNumber01(deep.engagementPotentialScore);

  const getReadabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getReadabilityLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getPlatformRecommendation = (wordCount: number) => {
    if (wordCount < 30) return { platform: 'Twitter/X', icon: '🐦', color: 'from-blue-500 to-blue-600' };
    if (wordCount < 100) return { platform: 'Instagram', icon: '📸', color: 'from-pink-500 to-purple-600' };
    if (wordCount < 200) return { platform: 'LinkedIn', icon: '💼', color: 'from-blue-600 to-blue-700' };
    return { platform: 'Facebook/LinkedIn', icon: '📘', color: 'from-blue-700 to-indigo-700' };
  };

  const platform = getPlatformRecommendation(analysis.wordCount);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2">
          Analysis Complete! 🎉
        </h2>
        <p className="text-gray-300">
          {fileName} • {fileType.toUpperCase()} • {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Platform Recommendation */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              🎯 Best Platform Match
            </h3>
            <p className="text-gray-300">
              Your content is optimized for <span className="font-semibold text-purple-400">{platform.platform}</span>
            </p>
          </div>
          <div className="text-4xl">{platform.icon}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 bg-white/10 rounded-xl p-1 mb-8 overflow-visible">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'text', label: 'Extracted Text', icon: '📝' },
          { id: 'suggestions', label: 'Suggestions', icon: '💡' },
          ...(result.deepAnalysis ? [{ id: 'deep', label: 'Deep Analysis', icon: '🤖' }] : [])
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'text' | 'suggestions' | 'deep')}
            className={`
              flex-1 basis-1/2 md:basis-1/4 min-w-[140px] flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                <div className="text-3xl mb-2">📝</div>
                <div className="text-3xl font-bold text-white mb-1">{analysis.wordCount}</div>
                <div className="text-gray-400">Words</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                <div className="text-3xl mb-2">🔤</div>
                <div className="text-3xl font-bold text-white mb-1">{analysis.characterCount}</div>
                <div className="text-gray-400">Characters</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                <div className="text-3xl mb-2">📊</div>
                <div className={`text-3xl font-bold mb-1 ${getReadabilityColor(analysis.readabilityScore)}`}>
                  {analysis.readabilityScore}
                </div>
                <div className="text-gray-400">{getReadabilityLabel(analysis.readabilityScore)}</div>
              </div>
            </div>

            {/* Readability Score */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Readability Score</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                      analysis.readabilityScore >= 80 ? 'bg-green-500' :
                      analysis.readabilityScore >= 60 ? 'bg-yellow-500' :
                      analysis.readabilityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analysis.readabilityScore}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-sm">
                  Score: {analysis.readabilityScore}/100 • {getReadabilityLabel(analysis.readabilityScore)} readability
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Content Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">
                    {analysis.wordCount < 100 ? 'Perfect length for social media' : 'Good content length'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">
                    {analysis.suggestions.length} optimization tips available
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">
                    Best suited for {platform.platform}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                  <span className="text-gray-300">
                    {fileType === 'image' ? 'OCR processed' : 'PDF analyzed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Text Tab */}
        {activeTab === 'text' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Extracted Text</h3>
            <div className="bg-gray-900/50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {extractedText || 'No text was extracted from this file.'}
              </p>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              {extractedText ? `${analysis.wordCount} words • ${analysis.characterCount} characters` : 'Text extraction failed'}
            </div>
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Optimization Suggestions</h3>
            {analysis.suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{suggestion}</p>
                </div>
              </div>
            ))}
            
            {analysis.suggestions.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-lg">Your content is already well-optimized!</p>
                <p className="text-sm">No additional suggestions needed.</p>
              </div>
            )}
          </div>
                 )}

        {/* Deep Analysis Tab */}
        {activeTab === 'deep' && (result.deepAnalysis || true) && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Content Quality Score */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Content Quality Score</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">{deep.contentQualityScore}/100</div>
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${deep.contentQualityScore}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-300 text-sm">Overall content quality assessment</p>
                </div>
              </div>

              {/* Engagement Potential */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Engagement Potential</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">{deep.engagementPotentialScore}/100</div>
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${deep.engagementPotentialScore}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-300 text-sm">Expected engagement performance</p>
                </div>
              </div>
            </div>

            {/* Brand Voice & Target Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Brand Voice</h3>
                <div className="bg-purple-500/20 rounded-lg p-4">
                  <p className="text-purple-300 font-semibold">{deep.brandVoice}</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Target Audience</h3>
                <div className="bg-pink-500/20 rounded-lg p-4">
                  <p className="text-pink-300 font-semibold">{deep.targetAudience}</p>
                </div>
              </div>
            </div>

            {/* Platform Recommendations */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Platform-Specific Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <h4 className="text-blue-400 font-semibold mb-2">🐦 Twitter/X</h4>
                  <p className="text-gray-300 text-sm">{deep.platformRecommendations?.twitter ?? 'Unavailable'}</p>
                </div>
                <div className="bg-pink-500/10 rounded-lg p-4 border border-pink-500/20">
                  <h4 className="text-pink-400 font-semibold mb-2">📸 Instagram</h4>
                  <p className="text-gray-300 text-sm">{deep.platformRecommendations?.instagram ?? 'Unavailable'}</p>
                </div>
                <div className="bg-blue-600/10 rounded-lg p-4 border border-blue-600/20">
                  <h4 className="text-blue-300 font-semibold mb-2">💼 LinkedIn</h4>
                  <p className="text-gray-300 text-sm">{deep.platformRecommendations?.linkedin ?? 'Unavailable'}</p>
                </div>
                <div className="bg-blue-700/10 rounded-lg p-4 border border-blue-700/20">
                  <h4 className="text-blue-200 font-semibold mb-2">📘 Facebook</h4>
                  <p className="text-gray-300 text-sm">{deep.platformRecommendations?.facebook ?? 'Unavailable'}</p>
                </div>
              </div>
            </div>

            {/* Hashtag Strategy */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Hashtag Strategy</h3>
              <div className="flex flex-wrap gap-2">
                {(deep.hashtagStrategy ?? []).map((hashtag, index) => (
                  <span key={index} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                    {hashtag}
                  </span>
                ))}
              </div>
            </div>

            {/* Optimal Posting Times */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Optimal Posting Times</h3>
              <div className="flex flex-wrap gap-2">
                {(deep.optimalPostingTimes ?? []).map((time, index) => (
                  <span key={index} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm border border-green-500/30">
                    {time}
                  </span>
                ))}
              </div>
            </div>

            {/* Improvement Suggestions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Content Improvement Suggestions</h3>
              <div className="space-y-3">
                {(deep.improvementSuggestions ?? []).map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitive Analysis & ROI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Competitive Analysis</h3>
                <p className="text-gray-300 leading-relaxed">{deep.competitiveAnalysis}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">ROI Potential</h3>
                <p className="text-gray-300 leading-relaxed">{deep.roiPotential}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-white/20">
        <button
          onClick={() => {
            const report = {
              fileName,
              fileType,
              generatedAt: new Date().toISOString(),
              extractedText,
              basicAnalysis: analysis,
              deepAnalysis: deep,
            };
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName.replace(/\.[^/.]+$/, '') || 'report'}-analysis.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
        >
          📊 Download Report
        </button>
        <button
          onClick={() => {
            // Soft navigation back to top and signal parent to reset by emitting a custom event
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.dispatchEvent(new CustomEvent('reset-analysis'));
          }}
          className="flex-1 border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          🔄 Analyze Another File
        </button>
      </div>
    </div>
  );
}
