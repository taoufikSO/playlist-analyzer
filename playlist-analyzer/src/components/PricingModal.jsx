import { useState } from 'react'
import { X, Check, Zap, Crown, Star } from 'lucide-react'
import EmailCapture from './EmailCapture'

export default function PricingModal({ isOpen, onClose, onSelectPlan }) {
  const [selectedPlan, setSelectedPlan] = useState('pro')
  if (!isOpen) return null

  const plans = {
    free: {
      name: 'Free',
      price: '$0',
      period: 'forever',
      icon: <Star className="w-6 h-6" />,
      bgColor: 'bg-gray-700',
      features: [
        'Analyze up to 5 playlists per month',
        'Basic audio features (energy, mood, tempo)',
        'Simple visualizations',
        'Track list with basic info',
        'Community support',
      ],
      limitations: [
        'Limited to 5 playlists/month',
        'No detailed reports',
        'No export functionality',
        'No advanced recommendations',
      ],
    },
    pro: {
      name: 'Pro',
      price: '$12',
      period: 'month',
      icon: <Zap className="w-6 h-6" />,
      bgColor: 'bg-gradient-to-r from-green-600 to-blue-600',
      popular: true,
      features: [
        'Unlimited playlist analysis',
        'Advanced audio insights & recommendations',
        'Detailed PDF reports & exports',
        'Playlist optimization suggestions',
        'Track recommendation engine',
        'Playlist comparison tools',
        'Email insights reports',
        'Priority support',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      price: '$49',
      period: 'month',
      icon: <Crown className="w-6 h-6" />,
      bgColor: 'bg-gradient-to-r from-purple-600 to-pink-600',
      features: [
        'Everything in Pro',
        'API access for developers',
        'White-label solutions',
        'Custom integrations',
        'Advanced analytics dashboard',
        'Team collaboration features',
        'Dedicated account manager',
        'Custom reporting',
      ],
    },
  }

  const handleSelect = (key) => {
    setSelectedPlan(key)
    if (onSelectPlan) onSelectPlan(key)
    if (key === 'free') onClose()
    else alert(`${plans[key].name} plan coming soon! We’ll notify early users.`)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
            <p className="text-gray-400">Unlock the full power of playlist analytics</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 transition-colors"
            aria-label="Close pricing"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                className={`relative bg-gray-700 rounded-lg p-6 border-2 transition-all cursor-pointer hover:scale-105 ${
                  selectedPlan === key ? 'border-green-400' : 'border-transparent'
                } ${plan.popular ? 'ring-2 ring-green-400' : ''}`}
                onClick={() => setSelectedPlan(key)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-green-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${plan.bgColor} mb-4 text-white`}>
                    {plan.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-white">
                    {plan.price}
                    <span className="text-lg text-gray-400">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.limitations && (
                  <div className="mb-6">
                    <h4 className="text-gray-400 text-sm font-medium mb-2">Limitations:</h4>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, i) => (
                        <li key={i} className="text-gray-500 text-xs">• {limitation}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleSelect(key)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    key === 'free'
                      ? 'bg-gray-600 hover:bg-gray-500 text-white'
                      : plan.popular
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-500 text-white'
                  }`}
                >
                  {key === 'free' ? 'Current Plan' : 'Coming Soon'}
                </button>
              </div>
            ))}
          </div>

          {/* Capture interest for Pro/Enterprise */}
          <div className="mt-10 max-w-xl mx-auto">
            <EmailCapture
              title="Get early-bird deals on Pro"
              description="Join the waitlist and get 50% off your first 6 months."
              buttonText="Join Waitlist"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-900 rounded-b-xl text-center text-gray-400 text-sm">
          <p className="mb-2">🚀 <strong>Early Bird Special:</strong> First 100 users get 50% off Pro for 6 months!</p>
          <p>All plans include 14-day free trial • Cancel anytime • No hidden fees</p>
        </div>
      </div>
    </div>
  )
}
