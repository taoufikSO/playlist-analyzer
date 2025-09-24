import { Crown, ArrowRight } from 'lucide-react'

export default function UpgradePrompt({
  feature = 'this feature',
  ctaText = 'Upgrade Now',
  onUpgrade = () => {},
  className = ''
}) {
  return (
    <div className={`bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-lg text-center ${className}`}>
      <Crown className="w-12 h-12 text-yellow-300 mx-auto mb-4" aria-hidden="true" />
      <h3 className="text-xl font-bold text-white mb-2">Upgrade to Pro</h3>
      <p className="text-gray-200 mb-6">Unlock {feature} and get unlimited access to all analytics features.</p>
      <button
        type="button"
        onClick={onUpgrade}
        className="bg-white text-purple-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all inline-flex items-center space-x-2"
      >
        <span>{ctaText}</span>
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </button>
      <p className="text-gray-300 text-xs mt-3">14-day free trial • Cancel anytime</p>
    </div>
  )
}
