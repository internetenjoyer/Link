# Linker - Bağlantı Takip Sistemi

Bu proje, bağlantıları (linkleri) kategorilere ve markalara göre düzenleyip takip etmeyi sağlayan bir web uygulamasıdır.

## Kurulum

Projeyi çalıştırmak için aşağıdaki adımları izleyin:

1. Gerekli paketleri yükleyin:
```
npm install
```

2. Sunucuyu başlatın:

Geliştirme modu (Nodemon ile otomatik yeniden başlatma):
```
npm run dev
```

veya

Üretim modu:
```
npm start
```

3. Tarayıcınızda aşağıdaki adresi açın:
```
http://localhost:3000
```

## Kullanım

- **Giriş Yapma**: Varsayılan kullanıcı adı ve şifre: `admin` / `admin`
- **Bağlantı Ekleme**: "Yeni Bağlantı Ekle" butonuna tıklayarak yeni bağlantı ekleyebilirsiniz.
- **Bağlantı Filtreleme**: Tarih, marka ve kategoriye göre bağlantıları filtreleyebilirsiniz.
- **Bağlantı Sıralama**: Bağlantıları sürükle-bırak yöntemiyle sıralayabilirsiniz.
- **Veri Dışa Aktarma**: Admin panelindeki butonları kullanarak verileri JSON formatında dışa aktarabilirsiniz.

## Geliştirme

Geliştirme yaparken `npm run dev` komutunu kullanmanız önerilir. Bu komut, Nodemon aracılığıyla kod değişikliklerini otomatik olarak algılar ve sunucuyu yeniden başlatır, böylece her değişiklik sonrası manuel olarak sunucuyu yeniden başlatmanıza gerek kalmaz.

## Önemli Not

Bu uygulama, bağlantıları `data/links.json` dosyasına kaydeder. Bağlantı ekleme, düzenleme, silme ve sıralama işlemleri bu dosyayı otomatik olarak günceller. Sunucunun çalışır durumda olduğundan emin olun.

## Teknik Detaylar

- Frontend: HTML, CSS, JavaScript (ES6+)
- Backend: Node.js, Express
- Veri Depolama: JSON dosyaları
- Bağımlılıklar: Express, CORS, Body-Parser
- Geliştirme Araçları: Nodemon

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. 