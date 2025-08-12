import React, { forwardRef } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Professional text editor component for StyleSensAI AI writing assistant.
 * Provides a clean, distraction-free writing environment with AI-powered suggestions.
 */
const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(
  ({ value, onChange, disabled = false }, ref) => {
    return (
      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full p-6 text-base text-gray-800 placeholder-gray-400 focus:outline-none resize-none font-sans leading-relaxed bg-white border-0 focus:ring-0"
          rows={16}
          style={{ minHeight: '400px' }}
          placeholder="SensAI will help you transform your writing to be more confident, clear, and impactful while preserving your unique voice."
        />
        
        {/* Loading indicator */}
        {disabled && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">SensAI is working...</p>
              <p className="text-sm text-gray-500 mt-1">Your AI writing master is transforming your text</p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Editor.displayName = 'Editor';

export default Editor;