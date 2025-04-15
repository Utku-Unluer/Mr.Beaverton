# Mr.Beaverton - Dil Öğrenme Uygulaması

## Hakkında

Mr.Beaverton, kelime listeleri oluşturarak dil öğrenmeyi kolaylaştıran bir mobil uygulamadır. Bu uygulama, React Native ve Expo kullanılarak geliştirilmiştir ve Supabase veritabanı ile entegre edilmiştir.

## Proje Genel Bakış

Mr.Beaverton, kişiselleştirilmiş bir dil öğrenme uygulamasıdır ve kendi oluşturduğunuz kelime listelerine ve içeriklerine odaklanır. Bu uygulama kullanıcılara şunları sağlar:

1. Tüketilen içeriklerden (kitaplar, makaleler vb.) kelime listeleri oluşturma
2. Bilgileri sınavlarla test etme
3. ChatGPT destekli chatbot ile dil öğrenme konusunda yardım alma
4. Kelime dağarcığını etkili bir şekilde geliştirme

## Veritabanı Entegrasyonu

Bu proje, Supabase veritabanı ile entegre edilmiştir. Backend API, Node.js ve Express kullanılarak geliştirilmiştir ve veritabanı işlemleri için gerekli endpoint'leri sağlar.

### Özellikler:

1. **Kullanıcı Kimlik Doğrulama** - Giriş/Kayıt sistemi
2. **Kelime Listeleri** - Tüm kelime listelerinizi görüntüleyin
3. **Liste Oluşturma** - Yeni bir kelime listesi ekleyin
4. **Kelime Ekleme** - Mevcut listelere kelimeler ekleyin
5. **Test Modu** - Öğrenilen kelimeleri test edin
6. **Liste Detayları** - Liste içeriğini görüntüleyin ve yönetin
7. **Chatbot** - ChatGPT destekli chatbot ile dil öğrenme konusunda yardım alın
8. **Arama** - Kelimeleri ve listeleri bulun
9. **Ayarlar** - Uygulama tercihlerini yönetin
10. **API Ayarları** - Backend API bağlantı ayarlarını yönetin

## Kurulum

### Ön Koşullar

- Node.js (v14 veya üzeri)
- npm veya yarn
- Supabase hesabı
- OpenAI API anahtarı (Chatbot özelliği için)
- Expo CLI (`npm install -g expo-cli`)

### Backend Kurulumu

1. Backend klasörüne gidin:
   ```
   cd Mr_Beaverton/backend
   ```

2. Bağımlılıkları yükleyin:
   ```
   npm install
   ```

3. `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli bilgileri doldurun:
   ```
   cp .env.example .env
   ```

4. Supabase'de gerekli tabloları oluşturun:
   ```sql
   -- Users tablosu
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     password TEXT NOT NULL,
     name TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     streak INTEGER DEFAULT 0
   );

   -- WordLists tablosu
   CREATE TABLE wordlists (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     description TEXT,
     context TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Words tablosu
   CREATE TABLE words (
     id SERIAL PRIMARY KEY,
     list_id INTEGER REFERENCES wordlists(id) ON DELETE CASCADE,
     value TEXT NOT NULL,
     meaning TEXT NOT NULL,
     context TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Chatbot conversations tablosu
   CREATE TABLE chatbot_conversations (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
     message TEXT NOT NULL,
     response TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     context JSONB
   );
   ```

5. Backend sunucusunu başlatın:
   ```
   node server.js
   ```

### Frontend Kurulumu

1. Ana proje klasörüne gidin:
   ```
   cd Mr_Beaverton
   ```

2. Bağımlılıkları yükleyin:
   ```
   npm install
   ```

3. `src/api/apiService.ts` dosyasında API URL'sini kendi ortamınıza göre ayarlayın

4. Uygulamayı başlatın:
   ```
   npm start
   ```

5. Expo Go uygulamasını kullanarak QR kodu tarayın veya emülatörde açın.

6. API ayarlarını uygulama içinden de yapabilirsiniz. Ayarlar ekranından "API Ayarları" seçeneğine tıklayarak API URL'sini güncelleyebilirsiniz.

## Veritabanı Şeması

- **users**: Kullanıcı bilgileri (id, email, password, name, created_at, last_active, streak)
- **wordlists**: Kelime listeleri (id, user_id, name, description, context, created_at)
- **words**: Kelimeler (id, list_id, value, meaning, context, created_at)
- **chatbot_conversations**: Chatbot konuşma geçmişi (id, user_id, message, response, created_at, context)

## API Endpoint'leri

### Kimlik Doğrulama

- `POST /api/auth/login`: Kullanıcı girişi
- `POST /api/auth/register`: Yeni kullanıcı kaydı
- `GET /api/auth/user`: Mevcut kullanıcı bilgilerini getir

### Kelime Listeleri

- `GET /api/lists`: Tüm listeleri getir
- `POST /api/lists`: Yeni liste oluştur
- `GET /api/lists/:id`: Belirli bir listeyi getir
- `PUT /api/lists/:id`: Listeyi güncelle
- `DELETE /api/lists/:id`: Listeyi sil

### Kelimeler

- `GET /api/words/list/:listId`: Bir listedeki tüm kelimeleri getir
- `POST /api/words`: Yeni kelime ekle
- `PUT /api/words/:id`: Kelimeyi güncelle
- `DELETE /api/words/:id`: Kelimeyi sil
- `POST /api/words/bulk`: Toplu kelime ekle

### Test

- `POST /api/tests/generate`: Test soruları oluştur

### Chatbot

- `POST /api/chatbot/message`: Chatbot'a mesaj gönder
- `POST /api/chatbot/clear-history`: Chatbot konuşma geçmişini temizle

### Sağlık Kontrolü

- `GET /api/health`: API sağlık durumunu kontrol et

## Proje Yapısı

```
Mr_Beaverton/
├── assets/              # Uygulama ikonları ve görselleri
├── src/
│   ├── api/             # API servisi ve veri çekme işlemleri
│   ├── components/      # Yeniden kullanılabilir UI bileşenleri
│   ├── context/         # React Context sağlayıcıları (örn. AuthContext)
│   ├── navigation/      # Navigasyon yapılandırması
│   ├── screens/         # Ana uygulama ekranları
│   │   ├── auth/        # Kimlik doğrulama ekranları
│   │   ├── ChatbotScreen # Chatbot ekranı
│   │   ├── ListDetailScreen # Liste detay ekranı
│   │   ├── ListsScreen  # Listeler ekranı
│   │   ├── TestScreen   # Test ekranı
│   │   └── ApiSettingsScreen # API ayarları ekranı
│   ├── styles/          # Stil ve tema
│   └── types/           # TypeScript tip tanımlamaları
├── backend/             # Backend API (Node.js/Express)
│   ├── routes/          # API rotaları
│   ├── middleware/      # Express middleware
│   └── .env.example     # Örnek .env dosyası
├── .env.example         # Örnek .env dosyası
├── .gitignore           # Git tarafından yok sayılacak dosyalar
└── App.tsx              # Ana uygulama bileşeni
```

## Geliştirme Notları

- Kod iyi belgelenmiş ve en iyi uygulamaları takip etmektedir
- Koyu tema ve kullanıcı dostu arayüz ile tutarlı bir UI/UX yaklaşımı uygulanmıştır
- Chatbot özelliği için OpenAI API anahtarı gereklidir
- Veritabanı için Supabase kullanılmıştır
- API URL'si dinamik olarak ayarlanabilir, böylece farklı cihazlarda ve ağlarda çalışabilir

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
