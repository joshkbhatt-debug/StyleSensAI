export function SpinnerHero() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Writing Editor</h3>
        <p className="text-sm text-gray-600 mt-1">
          SensAI is working on your text...
        </p>
      </div>
      <div className="p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">SensAI is working...</h3>
          <p className="text-gray-600 text-center max-w-md">
            Transforming your text to match the selected tones. This usually takes a few seconds.
          </p>
        </div>
      </div>
    </div>
  );
} 