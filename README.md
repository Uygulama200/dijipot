# Dijipot - Yapay Zeka ile Fotoğraf Dağıtımı

Etkinlik fotoğraflarını yüz tanıma teknolojisiyle otomatik eşleştiren ve misafirlere anında ulaştıran platform.

## 🚀 Özellikler

- ✅ Fotoğrafçı paneli (kayıt, giriş, etkinlik yönetimi)
- ✅ Otomatik QR kod oluşturma
- ✅ Sürükle-bırak fotoğraf yükleme
- ✅ **Yüz tanıma ve eşleştirme (Face++ API)**
- ✅ Misafir selfie çekme
- ✅ Kişiye özel fotoğraf galerisi
- ✅ Türkçe arayüz
- ✅ Mobil uyumlu tasarım

## 🔧 Kurulum

### 1. Supabase Tabloları

SQL Editor'da çalıştırın:

```sql
-- Temel tablolar
CREATE TABLE studios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

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

CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  original_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  phone TEXT,
  selfie_url TEXT,
  photo_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Yüz tanıma tabloları
CREATE TABLE face_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  face_token TEXT NOT NULL,
  face_rectangle JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE participant_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  confidence FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexler
CREATE INDEX idx_face_tokens_photo ON face_tokens(photo_id);
CREATE INDEX idx_participant_matches_participant ON participant_matches(participant_id);

-- RLS Policies
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all_studios" ON studios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_photos" ON photos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_participants" ON participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_face_tokens" ON face_tokens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_matches" ON participant_matches FOR ALL USING (true) WITH CHECK (true);
```

### 2. Storage Buckets

Supabase → Storage → New Bucket:
- `selfies` (Public ✅)
- `photos` (Public ✅)

Her bucket için Policy ekleyin:
- Policy name: `allow_all`
- Operations: SELECT, INSERT, UPDATE, DELETE
- Policy definition: `true`

### 3. Environment Variables

Vercel'de şu değişkenleri ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
FACEPP_API_KEY=your_facepp_api_key
FACEPP_API_SECRET=your_facepp_api_secret
```

### 4. Deploy

```bash
# Lokal geliştirme
npm install
npm run dev

# Vercel'e deploy
git push origin main
```

## 📱 Sayfalar

| Sayfa | URL | Açıklama |
|-------|-----|----------|
| Ana Sayfa | `/` | Landing page |
| Giriş | `/giris` | Fotoğrafçı girişi |
| Kayıt | `/kayit` | Fotoğrafçı kaydı |
| Panel | `/panel` | Dashboard |
| Etkinlikler | `/panel/etkinlikler` | Etkinlik listesi |
| Etkinlik Oluştur | `/panel/etkinlik/olustur` | Yeni etkinlik |
| Etkinlik Detay | `/panel/etkinlik/[id]` | Etkinlik yönetimi + Yüz tespiti |
| Misafir Katılım | `/e/[code]` | QR kod sonrası sayfa |
| Selfie | `/selfie` | Selfie çekme + Yüz eşleştirme |
| Bekleme | `/bekle/[id]` | İşlem bekleme |
| Galeri | `/g/[id]` | Eşleşen fotoğraflar |

## 🧠 Yüz Tanıma Akışı

```
FOTOĞRAF YÜKLEME:
1. Fotoğraf Supabase Storage'a yüklenir
2. Face++ API ile yüzler tespit edilir
3. Her yüz için face_token alınır
4. face_tokens tablosuna kaydedilir

MİSAFİR SELFİE:
1. Misafir selfie çeker
2. Selfie Supabase Storage'a yüklenir
3. Face++ API ile selfie'deki yüz tespit edilir
4. Tüm etkinlik fotoğraflarındaki yüzlerle karşılaştırılır
5. %75+ benzerlik olanlar participant_matches'e kaydedilir
6. Misafir sadece eşleşen fotoğrafları görür
```

## 🛠 Teknolojiler

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Yüz Tanıma:** Face++ API
- **Hosting:** Vercel

## 📄 Lisans

MIT License

---

Made with ❤️ by Dijipot
