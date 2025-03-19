// Kimlik doğrulama yönetimi sınıfı
export class AuthManager {
    constructor(dataManager, toastManager) {
        this.dataManager = dataManager;
        this.toastManager = toastManager;
        this.currentUser = null;
        this.loginForm = document.getElementById('login-form');
        this.logoutBtn = document.getElementById('logout-btn');
    }
    
    // Kimlik doğrulama yöneticisini başlatma
    init() {
        // Oturum durumunu kontrol etme
        this.checkSession();
        
        // Olay dinleyicilerini ekleme
        this.addEventListeners();
    }
    
    // Olay dinleyicilerini ekleme
    addEventListeners() {
        // Giriş formunu dinleme
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });
        
        // Çıkış butonunu dinleme
        this.logoutBtn.addEventListener('click', () => {
            this.logout();
        });
    }
    
    // Oturum durumunu kontrol etme
    checkSession() {
        // LocalStorage'dan kullanıcı bilgilerini alma
        const userData = localStorage.getItem('currentUser');
        
        // Sayfa yüklenirken her iki container'ı da gizle
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('main-container').classList.add('hidden');
        
        if (userData) {
            try {
                // Kullanıcı bilgilerini JSON olarak ayrıştırma
                const user = JSON.parse(userData);
                
                // Kullanıcıyı doğrulama
                const validUser = this.dataManager.users.find(u => u.id === user.id);
                
                if (validUser) {
                    // Geçerli kullanıcıyı ayarlama
                    this.currentUser = validUser;
                    
                    // Kullanıcı bilgilerini güncelleme
                    console.log('Oturum açık kullanıcı:', this.currentUser);
                    console.log('İzinli markalar:', this.currentUser.allowedBrands);
                    
                    // Kullanıcı arayüzünü güncelleme
                    this.updateUI();
                    
                    // Not: Bağlantı listesi App.init() içinde zaten yükleniyor
                } else {
                    console.warn('Geçersiz kullanıcı, oturum sonlandırılıyor');
                    // Geçersiz kullanıcı, oturumu sonlandırma
                    this.logout(false); // Onay diyaloğu gösterme
                }
            } catch (error) {
                console.error('Oturum bilgileri ayrıştırılırken hata oluştu:', error);
                this.logout(false); // Onay diyaloğu gösterme
            }
        } else {
            // Kullanıcı bilgisi yoksa giriş ekranını göster
            document.getElementById('login-container').classList.remove('hidden');
        }
        
        // Sayfa yüklendikten sonra içeriği görünür yap
        document.body.classList.add('loaded');
    }
    
    // Giriş yapma
    login() {
        // Form verilerini alma
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        // Kullanıcıyı bulma
        const user = this.dataManager.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Geçerli kullanıcıyı ayarlama
            this.currentUser = user;
            
            // Kullanıcı bilgilerini localStorage'a kaydetme
            // Tüm kullanıcı bilgilerini JSON olarak kaydet
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
        } else {
            // Hata mesajı gösterme
            this.toastManager.error('Geçersiz kullanıcı adı veya şifre!');
        }
    }
    
    // Çıkış yapma
    logout(showConfirmation = true) {
        // Kullanıcı adını kaydetme
        const username = this.currentUser ? this.currentUser.username : '';
        
        if (showConfirmation) {
            // Onay diyaloğu gösterme
            this.toastManager.confirm(
                'Çıkış yapmak istediğinizden emin misiniz?',
                'Çıkış Yap',
                // Onay işlemi
                () => {
                    // Geçerli kullanıcıyı temizleme
                    this.currentUser = null;
                    
                    // LocalStorage'dan kullanıcı bilgilerini silme
                    localStorage.removeItem('currentUser');
                    
                    // Kullanıcı arayüzünü güncelleme
                    this.updateUI();
                    
                    // Bağlantı listesini yenileme
                    if (this.dataManager.linkManager) {
                        console.log('Bağlantı listesi yenileniyor (logout-confirm)...');
                        this.dataManager.linkManager.loadLinks();
                    }
                    
                    // Bilgi mesajı gösterme
                    if (username) {
                        this.toastManager.info(`${username} çıkış yaptı`);
                    }
                    
                    console.log('Çıkış yapıldı');
                }
            );
        } else {
            // Geçerli kullanıcıyı temizleme
            this.currentUser = null;
            
            // LocalStorage'dan kullanıcı bilgilerini silme
            localStorage.removeItem('currentUser');
            
            // Kullanıcı arayüzünü güncelleme
            this.updateUI();
            
            // Bağlantı listesini yenileme
            if (this.dataManager.linkManager) {
                console.log('Bağlantı listesi yenileniyor (logout-direct)...');
                this.dataManager.linkManager.loadLinks();
            }
            
            // Bilgi mesajı gösterme
            if (username) {
                this.toastManager.info(`${username} çıkış yaptı`);
            }
            
            console.log('Çıkış yapıldı');
        }
    }
    
    // Kullanıcı arayüzünü güncelleme
    updateUI() {
        const loginContainer = document.getElementById('login-container');
        const mainContainer = document.getElementById('main-container');
        const currentUserElement = document.getElementById('current-user');
        const userRoleElement = document.getElementById('user-role');
        const adminPanel = document.getElementById('admin-panel');
        const dataManagementPanel = document.getElementById('data-management-panel');
        
        if (this.currentUser) {
            // Ana içeriği gösterme
            loginContainer.classList.add('hidden');
            mainContainer.classList.remove('hidden');
            
            // Kullanıcı bilgilerini gösterme
            currentUserElement.textContent = this.currentUser.username;
            
            // Kullanıcı rolünü gösterme
            let roleText = '';
            switch (this.currentUser.role) {
                case 'admin':
                    roleText = 'Admin';
                    break;
                case 'editor':
                    roleText = 'Editör';
                    break;
                default:
                    roleText = 'Kullanıcı';
            }
            userRoleElement.textContent = roleText;
            
            // Admin panelini gösterme/gizleme (sadece admin rolü için)
            if (this.currentUser.role === 'admin') {
                adminPanel.classList.remove('hidden');
            } else {
                adminPanel.classList.add('hidden');
            }
            
            // Veri yönetimi panelini gösterme/gizleme (admin ve editör rolleri için)
            if (this.currentUser.role === 'admin' || this.currentUser.role === 'editor') {
                dataManagementPanel.classList.remove('hidden');
            } else {
                dataManagementPanel.classList.add('hidden');
            }
        } else {
            // Giriş ekranını gösterme
            loginContainer.classList.remove('hidden');
            mainContainer.classList.add('hidden');
        }
    }
    
    // Kullanıcının belirli bir markaya erişimi olup olmadığını kontrol etme
    hasAccessToBrand(brandId) {
        // Kullanıcı oturum açmamışsa erişim yok
        if (!this.currentUser) {
            console.log('Erişim reddedildi: Kullanıcı oturum açmamış');
            return false;
        }
        
        // Admin kullanıcısı tüm markalara erişebilir
        if (this.currentUser.role === 'admin') {
            console.log('Erişim kabul edildi: Admin kullanıcısı');
            return true;
        }
        
        // Editör kullanıcısı tüm markalara erişebilir
        if (this.currentUser.role === 'editor') {
            console.log('Erişim kabul edildi: Editör kullanıcısı');
            return true;
        }
        
        // Normal kullanıcı sadece izin verilen markalara erişebilir
        if (!Array.isArray(this.currentUser.allowedBrands)) {
            console.log('Erişim reddedildi: allowedBrands bir dizi değil');
            return false;
        }
        
        const hasAccess = this.currentUser.allowedBrands.includes(brandId);
        
        console.log(`Erişim ${hasAccess ? 'kabul edildi' : 'reddedildi'}: Normal kullanıcı, marka ID: ${brandId}, İzinli markalar:`, this.currentUser.allowedBrands);
        return hasAccess;
    }
    
    // Kullanıcının düzenleme yetkisi olup olmadığını kontrol etme
    canEdit() {
        return this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'editor');
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