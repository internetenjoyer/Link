const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS ve JSON body parser ayarları
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('./'));

// Nodemon için log
console.log('Sunucu başlatılıyor... (Nodemon aktif)');

// Dosya okuma işlemi
app.get('/api/read/:file', (req, res) => {
    const file = req.params.file;
    const filePath = path.join(__dirname, 'data', `${file}.json`);
    
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.status(404).json({ error: 'Dosya bulunamadı' });
        }
    } catch (error) {
        console.error(`Dosya okuma hatası: ${error.message}`);
        res.status(500).json({ error: 'Dosya okuma hatası' });
    }
});

// Dosya yazma işlemi
app.post('/api/write/:file', (req, res) => {
    const file = req.params.file;
    const filePath = path.join(__dirname, 'data', `${file}.json`);
    const data = req.body;
    
    try {
        // data klasörünün varlığını kontrol etme
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log('data klasörü oluşturuldu');
        }
        
        // Dosya üzerinde yazma izni kontrol et
        try {
            fs.accessSync(dataDir, fs.constants.W_OK);
        } catch (error) {
            console.error(`Yazma izni hatası: ${error.message}`);
            return res.status(500).json({ error: 'Dosya klasöründe yazma izni yok.' });
        }
        
        // JSON verilerini dosyaya yazma
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`${file}.json dosyası güncellendi`);
        res.json({ success: true, message: `${file}.json dosyası başarıyla güncellendi` });
    } catch (error) {
        console.error(`Dosya yazma hatası: ${error.message}`);
        res.status(500).json({ error: `Dosya yazma hatası: ${error.message}` });
    }
});

// Sunucuyu başlatma
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
    console.log('Değişiklikler otomatik olarak algılanacak (Nodemon sayesinde)');
}); 
