import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function ExtensionPage() {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const chromeWebStoreUrl = process.env.NEXT_PUBLIC_CHROME_WEBSTORE_URL;

  const handleDownload = () => {
    setDownloadStarted(true);
    // The download will be handled by the browser when clicking the link
  };

  return (
    <>
      <Head>
        <title>StyleSensAI Extension - Install Guide</title>
        <meta name="description" content="Install the StyleSensAI Chrome extension to improve your writing on any website" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              StyleSensAI Chrome Extension
            </h1>
            <p className="text-xl text-gray-600">
              Transform your writing on any website with AI-powered grammar and style improvements
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Install StyleSensAI</h2>
              <p className="text-gray-600">
                No API key required! The extension connects to our secure API automatically.
              </p>
            </div>

            <div className="text-center">
              {chromeWebStoreUrl ? (
                <a
                  href={chromeWebStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Add to Chrome
                </a>
              ) : (
                <>
                  <a
                    href="/api/extension-download"
                    download
                    onClick={handleDownload}
                    className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {downloadStarted ? 'Downloading...' : 'Download Extension'}
                  </a>
                  
                  <div className="mt-6 text-sm text-gray-600">
                    <p className="font-medium mb-2">Install manually:</p>
                    <ul className="space-y-1">
                      <li>• Open chrome://extensions</li>
                      <li>• Enable Developer mode</li>
                      <li>• Click "Load unpacked" and select the unzipped folder</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🔒 Secure & Private</h3>
              <p className="text-gray-600">
                No API keys needed. All processing happens on our secure servers with enterprise-grade encryption.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🌐 Works Everywhere</h3>
              <p className="text-gray-600">
                Use StyleSensAI on any website - Gmail, LinkedIn, Twitter, or any text input field.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/app"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Try the Web Editor
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 