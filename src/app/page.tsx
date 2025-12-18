'use client'

import Link from 'next/link'
import { Camera, Zap, Users, QrCode, Upload, Bell, Download, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Camera className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-secondary-800">Dijipot</span>
            </div>
            <div className="flex gap-4">
              <Link href="/giris" className="text-secondary-600 hover:text-secondary-800 font-medium">
                Giriş Yap
              </Link>
              <Link href="/kayit" className="btn-primary text-sm">
                Ücretsiz Dene
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-secondary-800 mb-6">
            Yapay Zeka ile
            <span className="text-primary block mt-2">Fotoğraf Dağıtımı</span>
          </h1>
          <p className="text-xl text-secondary-500 max-w-2xl mx-auto mb-10">
            Etkinlik fotoğraflarınızı yüz tanıma teknolojisiyle otomatik eşleştirin, 
            misafirlerinize anında WhatsApp ile ulaştırın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/kayit" className="btn-primary text-lg px-8 py-4">
              Ücretsiz Dene
            </Link>
            <Link href="/giris" className="btn-outline text-lg px-8 py-4">
              Giriş Yap
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-secondary-800 mb-12">
            Neden Dijipot?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-800 mb-2">
                Yapay Zeka Eşleştirme
              </h3>
              <p className="text-secondary-500">
                Yüz tanıma teknolojisi ile fotoğrafları otomatik olarak doğru kişilerle eşleştirin.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-800 mb-2">
                Anında Teslimat
              </h3>
              <p className="text-secondary-500">
                Misafirleriniz fotoğraflarına WhatsApp üzerinden saniyeler içinde ulaşsın.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-800 mb-2">
                Kolay Kullanım
              </h3>
              <p className="text-secondary-500">
                Misafirler uygulama indirmeden, sadece QR kod okutarak fotoğraflarına erişsin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-secondary-800 mb-12">
            Nasıl Çalışır?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                1
              </div>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="font-semibold text-secondary-800 mb-2">Etkinlik Oluştur</h3>
              <p className="text-secondary-500 text-sm">QR kod otomatik oluşturulur</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                2
              </div>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="font-semibold text-secondary-800 mb-2">Fotoğraf Yükle</h3>
              <p className="text-secondary-500 text-sm">Toplu fotoğraf yükleyin</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                3
              </div>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="font-semibold text-secondary-800 mb-2">Misafir Selfie</h3>
              <p className="text-secondary-500 text-sm">QR okutup selfie çeksin</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                4
              </div>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="font-semibold text-secondary-800 mb-2">Otomatik Teslimat</h3>
              <p className="text-secondary-500 text-sm">Fotoğraflar anında iletilir</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Hemen Başlayın
          </h2>
          <p className="text-white/90 text-lg mb-8">
            İlk etkinliğinizi ücretsiz oluşturun ve farkı görün.
          </p>
          <Link href="/kayit" className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-block">
            Ücretsiz Kayıt Ol
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Camera className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Dijipot</span>
            </div>
            <div className="text-secondary-400 text-sm">
              © 2024 Dijipot. Tüm hakları saklıdır.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
