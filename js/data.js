/**
 * Veri yönetimi sınıfı
 * Kullanıcılar, markalar, kategoriler ve bağlantılar için CRUD işlemlerini yönetir.
 * Hem yerel depolama (localStorage) hem de API üzerinden veri senkronizasyonu sağlar.
 */
export class DataManager {
    /**
     * DataManager sınıfı yapılandırıcısı
     * @param {Object} toastManager - Bildirim gösterimi için ToastManager nesnesi
     * @param {Object} authManager - Kimlik doğrulama için AuthManager nesnesi (isteğe bağlı)
     * @param {Object} linkManager - Bağlantı yönetimi için LinkManager nesnesi (isteğe bağlı)
     */
    constructor(toastManager, authManager = null, linkManager = null) {
        /**
         * Veri koleksiyonları
         * @type {Array}
         */
        this.users = [];
        this.brands = [];
        this.categories = [];
        this.links = [];
        this.postTypes = {}; // Kategori ID'lerine göre gönderi tipleri
        
        /**
         * API yapılandırması
         * @type {string}
         */
        this.apiBaseUrl = window.location.origin + '/api';
        this.readApiUrl = `${this.apiBaseUrl}/read`;
        this.writeApiUrl = `${this.apiBaseUrl}/write`;
        
        /**
         * Bağımlılıklar
         * @type {Object}
         */
        this.toastManager = toastManager;
        this.authManager = authManager;
        this.linkManager = linkManager;
        
        // Bağımlılık kontrolü
        if (!toastManager) {
            console.warn('DataManager: ToastManager bağımlılığı sağlanmadı, bildirimler gösterilmeyecek');
        }
    }
    
    // Veri yöneticisini başlatma
    async init() {
        try {
            console.log('Veri yöneticisi başlatılıyor...');
            
            // Tüm veri kaynaklarını sırayla yükle
            const loadTasks = [
                { name: 'kullanıcılar', fn: this.loadUsers.bind(this) },
                { name: 'markalar', fn: this.loadBrands.bind(this) },
                { name: 'kategoriler', fn: this.loadCategories.bind(this) },
                { name: 'bağlantılar', fn: this.loadLinks.bind(this) }
            ];
            
            for (const task of loadTasks) {
                try {
                    await task.fn();
                    console.log(`${task.name} başarıyla yüklendi`);
                } catch (err) {
                    console.error(`${task.name} yüklenirken hata: ${err.message}`);
                }
            }
            
            // Gönderi tiplerini tanımlama
            this.definePostTypes();
            
            console.log('Veri yöneticisi başarıyla başlatıldı');
            return true;
        } catch (error) {
            console.error('Veri yöneticisi başlatılırken hata oluştu:', error);
            
            // Varsayılan verileri kullanma
            this.useDefaultData();
            return false;
        }
    }
    
    // Genel veri yükleme metodu - tekrarlanan kodları önlemek için
    async loadData(dataType, defaultValue = []) {
        try {
            let data = null;
            
            // Önce localStorage'dan yüklemeyi dene
            const storedData = localStorage.getItem(dataType);
            if (storedData) {
                data = JSON.parse(storedData);
                console.log(`${dataType} localStorage'dan yüklendi:`, data.length);
            }
            
            // API'den yüklemeyi dene
            const apiData = await this.readFromApi(dataType);
            if (apiData) {
                data = apiData;
                localStorage.setItem(dataType, JSON.stringify(data));
                console.log(`${dataType} API'den yüklendi:`, data.length);
            }
            
            // Hiçbir kaynak bulunamazsa varsayılan değeri kullan
            if (!data) {
                data = defaultValue;
                localStorage.setItem(dataType, JSON.stringify(data));
                console.log(`${dataType} bulunamadı, varsayılan değer kullanıldı`);
            }
            
            return data;
        } catch (error) {
            console.error(`${dataType} yüklenirken hata oluştu:`, error);
            const data = defaultValue;
            localStorage.setItem(dataType, JSON.stringify(data));
            return data;
        }
    }
    
    // Kullanıcıları yükleme
    async loadUsers() {
        try {
            // Varsayılan admin kullanıcısı
            const defaultAdmin = [
                {
                    id: 'admin',
                    username: 'admin',
                    passwordHash: 'f39f5b669a5945c131c89351e6ffeff0d951f93217df42711cbf6a6928bb46e9', // 'root' şifresinin hash'i
                    role: 'admin',
                    allowedBrands: []
                }
            ];
            
            this.users = await this.loadData('users', defaultAdmin);
            
            // Kullanıcı listesi boşsa, varsayılan admin kullanıcısını ekle
            if (this.users.length === 0) {
                this.users = defaultAdmin;
                await this.saveUsers();
                console.log('Varsayılan admin kullanıcısı oluşturuldu');
            }
            
            return this.users;
        } catch (error) {
            console.error('Kullanıcılar yüklenirken hata oluştu:', error);
            return [];
        }
    }
    
    // Markaları yükleme
    async loadBrands() {
        this.brands = await this.loadData('brands', []);
        
        // Markaları ID yerine isimleri ile tanımla
        this.brands.forEach(brand => {
            if (!brand.displayName) {
                brand.displayName = brand.name;
            }
        });
        
        return this.brands;
    }
    
    // Kategorileri yükleme
    async loadCategories() {
        this.categories = await this.loadData('categories', []);
        return this.categories;
    }
    
    // Bağlantıları yükleme
    async loadLinks() {
        this.links = await this.loadData('links', []);
        
        // Mevcut bağlantılara marka ve kategori isimlerini ekle
        this.links.forEach(link => {
            if (!link.brandName && link.brandId) {
                const brand = this.brands.find(b => b.id === link.brandId);
                if (brand) {
                    link.brandName = brand.name;
                }
            }
            
            if (!link.categoryName && link.categoryId) {
                const category = this.categories.find(c => c.id === link.categoryId);
                if (category) {
                    link.categoryName = category.name;
                }
            }
        });
        
        // Güncellenmiş bağlantıları kaydet
        await this.saveLinks();
        
        return this.links;
    }
    
    // Gönderi tiplerini tanımlama
    definePostTypes() {
        // Kategorileri bul
        const instagram = this.categories.find(c => c.name === 'Instagram');
        const facebook = this.categories.find(c => c.name === 'Facebook');
        const linkedin = this.categories.find(c => c.name === 'LinkedIn');
        const youtube = this.categories.find(c => c.name === 'YouTube');
        
        // Gönderi tiplerini tanımla
        this.postTypes = {
            // Instagram gönderi tipleri
            [instagram ? instagram.id : 'instagram']: [
                { id: 'post', name: 'Post' },
                { id: 'carousel', name: 'Carousel Post' },
                { id: 'reels', name: 'Reels' }
            ],
            
            // Facebook gönderi tipleri
            [facebook ? facebook.id : 'facebook']: [
                { id: 'post', name: 'Post' },
                { id: 'carousel', name: 'Carousel Post' },
                { id: 'reels', name: 'Reels' }
            ],
            
            // LinkedIn gönderi tipleri
            [linkedin ? linkedin.id : 'linkedin']: [
                { id: 'image', name: 'Görsel' },
                { id: 'video', name: 'Video' },
                { id: 'carousel', name: 'Carousel Post' },
                { id: 'blog', name: 'Blog' }
            ],
            
            // YouTube gönderi tipleri
            [youtube ? youtube.id : 'youtube']: [
                { id: 'video', name: 'Video' },
                { id: 'shorts', name: 'Shorts' }
            ]
        };
        
        console.log('Gönderi tipleri tanımlandı:', this.postTypes);
    }
    
    // Varsayılan verileri kullanma
    useDefaultData() {
        console.log('Varsayılan veriler kullanılıyor');
        
        // Varsayılan kullanıcılar
        this.users = [
            {
                id: 'admin',
                username: 'admin',
                passwordHash: 'f39f5b669a5945c131c89351e6ffeff0d951f93217df42711cbf6a6928bb46e9', // 'root' şifresinin hash'i
                role: 'admin',
                allowedBrands: []
            }
        ];
        
        // Varsayılan markalar
        this.brands = [
            { id: 'brand1', name: 'Scania', logo: null },
            { id: 'brand2', name: 'Meiller', logo: null },
            { id: 'brand3', name: 'Wielton', logo: null },
            { id: 'brand4', name: 'Vibe Medya', logo: null },
            { id: 'brand5', name: 'Korlas', logo: null },
            { id: 'brand6', name: 'Kosy', logo: null },
            { id: 'brand7', name: 'Lovesail', logo: null }
        ];
        
        // Varsayılan kategoriler
        this.categories = [
            { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram' },
            { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin' },
            { id: 'youtube', name: 'YouTube', icon: 'fab fa-youtube' },
            { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook' },
            { id: 'website', name: 'Web Sitesi', icon: 'fas fa-globe' }
        ];
        
        // Varsayılan bağlantılar
        this.links = [];
        
        // Verileri kaydetme
        this.saveUsers();
        this.saveBrands();
        this.saveCategories();
        this.saveLinks();
    }
    
    // API'den veri okuma
    async readFromApi(file) {
        try {
            const response = await fetch(`${this.readApiUrl}/${file}`);
            
            if (response.ok) {
                return await response.json();
            } else if (response.status === 404) {
                console.log(`${file}.json dosyası bulunamadı, yeni oluşturulacak`);
                return null;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API okuma hatası');
            }
        } catch (error) {
            console.error(`API'den ${file} okuma hatası:`, error);
            return null;
        }
    }
    
    // API'ye veri yazma
    async writeToApi(file, data) {
        try {
            console.log(`API'ye yazma isteği gönderiliyor: ${this.writeApiUrl}/${file}`);
            
            // İstek zaman aşımı için 15 saniye tanımlayalım
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            // API'ye POST isteği gönderme
            const response = await fetch(`${this.writeApiUrl}/${file}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });
            
            // Zaman aşımı zamanlayıcısını temizle
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const result = await response.json();
                console.log(`API yanıtı: ${result.message}`);
                return true;
            } else {
                let errorMessage = 'API yazma hatası';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                    console.error(`API hata yanıtı: ${JSON.stringify(errorData)}`);
                } catch (e) {
                    console.error(`API yanıtını işleme hatası: ${e.message}`);
                }
                
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error(`API'ye ${file} yazma hatası:`, error);
            
            // Ağ hatası olup olmadığını kontrol et
            let errorMessage = error.message;
            if (error.name === 'AbortError') {
                errorMessage = 'API isteği zaman aşımına uğradı. Sunucu yanıt vermiyor.';
            } else if (!navigator.onLine) {
                errorMessage = 'İnternet bağlantınız yok. Lütfen bağlantınızı kontrol edin.';
            } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                errorMessage = 'Sunucuya bağlanılamıyor. Lütfen sunucunun çalıştığından emin olun.';
            }
            
            if (this.toastManager) {
                this.toastManager.error(`${file}.json dosyası güncellenirken hata oluştu: ${errorMessage}`);
            }
            
            // Hata olsa bile localStorage'a kaydet
            try {
                localStorage.setItem(file, JSON.stringify(data));
                console.log(`Veriler localStorage'a kaydedildi. Sunucu erişilebilir olduğunda tekrar denenecek.`);
            } catch (e) {
                console.error(`localStorage'a kaydetme hatası: ${e.message}`);
            }
            
            return false;
        }
    }
    
    // Genel kaydetme metodu
    async saveData(dataType, data) {
        try {
            // Veriyi JSON formatına çevirme
            const jsonData = JSON.stringify(data, null, 2);
            
            // localStorage'a kaydetme
            localStorage.setItem(dataType, jsonData);
            
            // API'ye kaydetme
            await this.writeToApi(dataType, data);
            
            console.log(`${dataType} başarıyla kaydedildi`);
            return true;
        } catch (error) {
            console.error(`${dataType} kaydedilirken hata oluştu:`, error);
            return false;
        }
    }
    
    // Kullanıcıları kaydetme
    async saveUsers(users = this.users) {
        return await this.saveData('users', users);
    }
    
    // Markaları kaydetme
    async saveBrands(brands = this.brands) {
        return await this.saveData('brands', brands);
    }
    
    // Kategorileri kaydetme
    async saveCategories(categories = this.categories) {
        return await this.saveData('categories', categories);
    }
    
    // Bağlantıları kaydetme
    async saveLinks(links = this.links) {
        return await this.saveData('links', links);
    }
    
    // Tüm verileri JSON olarak dışa aktarma
    exportAllDataAsJSON() {
        try {
            // Tüm verileri bir araya getirme
            const allData = {
                users: this.users,
                brands: this.brands,
                categories: this.categories,
                links: this.links
            };
            
            // JSON dosyasını oluşturma ve indirme
            const date = new Date().toISOString().split('T')[0];
            const filename = `all_data_${date}.json`;
            this.downloadJSON(allData, filename);
            
            return true;
        } catch (error) {
            console.error('Veriler dışa aktarılırken hata oluştu:', error);
            return false;
        }
    }
    
    // Belirli bir veri türünü JSON olarak dışa aktarma
    exportDataAsJSON(data, filename) {
        try {
            // JSON dosyasını oluşturma ve indirme
            this.downloadJSON(data, filename);
            return true;
        } catch (error) {
            console.error(`${filename} dışa aktarılırken hata oluştu:`, error);
            return false;
        }
    }
    
    // JSON verilerini dosya olarak indirme yardımcı metodu
    downloadJSON(data, filename) {
        // JSON verilerini oluşturma
        const jsonData = JSON.stringify(data, null, 2);
        
        // JSON verilerini blob'a dönüştürme
        const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
        
        // Dosya indirme bağlantısı oluşturma
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Kullanıcıya bildirim gösterme
        if (this.toastManager) {
            this.toastManager.success(`${filename} başarıyla dışa aktarıldı`);
        }
        
        console.log(`${filename} başarıyla dışa aktarıldı`);
    }
    
    // Herhangi bir veri türünü dışa aktarma yardımcı metodu
    exportEntityAsJSON(dataType, data) {
        const date = new Date().toISOString().split('T')[0];
        const filename = `${dataType}_${date}.json`;
        return this.exportDataAsJSON(data, filename);
    }
    
    // Bağlantıları JSON olarak dışa aktarma
    exportLinksAsJSON() {
        return this.exportEntityAsJSON('links', this.links);
    }
    
    // Kullanıcıları JSON olarak dışa aktarma
    exportUsersAsJSON() {
        // Şifre ve hash bilgilerini gizleyerek kullanıcıları dışa aktar
        const sanitizedUsers = this.users.map(user => {
            const { password, passwordHash, ...restUser } = user;
            return {
                ...restUser,
                password: "********", // Şifre bilgisini gizle
            };
        });
        
        return this.exportEntityAsJSON('users', sanitizedUsers);
    }
    
    // Markaları JSON olarak dışa aktarma
    exportBrandsAsJSON() {
        return this.exportEntityAsJSON('brands', this.brands);
    }
    
    // Kategorileri JSON olarak dışa aktarma
    exportCategoriesAsJSON() {
        return this.exportEntityAsJSON('categories', this.categories);
    }
    
    // Genel varlık ekle/güncelle/sil için yardımcı metotlar
    _getEntityData(entityType) {
        switch (entityType) {
            case 'user': return { collection: this.users, saveMethod: this.saveUsers.bind(this) };
            case 'brand': return { collection: this.brands, saveMethod: this.saveBrands.bind(this) };
            case 'category': return { collection: this.categories, saveMethod: this.saveCategories.bind(this) };
            default: throw new Error(`Bilinmeyen varlık türü: ${entityType}`);
        }
    }
    
    // Genel varlık ekleme metodu
    async addEntity(entityType, entityData) {
        try {
            const { collection, saveMethod } = this._getEntityData(entityType);
            
            // ID oluşturma
            entityData.id = this.generateId();
            
            // Koleksiyona ekleme
            collection.push(entityData);
            
            // Değişiklikleri kaydetme
            await saveMethod();
            
            console.log(`${entityType} eklendi:`, entityData);
            return entityData;
        } catch (error) {
            console.error(`${entityType} eklenirken hata oluştu:`, error);
            throw error;
        }
    }
    
    // Genel varlık güncelleme metodu
    async updateEntity(entityType, entityId, updatedData) {
        try {
            const { collection, saveMethod } = this._getEntityData(entityType);
            
            // Varlığı bulma
            const index = collection.findIndex(entity => entity.id === entityId);
            
            if (index === -1) {
                throw new Error(`${entityType} bulunamadı`);
            }
            
            // Özel işlemler
            if (entityType === 'user' && entityId === 'admin' && updatedData.role) {
                updatedData.role = 'admin'; // Admin kullanıcısının rolünü koruma
            }
            
            // Varlığı güncelleme (var olan alanları koruyarak)
            collection[index] = { ...collection[index], ...updatedData };
            
            // Değişiklikleri kaydetme
            await saveMethod();
            
            console.log(`${entityType} güncellendi:`, collection[index]);
            return collection[index];
        } catch (error) {
            console.error(`${entityType} güncellenirken hata oluştu:`, error);
            throw error;
        }
    }
    
    // Genel varlık silme metodu
    async deleteEntity(entityType, entityId) {
        try {
            const { collection, saveMethod } = this._getEntityData(entityType);
            
            // Özel korumalar
            if (entityType === 'user' && entityId === 'admin') {
                throw new Error('Admin kullanıcısı silinemez');
            }
            
            // Varlığı bulma
            const index = collection.findIndex(entity => entity.id === entityId);
            
            if (index === -1) {
                throw new Error(`${entityType} bulunamadı`);
            }
            
            // İlişkileri kontrol etme
            if (entityType === 'brand' || entityType === 'category') {
                const fieldName = entityType === 'brand' ? 'brandId' : 'categoryId';
                const hasLinks = this.links.some(link => link[fieldName] === entityId);
                
                if (hasLinks) {
                    throw new Error(`Bu ${entityType}'a ait bağlantılar bulunmaktadır. Önce bağlantıları silmelisiniz.`);
                }
            }
            
            // Varlığı silme
            collection.splice(index, 1);
            
            // Değişiklikleri kaydetme
            await saveMethod();
            
            console.log(`${entityType} silindi: ${entityId}`);
            return true;
        } catch (error) {
            console.error(`${entityType} silinirken hata oluştu:`, error);
            throw error;
        }
    }
    
    // Kullanıcı ekleme
    async addUser(user) {
        // allowedBrands dizisini kontrol et
        if (!Array.isArray(user.allowedBrands)) {
            user.allowedBrands = [];
        }
        
        return await this.addEntity('user', user);
    }
    
    // Kullanıcı güncelleme
    async updateUser(userId, updatedUser) {
        // allowedBrands dizisini kontrol et
        if (updatedUser.allowedBrands && !Array.isArray(updatedUser.allowedBrands)) {
            updatedUser.allowedBrands = [];
        }
        
        return await this.updateEntity('user', userId, updatedUser);
    }
    
    // Kullanıcı silme
    async deleteUser(userId) {
        return await this.deleteEntity('user', userId);
    }
    
    // Marka ekleme
    async addBrand(brand) {
        return await this.addEntity('brand', brand);
    }
    
    // Marka güncelleme
    async updateBrand(brandId, updatedBrand) {
        return await this.updateEntity('brand', brandId, updatedBrand);
    }
    
    // Marka silme
    async deleteBrand(brandId) {
        return await this.deleteEntity('brand', brandId);
    }
    
    // Kategori ekleme
    async addCategory(category) {
        return await this.addEntity('category', category);
    }
    
    // Kategori güncelleme
    async updateCategory(categoryId, updatedCategory) {
        return await this.updateEntity('category', categoryId, updatedCategory);
    }
    
    // Kategori silme
    async deleteCategory(categoryId) {
        return await this.deleteEntity('category', categoryId);
    }
    
    // Bağlantı işlemleri için genel metot
    async processLink(action, linkData) {
        try {
            let result;
            
            switch (action) {
                case 'add':
                    // ID oluşturma (eğer yoksa)
                    if (!linkData.id) {
                        linkData.id = this.generateId();
                    }
                    
                    // İlişkili veri doldurma
                    this._fillLinkRelatedData(linkData);
                    
                    // Bağlantıyı diziye ekleme
                    this.links.push(linkData);
                    result = linkData;
                    console.log('Bağlantı başarıyla eklendi:', linkData);
                    break;
                    
                case 'update':
                    // Bağlantıyı bulma
                    const updateIndex = this.links.findIndex(link => link.id === linkData.id);
                    
                    if (updateIndex === -1) {
                        throw new Error('Güncellenecek bağlantı bulunamadı');
                    }
                    
                    // İlişkili veri doldurma
                    this._fillLinkRelatedData(linkData);
                    
                    // Bağlantıyı güncelleme
                    this.links[updateIndex] = linkData;
                    result = linkData;
                    console.log('Bağlantı başarıyla güncellendi:', linkData);
                    break;
                    
                case 'delete':
                    // Bağlantıyı bulma (sadece ID gönderilmiş olabilir)
                    const deleteIndex = this.links.findIndex(link => link.id === linkData);
                    
                    if (deleteIndex === -1) {
                        throw new Error('Bağlantı bulunamadı');
                    }
                    
                    // Bağlantıyı silme
                    this.links.splice(deleteIndex, 1);
                    result = true;
                    console.log('Bağlantı başarıyla silindi:', linkData);
                    break;
                    
                default:
                    throw new Error(`Geçersiz bağlantı işlemi: ${action}`);
            }
            
            // Bağlantıları kaydetme
            await this.saveLinks();
            return result;
        } catch (error) {
            console.error(`Bağlantı ${action} işlemi sırasında hata oluştu:`, error);
            throw error;
        }
    }
    
    // İlişkili bağlantı verilerini doldurma yardımcı metodu
    _fillLinkRelatedData(linkData) {
        // Marka adını doldurma
        if (linkData.brandId && !linkData.brandName) {
            const brand = this.brands.find(b => b.id === linkData.brandId);
            if (brand) {
                linkData.brandName = brand.name;
            }
        }
        
        // Kategori adını doldurma
        if (linkData.categoryId && !linkData.categoryName) {
            const category = this.categories.find(c => c.id === linkData.categoryId);
            if (category) {
                linkData.categoryName = category.name;
            }
        }
        
        return linkData;
    }
    
    // Bağlantı ekleme
    async addLink(linkData) {
        return await this.processLink('add', linkData);
    }
    
    // Bağlantı güncelleme
    async updateLink(linkData) {
        return await this.processLink('update', linkData);
    }
    
    // Bağlantı silme
    async deleteLink(linkId) {
        return await this.processLink('delete', linkId);
    }
    
    // Bağlantı sıralaması kaldırıldı (İstenilen değişiklik #32)
    async updateLinkOrder(linkIds) {
        // Bu fonksiyon artık kullanılmıyor
        console.log('Bağlantı sıralaması özelliği kaldırıldı (İstenilen değişiklik #32)');
        return true;
    }
    
    // Benzersiz ID oluşturma
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    // Filtrelere göre bağlantıları getirme
    getLinks(filters = {}) {
        try {
            console.log('getLinks fonksiyonu çağrıldı, filtreler:', filters);
            
            // Bağlantıları tarihe göre sıralama (sürükleme sıralaması kaldırıldı)
            let sortedLinks = [...this.links].sort((a, b) => {
                // Tarih sıralaması (yeniden eskiye)
                return new Date(b.datetime) - new Date(a.datetime);
            });
            
            // Kullanıcının erişebileceği bağlantıları filtreleme
            if (this.linkManager && this.linkManager.filterLinks) {
                sortedLinks = this.linkManager.filterLinks(sortedLinks, filters);
            } else {
                console.warn('LinkManager veya filterLinks fonksiyonu bulunamadı, filtreleme yapılamıyor');
            }
            
            return sortedLinks;
        } catch (error) {
            console.error('Bağlantılar getirilirken hata oluştu:', error);
            return [];
        }
    }
    
    // Erişilebilir bağlantı sayısını getirme
    getAccessibleLinkCount() {
        // Kullanıcının rolünü kontrol et
        const isAdmin = this.authManager && this.authManager.isAdmin && this.authManager.isAdmin();
        const isEditor = this.authManager && this.authManager.currentUser && this.authManager.currentUser.role === 'editor';
        
        // Admin ve editör tüm bağlantılara erişebilir
        if (isAdmin || isEditor) {
            return this.links.length;
        }
        
        // Normal kullanıcı için erişilebilir bağlantı sayısını hesapla
        const allowedBrands = this.authManager && this.authManager.currentUser && 
                             Array.isArray(this.authManager.currentUser.allowedBrands) ? 
                             this.authManager.currentUser.allowedBrands : [];
        
        const accessibleCount = this.links.filter(link => 
            allowedBrands.includes(link.brandId)
        ).length;
        
        return accessibleCount;
    }
    
    /**
     * CSV veri dosyası oluşturma
     * @param {Array} data - CSV'ye dönüştürülecek veri dizisi
     * @param {Function} rowGeneratorFn - Her satırı oluşturmak için kullanılacak fonksiyon
     * @returns {string} - Oluşturulan CSV içeriği
     */
    generateCSV(data, rowGeneratorFn) {
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }
        
        try {
            // CSV başlıkları
            const headers = ['URL', 'Başlık', 'Açıklama', 'Marka', 'Kategori', 'Gönderi Tipi', 'Ekleyen', 'Tarih'];
            
            // Başlık satırı
            let csv = headers.join(',') + '\n';
            
            // Veri satırları
            data.forEach(item => {
                const row = rowGeneratorFn(item);
                csv += row + '\n';
            });
            
            return csv;
        } catch (error) {
            console.error('CSV oluşturulurken hata oluştu:', error);
            return '';
        }
    }
    
    /**
     * Hücre değerini CSV formatına uygun şekilde biçimlendirir
     * @param {*} value - Hücre değeri
     * @returns {string} - Kaçış karakterleri eklenmiş hücre değeri
     */
    escapeCsvCell(value) {
        // Hücre içeriğini string'e dönüştürme
        const cellStr = String(value || '');
        
        // Özel karakterler varsa, çift tırnak içine alma ve çift tırnakları escape etme
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return '"' + cellStr.replace(/"/g, '""') + '"';
        }
        
        return cellStr;
    }
    
    /**
     * Bağlantı bilgilerinden CSV satırı oluşturur
     * @param {Object} link - Bağlantı nesnesi
     * @returns {string} - CSV satır formatında string
     */
    generateLinkRow(link) {
        try {
            // Marka ve kategori bilgilerini alma
            const brand = this.brands.find(b => b.id === link.brandId) || { name: 'Bilinmeyen' };
            const category = this.categories.find(c => c.id === link.categoryId) || { name: 'Bilinmeyen' };
            const creator = this.users.find(u => u.id === link.createdBy) || { username: 'Bilinmeyen' };
            
            // Gönderi tipi bilgisini alma
            let postTypeName = '';
            if (link.postTypeId && link.categoryId && this.postTypes[link.categoryId]) {
                const postType = this.postTypes[link.categoryId].find(pt => pt.id === link.postTypeId);
                if (postType) {
                    postTypeName = postType.name;
                }
            }
            
            // CSV satırı için değerleri hazırlama
            const rowValues = [
                link.url || '',
                link.title || '',
                link.description || '',
                brand.name || '',
                category.name || '',
                postTypeName || '',
                creator.username || '',
                link.datetime || ''
            ];
            
            // Tüm değerleri CSV için kaçış karakterleriyle hazırlama
            const escapedRow = rowValues.map(value => this.escapeCsvCell(value));
            
            // CSV satırını oluşturma
            return escapedRow.join(',');
        } catch (error) {
            console.error('Bağlantı satırı oluşturulurken hata oluştu:', error);
            return '';
        }
    }
    
    // Resmi kaydetme ve yolunu döndürme
    async saveImageAsBase64(file) {
        try {
            if (!file) {
                return null;
            }
            
            // Dosya adını oluştur (benzersiz olması için timestamp ekle)
            const timestamp = new Date().getTime();
            const fileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
            const filePath = `assets/logos/${fileName}`;
            
            // Base64 formatına çevirme işlemi (eski yöntem)
            const base64 = await this.convertToBase64(file);
            
            // Dosya yolunu döndür
            return filePath;
        } catch (error) {
            console.error('Resim kaydedilirken hata oluştu:', error);
            return null;
        }
    }
    
    // Resmi Base64 formatına çevirme (yardımcı metod)
    convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = (e) => {
                reject(e);
            };
            
            reader.readAsDataURL(file);
        });
    }
} 