# Dijipot - Yapay Zeka ile Fotoğraf Dağıtımı

Etkinlik fotoğraflarını yüz tanıma teknolojisiyle otomatik eşleştiren ve misafirlere anında ulaştıran platform.

## 🚀 Özellikler

- ✅ Fotoğrafçı paneli (kayıt, giriş, etkinlik yönetimi)
- ✅ Otomatik QR kod oluşturma
- ✅ Sürükle-bırak fotoğraf yükleme
- ✅ Misafir selfie çekme
- ✅ Fotoğraf galerisi ve indirme
- ✅ Türkçe arayüz
- ✅ Mobil uyumlu tasarım

## 📦 Kurulum

### 1. Supabase Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. SQL Editor'da aşağıdaki tabloları oluşturun:

```sql
-- Studios tablosu
CREATE TABLE studios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events tablosu
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id UUID REFERENCES studios(id),
  name TEXT NOT NULL,
  event_date DATE,
  event_code TEXT UNIQUE NOT NULL,
  qr_code_url TEXT,
  status TEXT DEFAULT 'active',
  photo_count INT DEFAULT 0,
  participant_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Photos tablosu
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  original_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Participants tablosu
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  phone TEXT,
  selfie_url TEXT,
  photo_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_events" ON events FOR SELECT USING (true);
CREATE POLICY "public_read_photos" ON photos FOR SELECT USING (true);
CREATE POLICY "public_read_participants" ON participants FOR SELECT USING (true);
CREATE POLICY "public_insert_participants" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_photos" ON photos FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_studios" ON studios FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_studios" ON studios FOR SELECT USING (true);
CREATE POLICY "public_insert_events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_events" ON events FOR UPDATE USING (true);
```

4. Storage'da iki bucket oluşturun:
   - `selfies` (Public)
   - `photos` (Public)

### 2. Proje Kurulumu

```bash
# Bağımlılıkları yükle
npm install

# .env.local dosyasını düzenle (zaten hazır)
# Supabase bilgileriniz .env.local dosyasında

# Geliştirme sunucusunu başlat
npm run dev
```

### 3. Vercel'e Deploy

1. [Vercel](https://vercel.com) hesabı oluşturun
2. GitHub'a push edin veya Vercel'e dosyaları yükleyin
3. Environment variables ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## 📱 Sayfalar

| Sayfa | URL | Açıklama |
|-------|-----|----------|
| Ana Sayfa | `/` | Landing page |
| Giriş | `/giris` | Fotoğrafçı girişi |
| Kayıt | `/kayit` | Fotoğrafçı kaydı |
| Panel | `/panel` | Dashboard |
| Etkinlikler | `/panel/etkinlikler` | Etkinlik listesi |
| Etkinlik Oluştur | `/panel/etkinlik/olustur` | Yeni etkinlik |
| Etkinlik Detay | `/panel/etkinlik/[id]` | Etkinlik yönetimi |
| Misafir Katılım | `/e/[code]` | QR kod sonrası sayfa |
| Selfie | `/selfie` | Selfie çekme |
| Bekleme | `/bekle/[id]` | İşlem bekleme |
| Galeri | `/g/[id]` | Fotoğraf galerisi |

## 🛠 Teknolojiler

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Hosting:** Vercel
- **Icons:** Lucide React

## 📄 Lisans

MIT License

---

Made with ❤️ by Dijipot
