import { useState } from 'react'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'

export default function EmailCapture({
  title = 'Get notified when we launch Pro features!',
  description = 'Be the first to access advanced analytics, unlimited exports, and exclusive insights.',
  buttonText = 'Notify Me',
  placeholder = 'Enter your email address',
  onSubmit = null,
  className = ''
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setStatus('error'); setMessage('Please enter your email address'); return
    }
    if (!isValidEmail(email)) {
      setStatus('error'); setMessage('Please enter a valid email address'); return
    }

    setStatus('loading')
    try {
      if (onSubmit) {
        await onSubmit(email)
      } else {
        // Local fallback: store unique emails as objects
        const key = 'waitlist_emails'
        const list = JSON.parse(localStorage.getItem(key) || '[]')
        const exists = Array.isArray(list) && list.some(e => e?.email === email)
        if (!exists) {
          list.push({ email, timestamp: new Date().toISOString(), source: 'email_capture' })
          localStorage.setItem(key, JSON.stringify(list))
        }
      }
      setStatus('success')
      setMessage("Thanks! We'll notify you when Pro features are ready.")
      setEmail('')
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className={`bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-lg ${className}`}>
      <div className="text-center mb-6">
        <Mail className="w-12 h-12 text-white mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-200 text-sm">{description}</p>
      </div>

      {status === 'success' ? (
        <div className="text-center">
          <CheckCircle className="w-8 h-8 text-green-300 mx-auto mb-2" aria-hidden="true" />
          <p className="text-green-200">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <label className="block" htmlFor="email-capture">
            <span className="sr-only">Email</span>
            <input
              id="email-capture"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              autoComplete="email"
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:border-white/50 focus:bg-white/30 transition-all"
              disabled={status === 'loading'}
              aria-invalid={status === 'error'}
            />
          </label>

          {status === 'error' && (
            <div className="flex items-center space-x-2 text-red-200 text-sm" role="alert">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-white text-purple-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Submitting…' : buttonText}
          </button>
        </form>
      )}
    </div>
  )
}
