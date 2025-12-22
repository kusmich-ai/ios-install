'use client';

import { useState } from 'react';
import { X, Check, Zap, Shield, Brain, Sparkles, Star, Users } from 'lucide-react';

type PlanType = 'quarterly' | 'biannual' | 'annual' | 'quarterly_coaching' | 'biannual_coaching' | 'annual_coaching';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: PlanType) => Promise<void>;
}

export function PaywallModal({ isOpen, onClose, onUpgrade }: PaywallModalProps) {
  const [selectedTrack, setSelectedTrack] = useState<'installer' | 'coaching'>('installer');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      await onUpgrade(selectedPlan);
    } catch (err) {
      setError('Failed to start checkout. Please try again.');
      console.error('Upgrade error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update selected plan when track changes
  const handleTrackChange = (track: 'installer' | 'coaching') => {
    setSelectedTrack(track);
    if (track === 'installer') {
      setSelectedPlan('annual');
    } else {
      setSelectedPlan('annual_coaching');
    }
  };

  const installerFeatures = [
    { icon: Brain, text: 'Embodied Awareness & Somatic Practices' },
    { icon: Star, text: '21-Day Identity Installation Cycles' },
    { icon: Zap, text: 'Flow Mode Deep Work Training' },
    { icon: Shield, text: 'Relational Coherence Protocols' },
    { icon: Sparkles, text: 'Full Integration & Stage 7 Access' },
  ];

  const coachingFeatures = [
    { icon: Users, text: 'Weekly live calls with Nic & Fehren' },
    { icon: Star, text: 'Guest experts & Charok Lama sessions' },
    { icon: Zap, text: 'Direct Q&A and hot seat coaching' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#111111] border border-[#1a1a1a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-8 pb-6 text-center border-b border-[#1a1a1a]">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ff9e19]/10 rounded-full mb-4">
            <Zap className="w-8 h-8 text-[#ff9e19]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Neural Priming Complete
          </h2>
          <p className="text-gray-400">
            You've proven stability. Time to install the full system.
          </p>
        </div>

        {/* Track Selector */}
        <div className="p-6 border-b border-[#1a1a1a]">
          <div className="flex gap-2 p-1 bg-[#0a0a0a] rounded-xl">
            <button
              onClick={() => handleTrackChange('installer')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                selectedTrack === 'installer'
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              IOS Installer
            </button>
            <button
              onClick={() => handleTrackChange('coaching')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                selectedTrack === 'coaching'
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Installer + Coaching
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="p-6 border-b border-[#1a1a1a]">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-4">
            {selectedTrack === 'installer' ? 'Full System Access' : 'Everything in Installer, Plus'}
          </p>
          <div className="space-y-3">
            {(selectedTrack === 'installer' ? installerFeatures : coachingFeatures).map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#ff9e19]/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-[#ff9e19]" />
                </div>
                <p className="text-gray-300">{feature.text}</p>
              </div>
            ))}
          </div>
          {selectedTrack === 'coaching' && (
            <p className="text-gray-500 text-sm mt-4 italic">
              + All IOS Installer features included
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="p-6 space-y-3">
          {selectedTrack === 'installer' ? (
            <>
              {/* Annual - Best Value */}
              <button
                onClick={() => setSelectedPlan('annual')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                  selectedPlan === 'annual'
                    ? 'border-[#ff9e19] bg-[#ff9e19]/10'
                    : 'border-[#1a1a1a] hover:border-[#333]'
                }`}
              >
                <div className="absolute -top-3 left-4 px-3 py-1 bg-[#ff9e19] text-black text-xs font-bold rounded-full">
                  SAVE 61%
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div>
                    <span className="text-white font-semibold">Annual</span>
                    <div className="text-gray-400 text-sm mt-0.5">Just $58/month</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">$697</div>
                  </div>
                </div>
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'annual' ? 'border-[#ff9e19] bg-[#ff9e19]' : 'border-gray-500'
                }`}>
                  {selectedPlan === 'annual' && <Check className="w-3 h-3 text-black" />}
                </div>
              </button>

              {/* 6 Month */}
              <button
                onClick={() => setSelectedPlan('biannual')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                  selectedPlan === 'biannual'
                    ? 'border-[#ff9e19] bg-[#ff9e19]/10'
                    : 'border-[#1a1a1a] hover:border-[#333]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-white font-semibold">6 Months</span>
                    <div className="text-gray-400 text-sm mt-0.5">$100/month</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">$597</div>
                  </div>
                </div>
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'biannual' ? 'border-[#ff9e19] bg-[#ff9e19]' : 'border-gray-500'
                }`}>
                  {selectedPlan === 'biannual' && <Check className="w-3 h-3 text-black" />}
                </div>
              </button>

              {/* 3 Month */}
              <button
                onClick={() => setSelectedPlan('quarterly')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                  selectedPlan === 'quarterly'
                    ? 'border-[#ff9e19] bg-[#ff9e19]/10'
                    : 'border-[#1a1a1a] hover:border-[#333]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-white font-semibold">3 Months</span>
                    <div className="text-gray-400 text-sm mt-0.5">$149/month</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">$447</div>
                  </div>
                </div>
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'quarterly' ? 'border-[#ff9e19] bg-[#ff9e19]' : 'border-gray-500'
                }`}>
                  {selectedPlan === 'quarterly' && <Check className="w-3 h-3 text-black" />}
                </div>
              </button>
            </>
          ) : (
            <>
              {/* Annual Coaching - Best Value */}
              <button
                onClick={() => setSelectedPlan('annual_coaching')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                  selectedPlan === 'annual_coaching'
                    ? 'border-[#ff9e19] bg-[#ff9e19]/10'
                    : 'border-[#1a1a1a] hover:border-[#333]'
                }`}
              >
                <div className="absolute -top-3 left-4 px-3 py-1 bg-[#ff9e19] text-black text-xs font-bold rounded-full">
                  BEST VALUE
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div>
                    <span className="text-white font-semibold">Annual</span>
                    <div className="text-gray-400 text-sm mt-0.5">Just $150/month</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">$1,797</div>
                  </div>
                </div>
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'annual_coaching' ? 'border-[#ff9e19] bg-[#ff9e19]' : 'border-gray-500'
                }`}>
                  {selectedPlan === 'annual_coaching' && <Check className="w-3 h-3 text-black" />}
                </div>
              </button>

              {/* 6 Month Coaching */}
              <button
                onClick={() => setSelectedPlan('biannual_coaching')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                  selectedPlan === 'biannual_coaching'
                    ? 'border-[#ff9e19] bg-[#ff9e19]/10'
                    : 'border-[#1a1a1a] hover:border-[#333]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-white font-semibold">6 Months</span>
                    <div className="text-gray-400 text-sm mt-0.5">$233/month</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">$1,397</div>
                  </div>
                </div>
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'biannual_coaching' ? 'border-[#ff9e19] bg-[#ff9e19]' : 'border-gray-500'
                }`}>
                  {selectedPlan === 'biannual_coaching' && <Check className="w-3 h-3 text-black" />}
                </div>
              </button>

              {/* 3 Month Coaching */}
              <button
                onClick={() => setSelectedPlan('quarterly_coaching')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                  selectedPlan === 'quarterly_coaching'
                    ? 'border-[#ff9e19] bg-[#ff9e19]/10'
                    : 'border-[#1a1a1a] hover:border-[#333]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-white font-semibold">3 Months</span>
                    <div className="text-gray-400 text-sm mt-0.5">$346/month</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">$1,038</div>
                  </div>
                </div>
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'quarterly_coaching' ? 'border-[#ff9e19] bg-[#ff9e19]' : 'border-gray-500'
                }`}>
                  {selectedPlan === 'quarterly_coaching' && <Check className="w-3 h-3 text-black" />}
                </div>
              </button>
            </>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="px-6 pb-2">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* CTA */}
        <div className="p-6 pt-2">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-4 bg-[#ff9e19] hover:bg-[#ffb04d] text-black font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                {selectedTrack === 'installer' ? 'Install the IOS' : 'Install + Join Coaching'}
              </>
            )}
          </button>
          
          <div className="flex items-center justify-center gap-4 mt-4 text-gray-500 text-sm">
            <span>✓ 7-day guarantee</span>
            <span>✓ Auto-renews at same rate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
