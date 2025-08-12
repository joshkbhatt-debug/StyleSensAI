import React from 'react';
import { STYLE_OPTIONS, StyleId } from '../utils/constants';

type AIProvider = 'sensei' | 'openai' | 'anthropic' | 'google' | 'mistral' | 'cohere';

interface ToolbarProps {
  style: StyleId | null;
  onStyleChange: (style: StyleId | null) => void;
  provider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
}

/**
 * Professional toolbar component for StyleSensAI AI writing assistant.
 * Provides style selection controls with visual feedback.
 */
export default function Toolbar({ 
  style, 
  onStyleChange, 
  provider, 
  onProviderChange 
}: ToolbarProps) {
  return (
    <div className="space-y-8">
      {/* SensAI Display */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">SA</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">SensAI</h3>
          <p className="text-sm text-gray-500">AI Writing Assistant</p>
        </div>
      </div>

      {/* Style Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Your Style</h3>
        <div className="grid grid-cols-1 gap-3">
          {STYLE_OPTIONS.map((styleOption) => (
            <button
              key={styleOption.id}
              onClick={() => onStyleChange(style === styleOption.id ? null : styleOption.id)}
              className={`group relative w-full text-left rounded-xl border p-4 transition-all duration-200 ${
                style === styleOption.id
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm font-medium transition-colors ${
                    style === styleOption.id ? 'text-purple-700' : 'text-gray-900 group-hover:text-gray-700'
                  }`}>
                    {styleOption.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{styleOption.description}</div>
                </div>
                {style === styleOption.id && (
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Quick Tips
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Enter your text in the editor</li>
          <li>• Select a style for your writing</li>
          <li>• Click "Finish" to transform your text</li>
          <li>• View SensAI's explanations for detailed insights</li>
        </ul>
      </div>
    </div>
  );
}