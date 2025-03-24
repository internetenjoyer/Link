/**
 * Toast mesajları için yardımcı fonksiyonlar
 */
export class ToastManager {
    constructor() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
        
        this.confirmContainer = document.createElement('div');
        this.confirmContainer.className = 'confirm-dialog';
        document.body.appendChild(this.confirmContainer);
        
        // Toast mesaj tipleri için varsayılan başlık ve ikonlar
        this.toastTypes = {
            success: { title: 'Başarılı', icon: 'fas fa-check-circle' },
            error: { title: 'Hata', icon: 'fas fa-times-circle' },
            warning: { title: 'Uyarı', icon: 'fas fa-exclamation-triangle' },
            info: { title: 'Bilgi', icon: 'fas fa-info-circle' }
        };
    }

    /**
     * Farklı mesaj tipleri için ortak metot
     * @param {string} message - Gösterilecek mesaj
     * @param {string} type - Mesaj tipi (success, error, warning, info)
     * @param {string} title - Mesaj başlığı (opsiyonel)
     * @param {boolean} modal - Modal açıkken gösterilecek mi
     */
    showToast(message, type, title, modal = false) {
        // Eğer başlık belirtilmemişse varsayılan başlığı kullan
        const defaultTitle = this.toastTypes[type].title;
        const icon = this.toastTypes[type].icon;
        title = title || defaultTitle;
        
        // Toast'ı göster
        if (modal) {
            this.showWithoutClosingModal(message, title, type, icon);
        } else {
            this.show(message, title, type, icon);
        }
    }

    /**
     * Başarı mesajı gösterir
     * @param {string} message - Gösterilecek mesaj
     * @param {string} title - Mesaj başlığı (opsiyonel)
     */
    success(message, title) {
        this.showToast(message, 'success', title, false);
    }

    /**
     * Hata mesajı gösterir
     * @param {string} message - Gösterilecek mesaj
     * @param {string} title - Mesaj başlığı (opsiyonel)
     */
    error(message, title) {
        this.showToast(message, 'error', title, false);
    }

    /**
     * Uyarı mesajı gösterir
     * @param {string} message - Gösterilecek mesaj
     * @param {string} title - Mesaj başlığı (opsiyonel)
     */
    warning(message, title) {
        this.showToast(message, 'warning', title, false);
    }

    /**
     * Bilgi mesajı gösterir
     * @param {string} message - Gösterilecek mesaj
     * @param {string} title - Mesaj başlığı (opsiyonel)
     */
    info(message, title) {
        this.showToast(message, 'info', title, false);
    }
    
    /**
     * Modal açıkken başarı mesajı gösterir (modal kapatılmaz)
     * @param {string} message - Gösterilecek mesaj
     * @param {string} title - Mesaj başlığı (opsiyonel)
     */
    modalSuccess(message, title) {
        this.showToast(message, 'success', title, true);
    }

    /**
     * Modal açıkken hata mesajı gösterir (modal kapatılmaz)
     * @param {string} message - Gösterilecek mesaj
     * @param {string} title - Mesaj başlığı (opsiyonel)
     */
    modalError(message, title) {
        this.showToast(message, 'error', title, true);
    }

    /**
     * Modal açıkken uyarı mesajı gösterir (modal kapatılmaz)
     * @param {string} message - Gösterilecek mesaj
     * @param {string} title - Mesaj başlığı (opsiyonel)
     */
    modalWarning(message, title) {
        this.showToast(message, 'warning', title, true);
    }

    /**
     * Modal açıkken bilgi mesajı gösterir (modal kapatılmaz)
     * @param {string} message - Gösterilecek mesaj
     * @param {string} title - Mesaj başlığı (opsiyonel)
     */
    modalInfo(message, title) {
        this.showToast(message, 'info', title, true);
    }

    /**
     * Onay diyaloğu gösterir
     * @param {string} message - Gösterilecek mesaj
     * @param {string} title - Mesaj başlığı
     * @param {function} onConfirm - Onay işlemi için çağrılacak fonksiyon
     * @param {function} onCancel - İptal işlemi için çağrılacak fonksiyon
     */
    confirm(message, title = 'Onay', onConfirm, onCancel) {
        this.confirmContainer.innerHTML = `
            <div class="confirm-dialog-content">
                <div class="confirm-dialog-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="confirm-dialog-title">${title}</div>
                <div class="confirm-dialog-message">${message}</div>
                <div class="confirm-dialog-buttons">
                    <button class="btn btn-secondary" id="confirm-cancel-btn">İptal</button>
                    <button class="btn btn-danger" id="confirm-ok-btn">Evet, Eminim</button>
                </div>
            </div>
        `;
        
        this.confirmContainer.classList.add('active');
        
        const cancelBtn = document.getElementById('confirm-cancel-btn');
        const okBtn = document.getElementById('confirm-ok-btn');
        
        cancelBtn.addEventListener('click', () => {
            this.confirmContainer.classList.remove('active');
            if (typeof onCancel === 'function') {
                onCancel();
            }
        });
        
        okBtn.addEventListener('click', () => {
            this.confirmContainer.classList.remove('active');
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        });
    }

    /**
     * Toast mesajı oluşturur ve görüntüler
     * @param {string} message - Gösterilecek mesaj
     * @param {string} title - Mesaj başlığı
     * @param {string} type - Mesaj tipi (success, error, warning, info)
     * @param {string} icon - Font Awesome ikon adı
     * @param {boolean} closeModal - Modal kapatılsın mı
     */
    createToast(message, title, type, icon, autoClose = true) {
        // Toast elementini oluşturma
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Toast içeriğini oluşturma
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icon}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Kapat" title="Bildirimi kapat">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Container'a ekleme
        this.container.appendChild(toast);
        
        // Kapatma butonuna olay dinleyicisi ekleme
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.close(toast);
        });
        
        // Toast'a tıklandığında içeriğe göre farklı olaylar (opsiyonel)
        toast.addEventListener('click', (e) => {
            if (!e.target.closest('.toast-close')) {
                // Sadece kapatma butonuna tıklanmadıysa burada ek işlemler yapılabilir
            }
        });
        
        // Otomatik kapatma
        if (autoClose) {
            setTimeout(() => {
                this.close(toast);
            }, 5000);
        }
        
        return toast;
    }

    /**
     * Toast mesajı gösterir
     * @param {string} message - Gösterilecek mesaj
     * @param {string} title - Mesaj başlığı
     * @param {string} type - Mesaj tipi (success, error, warning, info)
     * @param {string} icon - Font Awesome ikon adı
     */
    show(message, title, type, icon) {
        return this.createToast(message, title, type, icon, true);
    }
    
    /**
     * Modal açıkken toast mesajı gösterir (modal kapatılmaz)
     * @param {string} message - Gösterilecek mesaj
     * @param {string} title - Mesaj başlığı
     * @param {string} type - Mesaj tipi (success, error, warning, info)
     * @param {string} icon - Font Awesome ikon adı
     */
    showWithoutClosingModal(message, title, type, icon) {
        return this.createToast(message, title, type, icon, true);
    }

    /**
     * Toast mesajını kapatır
     * @param {HTMLElement} toast - Kapatılacak toast elementi
     */
    close(toast) {
        // Eğer toast zaten kaldırılmışsa işlem yapma
        if (!toast || !toast.parentNode) return;
        
        // Toast'a çıkış animasyonu ekle
        toast.style.animation = 'toastFadeOut 0.5s forwards';
        
        // Animasyon bittikten sonra toast'u kaldır
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 500);
    }
    
    /**
     * Modal içindeki bildirimleri desteklemiyoruz, bunun yerine toast kullananılır
     * @deprecated Bu metodun kullanımı önerilmez, bunun yerine modalSuccess, modalError, modalWarning veya modalInfo kullanın
     */
    showInModal(modalElement, message, type, containerId = 'modal-notification', duration = 5000) {
        console.warn('showInModal metodu artık kullanımdan kaldırılmıştır. Bunun yerine modalSuccess, modalError, modalWarning veya modalInfo metodlarını kullanın.');
        
        // Bildirim tipine göre uygun metodu çağır
        switch (type) {
            case 'success':
                this.modalSuccess(message);
                break;
            case 'error':
                this.modalError(message);
                break;
            case 'warning':
                this.modalWarning(message);
                break;
            default:
                this.modalInfo(message);
        }
    }
} 