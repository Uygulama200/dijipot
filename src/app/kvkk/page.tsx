'use client'

import Link from 'next/link'
import { Camera, ArrowLeft, Shield } from 'lucide-react'

export default function KVKKPage() {
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
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-secondary-900">
              KVKK Aydınlatma Metni
            </h1>
            <p className="text-secondary-600 mt-2">
              Son Güncelleme: 25 Aralık 2024
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">1. Veri Sorumlusu</h2>
            <p className="text-secondary-700 leading-relaxed">
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz; 
              veri sorumlusu olarak Dijipot tarafından aşağıda açıklanan kapsamda işlenebilecektir.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">2. İşlenen Kişisel Veriler</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              Dijipot olarak, platformumuz üzerinden aşağıdaki kişisel verilerinizi işlemekteyiz:
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary-700">
              <li><strong>Kimlik Verileri:</strong> Ad, soyad, fotoğraf</li>
              <li><strong>İletişim Verileri:</strong> E-posta adresi, telefon numarası</li>
              <li><strong>Görsel Veriler:</strong> Etkinliklerde çekilen fotoğraflar</li>
              <li><strong>Biyometrik Veriler:</strong> Yüz tanıma için kullanılan yüz geometrisi verileri</li>
              <li><strong>İşlem Güvenliği Verileri:</strong> IP adresi, çerez kayıtları, tarayıcı bilgileri</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">3. Kişisel Verilerin İşlenme Amaçları</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary-700">
              <li>Etkinlik fotoğraflarını yapay zeka ile otomatik eşleştirme</li>
              <li>Kullanıcı hesabı oluşturma ve yönetme</li>
              <li>Platform hizmetlerinin sunulması ve geliştirilmesi</li>
              <li>İletişim ve bilgilendirme faaliyetleri</li>
              <li>Güvenlik ve dolandırıcılık önleme</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">4. Yüz Tanıma Teknolojisi</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              <strong>Önemli:</strong> Dijipot, etkinlik fotoğraflarını katılımcılarla eşleştirmek için 
              yapay zeka tabanlı yüz tanıma teknolojisi kullanmaktadır.
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary-700">
              <li>Yüz tanıma sadece fotoğraf eşleştirme amacıyla kullanılır</li>
              <li>Biyometrik veriler şifrelenmiş olarak saklanır</li>
              <li>Veriler üçüncü taraflarla paylaşılmaz</li>
              <li>İstemediğiniz zaman verilerinizi silebilirsiniz</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">5. Kişisel Verilerin Aktarımı</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              Kişisel verileriniz aşağıdaki durumlarda aktarılabilir:
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary-700">
              <li><strong>Hizmet Sağlayıcılar:</strong> Bulut depolama (Supabase), e-posta servisleri</li>
              <li><strong>Yasal Merciler:</strong> Yasal yükümlülük kapsamında yetkili kamu kurum ve kuruluşları</li>
              <li><strong>İş Ortakları:</strong> Fotoğrafçılar ve etkinlik organizatörleri (sadece ilgili etkinlik kapsamında)</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">6. KVKK Kapsamındaki Haklarınız</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary-700">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
              <li>Silme veya yok edilmesini isteme</li>
              <li>Aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
              <li>Münhasıran otomatik sistemler ile analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
              <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">7. Başvuru Yöntemi</h2>
            <p className="text-secondary-700 leading-relaxed mb-4">
              KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-secondary-900 font-medium mb-2">📧 E-posta:</p>
              <p className="text-secondary-700">kvkk@dijipot.com</p>
              
              <p className="text-secondary-900 font-medium mt-4 mb-2">📮 Posta Adresi:</p>
              <p className="text-secondary-700">
                [Şirket Adresi Buraya Gelecek]<br />
                KVKK Başvuruları
              </p>
            </div>
            <p className="text-secondary-600 text-sm mt-4">
              * Başvurularınız en geç 30 gün içinde yanıtlanacaktır.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">8. Güvenlik</h2>
            <p className="text-secondary-700 leading-relaxed">
              Kişisel verilerinizin güvenliği bizim için önceliklidir. Verilerinizi korumak için 
              endüstri standardı güvenlik önlemleri (SSL/TLS şifreleme, güvenli veri merkezleri, 
              erişim kontrolleri) uygulamaktayız.
            </p>
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
