'use client'

import Link from 'next/link'
import { Camera, Zap, Users, QrCode, Upload, Bell, Download, CheckCircle } from 'lucide-react'
import DarkModeToggle from '@/components/DarkModeToggle'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Camera className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-secondary-800">Dijipot</span>
            </div>
      
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#ozellikler" className="text-secondary-600 hover:text-primary transition-colors">
                Özellikler
              </a>
              <a href="#nasil-calisir" className="text-secondary-600 hover:text-primary transition-colors">
                Nasıl Çalışır?
              </a>
              <Link href="/fiyatlandirma" className="text-secondary-600 hover:text-primary transition-colors">
                Fiyatlandırma
              </Link>
              <DarkModeToggle /> {/* 👈 BUNU EKLEYİN */}
              <Link href="/giris" className="text-secondary-600 hover:text-secondary-900">
                Giriş Yap
              </Link>
              <Link href="/kayit" className="btn-primary">
                Ücretsiz Başla
              </Link>
            </div>
      
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Link href="/kayit" className="btn-primary text-sm">
                Başla
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
              Ücretsiz Başla
            </Link>
            <Link href="/fiyatlandirma" className="btn-outline text-lg px-8 py-4">
              Fiyatları Görüntüle
            </Link>
          </div>
          <p className="text-sm text-secondary-500 mt-4">
            💳 Kredi kartı gerektirmez • 🎁 100 ücretsiz fotoğraf kredisi
          </p>
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
      {/* Pricing Teaser Section */}
      <section id="fiyatlandirma-ozet" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-800 mb-4">
              Basit ve Şeffaf Fiyatlandırma
            </h2>
            <p className="text-xl text-secondary-500 max-w-2xl mx-auto">
              Tek seferlik ödeme yapın, fotoğraf kredilerinizi kullanın. Abonelik yok.
            </p>
          </div>
      
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="card text-center hover:shadow-xl transition-shadow">
              <div className="mb-4">
                <div className="text-secondary-600 font-semibold mb-2">Ücretsiz</div>
                <div className="text-4xl font-bold text-secondary-800">$0</div>
              </div>
              <p className="text-secondary-500 mb-6">100 fotoğraf kredisi</p>
              <ul className="text-sm text-secondary-600 space-y-2 mb-6 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  5 etkinliğe kadar
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Temel yüz tanıma
                </li>
              </ul>
              <Link href="/kayit" className="btn-outline w-full">
                Başla
              </Link>
            </div>
      
            {/* Intermediate - Popular */}
            <div className="card text-center relative border-2 border-primary hover:shadow-xl transition-shadow">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                ⭐ En Popüler
              </div>
              <div className="mb-4 mt-4">
                <div className="text-secondary-600 font-semibold mb-2">Intermediate</div>
                <div className="text-4xl font-bold text-secondary-800">$499</div>
              </div>
              <p className="text-secondary-500 mb-6">2,000 fotoğraf kredisi</p>
              <ul className="text-sm text-secondary-600 space-y-2 mb-6 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Sınırsız etkinlik
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Yüksek çözünürlük
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Toplu işlemler
                </li>
              </ul>
              <Link href="/fiyatlandirma" className="btn-primary w-full">
                Detayları Gör
              </Link>
            </div>
      
            {/* Professional */}
            <div className="card text-center hover:shadow-xl transition-shadow">
              <div className="mb-4">
                <div className="text-secondary-600 font-semibold mb-2">Professional</div>
                <div className="text-4xl font-bold text-secondary-800">$999</div>
              </div>
              <p className="text-secondary-500 mb-6">5,000 fotoğraf kredisi</p>
              <ul className="text-sm text-secondary-600 space-y-2 mb-6 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Öncelikli destek
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Gelişmiş analitik
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  API erişimi
                </li>
              </ul>
              <Link href="/fiyatlandirma" className="btn-outline w-full">
                Detayları Gör
              </Link>
            </div>
          </div>
      
          <div className="text-center mt-8">
            <Link href="/fiyatlandirma" className="text-primary hover:underline font-semibold">
              Tüm planları ve özellikleri görüntüle →
            </Link>
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Camera className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Dijipot</span>
            </div>
            
            {/* Yasal Linkler */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm">
              <Link href="/kvkk" className="text-secondary-300 hover:text-white transition-colors">
                KVKK
              </Link>
              <span className="text-secondary-600">•</span>
              <Link href="/kullanim-sartlari" className="text-secondary-300 hover:text-white transition-colors">
                Kullanım Şartları
              </Link>
              <span className="text-secondary-600">•</span>
              <Link href="/gizlilik-politikasi" className="text-secondary-300 hover:text-white transition-colors">
                Gizlilik Politikası
              </Link>
            </div>
            
            {/* Copyright */}
            <div className="text-secondary-400 text-sm">
              © 2024 Dijipot. Tüm hakları saklıdır.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
