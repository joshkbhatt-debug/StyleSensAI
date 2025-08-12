import React from 'react';

interface Suggestion {
  original: string;
  suggestion: string;
  explanation: string;
}

interface SidebarProps {
  suggestions: Suggestion[];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Professional sidebar component for StyleSensAI AI writing assistant.
 * Displays AI suggestions and explanations for text transformations.
 */
export default function Sidebar({ suggestions, isOpen, onClose }: SidebarProps) {
  return (
    <div
      className={`fixed top-0 right-0 z-50 h-full w-96 max-w-full transform overflow-y-auto border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">SensAI's Explanations</h2>
          <p className="text-sm text-gray-600 mt-1">See how SensAI improved your text</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              {/* Suggestion Number */}
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  Suggestion {index + 1}
                </span>
              </div>

              {/* Original Text */}
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Original:</h4>
                <p className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-200">
                  "{suggestion.original}"
                </p>
              </div>

              {/* Suggestion */}
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Suggestion:</h4>
                <p className="text-sm text-gray-800 bg-blue-50 rounded-lg p-3 border border-blue-200 font-medium">
                  "{suggestion.suggestion}"
                </p>
              </div>

              {/* Explanation */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Why this change:</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {suggestion.explanation}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Suggestions Yet</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Transform your text using the action buttons to see how SensAI improves your writing with detailed explanations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}