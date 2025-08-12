import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import Editor from '../components/Editor';
import Toast from '../components/Toast';
import { BeforeAfter } from '../components/BeforeAfter';
import { TONES } from '../data/tones';

const MIN_LOADER_MS = 5000;
const API_TIMEOUT_MS = 25000;

function withTimeout<T>(p: Promise<T>, ms: number, label = 'timeout'): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(label)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); })
     .catch((e) => { clearTimeout(t); reject(e); });
  });
}

export default function ResultPage() {
  const router = useRouter();
  const { user } = useAuth();
  const startedAtRef = useRef<number>(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [original, setOriginal] = useState('');
  const [revised, setRevised] = useState('');
  const [explanations, setExplanations] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);
  const [showAuthToast, setShowAuthToast] = useState(false);

  const jobId = useMemo(() => {
    const q = router.query?.id;
    return Array.isArray(q) ? q[0] : q || null;
  }, [router.query]);

  useEffect(() => {
    let cancelled = false;
    console.debug('[SensAI] result mount', { jobId });

    const run = async () => {
      // Start both: API fetch and 5s minimum loader gate
      const minGate = new Promise<void>((res) => {
        const remain = Math.max(0, MIN_LOADER_MS - (Date.now() - startedAtRef.current));
        console.debug('[SensAI] minGate will resolve in', remain, 'ms');
        setTimeout(res, remain);
      });

      try {
        console.debug('[SensAI] fetch start');
        
        // Get payload from localStorage (fallback to sessionStorage if needed)
        const payloadStr = localStorage.getItem('sensai_payload') || sessionStorage.getItem('sensai_payload');
        if (!payloadStr) {
          throw new Error('No analysis payload found');
        }

        const body = JSON.parse(payloadStr);
        console.debug('[SensAI] payload', body);

        const res = await withTimeout(
          fetch('/api/analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }),
          API_TIMEOUT_MS,
          'analysis-timeout'
        );

        if (!res.ok) {
          throw new Error(`analysis-status-${res.status}`);
        }

        const data = await res.json(); // { correctedText, suggestions }
        console.debug('[SensAI] fetch done', data);

        if (cancelled) return;

        // Set the data immediately
        setOriginal(data.originalText || '');
        setRevised(data.correctedText || ''); // This should be the NEW text
        setExplanations(Array.isArray(data.suggestions) ? data.suggestions : []);

        // Save to history if authenticated
        if (user) {
          try {
            await fetch('/api/history/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: data.originalText,
                style: body.style,
                revised: data.correctedText,
                explanations: data.suggestions,
              }),
            });
          } catch (error) {
            console.error('Error saving history:', error);
          }
        } else {
          // Save to localStorage for guests
          const historyItem = {
            id: crypto.randomUUID(),
            text: data.originalText,
            style: body.style,
            revised: data.correctedText,
            explanations: data.suggestions,
            createdAt: new Date().toISOString(),
          };
          
          const existingHistory = JSON.parse(localStorage.getItem('sensai_history') || '[]');
          existingHistory.unshift(historyItem);
          localStorage.setItem('sensai_history', JSON.stringify(existingHistory.slice(0, 10)));
        }

        // Clear the payload
        localStorage.removeItem('sensai_payload');
        sessionStorage.removeItem('sensai_payload');

        // Wait until min loader window elapses, then show content
        await minGate;
        if (!cancelled) {
          console.debug('[SensAI] minGate resolved, stopping loader');
          setIsLoading(false);
          console.debug('[SensAI] loader ended -> show result');
        }
      } catch (e: any) {
        console.debug('[SensAI] fetch error', e?.message || e);
        
        // On error, still wait for min loader window
        await minGate;
        if (!cancelled) {
          console.debug('[SensAI] minGate resolved after error, stopping loader');
          setIsLoading(false);
          setError('SensAI had trouble finishing that request. Please try again.');
          
          // Fallback: show original text as revised so user isn't stuck
          const payloadStr = localStorage.getItem('sensai_payload') || sessionStorage.getItem('sensai_payload');
          if (payloadStr) {
            const body = JSON.parse(payloadStr);
            setOriginal(body.text || '');
            setRevised(body.text || ''); // Fallback to original
            setExplanations([]);
          }
        }
      }
    };

    run();
    return () => { cancelled = true; };
  }, [jobId, user]);

  const copyToClipboard = async () => {
    if (!revised) return;
    
    try {
      await navigator.clipboard.writeText(revised);
      alert('Text copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleRestart = () => {
    if (!original) return;
    router.push(`/app?text=${encodeURIComponent(original)}&tones=${explanations.length > 0 ? 'confident' : ''}`);
  };

  const handleNewDraft = () => {
    router.push('/app');
  };

  const handleHistory = () => {
    router.push('/history');
  };

  const actionName = explanations.length > 0 ? 'AI Improved' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Transformation Complete!</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Applied: {actionName}
                </p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <button
                    onClick={handleHistory}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    History
                  </button>

                  <button
                    onClick={copyToClipboard}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy to Clipboard
                  </button>
                  
                  <button
                    onClick={() => setShowExplanations(!showExplanations)}
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {isLoading ? 'SensAI\'s Explanations (after)' : (showExplanations ? 'Hide' : 'Show') + ' SensAI\'s Explanations'}
                  </button>

                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={handleRestart}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-orange-100 text-orange-700 text-sm font-medium rounded-lg hover:bg-orange-200 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Restart with Original Text
                    </button>
                    
                    <button
                      onClick={handleNewDraft}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg hover:bg-green-200 transition-colors mt-2"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      New Draft
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Writing Editor</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your transformed text is ready
                </p>
              </div>

              {/* While loading: show spinner and blur ONLY while loading */}
              <div className={isLoading ? 'relative' : ''}>
                {isLoading && (
                  <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin h-6 w-6 rounded-full border-2 border-gray-300 border-t-transparent" />
                    <span className="ml-3 text-gray-600">SensAI is working…</span>
                  </div>
                )}

                {!isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    <Editor 
                      value={revised} 
                      onChange={() => {}} // Read-only
                      disabled={true}
                    />
                  </motion.div>
                )}
              </div>

              {error && (
                <div className="p-4 border-t border-gray-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Before & After Comparison - only show when NOT loading */}
            {!isLoading && original && revised && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
              >
                <BeforeAfter original={original} revised={revised} />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Explanations Drawer */}
      {showExplanations && !isLoading && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-0 right-0 z-50 h-full w-96 max-w-full transform overflow-y-auto border-l border-gray-200 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">SensAI's Explanations</h2>
              <p className="text-sm text-gray-600 mt-1">See how SensAI improved your text</p>
            </div>
            <button 
              onClick={() => setShowExplanations(false)}
              className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {explanations.length > 0 ? (
              explanations.map((explanation, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-3">
                    <div className="flex items-center mb-2">
                      <span className="w-3 h-3 bg-red-400 rounded-full mr-2"></span>
                      <span className="text-sm font-medium text-gray-700">Original</span>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <code className="text-sm text-gray-800">{explanation.original}</code>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center mb-2">
                      <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                      <span className="text-sm font-medium text-gray-700">Revised</span>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <code className="text-sm text-gray-800">{explanation.revised}</code>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Rationale</div>
                    <p className="text-sm text-gray-600">{explanation.rationale}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Suggestions Yet</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  Transform your text using the action buttons to see how SensAI improves your writing with detailed explanations.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Auth Toast */}
      {showAuthToast && (
        <Toast
          message="History isn't saved. Log in or sign up to keep your edits."
          actions={[
            { label: 'Log in', href: '/login', variant: 'primary' },
            { label: 'Sign up', href: '/signup', variant: 'secondary' }
          ]}
          onClose={() => setShowAuthToast(false)}
          duration={0}
        />
      )}
    </motion.div>
  );
} 