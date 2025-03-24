/**
 * Kimlik doğrulama ve yetkilendirme işlemlerini yöneten sınıf
 * Kullanıcı girişi, çıkışı ve yetki kontrolü fonksiyonlarını içerir
 */
// ES modül sisteminde doğrudan import yerine global CryptoJS nesnesini kullanıyoruz
// CryptoJS kütüphanesi index.html'de script olarak yüklenmeli

export class AuthManager {
    /**
     * AuthManager sınıfı için yapılandırıcı
     * @param {Object} dataManager - Veri yönetimi için DataManager nesnesi
     * @param {Object} toastManager - Bildirim gösterimi için ToastManager nesnesi
     */
    constructor(dataManager, toastManager) {
        // Bağımlılıklar
        this.dataManager = dataManager;
        this.toastManager = toastManager;
        
        // CryptoJS varlığını kontrol et
        if (typeof CryptoJS === 'undefined') {
            console.error('CryptoJS kütüphanesi bulunamadı! Şifre hashleme işlemleri çalışmayacak.');
        }
        
        // Durum nesneleri
        this.currentUser = null; // Mevcut oturum açmış kullanıcı
        
        // UI elementleri
        this.loginForm = document.getElementById('login-form');
        this.logoutBtn = document.getElementById('logout-btn');
        
        // Form elementleri bulunamazsa uyarı göster
        if (!this.loginForm) {
            console.warn('Login formu bulunamadı. Sayfa yapısını kontrol edin.');
        }
        
        if (!this.logoutBtn) {
            console.warn('Çıkış butonu bulunamadı. Sayfa yapısını kontrol edin.');
        }
        
        // Hash için kullanılacak gizli anahtar (bu bir örnek, gerçek uygulamada .env dosyasında saklanmalıdır)
        this.hashSecret = "linkergh-hash-secret-key";
    }
    
    // Şifre hashleme yardımcı metodu
    hashPassword(password) {
        if (!password) return null;
        return CryptoJS.SHA256(password + this.hashSecret).toString();
    }
    
    // Şifre doğrulama yardımcı metodu
    verifyPassword(plainPassword, hashedPassword) {
        if (!plainPassword || !hashedPassword) return false;
        return this.hashPassword(plainPassword) === hashedPassword;
    }
    
    // Kimlik doğrulama yöneticisini başlatma
    async init() {
        try {
            console.log('AuthManager başlatılıyor...');
            
            // Oturum durumunu kontrol etme
            this.checkSession();
            
            // Olay dinleyicilerini ekleme
            this.addEventListeners();
            
            console.log('AuthManager başarıyla başlatıldı');
            return true;
        } catch (error) {
            console.error('AuthManager başlatılırken hata oluştu:', error);
            if (this.toastManager) {
                this.toastManager.error('Kimlik doğrulama sistemi başlatılırken bir hata oluştu: ' + error.message);
            }
            return false;
        }
    }
    
    // Olay dinleyicilerini ekleme
    addEventListeners() {
        try {
            if (!this.loginForm || !this.logoutBtn) {
                console.error('Giriş formu veya çıkış butonu bulunamadı');
                return false;
            }
            
            // Giriş formunu dinleme
            this.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
            
            // Çıkış butonunu dinleme
            this.logoutBtn.addEventListener('click', () => {
                this.logout();
            });
            
            console.log('Kimlik doğrulama olay dinleyicileri eklendi');
            return true;
        } catch (error) {
            console.error('Olay dinleyicileri eklenirken hata oluştu:', error);
            return false;
        }
    }
    
    // Oturum durumunu kontrol etme
    checkSession() {
        // Sayfa yüklenirken her iki container'ı da gizle
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('main-container').classList.add('hidden');
        
        // LocalStorage'dan kullanıcı bilgilerini alma
        const userData = localStorage.getItem('currentUser');
        
        if (!userData) {
            // Kullanıcı bilgisi yoksa giriş ekranını göster
            document.getElementById('login-container').classList.remove('hidden');
            document.body.classList.add('loaded');
            return;
        }
        
        try {
            // Kullanıcı bilgilerini JSON olarak ayrıştırma
            const user = JSON.parse(userData);
            
            // Kullanıcıyı doğrulama
            const validUser = this.dataManager.users.find(u => u.id === user.id);
            
            if (!validUser) {
                console.warn('Geçersiz kullanıcı, oturum sonlandırılıyor');
                // Geçersiz kullanıcı, oturumu sonlandırma
                this.logout(false); // Onay diyaloğu gösterme
                return;
            }
            
            // Geçerli kullanıcıyı ayarlama
            this.currentUser = validUser;
            
            // Kullanıcı bilgilerini güncelleme
            console.log('Oturum açık kullanıcı:', this.currentUser);
            console.log('İzinli markalar:', this.currentUser.allowedBrands);
            
            // Kullanıcı arayüzünü güncelleme
            this.updateUI();
        } catch (error) {
            console.error('Oturum bilgileri ayrıştırılırken hata oluştu:', error);
            this.logout(false); // Onay diyaloğu gösterme
        } finally {
            // Sayfa yüklendikten sonra içeriği görünür yap
            document.body.classList.add('loaded');
        }
    }
    
    // Giriş yapma
    login() {
        try {
            // Form verilerini alma
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            
            // Giriş bilgilerinin doğruluğunu kontrol etme
            if (!username || !password) {
                this.toastManager.error('Kullanıcı adı ve şifre gereklidir!');
                return;
            }
            
            // Kullanıcıyı kullanıcı adına göre bulma
            const user = this.dataManager.users.find(u => u.username === username);
            
            if (!user) {
                // Hata mesajı gösterme
                this.toastManager.error('Geçersiz kullanıcı adı veya şifre!');
                return;
            }
            
            // Şifre doğrulama
            let isAuthenticated = false;
            
            // Hashli şifre kontrolü
            if (user.passwordHash) {
                isAuthenticated = this.verifyPassword(password, user.passwordHash);
            } 
            // Eski düz metin şifre kontrolü - geçiş süreci için
            else if (user.password === password) {
                isAuthenticated = true;
                
                // Eski şifreyi hash'e dönüştürme
                const passwordHash = this.hashPassword(password);
                
                // Kullanıcının şifresini güncelleme
                this.dataManager.updateUser(user.id, {
                    passwordHash: passwordHash,
                    // Eski şifre alanını silebiliriz, veya geçiş için belirli bir süre tutabiliriz
                    password: undefined
                });
                
                console.log('Kullanıcının şifresi hash formatına dönüştürüldü:', user.username);
            }
            
            if (!isAuthenticated) {
                // Hata mesajı gösterme
                this.toastManager.error('Geçersiz kullanıcı adı veya şifre!');
                return;
            }
            
            // Geçerli kullanıcıyı ayarlama
            this.currentUser = user;
            
            // Kullanıcı bilgilerini localStorage'a kaydetme
            localStorage.setItem('currentUser', JSON.stringify({
                id: user.id,
                username: user.username,
                role: user.role,
                allowedBrands: Array.isArray(user.allowedBrands) ? [...user.allowedBrands] : []
            }));
            
            console.log('Kullanıcı bilgileri kaydedildi:', this.currentUser);
            console.log('İzinli markalar:', this.currentUser.allowedBrands);
            
            // Kullanıcı arayüzünü güncelleme
            this.updateUI();
            
            // Bağlantı listesini yenileme
            if (this.dataManager.linkManager) {
                console.log('Bağlantı listesi yenileniyor (login)...');
                this.dataManager.linkManager.loadLinks();
            }
            
            // Form alanlarını temizleme
            document.getElementById('login-username').value = '';
            document.getElementById('login-password').value = '';
            
            // Başarı mesajı gösterme
            this.toastManager.success(`Hoş geldiniz, ${user.username}!`);
            
            console.log('Giriş başarılı:', user.username);
        } catch (error) {
            console.error('Giriş yapılırken hata oluştu:', error);
            this.toastManager.error('Giriş yapılırken bir hata oluştu: ' + error.message);
        }
    }
    
    // Çıkış yapma
    logout(showConfirmation = true) {
        // Kullanıcı adını kaydetme
        const username = this.currentUser ? this.currentUser.username : '';
        
        const performLogout = () => {
            // Geçerli kullanıcıyı temizleme
            this.currentUser = null;
            
            // LocalStorage'dan kullanıcı bilgilerini silme
            localStorage.removeItem('currentUser');
            
            // Kullanıcı arayüzünü güncelleme
            this.updateUI();
            
            // Bağlantı listesini yenileme
            if (this.dataManager.linkManager) {
                console.log('Bağlantı listesi yenileniyor (logout)...');
                this.dataManager.linkManager.loadLinks();
            }
            
            // Bilgi mesajı gösterme
            if (username) {
                this.toastManager.info(`${username} çıkış yaptı`);
            }
            
            console.log('Çıkış yapıldı');
        };
        
        if (showConfirmation) {
            // Onay diyaloğu gösterme
            this.toastManager.confirm(
                'Çıkış yapmak istediğinizden emin misiniz?',
                'Çıkış Yap',
                // Onay işlemi
                performLogout
            );
        } else {
            // Doğrudan çıkış işlemini gerçekleştir
            performLogout();
        }
    }
    
    // Kullanıcı arayüzünü güncelleme
    updateUI() {
        // Temel UI elementleri
        const loginContainer = document.getElementById('login-container');
        const mainContainer = document.getElementById('main-container');
        const currentUserElement = document.getElementById('current-user');
        const userRoleElement = document.getElementById('user-role');
        const adminPanel = document.getElementById('admin-panel');
        const dataManagementPanel = document.getElementById('data-management-panel');
        
        // Kullanıcı giriş yapmışsa ana içeriği göster
        if (this.currentUser) {
            // Giriş ekranını gizle, ana içeriği göster
            loginContainer.classList.add('hidden');
            mainContainer.classList.remove('hidden');
            
            // Kullanıcı bilgilerini gösterme
            currentUserElement.textContent = this.currentUser.username;
            
            // Kullanıcı rolünü gösterme
            const roleMap = {
                'admin': 'Admin',
                'editor': 'Editör',
                'user': 'Kullanıcı'
            };
            userRoleElement.textContent = roleMap[this.currentUser.role] || 'Kullanıcı';
            
            // Rol bazlı panel görünürlüklerini ayarlama
            adminPanel.classList.toggle('hidden', this.currentUser.role !== 'admin');
            dataManagementPanel.classList.toggle('hidden', 
                this.currentUser.role !== 'admin' && this.currentUser.role !== 'editor');
            
            // UIManager'ın kullanıcı rolüne göre UI güncellemesi yapmasını sağla
            if (window.uiManager && typeof window.uiManager.updateUIBasedOnAuth === 'function') {
                window.uiManager.updateUIBasedOnAuth();
                console.log('UIManager.updateUIBasedOnAuth metoduyla kullanıcı rolüne göre UI güncellendi');
            }
        } else {
            // Giriş ekranını göster, ana içeriği gizle
            loginContainer.classList.remove('hidden');
            mainContainer.classList.add('hidden');
        }
    }
    
    // Kullanıcı rolüne göre erişim kontrolü yapan yardımcı metot
    checkAccessByRole(action, brandId = null) {
        // Kullanıcı oturum açmamışsa erişim yok
        if (!this.currentUser) {
            console.log(`Erişim reddedildi (${action}): Kullanıcı oturum açmamış`);
            return false;
        }
        
        // Admin ve editör kullanıcıları tüm işlemlere erişebilir
        if (this.currentUser.role === 'admin' || this.currentUser.role === 'editor') {
            console.log(`Erişim kabul edildi (${action}): ${this.currentUser.role} kullanıcısı`);
            return true;
        }
        
        // Sadece marka bazlı erişim kontrolü gerektiren durumlarda
        if (brandId !== null) {
            // Normal kullanıcı sadece izin verilen markalara erişebilir
            if (!Array.isArray(this.currentUser.allowedBrands)) {
                console.log(`Erişim reddedildi (${action}): allowedBrands bir dizi değil`);
                return false;
            }
            
            const hasAccess = this.currentUser.allowedBrands.includes(brandId);
            
            console.log(`Erişim ${hasAccess ? 'kabul edildi' : 'reddedildi'} (${action}): 
                Normal kullanıcı, marka ID: ${brandId}, İzinli markalar:`, this.currentUser.allowedBrands);
            return hasAccess;
        }
        
        // Normal kullanıcı için varsayılan olarak erişim reddetme
        console.log(`Erişim reddedildi (${action}): Normal kullanıcı için yetkisiz işlem`);
        return false;
    }
    
    // Kullanıcının belirli bir markaya erişimi olup olmadığını kontrol etme
    hasAccessToBrand(brandId) {
        return this.checkAccessByRole('marka erişimi', brandId);
    }
    
    // Kullanıcının düzenleme yetkisi olup olmadığını kontrol etme
    canEdit() {
        return this.checkAccessByRole('düzenleme');
    }
    
    // Kullanıcının admin yetkisi olup olmadığını kontrol etme
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }
    
    // Kullanıcının giriş yapmış olup olmadığını kontrol etme
    isLoggedIn() {
        return this.currentUser !== null;
    }
} 