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
        
        // Toast yöneticisi oluşturma
        this.toastManager = new ToastManager();
        
        // Veri yöneticisi oluşturma
        this.dataManager = new DataManager(this.toastManager);
        
        // Kimlik doğrulama yöneticisi oluşturma
        this.authManager = new AuthManager(this.dataManager, this.toastManager);
        
        // Bağlantı yöneticisi oluşturma
        this.linkManager = new LinkManager(this.dataManager, this.authManager, this.toastManager);
        
        // Kullanıcı arayüzü yöneticisi oluşturma
        this.uiManager = new UIManager(this.authManager, null, this.dataManager, this.toastManager);
        
        // Uygulama başlatma
        this.init();
    }
    
    // Uygulamayı başlatma
    async init() {
        try {
            // Veri yöneticisini başlatma
            await this.dataManager.init();
            
            // Kimlik doğrulama yöneticisini başlatma
            await this.authManager.init();
            
            // UI yöneticisini başlatma
            this.uiManager = new UIManager(this.authManager, null, this.dataManager, this.toastManager);
            
            // Bağlantı yöneticisini başlatma
            this.linkManager = new LinkManager(this.dataManager, this.authManager, this.toastManager, this.uiManager);
            
            // UI yöneticisine bağlantı yöneticisini atama
            this.uiManager.linkManager = this.linkManager;
            
            // DataManager'a authManager ve linkManager referanslarını atama
            this.dataManager.authManager = this.authManager;
            this.dataManager.linkManager = this.linkManager;
            
            // UI yöneticisini başlatma
            this.uiManager.init();
            
            // Bağlantı yöneticisini başlatma
            this.linkManager.init();
            
            // Sayfa yüklendi işaretini ekleme
            document.body.classList.add('loaded');
            
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
            this.toastManager.error('Uygulama başlatılırken bir hata oluştu: ' + error.message);
        }
    }
}

// Uygulamayı başlatma
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 