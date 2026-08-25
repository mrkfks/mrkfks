# Docker Yapılandırma Rehberi

Bu proje Windows ve Linux'ta Docker kullanarak sorunsuz şekilde çalışacak şekilde yapılandırılmıştır.

## Dosyalar

- **Dockerfile** - Production build için multi-stage Dockerfile
- **Dockerfile.dev** - Development/geliştirme ortamı için Dockerfile
- **docker-compose.yml** - Production ortamı için Docker Compose yapılandırması
- **docker-compose.dev.yml** - Geliştirme ortamı için Docker Compose yapılandırması
- **.dockerignore** - Docker build'de hariç tutulacak dosyalar

## Kurulum

Docker ve Docker Compose'un sisteminizde kurulu olduğundan emin olun:

```bash
docker --version
docker-compose --version
```

## Production Ortamında Çalıştırma

### Seçenek 1: Docker Compose kullanarak (Önerilen)

```bash
# İlk çalıştırma - image'i build et ve container'ı başlat
docker-compose up --build

# Arka planda çalıştırma
docker-compose up -d

# Log'ları görmek
docker-compose logs -f

# Durdurma
docker-compose down
```

### Seçenek 2: Docker CLI kullanarak

```bash
# Image'i build et
docker build -t mrkfks:latest .

# Container'ı çalıştır
docker run -p 4200:4200 mrkfks:latest

# Container'ı arka planda çalıştır
docker run -d -p 4200:4200 --name mrkfks-app mrkfks:latest

# Log'ları görmek
docker logs -f mrkfks-app

# Container'ı durdurmak
docker stop mrkfks-app

# Container'ı silmek
docker rm mrkfks-app
```

## Geliştirme Ortamında Çalıştırma

### Seçenek 1: Docker Compose (Sıcak yeniden yükleme ile)

```bash
# Development ortamını başlat
docker-compose -f docker-compose.dev.yml up

# Arka planda çalıştırma
docker-compose -f docker-compose.dev.yml up -d

# Durdurma
docker-compose -f docker-compose.dev.yml down
```

### Seçenek 2: Docker CLI kullanarak

```bash
# Development image'ini build et
docker build -f Dockerfile.dev -t mrkfks:dev .

# Volume mount ile çalıştır (sıcak yeniden yükleme)
docker run -p 4200:4200 -v $(pwd):/app -v /app/node_modules mrkfks:dev

# Windows PowerShell için
docker run -p 4200:4200 -v ${PWD}:/app -v /app/node_modules mrkfks:dev

# Windows CMD için
docker run -p 4200:4200 -v %cd%:/app -v /app/node_modules mrkfks:dev
```

## Uygulamaya Erişim

- **URL**: `http://localhost:4200`
- **Porta Erişim**: Port 4200 expose edilmiştir

## Platform Uyumluluğu

Bu yapılandırma şu platformlarda test edilmiştir ve sorunsuz çalışmaktadır:

- ✅ **Windows** (Docker Desktop)
- ✅ **Linux** (Docker Engine)
- ✅ **macOS** (Docker Desktop)

## Node.js Versiyonu

Bu yapılandırma **Node.js 20 (Alpine Linux)** kullanmaktadır:

- Hafif ve hızlı başlatılan image
- npm 11.11.0 ile uyumlu
- Angular 21 ile tamamen uyumlu
- Cross-platform desteği

## Ek Komutlar

### Image bilgilerini görmek

```bash
docker images | grep mrkfks
```

### Çalışan container'ları görmek

```bash
docker ps
```

### Bütün container'ları görmek (durdurulmuş dahil)

```bash
docker ps -a
```

### Container'ın iç kısmında komut çalıştırmak

```bash
# Production
docker exec -it mrkfks-app /bin/sh

# Development
docker exec -it mrkfks-app-dev /bin/sh
```

### Container'dan belirli dosyaları kopyalamak

```bash
docker cp mrkfks-app:/app/dist ./local-dist
```

## Sorun Giderme

### Port 4200 zaten kullanılıyor mu?

```bash
# Docker Compose'da farklı port kullanın
docker-compose -e PORT=3000 up

# Veya docker-compose.yml'de ports kısmını düzenleyin:
# ports:
#   - "3000:4200"
```

### Container'ın başlaması başarısız oldu mu?

```bash
# Log'ları kontrol edin
docker-compose logs app

# Veya
docker logs mrkfks-app
```

### Node modules veya build sorunları?

```bash
# Cache'i temizle ve yeniden build et
docker-compose build --no-cache

# Veya
docker build --no-cache -t mrkfks:latest .
```

## Environment Variables

`.env` dosyası varsa Docker container'ında kullanılacaktır. Production için gerekli değişkenleri ayarlayın.

Örnek:
```bash
NODE_ENV=production
```

## Build Optimizasyon

Production Dockerfile aşağıdaki optimizasyonları içerir:

1. **Multi-stage Build** - Final image boyutunu küçültür
2. **Alpine Linux** - Minimum temel image boyutu (~5MB)
3. **npm ci** - Deterministic dependency installation
4. **Health Check** - Otomatik container sağlık kontrolü

## Lisans ve Notlar

Bu Docker yapılandırması Angular 21 SSR projesi için optimize edilmiştir.

---

**Sorularınız mı var?** Docker documentation: https://docs.docker.com/
