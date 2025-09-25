import { Music, BarChart3, Zap } from 'lucide-react'
import { getLoginUrl } from '../utils/spotifyAuth'

export default function Home() {
  const handleLogin = () => {
    window.location.href = getLoginUrl()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-green-500 p-4 rounded-full">
              <Music className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">
            Playlist Analytics
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Analyze your Spotify playlists, discover hidden patterns, and get smart recommendations to optimize your music curation.
          </p>
          
          <button 
            onClick={handleLogin}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
          >
            Connect with Spotify
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-xl backdrop-blur-sm">
            <BarChart3 className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Deep Analytics</h3>
            <p className="text-gray-300">
              Analyze mood, energy, danceability, and musical characteristics of your playlists.
            </p>
          </div>
          
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-xl backdrop-blur-sm">
            <Zap className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Smart Recommendations</h3>
            <p className="text-gray-300">
              Get personalized track suggestions to fill gaps and improve your playlist flow.
            </p>
          </div>
          
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-xl backdrop-blur-sm">
            <Music className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Optimize & Export</h3>
            <p className="text-gray-300">
              Get actionable insights and export detailed reports for your playlists.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
