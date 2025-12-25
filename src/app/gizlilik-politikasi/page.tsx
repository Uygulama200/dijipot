'use client'

import Link from 'next/link'
import { Camera, ArrowLeft, Lock } from 'lucide-react'

export default function PrivacyPage() {
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
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-secondary-900">
              Gizlilik Politikası
            </h1>
            <p className="text-secondary-600 mt-2">
              Son Güncelleme: 25 Aralık 2024
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">1. Giriş</h2>
            <p className="text-secondary-700 leading-relaxed">
              Dijipot olarak gizliliğinize önem veriyoruz. Bu gizlilik politikası, 
              kişisel verilerinizi nasıl topladığımızı, kullandığımızı, koruduğumuzu 
              ve paylaştığımızı açıklar.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">2. Topladığımız Bilgiler</h2>
            
            <h3 className="text-xl font-semibold text-secondary-900 mb-3">2.1. Doğrudan Verdiğiniz Bilgiler</h3>
            <ul className="list-disc list-inside space-y-2 text-secondary-700 mb-4">
              <li><strong>Hesap Bilgileri:</strong> Ad, soyad, e-posta, telefon</li>
              <li><strong>Selfie Fotoğrafı:</strong> Yüz tanıma için çektiğiniz fotoğraf</li>
              <li><strong>Ödeme Bilgileri:</strong> Ödeme işlemi için gerekli bilgiler (kart bilgileri saklanmaz)</li>
            </ul>

            <h3 className="text-xl font-semibold text-secondary-900 mb-3">2.2. Otomatik Toplanan Bilgiler</h3>
            <ul className="list-disc list-inside space-y-2 text-secondary-700">
              <li><strong>Kullanım Bilgileri:</strong> Hangi sayfaları ziyaret ettiğiniz, ne kadar süre kaldığınız</li>
              <li><strong>Cihaz Bilgileri:</strong> IP adresi, tarayıcı türü, işletim sistemi</li>
              <li><strong>Çerezler:</strong> Oturum yönetimi ve tercihlerinizi hatırlamak için</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">3. Bilgilerinizi Nasıl Kullanırız</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              Topladığımız bilgileri şu amaçlarla kullanırız:
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary-700">
              <li><strong>Hizmet Sunumu:</strong> Yüz tanıma ile fotoğraf eşleştirme</li>
              <li><strong>Hesap Yönetimi:</strong> Giriş, şifre sıfırlama, profil güncelleme</li>
              <li><strong>İletişim:</strong> Önemli güncellemeler, bildirimler</li>
              <li><strong>Güvenlik:</strong> Dolandırıcılık önleme, hesap güvenliği</li>
              <li><strong>İyileştirme:</strong> Hizmet kalitesini artırma, yeni özellikler geliştirme</li>
              <li><strong>Yasal Uyum:</strong> Yasal yükümlülükleri yerine getirme</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">4. Yüz Tanıma Teknolojisi ve Gizlilik</h2>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <p className="text-orange-900 font-semibold mb-2">⚠️ Önemli Bilgi</p>
              <p className="text-orange-800 text-sm">
                Yüz tanıma teknolojisi hassas kişisel veri içerir. Gizliliğiniz bizim için önceliklidir.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-secondary-900 mb-3">Nasıl Çalışır:</h3>
            <ul className="list-disc list-inside space-y-2 text-secondary-700 mb-4">
              <li>Selfie fotoğrafınızdan yüz geometrisi çıkarılır (matematiksel veri)</li>
              <li>Bu veri, etkinlik fotoğraflarındaki yüzlerle eşleştirilir</li>
              <li>Eşleşen fotoğraflar size gösterilir</li>
            </ul>

            <h3 className="text-xl font-semibold text-secondary-900 mb-3">Güvenlik Önlemleri:</h3>
            <ul className="list-disc list-inside space-y-2 text-secondary-700">
              <li>✅ Tüm yüz verileri şifrelenmiş olarak saklanır</li>
              <li>✅ Veriler sadece fotoğraf eşleştirme için kullanılır</li>
              <li>✅ Üçüncü taraflarla paylaşılmaz</li>
              <li>✅ İstediğiniz zaman silebilirsiniz</li>
              <li>✅ Veri merkezleri ISO 27001 sertifikalıdır</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">5. Bilgi Paylaşımı</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              Bilgilerinizi şu durumlarda paylaşabiliriz:
            </p>
            
            <h3 className="text-xl font-semibold text-secondary-900 mb-3">5.1. Hizmet Sağlayıcılar</h3>
            <ul className="list-disc list-inside space-y-2 text-secondary-700 mb-4">
              <li><strong>Supabase:</strong> Veritabanı ve dosya depolama</li>
              <li><strong>Face++:</strong> Yüz tanıma API'si</li>
              <li><strong>E-posta Servisi:</strong> Bildirimler için</li>
            </ul>

            <h3 className="text-xl font-semibold text-secondary-900 mb-3">5.2. Yasal Gereklilikler</h3>
            <p className="text-secondary-700 leading-relaxed mb-4">
              Yasal zorunluluk durumunda yetkili makamlara bilgi verebiliriz.
            </p>

            <h3 className="text-xl font-semibold text-secondary-900 mb-3">5.3. Etkinlik Organizatörleri</h3>
            <p className="text-secondary-700 leading-relaxed">
              Sadece ilgili etkinlik kapsamında, fotoğrafçılar eşleşen fotoğrafları görebilir.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">6. Veri Saklama Süresi</h2>
            <ul className="list-disc list-inside space-y-2 text-secondary-700">
              <li><strong>Hesap Bilgileri:</strong> Hesabınız aktif olduğu sürece</li>
              <li><strong>Yüz Verileri:</strong> Hesabınız aktif olduğu sürece veya silme talebinize kadar</li>
              <li><strong>Etkinlik Fotoğrafları:</strong> Fotoğrafçının belirlediği süre (genelde 30-90 gün)</li>
              <li><strong>Log Kayıtları:</strong> Güvenlik için 6 ay</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">7. Haklarınız</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              Kişisel verileriniz üzerinde şu haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary-700">
              <li><strong>Erişim Hakkı:</strong> Verilerinizin kopyasını talep edebilirsiniz</li>
              <li><strong>Düzeltme Hakkı:</strong> Yanlış bilgileri düzeltebilirsiniz</li>
              <li><strong>Silme Hakkı:</strong> Hesabınızı ve tüm verilerinizi silebilirsiniz</li>
              <li><strong>İtiraz Hakkı:</strong> Veri işlemeye itiraz edebilirsiniz</li>
              <li><strong>Taşınabilirlik Hakkı:</strong> Verilerinizi başka platforma taşıyabilirsiniz</li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-secondary-900 font-medium mb-2">📧 Haklarınızı Kullanmak İçin:</p>
              <p className="text-secondary-700">
                E-posta: gizlilik@dijipot.com<br />
                Konu: "Kişisel Veri Talebi"
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">8. Çerezler</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              Dijipot, kullanıcı deneyimini iyileştirmek için çerezler kullanır:
            </p>
            
            <h3 className="text-xl font-semibold text-secondary-900 mb-3">Çerez Türleri:</h3>
            <ul className="list-disc list-inside space-y-2 text-secondary-700 mb-4">
              <li><strong>Zorunlu Çerezler:</strong> Oturum yönetimi, güvenlik</li>
              <li><strong>Performans Çerezleri:</strong> Hız ve performans ölçümü</li>
              <li><strong>Fonksiyonel Çerezler:</strong> Tercihlerinizi hatırlama</li>
            </ul>

            <p className="text-secondary-700 leading-relaxed">
              Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz. Ancak bazı çerezleri 
              devre dışı bırakırsanız, platformun bazı özellikleri çalışmayabilir.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">9. Güvenlik</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              Verilerinizi korumak için kullandığımız önlemler:
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary-700">
              <li>🔒 SSL/TLS şifreleme (HTTPS)</li>
              <li>🔐 Şifre hash'leme (bcrypt)</li>
              <li>🛡️ Güvenlik duvarı (Firewall)</li>
              <li>👁️ Düzenli güvenlik denetimleri</li>
              <li>⚠️ Otomatik tehdit algılama</li>
              <li>📊 Erişim kontrolleri ve loglama</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">10. Çocukların Gizliliği</h2>
            <p className="text-secondary-700 leading-relaxed">
              Dijipot, 18 yaşın altındaki kullanıcılardan bilerek kişisel veri toplamaz. 
              Eğer 18 yaşın altındaysanız, platformu kullanmadan önce ebeveyn veya 
              vasinin iznini almalısınız.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">11. Politika Değişiklikleri</h2>
            <p className="text-secondary-700 leading-relaxed">
              Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler 
              olduğunda size e-posta ile bildirim göndereceğiz. Politika değişikliklerini 
              düzenli olarak kontrol etmenizi öneririz.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">12. İletişim</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              Gizlilik politikası hakkında sorularınız için:
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-secondary-700">
                📧 E-posta: gizlilik@dijipot.com<br />
                📞 Telefon: [Telefon Numarası]<br />
                📮 Adres: [Şirket Adresi]
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
