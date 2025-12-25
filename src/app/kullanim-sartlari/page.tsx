'use client'

import Link from 'next/link'
import { Camera, ArrowLeft, FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Camera className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-secondary-800">Dijipot</span>
            </Link>
            <Link href="/" className="text-secondary-600 hover:text-primary flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfa
            </Link>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-secondary-900">
              Kullanım Şartları
            </h1>
            <p className="text-secondary-600 mt-2">
              Son Güncelleme: 25 Aralık 2024
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">1. Genel Hükümler</h2>
            <p className="text-secondary-700 leading-relaxed">
              Bu kullanım şartları, Dijipot platformunu kullanan tüm kullanıcılar için geçerlidir. 
              Platformu kullanarak bu şartları kabul etmiş sayılırsınız.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">2. Hizmet Tanımı</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              Dijipot, etkinlik fotoğraflarını yapay zeka ile otomatik eşleştiren bir platformdur:
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary-700">
              <li>Fotoğrafçılar etkinlik fotoğraflarını yükler</li>
              <li>Katılımcılar QR kod ile giriş yapar ve selfie çeker</li>
              <li>Yapay zeka fotoğrafları otomatik eşleştirir</li>
              <li>Katılımcılar kendilerinin olduğu fotoğrafları görür</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">3. Kullanıcı Yükümlülükleri</h2>
            <h3 className="text-xl font-semibold text-secondary-900 mb-3">Fotoğrafçılar / Stüdyolar:</h3>
            <ul className="list-disc list-inside space-y-2 text-secondary-700 mb-4">
              <li>Sadece yasal yollarla elde edilmiş fotoğrafları yüklemek</li>
              <li>Telif hakkı ihlali yapmamak</li>
              <li>Katılımcıların rızasını almak</li>
              <li>Uygunsuz içerik paylaşmamak</li>
            </ul>

            <h3 className="text-xl font-semibold text-secondary-900 mb-3">Katılımcılar:</h3>
            <ul className="list-disc list-inside space-y-2 text-secondary-700">
              <li>Doğru bilgiler vermek</li>
              <li>Hesap bilgilerini güvende tutmak</li>
              <li>Platformu kötüye kullanmamak</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">4. Fikri Mülkiyet Hakları</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              <strong>Fotoğraf Telif Hakları:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary-700">
              <li>Yüklenen fotoğrafların telif hakları fotoğrafçılara aittir</li>
              <li>Dijipot sadece eşleştirme hizmeti sunar, telif hakkı talep etmez</li>
              <li>Fotoğrafçılar istedikleri zaman fotoğraflarını silebilir</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">5. Ödeme ve İptal</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              <strong>Ödeme Koşulları:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary-700 mb-4">
              <li>Fiyatlandırma sayfasında belirtilen ücretler geçerlidir</li>
              <li>Ödemeler tek seferlik olup, fotoğraf kredisi olarak tanımlanır</li>
              <li>Krediler süresiz geçerlidir</li>
            </ul>

            <p className="text-secondary-700 leading-relaxed mb-2">
              <strong>İade Politikası:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary-700">
              <li>İlk 30 gün içinde memnun kalmazsanız tam iade</li>
              <li>Kullanılmış krediler iade edilmez</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">6. Sorumluluk Sınırlaması</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              Dijipot aşağıdaki durumlardan sorumlu değildir:
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary-700">
              <li>Yüz tanıma teknolojisinin %100 doğru sonuç vermemesi</li>
              <li>Kullanıcıların yüklediği uygunsuz içerikler</li>
              <li>İnternet bağlantı sorunları</li>
              <li>Üçüncü taraf hizmet sağlayıcıların kesintileri</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">7. Hesap Askıya Alma ve Sonlandırma</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              Dijipot, aşağıdaki durumlarda hesapları askıya alabilir veya sonlandırabilir:
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary-700">
              <li>Kullanım şartlarının ihlali</li>
              <li>Uygunsuz içerik paylaşımı</li>
              <li>Diğer kullanıcıların haklarının ihlali</li>
              <li>Dolandırıcılık veya kötüye kullanım</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">8. İletişim</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              Kullanım şartları hakkında sorularınız için:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-secondary-700">
                📧 E-posta: destek@dijipot.com<br />
                📞 Telefon: [Telefon Numarası]
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-primary hover:underline">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </main>
    </div>
  )
}
