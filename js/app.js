// Modülleri içe aktarma
import { AuthManager } from './auth.js';
import { LinkManager } from './links.js';
import { UIManager } from './ui.js';
import { DataManager } from './data.js';
import { ToastManager } from './toast.js';

// Uygulama sınıfı
class App {
    constructor() {
        // Uygulama başlatıldı mı kontrolü
        this.initialized = false;
        
        // Yönetici nesnelerini tanımlama (henüz başlatmadan)
        this.toastManager = null;
        this.dataManager = null;
        this.authManager = null;
        this.linkManager = null;
        this.uiManager = null;
        
        // Uygulama başlatma
        this.init();
    }
    
    // Uygulamayı başlatma
    async init() {
        try {
            // Yöneticileri sırasıyla oluşturma ve başlatma
            // Toast yöneticisi oluşturma (bağımlılık yok)
            this.toastManager = new ToastManager();
            
            // Veri yöneticisi oluşturma ve başlatma
            this.dataManager = new DataManager(this.toastManager);
            await this.dataManager.init();
            
            // Kimlik doğrulama yöneticisi oluşturma ve başlatma
            this.authManager = new AuthManager(this.dataManager, this.toastManager);
            await this.authManager.init();
            
            // UI yöneticisi oluşturma
            this.uiManager = new UIManager(this.authManager, null, this.dataManager, this.toastManager);
            
            // Bağlantı yöneticisi oluşturma
            this.linkManager = new LinkManager(this.dataManager, this.authManager, this.toastManager, this.uiManager);
            
            // Tüm çift yönlü bağımlılıkları atama
            this.dataManager.authManager = this.authManager;
            this.dataManager.linkManager = this.linkManager;
            this.uiManager.linkManager = this.linkManager;
            
            // UI ve bağlantı yöneticilerini başlatma
            this.uiManager.init();
            this.linkManager.init();
            
            // Sayfa yüklendi işaretini ekleme
            document.body.classList.add('loaded');
            this.initialized = true;
            
            // Sadece ilk başlatmada bildirim gösterme
            if (!localStorage.getItem('appInitialized')) {
                // Başarı mesajı gösterme
                this.toastManager.info('Uygulama başarıyla başlatıldı');
                
                // Başlatıldı olarak işaretleme
                localStorage.setItem('appInitialized', 'true');
            }
            
            console.log('Uygulama başarıyla başlatıldı');
        } catch (error) {
            console.error('Uygulama başlatılırken hata oluştu:', error);
            this.toastManager?.error('Uygulama başlatılırken bir hata oluştu: ' + error.message);
        }
    }
}

// Uygulamayı başlatma
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 