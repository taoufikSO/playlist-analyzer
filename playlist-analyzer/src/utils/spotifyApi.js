import axios from 'axios'
import { getValidAccessToken } from './spotifyAuth'

const BASE_URL = 'https://api.spotify.com/v1'

const createSpotifyApi = async () => {
  const token = await getValidAccessToken()
  if (!token) throw new Error('Authentication required. Please log in again.')

  const api = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
    timeout: 15000,
  })

  api.interceptors.response.use(
    (r) => r,
    async (error) => {
      const { response, config } = error
      if (response?.status === 429 && !config._retried) {
        config._retried = true
        const wait = Number(response.headers['retry-after'] ?? 1) * 1000
        await new Promise((res) => setTimeout(res, wait))
        return api(config)
      }
      if (response) {
        const { status, data } = response
        switch (status) {
          case 401: throw new Error('Authentication expired. Please log in again.')
          case 403: throw new Error('Access denied. Please check your Spotify permissions.')
          case 404: throw new Error('The requested resource was not found.')
          case 500: throw new Error('Spotify server error. Please try again later.')
          default: throw new Error(data?.error?.message || 'An unexpected error occurred.')
        }
      }
      if (error.request) throw new Error('Network error. Please check your internet connection.')
      throw new Error('Request failed. Please try again.')
    }
  )
  return api
}

export const getUserProfile = async () => {
  const api = await createSpotifyApi()
  const { data } = await api.get('/me')
  return data
}

export const getUserPlaylists = async (limit = 50) => {
  const api = await createSpotifyApi()
  const { data } = await api.get(`/me/playlists?limit=${limit}`)
  return data
}

export const getPlaylistTracks = async (playlistId) => {
  if (!playlistId) throw new Error('Playlist ID is required')

  const api = await createSpotifyApi()
  let allTracks = []
  let url = `/playlists/${playlistId}/tracks?limit=100`
  let cnt = 0

  while (url && cnt < 50) {
    const { data } = await api.get(url)
    allTracks = allTracks.concat(data.items || [])
    url = data.next ? data.next.replace(BASE_URL, '') : null
    cnt++
  }
  return { items: allTracks }
}

export const getAudioFeatures = async (trackIds) => {
  if (!trackIds?.length) return { audio_features: [] }
  const valid = trackIds.filter((id) => !!id && typeof id === 'string')
  if (!valid.length) return { audio_features: [] }

  const api = await createSpotifyApi()
  const chunks = []
  for (let i = 0; i < valid.length; i += 100) chunks.push(valid.slice(i, i + 100))

  let all = []
  for (const chunk of chunks) {
    try {
      const { data } = await api.get(`/audio-features?ids=${chunk.join(',')}`)
      all = all.concat(data.audio_features || [])
    } catch (e) {
      console.warn('Audio features chunk failed:', e.message)
    }
  }
  return { audio_features: all }
}

export const validatePlaylistData = (playlist) => {
  if (!playlist) throw new Error('Playlist data is missing')
  if (!playlist.id) throw new Error('Playlist ID is missing')
  if (!playlist.name) throw new Error('Playlist name is missing')
  return true
}
