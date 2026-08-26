# GitHub Pages Deployment Rehberi - Angular 21+ Projesi

## ✅ Tamamlanan Yapılandırmalar

Proje aşağıdaki ayarlamalar zaten yapılmış olarak hazırlanmıştır:

### 1. **Angular Router - Hash-Based Routing**
**Dosya:** `src/app/app.config.ts`
```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()), // ← GitHub Pages 404 hatalarını engeller
    provideClientHydration(),
    provideHttpClient(withFetch())
  ]
};
```

**Neden gerekli?** GitHub Pages statik dosya sunucusu olduğundan, açılış "/" ile başlayan route'lar 404 hatasına neden olur. Hash-based routing (`#`) kullanarak bu sorunu çözeriz.

---

### 2. **Angular Build Configuration**
**Dosya:** `angular.json`
```json
"configurations": {
  "production": {
    "baseHref": "/mrkfks/",  // ← Repository adı ile eşleş!
    "budgets": [
      {
        "type": "initial",
        "maximumWarning": "500kB",
        "maximumError": "1MB"
      },
      {
        "type": "anyComponentStyle",
        "maximumWarning": "16kB",
        "maximumError": "32kB"
      }
    ],
    "outputHashing": "all"
  }
}
```

**Önemli:** `baseHref` değeri repository adınıza göre ayarlanmalıdır:
- Repo: `mrkfks` → `baseHref: "/mrkfks/"`
- Repo: `portfolio` → `baseHref: "/portfolio/"`
- User Pages (repo: `username.github.io`) → `baseHref: "/"`

---

### 3. **Jekyll İşlemeyi Devre Dışı Bırakma**
**Dosya:** `public/.nojekyll` (boş dosya)

Bu dosya GitHub Pages'in Jekyll motor kullanarak Markdown dosyalarını işlemesini engeller. Böylece Angular asset dosyaları (JS, CSS) doğru şekilde sunulur.

---

### 4. **GitHub Actions Workflow**
**Dosya:** `.github/workflows/deploy.yml`
```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '24'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build

    - name: Remove README.md from dist
      run: rm -f dist/mrkfks/browser/README.md 2>/dev/null || true

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v4
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist/mrkfks/browser
        force_orphan: true
```

**Workflow Açıklaması:**
- `main` branch'ine `push` edilince otomatik çalışır
- Node.js 24 ile Angular projesini derler (`npm run build`)
- Derlenen çıktı `dist/mrkfks/browser` dizinindedir
- `README.md` dosyasını remove eder (statik sayfa olmaması için)
- Compiled output'u otomatik `gh-pages` branch'ine deploy eder

---

## 🔧 GitHub Sayfası Ayarları (Manuel Konfigürasyon)

### Adım 1: Repository Settings Açma
1. GitHub repository sayfanıza gidin: https://github.com/mrkfks/mrkfks
2. **Settings** sekmesine tıklayın (sağ üst, gear icon)

### Adım 2: Pages Sekmesi
3. Sol menüden **Pages** seçeneğini bulun
4. "Build and deployment" bölümünde:
   - **Source:** "Deploy from a branch" seçin
   - **Branch:** `gh-pages` ve `/ (root)` seçin
   - **Save** butonuna tıklayın

### Adım 3: Doğrulama
5. Kısa bir süre sonra aşağıdaki mesaj görünecek:
   ```
   Your site is live at https://mrkfks.github.io/mrkfks/
   ```
6. Bu URL'yi ziyaret edin ve Angular uygulamanızın yüklendiğini doğrulayın

---

## 📋 Deployment Kontrol Listesi

- [ ] `app.config.ts` → `withHashLocation()` eklendi
- [ ] `angular.json` → `baseHref: "/mrkfks/"` ayarlandı (reposu adı ile)
- [ ] `public/.nojekyll` → dosya mevcut ve boş
- [ ] `.github/workflows/deploy.yml` → GitHub Actions workflow kurulu
- [ ] `package-lock.json` → repository'ye commit edilmiş
- [ ] GitHub Pages Settings → Branch `gh-pages`, Source `/ (root)`
- [ ] GitHub Actions çalıştı → ✅ başarılı (Actions sekmesinde kontrol)

---

## 🚀 Test Etme ve Troubleshooting

### Build Locally Test
```bash
npm run build
ls dist/mrkfks/browser/  # index.html olduğunu doğrula
```

### GitHub Actions Log Kontrol
1. Repository → **Actions** sekmesi
2. En son workflow çalışmasını tıkla
3. `build-and-deploy` job → `Build application` adımında hata var mı kontrol et

### Yaygın Sorunlar

**Sorun 1:** "Cannot find module" hatası
```bash
# Çözüm: package-lock.json'ı commit et
git add package-lock.json
git commit -m "Add: package-lock.json"
git push origin main
```

**Sorun 2:** README.md hala gösteriliyor
```bash
# Sorun: .nojekyll dosyası eksik
touch public/.nojekyll
git add public/.nojekyll
git commit -m "Add: .nojekyll to disable Jekyll"
git push origin main
```

**Sorun 3:** Routes 404 hatası veriyor
```bash
# Sorun: withHashLocation() eksik veya baseHref yanlış
# app.config.ts'de withHashLocation() kullandığınızı doğrulayın
# angular.json'da baseHref değerini kontrol edin
```

**Sorun 4:** Assets (CSS/JS) yüklenmiyorsa
```bash
# Sorun: baseHref hatalı
# Tarayıcı DevTools → Network tab'ında dosyaların hangi URL'den çekildiğini kontrol edin
# Örn: https://mrkfks.github.io/mrkfks/main-xyz.js olmalı
```

---

## 📊 Başarılı Deployment Göstergeleri

✅ https://mrkfks.github.io/mrkfks/ ziyaret ettiğinizde:
- [ ] Angular uygulaması yüklenecek (README.md değil)
- [ ] Sidebar ve Explorer menüsü görünecek
- [ ] Chat widget 💬 butonunun çalışacağı
- [ ] Tab bar ile dosyaları seçebilecek
- [ ] URL'de `#` sembolü olacak: `https://mrkfks.github.io/mrkfks/#/`

---

## 🔄 CI/CD Pipeline Akışı

```
1. Lokal: git commit → git push origin main
   ↓
2. GitHub: main branch'ine push algılandı
   ↓
3. Actions: deploy.yml workflow tetiklendi
   ↓
4. Build: npm install & npm run build
   ↓
5. Output: dist/mrkfks/browser/ dizini oluşturuldu
   ↓
6. Deploy: peaceiris/actions-gh-pages → gh-pages branch'ine push
   ↓
7. GitHub Pages: gh-pages branch'i yayınladı
   ↓
8. Live: https://mrkfks.github.io/mrkfks/ canlı ✅
```

---

## 📝 Notlar

- Repository adınız `mrkfks` ise `baseHref: "/mrkfks/"` kullanın
- User Pages ise (repo: `username.github.io`), `baseHref: "/"` kullanın
- Hash routing sayesinde soft navigation sağlanır (sayfa yenilemesi olmaz)
- `.nojekyll` dosyası Jekyll'ı devre dışı bırakır (Angular assets için şart)
- GitHub Actions otomatik deploy sağlar (her push'ta çalışır)

---

**Deployment yapıldıktan sonra 2-3 dakika bekleyin, sonra URL'i tarayıcıda yenileyin!**
