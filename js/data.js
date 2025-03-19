// Veri yönetimi sınıfı
export class DataManager {
    constructor(toastManager, authManager = null, linkManager = null) {
        // Veri dizileri
        this.users = [];
        this.brands = [];
        this.categories = [];
        this.links = [];
        this.postTypes = {}; // Kategori ID'lerine göre gönderi tipleri
        
        // API URL'leri
        this.apiBaseUrl = 'http://localhost:3000/api';
        this.readApiUrl = `${this.apiBaseUrl}/read`;
        this.writeApiUrl = `${this.apiBaseUrl}/write`;
        
        // Toast Manager
        this.toastManager = toastManager;
        
        // Auth Manager ve Link Manager
        this.authManager = authManager;
        this.linkManager = linkManager;
    }
    
    // Veri yöneticisini başlatma
    async init() {
        try {
            console.log('Veri yöneticisi başlatılıyor...');
            
            // Kullanıcıları yükleme
            await this.loadUsers();
            
            // Markaları yükleme
            await this.loadBrands();
            
            // Kategorileri yükleme
            await this.loadCategories();
            
            // Bağlantıları yükleme
            await this.loadLinks();
            
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
                password: 'admin',
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
            const response = await fetch(`${this.writeApiUrl}/${file}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log(result.message);
                return true;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API yazma hatası');
            }
        } catch (error) {
            console.error(`API'ye ${file} yazma hatası:`, error);
            if (this.toastManager) {
                this.toastManager.error(`${file}.json dosyası güncellenirken hata oluştu. Sunucunun çalıştığından emin olun.`);
            }
            return false;
        }
    }
    
    // Kullanıcıları yükleme
    async loadUsers() {
        try {
            // Önce localStorage'dan yüklemeyi dene
            const storedData = localStorage.getItem('users');
            if (storedData) {
                this.users = JSON.parse(storedData);
                console.log('Kullanıcılar localStorage\'dan yüklendi:', this.users.length);
            }
            
            // API'den yüklemeyi dene
            const apiData = await this.readFromApi('users');
            if (apiData) {
                this.users = apiData;
                localStorage.setItem('users', JSON.stringify(this.users));
                console.log('Kullanıcılar API\'den yüklendi:', this.users.length);
            }
            
            // Hiçbir kaynak bulunamazsa varsayılan admin kullanıcısı oluştur
            if (!this.users || this.users.length === 0) {
                this.users = [
                    {
                        id: 'admin',
                        username: 'admin',
                        password: 'admin',
                        role: 'admin',
                        allowedBrands: []
                    }
                ];
                
                // Kullanıcıları kaydet
                localStorage.setItem('users', JSON.stringify(this.users));
                await this.saveUsers();
                
                console.log('Varsayılan admin kullanıcısı oluşturuldu');
            }
            
            return this.users;
        } catch (error) {
            console.error('Kullanıcılar yüklenirken hata oluştu:', error);
            
            // Hata durumunda varsayılan admin kullanıcısı oluştur
            this.users = [
                {
                    id: 'admin',
                    username: 'admin',
                    password: 'admin',
                    role: 'admin',
                    allowedBrands: []
                }
            ];
            
            localStorage.setItem('users', JSON.stringify(this.users));
            return this.users;
        }
    }
    
    // Markaları yükleme
    async loadBrands() {
        try {
            // Önce localStorage'dan yüklemeyi dene
            const storedData = localStorage.getItem('brands');
            if (storedData) {
                this.brands = JSON.parse(storedData);
                console.log('Markalar localStorage\'dan yüklendi:', this.brands.length);
            }
            
            // API'den yüklemeyi dene
            const apiData = await this.readFromApi('brands');
            if (apiData) {
                this.brands = apiData;
                localStorage.setItem('brands', JSON.stringify(this.brands));
                console.log('Markalar API\'den yüklendi:', this.brands.length);
            }
            
            // Hiçbir kaynak bulunamazsa boş dizi oluştur
            if (!this.brands) {
                this.brands = [];
                localStorage.setItem('brands', JSON.stringify(this.brands));
                console.log('Marka bulunamadı, boş liste oluşturuldu');
            }
            
            // Markaları ID yerine isimleri ile tanımla
            this.brands.forEach(brand => {
                if (!brand.displayName) {
                    brand.displayName = brand.name;
                }
            });
            
            return this.brands;
        } catch (error) {
            console.error('Markalar yüklenirken hata oluştu:', error);
            this.brands = [];
            localStorage.setItem('brands', JSON.stringify(this.brands));
            return this.brands;
        }
    }
    
    // Kategorileri yükleme
    async loadCategories() {
        try {
            // Önce localStorage'dan yüklemeyi dene
            const storedData = localStorage.getItem('categories');
            if (storedData) {
                this.categories = JSON.parse(storedData);
                console.log('Kategoriler localStorage\'dan yüklendi:', this.categories.length);
            }
            
            // API'den yüklemeyi dene
            const apiData = await this.readFromApi('categories');
            if (apiData) {
                this.categories = apiData;
                localStorage.setItem('categories', JSON.stringify(this.categories));
                console.log('Kategoriler API\'den yüklendi:', this.categories.length);
            }
            
            // Hiçbir kaynak bulunamazsa boş dizi oluştur
            if (!this.categories) {
                this.categories = [];
                localStorage.setItem('categories', JSON.stringify(this.categories));
                console.log('Kategori bulunamadı, boş liste oluşturuldu');
            }
            
            return this.categories;
        } catch (error) {
            console.error('Kategoriler yüklenirken hata oluştu:', error);
            this.categories = [];
            localStorage.setItem('categories', JSON.stringify(this.categories));
            return this.categories;
        }
    }
    
    // Bağlantıları yükleme
    async loadLinks() {
        try {
            // Önce localStorage'dan yüklemeyi dene
            const storedData = localStorage.getItem('links');
            if (storedData) {
                this.links = JSON.parse(storedData);
                console.log('Bağlantılar localStorage\'dan yüklendi:', this.links.length);
            }
            
            // API'den yüklemeyi dene
            const apiData = await this.readFromApi('links');
            if (apiData) {
                this.links = apiData;
                localStorage.setItem('links', JSON.stringify(this.links));
                console.log('Bağlantılar API\'den yüklendi:', this.links.length);
            }
            
            // Hiçbir kaynak bulunamazsa boş dizi oluştur
            if (!this.links) {
                this.links = [];
                localStorage.setItem('links', JSON.stringify(this.links));
                console.log('Bağlantı bulunamadı, boş liste oluşturuldu');
            }
            
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
        } catch (error) {
            console.error('Bağlantılar yüklenirken hata oluştu:', error);
            this.links = [];
            localStorage.setItem('links', JSON.stringify(this.links));
            return this.links;
        }
    }
    
    // Kullanıcıları kaydetme
    async saveUsers(users = this.users) {
        try {
            // Kullanıcıları JSON formatına çevirme
            const jsonData = JSON.stringify(users, null, 2);
            
            // localStorage'a kaydetme
            localStorage.setItem('users', jsonData);
            
            // API'ye kaydetme
            await this.writeToApi('users', users);
            
            console.log('Kullanıcılar başarıyla kaydedildi');
            return true;
        } catch (error) {
            console.error('Kullanıcılar kaydedilirken hata oluştu:', error);
            return false;
        }
    }
    
    // Markaları kaydetme
    async saveBrands(brands = this.brands) {
        try {
            // Markaları JSON formatına çevirme
            const jsonData = JSON.stringify(brands, null, 2);
            
            // localStorage'a kaydetme
            localStorage.setItem('brands', jsonData);
            
            // API'ye kaydetme
            await this.writeToApi('brands', brands);
            
            console.log('Markalar başarıyla kaydedildi');
            return true;
        } catch (error) {
            console.error('Markalar kaydedilirken hata oluştu:', error);
            return false;
        }
    }
    
    // Kategorileri kaydetme
    async saveCategories(categories = this.categories) {
        try {
            // Kategorileri JSON formatına çevirme
            const jsonData = JSON.stringify(categories, null, 2);
            
            // localStorage'a kaydetme
            localStorage.setItem('categories', jsonData);
            
            // API'ye kaydetme
            await this.writeToApi('categories', categories);
            
            console.log('Kategoriler başarıyla kaydedildi');
            return true;
        } catch (error) {
            console.error('Kategoriler kaydedilirken hata oluştu:', error);
            return false;
        }
    }
    
    // Bağlantıları kaydetme
    async saveLinks(links = this.links) {
        try {
            // Bağlantıları JSON formatına çevirme
            const jsonData = JSON.stringify(links, null, 2);
            
            // localStorage'a kaydetme
            localStorage.setItem('links', jsonData);
            
            // API'ye kaydetme
            await this.writeToApi('links', links);
            
            console.log('Bağlantılar başarıyla kaydedildi');
            return true;
        } catch (error) {
            console.error('Bağlantılar kaydedilirken hata oluştu:', error);
            return false;
        }
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
            
            // JSON verilerini oluşturma
            const jsonData = JSON.stringify(allData, null, 2);
            
            // Dosya adını oluşturma
            const date = new Date().toISOString().split('T')[0];
            const filename = `all_data_${date}.json`;
            
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
                this.toastManager.success('Tüm veriler başarıyla dışa aktarıldı');
            }
            
            console.log('Tüm veriler JSON olarak dışa aktarıldı');
            return true;
        } catch (error) {
            console.error('Veriler dışa aktarılırken hata oluştu:', error);
            return false;
        }
    }
    
    // Belirli bir veri türünü JSON olarak dışa aktarma
    exportDataAsJSON(data, filename) {
        try {
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
            return true;
        } catch (error) {
            console.error(`${filename} dışa aktarılırken hata oluştu:`, error);
            return false;
        }
    }
    
    // Bağlantıları JSON olarak dışa aktarma
    exportLinksAsJSON() {
        const date = new Date().toISOString().split('T')[0];
        const filename = `links_${date}.json`;
        return this.exportDataAsJSON(this.links, filename);
    }
    
    // Kullanıcıları JSON olarak dışa aktarma
    exportUsersAsJSON() {
        const date = new Date().toISOString().split('T')[0];
        const filename = `users_${date}.json`;
        return this.exportDataAsJSON(this.users, filename);
    }
    
    // Markaları JSON olarak dışa aktarma
    exportBrandsAsJSON() {
        const date = new Date().toISOString().split('T')[0];
        const filename = `brands_${date}.json`;
        return this.exportDataAsJSON(this.brands, filename);
    }
    
    // Kategorileri JSON olarak dışa aktarma
    exportCategoriesAsJSON() {
        const date = new Date().toISOString().split('T')[0];
        const filename = `categories_${date}.json`;
        return this.exportDataAsJSON(this.categories, filename);
    }
    
    // Kullanıcı ekleme
    addUser(user) {
        try {
            // Kullanıcı ID'si oluşturma
            user.id = this.generateId();
            
            // allowedBrands dizisini kontrol et
            if (!Array.isArray(user.allowedBrands)) {
                user.allowedBrands = [];
            }
            
            // Kullanıcıyı listeye ekleme
            this.users.push(user);
            
            // Kullanıcıları kaydetme
            this.saveUsers();
            
            console.log('Kullanıcı eklendi:', user);
            return user;
        } catch (error) {
            console.error('Kullanıcı eklenirken hata oluştu:', error);
            throw error;
        }
    }
    
    // Kullanıcı güncelleme
    updateUser(userId, updatedUser) {
        try {
            // Kullanıcıyı bulma
            const index = this.users.findIndex(user => user.id === userId);
            
            if (index === -1) {
                throw new Error('Kullanıcı bulunamadı');
            }
            
            // Admin kullanıcısının rolünü koruma
            if (userId === 'admin') {
                updatedUser.role = 'admin'; // Admin kullanıcısının rolünü her zaman admin olarak koru
            }
            
            // allowedBrands dizisini kontrol et
            if (updatedUser.allowedBrands && !Array.isArray(updatedUser.allowedBrands)) {
                updatedUser.allowedBrands = [];
            }
            
            // Kullanıcıyı güncelleme
            this.users[index] = { ...this.users[index], ...updatedUser };
            
            // Kullanıcıları kaydetme
            this.saveUsers();
            
            console.log('Kullanıcı güncellendi:', this.users[index]);
            return this.users[index];
        } catch (error) {
            console.error('Kullanıcı güncellenirken hata oluştu:', error);
            throw error;
        }
    }
    
    // Kullanıcı silme
    deleteUser(userId) {
        try {
            // Admin kullanıcısını silmeyi engelleme
            if (userId === 'admin') {
                throw new Error('Admin kullanıcısı silinemez');
            }
            
            // Kullanıcıyı bulma
            const index = this.users.findIndex(user => user.id === userId);
            
            if (index === -1) {
                throw new Error('Kullanıcı bulunamadı');
            }
            
            // Kullanıcıyı silme
            this.users.splice(index, 1);
            
            // Kullanıcıları kaydetme
            this.saveUsers();
            
            return true;
        } catch (error) {
            console.error('Kullanıcı silinirken hata oluştu:', error);
            throw error;
        }
    }
    
    // Marka ekleme
    addBrand(brand) {
        try {
            // Marka ID'si oluşturma
            brand.id = this.generateId();
            
            // Markayı listeye ekleme
            this.brands.push(brand);
            
            // Markaları kaydetme
            this.saveBrands();
            
            return brand;
        } catch (error) {
            console.error('Marka eklenirken hata oluştu:', error);
            throw error;
        }
    }
    
    // Marka güncelleme
    updateBrand(brandId, updatedBrand) {
        try {
            // Markayı bulma
            const index = this.brands.findIndex(brand => brand.id === brandId);
            
            if (index === -1) {
                throw new Error('Marka bulunamadı');
            }
            
            // Markayı güncelleme
            this.brands[index] = { ...this.brands[index], ...updatedBrand };
            
            // Markaları kaydetme
            this.saveBrands();
            
            return this.brands[index];
        } catch (error) {
            console.error('Marka güncellenirken hata oluştu:', error);
            throw error;
        }
    }
    
    // Marka silme
    deleteBrand(brandId) {
        try {
            // Markayı bulma
            const index = this.brands.findIndex(brand => brand.id === brandId);
            
            if (index === -1) {
                throw new Error('Marka bulunamadı');
            }
            
            // Markaya ait bağlantıları kontrol etme
            const hasLinks = this.links.some(link => link.brandId === brandId);
            
            if (hasLinks) {
                throw new Error('Bu markaya ait bağlantılar bulunmaktadır. Önce bağlantıları silmelisiniz.');
            }
            
            // Markayı silme
            this.brands.splice(index, 1);
            
            // Markaları kaydetme
            this.saveBrands();
            
            return true;
        } catch (error) {
            console.error('Marka silinirken hata oluştu:', error);
            throw error;
        }
    }
    
    // Kategori ekleme
    addCategory(category) {
        try {
            // Kategori ID'si oluşturma
            category.id = this.generateId();
            
            // Kategoriyi listeye ekleme
            this.categories.push(category);
            
            // Kategorileri kaydetme
            this.saveCategories();
            
            return category;
        } catch (error) {
            console.error('Kategori eklenirken hata oluştu:', error);
            throw error;
        }
    }
    
    // Kategori güncelleme
    updateCategory(categoryId, updatedCategory) {
        try {
            // Kategoriyi bulma
            const index = this.categories.findIndex(category => category.id === categoryId);
            
            if (index === -1) {
                throw new Error('Kategori bulunamadı');
            }
            
            // Kategoriyi güncelleme
            this.categories[index] = { ...this.categories[index], ...updatedCategory };
            
            // Kategorileri kaydetme
            this.saveCategories();
            
            return this.categories[index];
        } catch (error) {
            console.error('Kategori güncellenirken hata oluştu:', error);
            throw error;
        }
    }
    
    // Kategori silme
    deleteCategory(categoryId) {
        try {
            // Kategoriyi bulma
            const index = this.categories.findIndex(category => category.id === categoryId);
            
            if (index === -1) {
                throw new Error('Kategori bulunamadı');
            }
            
            // Kategoriye ait bağlantıları kontrol etme
            const hasLinks = this.links.some(link => link.categoryId === categoryId);
            
            if (hasLinks) {
                throw new Error('Bu kategoriye ait bağlantılar bulunmaktadır. Önce bağlantıları silmelisiniz.');
            }
            
            // Kategoriyi silme
            this.categories.splice(index, 1);
            
            // Kategorileri kaydetme
            this.saveCategories();
            
            return true;
        } catch (error) {
            console.error('Kategori silinirken hata oluştu:', error);
            throw error;
        }
    }
    
    // Bağlantı ekleme
    async addLink(linkData) {
        try {
            // Bağlantıyı diziye ekleme
            this.links.push(linkData);
            
            // Bağlantıları kaydetme
            await this.saveLinks();
            
            console.log('Bağlantı başarıyla eklendi:', linkData);
            return linkData;
        } catch (error) {
            console.error('Bağlantı eklenirken hata oluştu:', error);
            throw error;
        }
    }
    
    // Bağlantı güncelleme
    async updateLink(linkData) {
        try {
            // Bağlantıyı bulma
            const index = this.links.findIndex(link => link.id === linkData.id);
            
            if (index !== -1) {
                // Bağlantıyı güncelleme
                this.links[index] = linkData;
                
                // Bağlantıları kaydetme
                await this.saveLinks();
                
                console.log('Bağlantı başarıyla güncellendi:', linkData);
                return linkData;
            } else {
                throw new Error('Güncellenecek bağlantı bulunamadı');
            }
        } catch (error) {
            console.error('Bağlantı güncellenirken hata oluştu:', error);
            throw error;
        }
    }
    
    // Bağlantı silme
    async deleteLink(linkId) {
        try {
            // Bağlantıyı bulma
            const index = this.links.findIndex(link => link.id === linkId);
            
            if (index === -1) {
                throw new Error('Bağlantı bulunamadı');
            }
            
            // Bağlantıyı silme
            this.links.splice(index, 1);
            
            // Bağlantıları kaydetme
            await this.saveLinks();
            
            console.log('Bağlantı başarıyla silindi:', linkId);
            return true;
        } catch (error) {
            console.error('Bağlantı silinirken hata oluştu:', error);
            throw error;
        }
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
    
    // CSV verisi oluşturma
    generateCSV(data, rowGeneratorFn) {
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }
        
        try {
            // CSV başlıkları (ID sütunu kaldırıldı)
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
            throw error;
        }
    }
    
    // Bağlantı satırı oluşturma
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
            
            // CSV satırı oluşturma (ID sütunu kaldırıldı)
            const row = [
                link.url || '',
                link.title || '',
                link.description || '',
                brand.name || '',
                category.name || '',
                postTypeName || '',
                creator.username || '',
                link.datetime || ''
            ];
            
            // Özel karakterleri işleme (virgül, çift tırnak, yeni satır)
            const escapedRow = row.map(cell => {
                // Hücre içeriğini string'e dönüştürme
                const cellStr = String(cell);
                
                // Özel karakterler varsa, çift tırnak içine alma ve çift tırnakları escape etme
                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                    return '"' + cellStr.replace(/"/g, '""') + '"';
                }
                
                return cellStr;
            });
            
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