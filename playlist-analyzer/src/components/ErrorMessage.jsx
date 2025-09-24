import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ErrorMessage({
  title = 'Something went wrong',
  message = 'Please try again later',
  onRetry = null,
  className = '',
}) {
  return (
    <div className={`text-center ${className}`}>
      <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-red-400 mb-2">{title}</h3>
      <p className="text-gray-300 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  )
}
