# Biass Kasa — iOS Kurulum Rehberi
## Yazılımcı için adım adım

---

## GEREKSİNİMLER
- Mac bilgisayar
- Xcode 15+ (App Store'dan)
- Node.js 18+ (nodejs.org)
- Apple Developer hesabı ($99/yıl)
- GoogleService-Info.plist (Firebase'den indir)

---

## ADIM 1 — Proje Klasörü

```bash
mkdir biass-kasa-ios && cd biass-kasa-ios
```

`capacitor/` klasöründeki dosyaları kopyala:
- `package.json`
- `capacitor.config.json`

`www/` klasörü oluştur, içine koy:
- `index.html`
- `manifest.json`
- `sw.js`
- `icon-192.png`
- `icon-512.png`
- `privacy-policy.html`

```bash
npm install
npx cap add ios
npx cap sync ios
```

---

## ADIM 2 — Firebase Kurulumu

1. console.firebase.google.com → Proje: biass-kasa (yeni proje aç)
2. iOS uygulaması ekle → Bundle ID: `com.biass.kasa`
3. `GoogleService-Info.plist` indir
4. Xcode'da `App` klasörüne ekle

---

## ADIM 3 — Podfile

`ios/App/Podfile`:
```ruby
target 'App' do
  capacitor_pods
  pod 'Firebase/Core'
  pod 'Firebase/Messaging'
end
```

```bash
cd ios/App && pod install && cd ../..
npx cap sync ios
```

---

## ADIM 4 — AppDelegate.swift

```swift
import UIKit
import Capacitor
import FirebaseCore
import FirebaseMessaging

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  func application(_ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    FirebaseApp.configure()
    return true
  }

  func application(_ app: UIApplication,
    open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
    return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
  }

  func application(_ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    Messaging.messaging().apnsToken = deviceToken
    NotificationCenter.default.post(
      name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
  }

  func application(_ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error) {
    NotificationCenter.default.post(
      name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
  }
}
```

---

## ADIM 5 — Xcode Ayarları

1. **Signing & Capabilities**
   - Team: Apple Developer hesabı
   - Bundle ID: `com.biass.kasa`
2. **+ Capability** → Push Notifications
3. **+ Capability** → Background Modes → ✅ Remote notifications

---

## ADIM 6 — APNs Sertifikası

1. developer.apple.com → Certificates → + → APNs
2. App ID: `com.biass.kasa`
3. CSR yükle → İndir → `.p12` export
4. Firebase → Cloud Messaging → APNs sertifikasını yükle

---

## ADIM 7 — Firebase Service Account (Supabase Edge Function için)

Push notification'ları Supabase üzerinden göndermek için:

1. Firebase → Proje Ayarları → Service Accounts
2. Generate new private key → JSON indir
3. Supabase → Edge Functions'a yükle (opsiyonel — şimdilik Apps Script kullanılıyor)

---

## ADIM 8 — App Store Connect

1. appstoreconnect.apple.com → New App
2. Name: **Biass Kasa**
3. Bundle ID: `com.biass.kasa`
4. SKU: `biass-kasa-001`
5. Privacy Policy URL: `https://ozemaria53.github.io/biass-kasa/privacy-policy.html`
6. Category: **Finance**
7. Age Rating: 4+

**App Review Notu:**
> Bu uygulama yalnızca Biass Aksesuar Plastik Tekstil şirketi çalışanlarına özel dahili kasa yönetim sistemidir. Giriş için şirket tarafından atanmış hesap gerekmektedir.
> Demo: Kullanıcı: Yönetim, Şifre: 045743

---

## ADIM 9 — Archive & Upload

```
Product → Archive → Distribute App → App Store Connect → Upload
```

---

## İçerik Güncelleme

`index.html` değişince:
```bash
npx cap sync ios
# Xcode → Archive → Upload
```

---

## ÖNEMLİ

- Supabase URL: `https://zdveynidmwvplxfgtoyj.supabase.co`
- Push test için gerçek iPhone gerekir
EOF