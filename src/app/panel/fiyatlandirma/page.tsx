'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Zap, Crown, Rocket, Sparkles } from 'lucide-react'
import { getAllPlans } from '@/lib/subscription'
import type { SubscriptionPlan } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function PricingPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const data = await getAllPlans()
      setPlans(data)
    } catch (error) {
      console.error('Error loading plans:', error)
      toast.error('Planlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = (planSlug: string) => {
    if (planSlug === 'free') {
      toast.success('Ücretsiz plan zaten aktif!')
      return
    }
    router.push(`/panel/checkout/${planSlug}`)
  }

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'free':
        return <Sparkles className="h-6 w-6" />
      case 'starter':
        return <Zap className="h-6 w-6" />
      case 'intermediate':
        return <Rocket className="h-6 w-6" />
      case 'professional':
        return <Crown className="h-6 w-6" />
      default:
        return <Zap className="h-6 w-6" />
    }
  }

  const getPlanColor = (slug: string) => {
    switch (slug) {
      case 'free':
        return 'from-blue-500 to-blue-600'
      case 'starter':
        return 'from-blue-500 to-blue-600'
      case 'intermediate':
        return 'from-pink-500 to-purple-600'
      case 'professional':
        return 'from-orange-500 to-orange-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
        <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
          <span className="text-primary font-semibold text-sm">💎 Basit ve Şeffaf Fiyatlandırma</span>
        </div>
        <h1 className="text-5xl font-bold text-secondary-900 mb-6">
          Size Uygun Planı Seçin
        </h1>
        <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
          Tek seferlik ödeme yapın, fotoğraf kredilerinizi kullanın. Abonelik yok, gizli ücret yok.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                plan.is_popular ? 'ring-2 ring-primary transform scale-105' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.is_popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-pink-500 text-white px-6 py-2 rounded-bl-2xl font-semibold text-sm shadow-lg">
                  ⭐ En Popüler
                </div>
              )}

              {/* Card Content */}
              <div className="p-8">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getPlanColor(plan.slug)} flex items-center justify-center text-white mb-6 shadow-lg`}>
                  {getPlanIcon(plan.slug)}
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-secondary-900 mb-2">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-secondary-900">
                      ${plan.price_usd}
                    </span>
                    {plan.slug !== 'free' && (
                      <span className="text-secondary-500 text-sm">tek seferlik</span>
                    )}
                  </div>
                  {plan.slug === 'free' && (
                    <p className="text-secondary-500 text-sm mt-1">Sonsuza kadar ücretsiz</p>
                  )}
                  {plan.slug !== 'free' && (
                    <p className="text-secondary-500 text-sm mt-1">
                      ${(plan.price_usd / plan.photo_credits).toFixed(2)}/fotoğraf
                    </p>
                  )}
                </div>

                {/* Credits */}
                <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-secondary-900">
                      {plan.photo_credits.toLocaleString()}
                    </p>
                    <p className="text-sm text-secondary-600">Fotoğraf Kredisi</p>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.slug)}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                    plan.is_popular
                      ? 'bg-gradient-to-r from-primary to-pink-500 text-white hover:shadow-xl transform hover:scale-105'
                      : plan.slug === 'free'
                      ? 'bg-gray-200 text-secondary-600 cursor-default'
                      : 'bg-secondary-900 text-white hover:bg-secondary-800 hover:shadow-lg'
                  }`}
                  disabled={plan.slug === 'free'}
                >
                  {plan.slug === 'free' ? 'Mevcut Plan' : 'Başla'}
                </button>

                {/* Features */}
                <div className="mt-8 space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-secondary-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Card */}
        <div className="mt-8 bg-gradient-to-br from-secondary-900 to-secondary-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-12 text-center">
            <div className="inline-block mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-xl">
                <Crown className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Kurumsal Çözüm</h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Büyük ölçekli etkinlikler için özel paketler. Sınırsız fotoğraf, özel destek ve SLA garantisi.
            </p>
            <button
              onClick={() => toast.success('Yakında! Şimdilik bizimle iletişime geçin: info@dijipot.com')}
              className="bg-white text-secondary-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Bizimle İletişime Geçin
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-secondary-900 mb-2">Ömür Boyu Erişim</h4>
            <p className="text-secondary-600">
              Bir kez ödeyin, kredilerinizi istediğiniz zaman kullanın. Süre sınırı yok.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-xl font-bold text-secondary-900 mb-2">Anında Aktif</h4>
            <p className="text-secondary-600">
              Ödeme sonrası kredileriniz hemen hesabınıza tanımlanır. Beklemeden başlayın.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="text-xl font-bold text-secondary-900 mb-2">30 Gün Para İade</h4>
            <p className="text-secondary-600">
              İlk 30 gün içinde memnun kalmazsanız, koşulsuz iade garantisi.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-secondary-900 mb-12">
            Sık Sorulan Sorular
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-secondary-900 mb-2">
                Fotoğraf kredileri bitiyor mu?
              </h3>
              <p className="text-secondary-600">
                Hayır! Satın aldığınız krediler ömür boyu geçerlidir. İstediğiniz zaman, istediğiniz etkinlikte kullanabilirsiniz.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-secondary-900 mb-2">
                Etkinlik limiti var mı?
              </h3>
              <p className="text-secondary-600">
                Free plan hariç tüm planlarda sınırsız etkinlik oluşturabilirsiniz. Sadece fotoğraf kredileriniz kullanılır.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-secondary-900 mb-2">
                Ödeme yöntemleri nelerdir?
              </h3>
              <p className="text-secondary-600">
                Kredi kartı, banka kartı ve havale ile ödeme yapabilirsiniz. Tüm ödemeler SSL ile güvence altındadır.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-secondary-900 mb-2">
                Plan yükseltmesi nasıl yapılır?
              </h3>
              <p className="text-secondary-600">
                İstediğiniz zaman daha büyük bir plan satın alabilirsiniz. Yeni krediler mevcut kredilerinize eklenir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
