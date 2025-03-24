const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Sunucu IP adresini alma
function getServerIPAddress() {
    try {
        const interfaces = os.networkInterfaces();
        // Güvenli erişim için
        const allAddresses = [];
        
        // Tüm ağ arabirimlerini topla
        Object.keys(interfaces).forEach(interfaceName => {
            const addresses = interfaces[interfaceName];
            if (Array.isArray(addresses)) {
                addresses.forEach(address => {
                    if (address.family === 'IPv4' && !address.internal) {
                        allAddresses.push(address.address);
                    }
                });
            }
        });
        
        // Uygun bir IP adresi bulduysan döndür
        if (allAddresses.length > 0) {
            return allAddresses[0];
        }
    } catch (err) {
        console.error('IP adresi alınırken hata:', err);
    }
    
    // Hata durumunda tüm arayüzlerde dinle
    return '0.0.0.0';
}

const IP = '0.0.0.0'; // Tüm ağ arayüzlerinde dinlemek için en güvenli seçenek

// CORS ve JSON body parser ayarları
app.use(cors({
    origin: '*', // Tüm kaynaklara izin ver (geliştirme için)
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// İstek gövdesi boyutu sınırını artırıyoruz
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Statik dosyaları sunmak için
app.use(express.static('./'));

// Sunucu bilgilerini göster
console.log('Sunucu başlatılıyor...');
console.log(`Çalışma dizini: ${__dirname}`);
console.log(`İşletim sistemi: ${os.platform()} ${os.release()}`);

// Hata ayıklama amaçlı data dizini kontrolü
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    try {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log(`Data dizini oluşturuldu: ${dataDir}`);
    } catch (err) {
        console.error(`Data dizini oluşturulamadı: ${err.message}`);
        console.error(`Tam hata: ${err.stack}`);
    }
} else {
    try {
        fs.accessSync(dataDir, fs.constants.R_OK | fs.constants.W_OK);
        console.log(`Data dizini hazır ve erişilebilir: ${dataDir}`);
        
        // Data dizinindeki dosyaları listele
        const files = fs.readdirSync(dataDir);
        console.log(`Data dizinindeki dosyalar: ${files.join(', ') || 'Boş'}`);
    } catch (err) {
        console.error(`Data dizini erişim hatası: ${err.message}`);
        console.error(`Yetki hataları için sunucuyu gerekli izinlerle çalıştırdığınızdan emin olun.`);
    }
}

// Root endpoint - API durumu
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>Linker API Durumu</title></head>
            <body>
                <h1>Linker API Çalışıyor</h1>
                <p>Sunucu zamanı: ${new Date().toLocaleString()}</p>
                <p>API erişim noktası: <a href="/api/test">/api/test</a></p>
            </body>
        </html>
    `);
});

// Dosya okuma işlemi
app.get('/api/read/:file', (req, res) => {
    const file = req.params.file;
    const filePath = path.join(__dirname, 'data', `${file}.json`);
    
    console.log(`Dosya okuma isteği: ${filePath}`);
    
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            console.log(`Dosya başarıyla okundu: ${file}.json`);
            res.json(JSON.parse(data));
        } else {
            console.log(`Dosya bulunamadı: ${filePath}`);
            res.status(404).json({ error: 'Dosya bulunamadı', path: filePath });
        }
    } catch (error) {
        console.error(`Dosya okuma hatası (${filePath}): ${error.message}`);
        console.error(`Tam hata: ${error.stack}`);
        res.status(500).json({ error: `Dosya okuma hatası: ${error.message}`, path: filePath });
    }
});

// Dosya yazma işlemi
app.post('/api/write/:file', (req, res) => {
    const file = req.params.file;
    const filePath = path.join(__dirname, 'data', `${file}.json`);
    const data = req.body;
    
    console.log(`Dosya yazma isteği: ${filePath}`);
    console.log(`Gelen veri boyutu: ${JSON.stringify(data).length} karakter`);
    
    try {
        // data klasörünün varlığını kontrol etme
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log(`Data klasörü oluşturuldu: ${dataDir}`);
        }
        
        // Dosya üzerinde yazma izni kontrol et
        try {
            fs.accessSync(dataDir, fs.constants.W_OK);
        } catch (error) {
            console.error(`Yazma izni hatası (${dataDir}): ${error.message}`);
            return res.status(500).json({ error: `Dosya klasöründe yazma izni yok: ${error.message}`, path: dataDir });
        }
        
        // Verileri string'e dönüştür
        const jsonData = JSON.stringify(data, null, 2);
        
        // Geçici dosyaya yaz, sonra taşı (daha güvenli)
        const tempPath = `${filePath}.temp`;
        fs.writeFileSync(tempPath, jsonData, 'utf8');
        
        // Eğer orijinal dosya varsa, yedekle
        if (fs.existsSync(filePath)) {
            const backupPath = `${filePath}.bak`;
            fs.copyFileSync(filePath, backupPath);
            console.log(`Orjinal dosya yedeklendi: ${backupPath}`);
        }
        
        // Geçici dosyayı taşı
        fs.renameSync(tempPath, filePath);
        
        console.log(`${file}.json dosyası başarıyla güncellendi (${jsonData.length} karakter)`);
        res.json({ success: true, message: `${file}.json dosyası başarıyla güncellendi` });
    } catch (error) {
        console.error(`Dosya yazma hatası (${filePath}): ${error.message}`);
        console.error(`Tam hata: ${error.stack}`);
        res.status(500).json({ error: `Dosya yazma hatası: ${error.message}`, path: filePath });
    }
});

// Basit test endpoint'i
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'API çalışıyor', 
        timestamp: new Date().toISOString(),
        server: {
            platform: os.platform(),
            version: os.release(),
            hostname: os.hostname(),
            uptime: os.uptime()
        } 
    });
});

// Sunucuyu başlatma - Tüm arayüzlerde dinle
app.listen(PORT, IP, () => {
    console.log(`Sunucu port ${PORT} üzerinde tüm arayüzlerde çalışıyor`);
    console.log(`Yerel erişim: http://localhost:${PORT}`);
    console.log(`API test: http://localhost:${PORT}/api/test`);
    
    // Sunucu IP adreslerini görüntüle
    try {
        const interfaces = os.networkInterfaces();
        console.log('Mevcut ağ arayüzleri:');
        Object.keys(interfaces).forEach(ifaceName => {
            const addresses = interfaces[ifaceName];
            if (Array.isArray(addresses)) {
                addresses.forEach(addr => {
                    if (addr.family === 'IPv4' && !addr.internal) {
                        console.log(`  - ${ifaceName}: http://${addr.address}:${PORT}`);
                    }
                });
            }
        });
    } catch (err) {
        console.error('Ağ arabirimlerini listelerken hata:', err);
    }
}); 