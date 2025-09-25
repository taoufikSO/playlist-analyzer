import { useState, useEffect } from 'react'
import { LogOut, User, Music, Loader } from 'lucide-react'
import { getUserProfile, getUserPlaylists } from '../utils/spotifyApi'
import PlaylistAnalysis from './PlaylistAnalysis'

export default function Dashboard({ token, onLogout }) {
  const [user, setUser] = useState(null)
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userProfile, userPlaylists] = await Promise.all([
          getUserProfile(token),
          getUserPlaylists(token)
        ])
        
        setUser(userProfile)
        setPlaylists(userPlaylists.items || [])
      } catch (error) {
        setError(error.message)
        if (error.response?.status === 401) {
          onLogout()
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, onLogout])

  if (selectedPlaylist) {
    return (
      <PlaylistAnalysis 
        playlist={selectedPlaylist} 
        token={token} 
        onBack={() => setSelectedPlaylist(null)}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader className="w-12 h-12 text-green-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={onLogout}
            className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Music className="w-8 h-8 text-green-400" />
              <h1 className="text-2xl font-bold">Playlist Analytics</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300 hidden sm:inline">{user.display_name}</span>
                </div>
              )}
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back{user?.display_name ? `, ${user.display_name}` : ''}!</h2>
          <p className="text-gray-400">
            You have {playlists.length} playlists ready to analyze.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <div 
              key={playlist.id} 
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center mb-4">
                {playlist.images?.[0] ? (
                  <img 
                    src={playlist.images[0].url} 
                    alt={playlist.name}
                    className="w-16 h-16 rounded-lg mr-4"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-600 rounded-lg mr-4 flex items-center justify-center">
                    <Music className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">
                    {playlist.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {playlist.tracks.total} tracks
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedPlaylist(playlist)}
                className="w-full bg-green-600 hover:bg-green-700 py-2 px-4 rounded-lg transition-colors"
              >
                Analyze Playlist
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
