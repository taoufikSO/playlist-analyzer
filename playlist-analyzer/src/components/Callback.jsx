import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthParamsFromUrl, exchangeCodeForToken, cleanupUrl } from '../utils/spotifyAuth';
import { AlertCircle } from 'lucide-react';

export default function Callback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const ranRef = useRef(false);   // <- prevents double call in StrictMode

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        const { code, state, error: authError } = getAuthParamsFromUrl();
        if (authError) throw new Error(`Authentication failed: ${authError}`);
        if (!code) throw new Error('No authorization code received');

        await exchangeCodeForToken(code, state); // calls backend

        cleanupUrl();
      
navigate('/dashboard', { replace: true });
        navigate('/');
      } catch (e) {
        console.error('Callback error:', e);
        setError(e.message);
        setIsProcessing(false);
      }
    })();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-4">Authentication Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 grid place-items-center text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connecting to Spotify…</h2>
        <p className="text-gray-400">{isProcessing ? 'Exchanging authorization code…' : 'Please wait…'}</p>
      </div>
    </div>
  );
}
