import { useState, useEffect } from 'react'
import { LogOut, User, Music, RefreshCw, Crown } from 'lucide-react'
import { getUserProfile, getUserPlaylists } from '../utils/spotifyApi'
import PlaylistAnalysis from './PlaylistAnalysis'
import PricingModal from './PricingModal'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import { useAnalyticsLimit } from './hooks/useAnalyticsLimit'

export default function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null)
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [showPricing, setShowPricing] = useState(false)

  const { usageCount, isLimited, remainingAnalyses, incrementUsage, freeLimit } = useAnalyticsLimit(5)

  const fetchUserData = async () => {
    try {
      setLoading(true); setError(null)
      const [me, pls] = await Promise.all([getUserProfile(), getUserPlaylists()])
      setUser(me)
      setPlaylists(pls.items || [])
    } catch (err) {
      setError(err.message || 'Failed to load your data')
      if ((err.message || '').includes('Authentication')) setTimeout(() => onLogout(), 1500)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [me, pls] = await Promise.all([getUserProfile(), getUserPlaylists()])
        if (cancelled) return
        setUser(me)
        setPlaylists(pls.items || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load your data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const handleAnalyzePlaylist = (p) => {
    if (isLimited) { setShowPricing(true); return }
    setSelectedPlaylist(p)
  }
  const handleBackToDashboard = () => {
    setSelectedPlaylist(null)
    // Count one analysis completion (call this when finishing analysis if you prefer)
    incrementUsage()
  }
  const handleRetry = () => fetchUserData()

  if (selectedPlaylist) {
    return (
      <PlaylistAnalysis
        playlist={selectedPlaylist}
        onBack={handleBackToDashboard}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 grid place-items-center">
        <LoadingSpinner size="lg" text="Loading your playlists..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 grid place-items-center">
        <ErrorMessage title="Failed to load dashboard" message={error} onRetry={handleRetry} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Music className="w-8 h-8 text-green-400" />
              <h1 className="text-2xl font-bold">Playlist Analytics</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPricing(true)}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                title="Upgrade"
              >
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">Upgrade</span>
              </button>
              <button
                onClick={handleRetry}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
                title="Refresh playlists"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                title="Logout"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Limit banner */}
      <div className="container mx-auto px-6 mt-4">
        <div className={`rounded-lg px-4 py-3 text-sm ${
          isLimited ? 'bg-red-900/40 text-red-200 border border-red-700/50' : 'bg-gray-800 text-gray-300'
        }`}>
          {isLimited
            ? <>You’ve reached the free limit of <b>{freeLimit}</b> analyses this month. <button onClick={() => setShowPricing(true)} className="underline decoration-dotted hover:text-white">Upgrade to Pro</button> for unlimited analysis.</>
            : <>You have <b>{remainingAnalyses}</b> analysis{remainingAnalyses !== 1 ? 'es' : ''} left this month on the Free plan.</>}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back{user?.display_name ? `, ${user.display_name}` : ''}!</h2>
          <p className="text-gray-400">
            {playlists.length
              ? `You have ${playlists.length} playlist${playlists.length !== 1 ? 's' : ''} ready to analyze.`
              : 'No playlists found. Create some playlists on Spotify and refresh!'}
          </p>
        </div>

        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map((p) => (
              <div key={p.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-all duration-200 group transform hover:scale-105">
                <div className="flex items-center mb-4">
                  {p.images?.[0]?.url
                    ? <img src={p.images[0].url} alt={p.name} className="w-16 h-16 rounded-lg mr-4 object-cover" loading="lazy" />
                    : <div className="w-16 h-16 bg-gray-600 rounded-lg mr-4 grid place-items-center"><Music className="w-8 h-8 text-gray-400" /></div>}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg group-hover:text-green-400 transition-colors truncate">{p.name}</h3>
                    <p className="text-gray-400 text-sm">{p.tracks?.total ?? 0} track{(p.tracks?.total ?? 0) !== 1 ? 's' : ''}</p>
                    {p.description && <p className="text-gray-500 text-xs truncate">{p.description}</p>}
                  </div>
                </div>
                <button
                  onClick={() => handleAnalyzePlaylist(p)}
                  className={`w-full py-2 px-4 rounded-lg transition-colors font-medium ${
                    isLimited || (p.tracks?.total ?? 0) === 0
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                  disabled={isLimited || (p.tracks?.total ?? 0) === 0}
                >
                  {(p.tracks?.total ?? 0) === 0 ? 'Empty Playlist' : 'Analyze Playlist'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music className="w-24 h-24 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No Playlists Found</h3>
            <p className="text-gray-500 mb-6">Create some playlists on Spotify and come back!</p>
            <button onClick={handleRetry} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors">
              Refresh Playlists
            </button>
          </div>
        )}
      </main>

      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  )
}
