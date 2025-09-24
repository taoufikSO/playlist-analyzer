import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Music, Clock, Users, BarChart3, Loader, Play, Share2 } from 'lucide-react'
import { getPlaylistTracks, getAudioFeatures, validatePlaylistData } from '../utils/spotifyApi'

export default function PlaylistAnalysis({ playlist, onBack }) {
  const [tracks, setTracks] = useState([])
  const [audioFeatures, setAudioFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true

    const fetchPlaylistData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Validate input
        validatePlaylistData(playlist)

        // 1) Fetch tracks
        const tracksData = await getPlaylistTracks(playlist.id)
        const validTracks = (tracksData.items || []).filter(it => it.track && it.track.id)

        if (!mounted.current) return
        if (validTracks.length === 0) throw new Error('This playlist appears to be empty or contains no valid tracks.')

        setTracks(validTracks)

        // 2) Fetch audio features (batched internally by the helper)
        const trackIds = validTracks.map(it => it.track.id)
        const { audio_features } = await getAudioFeatures(trackIds)
        const validFeatures = (audio_features || []).filter(Boolean)

        if (!mounted.current) return
        setAudioFeatures(validFeatures)

        // 3) Analyze
        calculateAnalysis(validTracks, validFeatures)
      } catch (e) {
        if (!mounted.current) return
        console.error('Error fetching playlist data:', e)
        setError(e.message || 'Failed to analyze playlist.')
      } finally {
        if (mounted.current) setLoading(false)
      }
    }

    fetchPlaylistData()
    return () => { mounted.current = false }
  }, [playlist.id])

  const calculateAnalysis = (tracksData, features) => {
    if (!features.length) return

    const avg = (k) => features.reduce((s, f) => s + f[k], 0) / features.length
    const avgEnergy = avg('energy')
    const avgValence = avg('valence')
    const avgDanceability = avg('danceability')
    const avgTempo = avg('tempo')

    const totalDuration = tracksData.reduce((s, it) => s + (it.track?.duration_ms || 0), 0)

    // Really “top artists” not genres
    const artistNames = tracksData.flatMap(it => it.track?.artists?.map(a => a.name) || [])
    const counts = artistNames.reduce((acc, name) => (acc[name] = (acc[name] || 0) + 1, acc), {})
    const topArtists = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([artist, count]) => ({ artist, count }))

    let mood = 'Neutral'
    if (avgValence > 0.6 && avgEnergy > 0.6) mood = 'Energetic & Happy'
    else if (avgValence > 0.6 && avgEnergy < 0.4) mood = 'Chill & Positive'
    else if (avgValence < 0.4 && avgEnergy > 0.6) mood = 'Intense'
    else if (avgValence < 0.4 && avgEnergy < 0.4) mood = 'Melancholic'
    else if (avgEnergy > 0.7) mood = 'High Energy'
    else if (avgValence > 0.7) mood = 'Happy'

    setAnalysis({
      totalTracks: tracksData.length,
      totalDuration: Math.round(totalDuration / 1000 / 60), // minutes
      avgEnergy: Math.round(avgEnergy * 100),
      avgValence: Math.round(avgValence * 100),
      avgDanceability: Math.round(avgDanceability * 100),
      avgTempo: Math.round(avgTempo),
      mood,
      topArtists,
    })
  }

  const formatDuration = (ms) => {
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleRetry = () => {
    // Simply retrigger effect by “changing” id (or call the fetcher directly)
    setLoading(true)
    setError(null)
    // call fetch again:
    ;(async () => {
      try {
        const tracksData = await getPlaylistTracks(playlist.id)
        const validTracks = (tracksData.items || []).filter(it => it.track && it.track.id)
        setTracks(validTracks)
        const { audio_features } = await getAudioFeatures(validTracks.map(it => it.track.id))
        const validFeatures = (audio_features || []).filter(Boolean)
        setAudioFeatures(validFeatures)
        calculateAnalysis(validTracks, validFeatures)
      } catch (e) {
        setError(e.message || 'Failed to analyze playlist.')
      } finally {
        setLoading(false)
      }
    })()
  }

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: `${playlist.name} - Playlist Analysis`, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader className="w-16 h-16 text-green-400 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Analyzing Playlist</h2>
              <p className="text-gray-400">Fetching tracks and audio features...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center mb-8">
            <button onClick={onBack} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mr-6">
              <ArrowLeft className="w-5 h-5" /><span>Back to Dashboard</span>
            </button>
          </div>
          <div className="text-center">
            <p className="text-red-400 mb-4 font-semibold">{error}</p>
            <button onClick={handleRetry} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg">
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mr-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center space-x-4">
              {playlist.images?.[0]?.url ? (
                <img src={playlist.images[0].url} alt={playlist.name} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                  <Music className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{playlist.name}</h1>
                <p className="text-gray-400">{playlist.description || 'No description'}</p>
              </div>
            </div>
          </div>

          <button onClick={handleShare} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
            <Share2 className="w-4 h-4" /><span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {analysis && (
          <>
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <Music className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <div className="text-2xl font-bold">{analysis.totalTracks}</div>
                <div className="text-sm text-gray-400">Total Tracks</div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <div className="text-2xl font-bold">{analysis.totalDuration}m</div>
                <div className="text-sm text-gray-400">Duration</div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <div className="text-2xl font-bold">{analysis.avgTempo}</div>
                <div className="text-sm text-gray-400">Avg BPM</div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <div className="text-2xl font-bold">{analysis.mood}</div>
                <div className="text-sm text-gray-400">Overall Mood</div>
              </div>
            </div>

            {/* Audio Features */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2 text-green-400" />
                  Audio Characteristics
                </h3>
                <FeatureBar label="Energy" value={analysis.avgEnergy} color="bg-red-400" note="How energetic and intense the music feels" />
                <FeatureBar label="Positivity" value={analysis.avgValence} color="bg-green-400" note="How positive or uplifting the music sounds" />
                <FeatureBar label="Danceability" value={analysis.avgDanceability} color="bg-purple-400" note="How suitable the music is for dancing" />
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-purple-400" />
                  Top Artists
                </h3>
                <div className="space-y-3">
                  {analysis.topArtists.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-400 mr-3">#{i + 1}</span>
                        <span className="text-white">{item.artist}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{item.count} track{item.count > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Track List */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-6">Track List</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tracks.slice(0, 50).map((item, index) => {
              const track = item.track
              if (!track) return null
              return (
                <div key={track.id} className="flex items-center space-x-4 p-3 hover:bg-gray-700 rounded-lg transition-colors">
                  <span className="text-gray-400 text-sm w-8">{index + 1}</span>
                  {track.album?.images?.[2]
                    ? <img src={track.album.images[2].url} alt={track.name} className="w-10 h-10 rounded" />
                    : <div className="w-10 h-10 bg-gray-600 rounded grid place-items-center"><Music className="w-5 h-5 text-gray-400" /></div>}
                  <div className="flex-grow min-w-0">
                    <h4 className="text-white font-medium truncate">{track.name}</h4>
                    <p className="text-gray-400 text-sm truncate">{track.artists?.map(a => a.name).join(', ')}</p>
                  </div>
                  <span className="text-gray-400 text-sm">{formatDuration(track.duration_ms)}</span>
                  {track.preview_url && (
                    <button className="text-green-400 hover:text-green-300 p-1" title="Preview (30s)">
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )
            })}
            {tracks.length > 50 && (
              <div className="text-center py-4">
                <p className="text-gray-400">Showing first 50 tracks of {tracks.length} total</p>
              </div>
            )}
          </div>
        </div>

        {tracks.length === 0 && !loading && (
          <div className="text-center py-12">
            <Music className="w-24 h-24 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No Tracks Found</h3>
            <p className="text-gray-500">This playlist appears to be empty or private.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FeatureBar({ label, value, color, note }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between mb-2">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-semibold">{value}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
      {note && <p className="text-xs text-gray-400 mt-1">{note}</p>}
    </div>
  )
}
