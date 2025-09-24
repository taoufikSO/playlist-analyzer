import { Loader } from 'lucide-react'

export default function LoadingSpinner({ size = 'md', text = 'Loading...', className = '' }) {
  const sizeClasses = { sm: 'w-6 h-6', md: 'w-12 h-12', lg: 'w-16 h-16' }
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader className={`${sizeClasses[size]} text-green-400 animate-spin mb-4`} />
      <p className="text-gray-300">{text}</p>
    </div>
  )
}
