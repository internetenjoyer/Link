/**
 * Bağlantı yönetimi sınıfı
 * Kullanıcı arayüzüne bağlantıları görüntüleme, listeleme, filtreleme ve yönetme işlemlerini sağlar
 */
export class LinkManager {
    /**
     * LinkManager sınıfı yapılandırıcısı
     * @param {Object} dataManager - Veri yönetimi sağlayan DataManager nesnesi
     * @param {Object} authManager - Kimlik doğrulama sağlayan AuthManager nesnesi  
     * @param {Object} toastManager - Bildirim gösterimi sağlayan ToastManager nesnesi
     * @param {Object} uiManager - Kullanıcı arayüzü yönetimi sağlayan UIManager nesnesi
     */
    constructor(dataManager, authManager, toastManager, uiManager) {
        this.dataManager = dataManager;
        this.authManager = authManager;
        this.toastManager = toastManager;
        this.uiManager = uiManager;
        this.linksList = document.getElementById('links-list');
        this.lastOrderUpdate = null; // Son sıralama güncelleme zamanı
    }
    
    /**
     * Bağlantı yöneticisini başlatır, gerekli verileri yükler ve olay dinleyicilerini ekler
     */
    init() {
        try {
            // Temel başlatma görevleri
            const initTasks = [
                { task: this.loadLinks.bind(this), name: 'Bağlantıları yükleme' },
                { task: this.addEventListeners.bind(this), name: 'Olay dinleyicilerini ekleme' },
                { task: this.checkSelectAllHeaderVisibility.bind(this), name: '"Tümünü Seç" görünürlüğünü kontrol etme' },
                { task: this.setupSelectAllListener.bind(this), name: '"Tümünü Seç" dinleyicisini ekleme' },
                { task: this.initSearchBox.bind(this), name: 'Arama kutusunu başlatma' }
            ];
            
            // Tüm görevleri çalıştır
            for (const { task, name } of initTasks) {
                task();
                console.log(`${name} tamamlandı`);
            }
            
            console.log('Bağlantı yöneticisi başlatıldı');
        } catch (error) {
            console.error('Bağlantı yöneticisi başlatılırken hata oluştu:', error);
        }
    }
    
    /**
     * Bağlantıları yükler ve kullanıcı arayüzünde gösterir
     * @param {Object} filters - Bağlantıları filtrelemek için kullanılacak filtreler
     * @returns {Array} - Yüklenen bağlantılar dizisi
     */
    async loadLinks(filters = {}) {
        try {
            // Bağlantıları getirme
            const links = await this.dataManager.getLinks(filters);
            
            // Bağlantıları görüntüleme (UIManager üzerinden)
            if (this.uiManager && typeof this.uiManager.renderLinks === 'function') {
                this.uiManager.renderLinks(links);
            } else {
                console.warn('UIManager veya renderLinks fonksiyonu bulunamadı, bağlantılar görüntülenemedi');
            }
            
            // Gösterilen bağlantılarla ilgili arayüz güncellemeleri
            this.updateLinkCount(links.length, this.dataManager.getAccessibleLinkCount());
            this.resetSelectionUI();
            this.updateSelectAllHeaderVisibility(links.length);
            
            return links;
        } catch (error) {
            console.error('Bağlantılar yüklenirken hata oluştu:', error);
            if (this.toastManager) {
                this.toastManager.error('Bağlantılar yüklenirken bir hata oluştu: ' + error.message);
            }
            return [];
        }
    }
    
    /**
     * "Tümünü Seç" başlığının görünürlüğünü günceller
     * @param {number} linkCount - Bağlantı sayısı
     */
    updateSelectAllHeaderVisibility(linkCount) {
        try {
                const canEdit = this.authManager.canEdit();
            const shouldBeVisible = linkCount > 0 && canEdit;
            
            // Başlık görünürlüğünü güncelle
            const isVisible = this.toggleElementVisibility('select-all-header', shouldBeVisible);
            
            // Checkbox'ı sıfırla
                const selectAllCheckbox = document.getElementById('select-all-links');
                if (selectAllCheckbox) {
                    selectAllCheckbox.checked = false;
                }
            
            console.log(`"Tümünü Seç" başlığı ${isVisible ? 'gösterildi' : 'gizlendi'} (bağlantı sayısı: ${linkCount}, düzenleme yetkisi: ${canEdit ? 'var' : 'yok'})`);
        } catch (error) {
            console.error('Select all header görünürlüğü güncellenirken hata oluştu:', error);
        }
    }
    
    /**
     * "Tümünü Seç" başlığının başlangıç görünürlüğünü kontrol eder
     */
    checkSelectAllHeaderVisibility() {
        try {
            // Başlangıçta listedeki bağlantı sayısını kontrol et
            const linksList = document.getElementById('links-list');
            const linkCount = linksList ? linksList.querySelectorAll('li.link-item').length : 0;
            
            // Görünürlüğü güncelleme fonksiyonuna yönlendir
            this.updateSelectAllHeaderVisibility(linkCount);
            } catch (error) {
            console.error('Başlangıçta select all header görünürlüğü kontrol edilirken hata oluştu:', error);
        }
    }
    
    /**
     * Seçilen bağlantı sayısını günceller
     * @returns {number} - Seçilen bağlantı sayısı
     */
    updateSelectedCount() {
        try {
            const checkboxes = document.querySelectorAll('.link-checkbox:checked');
            const count = checkboxes.length;
            const countText = document.getElementById('selected-count');
            
            if (countText) {
                countText.textContent = `${count} bağlantı seçildi`;
            }
            
            console.log(`Seçilen bağlantı sayısı güncellendi: ${count}`);
            return count;
        } catch (error) {
            console.error('Seçilen bağlantı sayısı güncellenirken hata oluştu:', error);
            return 0;
        }
    }
    
    /**
     * Toplu işlem butonunun görünürlüğünü günceller
     */
    updateBulkActionsVisibility() {
        try {
            const countText = document.getElementById('selected-count');
            const bulkActions = document.getElementById('bulk-actions');
            
            if (!countText || !bulkActions) return;
            
            const countStr = countText.textContent.split(' ')[0];
            const count = parseInt(countStr);
            
            if (count > 0) {
                // Animasyonu daha düzgün hale getirmek için requestAnimationFrame kullanıyoruz
                requestAnimationFrame(() => {
                    bulkActions.classList.add('active');
                });
                
                // Yeni bağlantı ekle butonunun yanında görünmesi için action-left'in genişliğini ayarlayalım
                const actionLeft = document.querySelector('.action-left');
                if (actionLeft) {
                    actionLeft.style.display = 'flex';
                    actionLeft.style.alignItems = 'center';
                }
            } else {
                // Animasyonu daha düzgün hale getirmek için
                bulkActions.classList.remove('active');
            }
        } catch (error) {
            console.error('Toplu işlem butonunun görünürlüğü güncellenirken hata oluştu:', error);
        }
    }
    
    /**
     * Tüm bağlantıları seçili/seçilmemiş duruma getirir
     * @param {boolean} checked - Seçim durumu
     */
    toggleSelectAll(checked) {
        try {
            // Görünür bağlantıları daha güvenilir bir şekilde seçelim
            const linkItems = document.querySelectorAll('.link-item');
            const visibleCheckboxes = [];
            
            // Görünür bağlantıları ve checkbox'larını bul
            linkItems.forEach(item => {
                const computedStyle = window.getComputedStyle(item);
                const isVisible = computedStyle.display !== 'none';
                
                if (isVisible) {
                    const checkbox = item.querySelector('.link-checkbox');
                    if (checkbox) {
                        visibleCheckboxes.push(checkbox);
                        
                        // "selected" sınıfını güncelle
                        item.classList.toggle('selected', checked);
                    }
                }
            });
            
            if (visibleCheckboxes.length === 0) {
                console.warn('Seçilecek görünür bağlantı bulunamadı');
                return;
            }
            
            // Tüm görünür checkbox'ları işaretle
            visibleCheckboxes.forEach(checkbox => {
                checkbox.checked = checked;
            });
            
            // Seçimi güncelle
            this.updateSelectedCountAfterSearch();
            console.log(`Görünür bağlantıların seçimi ${checked ? 'yapıldı' : 'kaldırıldı'} (${visibleCheckboxes.length} bağlantı)`);
        } catch (error) {
            console.error('Bağlantıların seçimi değiştirilirken hata oluştu:', error);
        }
    }
    
    /**
     * Tümünü seç checkbox'ı için olay dinleyicisi ekler
     */
    setupSelectAllListener() {
        const selectAllCheckbox = document.getElementById('select-all-links');
        if (!selectAllCheckbox) return;
        
        selectAllCheckbox.addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });
    }
    
    /**
     * Olay dinleyicilerini ekler
     */
    addEventListeners() {
        try {
            // Toplu işlem butonlarına olay dinleyicileri ekleme
            const deleteSelectedBtn = document.getElementById('delete-selected-btn');
            
            if (deleteSelectedBtn) {
                deleteSelectedBtn.addEventListener('click', () => {
                    this.deleteSelectedLinks();
                });
                console.log('Seçilenleri sil butonuna olay dinleyicisi eklendi');
            }
        } catch (error) {
            console.error('Olay dinleyicileri eklenirken hata oluştu:', error);
        }
    }
    
    /**
     * Arama sonrası seçili öğe sayısını günceller
     */
    updateSelectedCountAfterSearch() {
        try {
            // Seçili öğe sayısını güncelle
            this.updateSelectedCount();
            
            // Toplu işlem butonunun görünürlüğünü güncelle
            this.updateBulkActionsVisibility();
            
            // Checkbox'ları ve selected sınıflarını güncelle
            this.updateCheckboxesAfterSearch();
        } catch (error) {
            console.error('Arama sonrası seçim güncellenirken hata oluştu:', error);
        }
    }
    
    /**
     * Arama sonrası checkbox'ları günceller
     */
    updateCheckboxesAfterSearch() {
        try {
            // Görünür ve seçili öğeleri bul
        const linkItems = document.querySelectorAll('.link-item');
            const visibleItems = [];
            const visibleCheckedItems = [];
        
            // Her link öğesini kontrol et
        linkItems.forEach(item => {
            const computedStyle = window.getComputedStyle(item);
            const isVisible = computedStyle.display !== 'none';
            
                // Görünür link öğelerini topla
            if (isVisible) {
                    visibleItems.push(item);
                    
                const checkbox = item.querySelector('.link-checkbox');
                if (checkbox && checkbox.checked) {
                        visibleCheckedItems.push(item);
                    }
                    
                    // "selected" sınıfını güncelle
                    if (checkbox) {
                        item.classList.toggle('selected', checkbox.checked);
                    }
                }
            });
            
            // Tümünü seç checkbox'ını güncelle
            const selectAllCheckbox = document.getElementById('select-all-links');
            if (selectAllCheckbox && visibleItems.length > 0) {
                selectAllCheckbox.checked = visibleItems.length === visibleCheckedItems.length;
            }
            } catch (error) {
            console.error('Arama sonrası seçim kutularını güncellerken hata oluştu:', error);
        }
    }
    
    /**
     * Seçim arayüzünü sıfırlar
     */
    resetSelectionUI() {
        try {
        // Toplu işlem butonunu gizle
        const bulkActions = document.getElementById('bulk-actions');
        if (bulkActions) {
            bulkActions.classList.remove('active');
        }
        
        // Sayacı sıfırla
        const countText = document.getElementById('selected-count');
        if (countText) {
            countText.textContent = '0 bağlantı seçildi';
        }
        
        // Tümünü seç checkbox'ını sıfırla
        const selectAllCheckbox = document.getElementById('select-all-links');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
        
        // Tüm checkbox'ları işaretlenmemiş yap ve "selected" sınıfını kaldır
        const checkboxes = document.querySelectorAll('.link-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            const linkItem = checkbox.closest('.link-item');
            if (linkItem) {
                linkItem.classList.remove('selected');
            }
        });
        
        // Toplu işlem butonunun görünürlüğünü güncelle
        this.updateBulkActionsVisibility();
        
            // Bağlantı listesindeki öğeleri kontrol et
            this.checkListAfterReset();
        } catch (error) {
            console.error('Seçim arayüzü sıfırlanırken hata oluştu:', error);
        }
    }
    
    /**
     * Liste sıfırlama sonrası bağlantı sayısını kontrol eder
     */
    checkListAfterReset() {
        try {
            const linksList = document.getElementById('links-list');
            if (!linksList) return;
            
            // Boş mesaj varsa veya liste boşsa, "Tümünü Seç" başlığını gizle
                const hasEmptyMessage = linksList.querySelector('.empty-message') !== null;
                
                if (hasEmptyMessage || linksList.children.length === 0) {
                    this.updateSelectAllHeaderVisibility(0);
                } else {
                    // Aksi takdirde, gerçek bağlantı sayısını kullan
                    const linkCount = linksList.querySelectorAll('.link-item').length;
                    this.updateSelectAllHeaderVisibility(linkCount);
                }
        } catch (error) {
            console.error('Liste sıfırlama sonrası kontrol edilirken hata oluştu:', error);
        }
    }
    
    /**
     * Bağlantıları filtreleme
     * @param {Array} links - Filtrelenecek bağlantılar
     * @param {Object} filters - Filtre kriterleri
     * @returns {Array} - Filtrelenmiş bağlantılar
     */
    filterLinks(links, filters) {
        if (!Array.isArray(links)) {
            console.warn('Filtrelenecek bağlantılar bir dizi değil');
            return [];
        }
        
        console.log('Filtreleme başlıyor, toplam bağlantı sayısı:', links.length);
        console.log('Uygulanan filtreler:', filters);
        
        const result = links.filter(link => {
            try {
                // Tüm filtrelerin geçerli olup olmadığını kontrol etmek için bir fonksiyon
                const isValidForFilter = (filterValue, linkValue) => {
                    return !filterValue || filterValue === '' || linkValue === filterValue;
                };
                
                // Tarih aralığı filtresi
                if (!this.isLinkInDateRange(link, filters)) {
                    return false;
                }
                
                // Temel filtreler: marka, kategori, gönderi tipi
                const filterMap = [
                    { filter: 'brandId', linkValue: link.brandId },
                    { filter: 'categoryId', linkValue: link.categoryId },
                    { filter: 'postTypeId', linkValue: link.postTypeId }
                ];
                
                // Herhangi bir filtre eşleşmezse false dön
                for (const { filter, linkValue } of filterMap) {
                    if (!isValidForFilter(filters[filter], linkValue)) {
                        return false;
                    }
                }
                
                return true;
        } catch (error) {
                console.error('Bağlantı filtrelenirken hata oluştu:', error, link);
                return false;
            }
        });
        
        console.log('Filtrelenmiş bağlantı sayısı:', result.length);
        return result;
    }
    
    /**
     * Bağlantının tarih aralığında olup olmadığını kontrol eder
     * @param {Object} link - Kontrol edilecek bağlantı
     * @param {Object} filters - Filtre kriterleri
     * @returns {boolean} - Bağlantı tarih aralığında mı
     */
    isLinkInDateRange(link, filters) {
        // Tarih aralığı filtresi yoksa true dön
        if (!filters.startDate && !filters.endDate) {
            return true;
        }
        
        const linkDate = link.datetime ? link.datetime.split('T')[0] : '';
        
        // Başlangıç tarihi kontrolü
        if (filters.startDate && linkDate && linkDate < filters.startDate) {
            return false;
        }
        
        // Bitiş tarihi kontrolü
        if (filters.endDate && linkDate && linkDate > filters.endDate) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Bağlantı sayısını güncelleme
     * @param {number} count - Gösterilen bağlantı sayısı
     * @param {Object} filters - Uygulanan filtreler
     */
    updateLinkCount(count, filters = {}) {
        // Ana sayaç güncelleme (actionbar içindeki)
        const countText = document.getElementById('link-count');
        if (countText) {
            const hasFilters = Object.keys(filters).length > 0;
            
            if (hasFilters) {
                // Filtre uygulanmışsa, toplam bağlantı sayısını da göster
                const accessibleCount = this.getAccessibleLinkCount();
                countText.textContent = `${count} bağlantı gösteriliyor (toplam ${accessibleCount})`;
            } else {
                // Filtre yoksa, sadece bağlantı sayısını göster
                countText.textContent = `${count} bağlantı`;
            }
        }
        
        // Arama sonuçları sayacı (links-list header içindeki)
        this.updateSearchResultsCount(count);
    }
    
    /**
     * Arama sonuçları sayacını günceller
     * @param {number} visibleCount - Görünür bağlantı sayısı
     */
    updateSearchResultsCount(visibleCount) {
        const linkCounter = document.querySelector('.link-counter');
        if (!linkCounter) return;
        
            // Toplam link sayısını alalım
            const totalLinks = document.querySelectorAll('.link-item').length;
            
        // Arama durumunu kontrol edelim
            const searchInput = document.getElementById('link-search');
            const isSearchActive = searchInput && searchInput.value.trim().length > 0;
            
            // Sayacı güncelleyelim
        if (isSearchActive && visibleCount < totalLinks) {
            linkCounter.textContent = `${visibleCount} / ${totalLinks} bağlantı gösteriliyor`;
            } else {
                linkCounter.textContent = `${totalLinks} bağlantı`;
            }
        }
    
    /**
     * Erişilebilir bağlantı sayısını hesaplar
     * @returns {number} - Erişilebilir bağlantı sayısı
     */
    getAccessibleLinkCount() {
        // Kullanıcının rolünü kontrol et
        const isAdmin = this.authManager.isAdmin();
        const isEditor = this.authManager.currentUser && this.authManager.currentUser.role === 'editor';
        
        // Admin ve editör tüm bağlantılara erişebilir
        if (isAdmin || isEditor) {
            return this.dataManager.links.length;
        }
        
        // Normal kullanıcı için erişilebilir bağlantı sayısını hesapla
        const allowedBrands = this.authManager.currentUser && 
                            Array.isArray(this.authManager.currentUser.allowedBrands) ? 
                            this.authManager.currentUser.allowedBrands : [];
        
        return this.dataManager.links.filter(link => 
            allowedBrands.includes(link.brandId)
        ).length;
    }
    
    /**
     * Benzersiz ID oluşturur
     * @returns {string} - Oluşturulan benzersiz ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    /**
     * Seçilen bağlantıları siler
     */
    deleteSelectedLinks() {
        const selectedIds = this.getSelectedLinkIds();
        
        if (selectedIds.length === 0) {
            this.toastManager.warning('Lütfen silmek için en az bir bağlantı seçin');
            return;
        }
        
        // Onay diyaloğu gösterme
        const confirmed = confirm(`${selectedIds.length} bağlantıyı silmek istediğinizden emin misiniz?`);
        
        if (confirmed) {
            try {
                // Seçilen bağlantıları silme
                selectedIds.forEach(async (id) => {
                    await this.dataManager.deleteLink(id);
                });
                
                // Bağlantıları yeniden yükleme
                this.loadLinks().then(links => {
                    // Tüm bağlantılar silindiyse "Tümünü Seç" başlığını gizle
                    if (links.length === 0) {
                        this.updateSelectAllHeaderVisibility(0);
                    }
                });
                
                // Seçim sayacını ve "Tümünü Seç" checkbox'ını sıfırlama
                this.resetSelectionUI();
                
                // Başarı mesajı gösterme
                this.toastManager.success(`${selectedIds.length} bağlantı başarıyla silindi`);
                
                console.log('Seçilen bağlantılar silindi:', selectedIds);
        } catch (error) {
                console.error('Bağlantılar silinirken hata oluştu:', error);
                this.toastManager.error('Bağlantılar silinirken bir hata oluştu: ' + error.message);
            }
        }
    }
    
    /**
     * Görünürlük temelinde elementlerin durumunu kontrol eden yardımcı fonksiyon
     * @param {string} elementId - Kontrol edilecek elementin ID'si
     * @param {boolean} shouldBeVisible - Elementin görünürlük durumu
     * @param {string} displayValue - Görünür olduğunda kullanılacak display değeri
     * @returns {boolean} - Elementin güncel görünürlük durumu
     */
    toggleElementVisibility(elementId, shouldBeVisible, displayValue = 'flex') {
        const element = document.getElementById(elementId);
        if (!element) return false;
        
        element.style.display = shouldBeVisible ? displayValue : 'none';
        return shouldBeVisible;
    }

    /**
     * Arama kutusu işlevselliğini başlatır
     */
    initSearchBox() {
        // DOM elementlerini seçelim
        const searchInput = document.getElementById('link-search');
        const clearButton = document.getElementById('clear-search');
        
        if (!searchInput || !clearButton) return;
        
        // Arama fonksiyonu - her tuş vuruşunda çalışır
        const performSearch = () => {
            const searchText = searchInput.value.toLowerCase().trim();
            
            // Temizle butonunu göster/gizle
            clearButton.style.display = searchText.length > 0 ? 'block' : 'none';
            
            // Tüm link itemleri seçelim
            const linkItems = document.querySelectorAll('.link-item');
            
            // Arama sonuçlarını filtrele
            const visibleCount = this.performFilterOnElements(
                searchText, 
                linkItems, 
                item => {
                // SADECE başlık ve marka metasını alalım (talebe göre düzeltildi)
                const title = item.querySelector('.link-title')?.textContent || '';
                const brand = item.querySelector('.link-brand')?.textContent || '';
                    return `${title} ${brand}`;
                }
            );
            
            // Eğer hiç sonuç yoksa bir mesaj gösterelim
            this.handleNoSearchResults(searchText, visibleCount);
            
            // Filtre sonucunda gösterilen link sayısını güncelleyelim (boş filters objesi ile)
            this.updateLinkCount(visibleCount, {});
            
            // Toplu seçim kısmını güncelleyelim
            this.updateSelectAllHeaderForSearch(visibleCount);
            
            // Varolan seçimleri kontrol edelim ve güncelleyelim
            this.updateSelectedCountAfterSearch();
            
            console.log(`Arama sonucu: ${visibleCount} bağlantı gösteriliyor`);
        };
        
        // Arama olaylarını bağla
        this.setupSearchEvents(searchInput, clearButton, performSearch);
    }

    /**
     * Arama sonuçlarına göre "Tümünü Seç" başlığının görünürlüğünü günceller
     * @param {number} visibleCount - Görünen link sayısı
     */
    updateSelectAllHeaderForSearch(visibleCount) {
        // Yeni eklenen ortak fonksiyonu kullan
        this.updateSelectAllHeaderVisibility(visibleCount);
        
        // Toplu İşlem butonunun durumunu güncelle
        this.resetSelectionUI();
    }

    /**
     * Arama sonuçları boş olduğunda mesaj gösterir
     * @param {string} searchText - Arama metni
     * @param {number} visibleCount - Görünür öğe sayısı
     */
    handleNoSearchResults(searchText, visibleCount) {
            const noResultsMessage = document.getElementById('no-search-results');
            const linksList = document.getElementById('links-list');
            
            if (!noResultsMessage && visibleCount === 0 && searchText.length > 0 && linksList) {
                const message = document.createElement('div');
                message.id = 'no-search-results';
                message.className = 'no-results-message';
                message.textContent = 'Aramaya uygun bağlantı bulunamadı.';
                linksList.appendChild(message);
            } else if (noResultsMessage && (visibleCount > 0 || searchText.length === 0)) {
                noResultsMessage.remove();
        }
    }
    
    /**
     * Arama olaylarını bağlar
     * @param {HTMLElement} searchInput - Arama giriş alanı
     * @param {HTMLElement} clearButton - Temizleme butonu
     * @param {Function} performSearch - Arama yapacak fonksiyon
     */
    setupSearchEvents(searchInput, clearButton, performSearch) {
        // Arama kutusuna olay dinleyicileri ekleyelim
        searchInput.addEventListener('input', performSearch);
        
        // Temizle butonuna olay dinleyicisi ekleyelim
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            clearButton.style.display = 'none';
            performSearch();
            searchInput.focus();
        });
        
        // ESC tuşu ile aramayı temizleme
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                clearButton.style.display = 'none';
                performSearch();
            }
        });
    }

    /**
     * DOM elementlerinde arama/filtreleme işlemi yapar
     * @param {string} searchText - Aranacak metin
     * @param {NodeList|Array} items - Aranacak DOM elementleri 
     * @param {Function} textExtractor - Her elementten metin çıkaran fonksiyon
     * @returns {number} - Görünür eleman sayısı
     */
    performFilterOnElements(searchText, items, textExtractor) {
        let visibleCount = 0;
        
        // Boş arama ise tümünü göster
        if (!searchText.length) {
            items.forEach(item => {
                item.style.display = 'flex';
                visibleCount++;
            });
            return visibleCount;
        }
        
        // Arama metni varsa eşleşenleri göster
        items.forEach(item => {
            const searchableText = textExtractor(item).toLowerCase();
            const matches = searchableText.includes(searchText.toLowerCase());
            
            item.style.display = matches ? 'flex' : 'none';
            if (matches) visibleCount++;
        });
        
        return visibleCount;
    }

    /**
     * Görünür bağlantı listesinden seçili olanları bulur
     * @returns {Array} - Seçilen bağlantı ID'leri
     */
    getSelectedLinkIds() {
                const linkItems = document.querySelectorAll('.link-item');
        const selectedIds = [];
                
        // Her bağlantı öğesini kontrol et
                linkItems.forEach(item => {
                    const computedStyle = window.getComputedStyle(item);
                    const isVisible = computedStyle.display !== 'none';
                    
                    if (isVisible) {
                        const checkbox = item.querySelector('.link-checkbox');
                if (checkbox && checkbox.checked) {
                    const id = checkbox.dataset.id;
                    if (id) {
                        selectedIds.push(id);
                    }
                        }
                    }
                });
                
        return selectedIds;
    }

    /**
     * Belirtilen işleme göre bağlantı ekler, günceller veya siler
     * @param {string} action - İşlem türü ('add', 'update', 'delete') 
     * @param {Object|string} data - Bağlantı verisi veya ID
     * @returns {Object|boolean} - İşlem sonucu
     */
    async processLinkOperation(action, data) {
        try {
            let result;
            
            // İşlem türüne göre veri yöneticisini çağır
            switch (action) {
                case 'add':
                    result = await this.dataManager.addLink({
                        id: this.generateId(),
                        ...data
                    });
                    this.toastManager.success('Bağlantı başarıyla eklendi');
                    break;
                    
                case 'update':
                    result = await this.dataManager.updateLink(data);
                    this.toastManager.success('Bağlantı başarıyla güncellendi');
                    break;
                    
                case 'delete':
                    // ID mi tam nesne mi kontrol et
                    const linkId = typeof data === 'string' ? data : data.id;
                    
                    // Silme onayı
                    if (!confirm('Bu bağlantıyı silmek istediğinize emin misiniz?')) {
                        return false;
                    }
                    
                    result = await this.dataManager.deleteLink(linkId);
                    this.toastManager.success('Bağlantı başarıyla silindi');
                    break;
                    
                default:
                    throw new Error(`Geçersiz bağlantı işlemi: ${action}`);
            }
            
            // Bağlantıları yeniden yükle
            this.loadLinks();
            return result;
        } catch (error) {
            console.error(`Bağlantı ${action} işlemi sırasında hata oluştu:`, error);
            this.toastManager.error(`Bağlantı işleminde bir hata oluştu: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Yeni bağlantı ekler
     * @param {Object} linkData - Eklenecek bağlantı verisi
     * @returns {Object} - Eklenen bağlantı
     */
    async addLink(linkData) {
        return this.processLinkOperation('add', linkData);
    }
    
    /**
     * Bağlantı günceller
     * @param {Object} linkData - Güncellenecek bağlantı verisi
     * @returns {Object} - Güncellenen bağlantı
     */
    async updateLink(linkData) {
        return this.processLinkOperation('update', linkData);
    }
    
    /**
     * Bağlantı siler
     * @param {string} linkId - Silinecek bağlantının ID'si
     * @returns {boolean} - İşlem başarılı mı
     */
    async deleteLink(linkId) {
        return this.processLinkOperation('delete', linkId);
    }
    
    /**
     * Bağlantı düzenleme modunu başlatır
     * @param {string} linkId - Düzenlenecek bağlantının ID'si
     */
    editLink(linkId) {
        try {
            this.uiManager.showEditLinkModal(linkId);
        } catch (error) {
            console.error('Bağlantı düzenlenirken hata oluştu:', error);
            this.toastManager.error('Bağlantı düzenlenirken bir hata oluştu: ' + error.message);
        }
    }
    
    /**
     * Bağlantıyı HTML olarak oluşturur
     * @param {Object} link - Oluşturulacak bağlantı nesnesi
     * @returns {HTMLElement} - Oluşturulan bağlantı elementi
     */
    renderLink(link) {
        try {
            // Bağlantı öğesi oluşturma
            const li = document.createElement('li');
            li.className = 'link-item';
            li.dataset.id = link.id;
            
            // İlişkili verileri getir
            const { brandName, categoryName, brand, category, creator } = this.getLinkRelatedData(link);
            
            // Tarih bilgilerini formatla
            const { formattedDate, formattedTime, formattedUpdateDate, formattedUpdateTime } = this.formatLinkDates(link);
            
            // Düzenleme yetkisi kontrol et
            const canEdit = this.authManager.canEdit();
            
            // İçerik oluştur
            li.innerHTML = this.generateLinkHTML(link, {
                brandName, categoryName, brand, category, creator,
                formattedDate, formattedTime, formattedUpdateDate, formattedUpdateTime, 
                canEdit
            });
            
            // Olay dinleyicileri ekle
            if (canEdit) {
                this.attachLinkEventListeners(li, link.id);
            }
            
            return li;
        } catch (error) {
            console.error('Bağlantı HTML oluşturulurken hata oluştu:', error);
            
            // Hata durumunda minimum bir element döndür
            const errorLi = document.createElement('li');
            errorLi.className = 'link-item error';
            errorLi.textContent = `Bağlantı gösterilemiyor: ${error.message}`;
            return errorLi;
        }
    }
    
    /**
     * Bağlantı ile ilişkili veri nesnelerini getirir
     * @param {Object} link - Bağlantı nesnesi
     * @returns {Object} - İlişkili veriler
     */
    getLinkRelatedData(link) {
        // Marka ve kategori bilgilerini alma
        const brandName = link.brandName || (this.dataManager.brands.find(b => b.id === link.brandId)?.name || 'Bilinmeyen Marka');
        const categoryName = link.categoryName || (this.dataManager.categories.find(c => c.id === link.categoryId)?.name || 'Bilinmeyen Kategori');
        
        // Marka ve kategori nesnelerini bulma (logo ve ikon için)
        const brand = this.dataManager.brands.find(b => b.id === link.brandId) || { name: brandName, logo: null };
        const category = this.dataManager.categories.find(c => c.id === link.categoryId) || { name: categoryName, icon: 'globe' };
        
        // Oluşturan kullanıcı bilgisini alma
        const creator = this.dataManager.users.find(u => u.id === link.createdBy) || { username: 'Bilinmeyen Kullanıcı' };
        
        return { brandName, categoryName, brand, category, creator };
    }
    
    /**
     * Bağlantının tarih bilgilerini formatlar
     * @param {Object} link - Bağlantı nesnesi
     * @returns {Object} - Formatlanmış tarih bilgileri
     */
    formatLinkDates(link) {
        // Tarih ve saat formatını düzenleme
        const dateTime = new Date(link.datetime);
        const formattedDate = `${dateTime.getDate().toString().padStart(2, '0')}.${(dateTime.getMonth() + 1).toString().padStart(2, '0')}.${dateTime.getFullYear()}`;
        const formattedTime = `${dateTime.getHours().toString().padStart(2, '0')}:${dateTime.getMinutes().toString().padStart(2, '0')}`;
        
        // Güncelleme tarihi varsa formatla
        let formattedUpdateDate = '';
        let formattedUpdateTime = '';
        if (link.lastUpdated) {
            const updateDateTime = new Date(link.lastUpdated);
            formattedUpdateDate = `${updateDateTime.getDate().toString().padStart(2, '0')}.${(updateDateTime.getMonth() + 1).toString().padStart(2, '0')}.${updateDateTime.getFullYear()}`;
            formattedUpdateTime = `${updateDateTime.getHours().toString().padStart(2, '0')}:${updateDateTime.getMinutes().toString().padStart(2, '0')}`;
        }
        
        return { formattedDate, formattedTime, formattedUpdateDate, formattedUpdateTime };
    }
    
    /**
     * Bağlantı HTML kodunu oluşturur
     * @param {Object} link - Bağlantı nesnesi
     * @param {Object} data - Oluşturma için gerekli veriler
     * @returns {string} - HTML kodu
     */
    generateLinkHTML(link, data) {
        const {
            brandName, categoryName, brand, category, creator,
            formattedDate, formattedTime, formattedUpdateDate, formattedUpdateTime,
            canEdit
        } = data;
        
        // Gönderi tipi bilgisini alma
        const postTypeName = link.postTypeName || '';
        
        // Düzenleyen kullanıcı bilgisini alma
        let updatedByUsername = '';
        if (link.lastUpdatedBy) {
            const updatedByUser = this.dataManager.users.find(u => u.id === link.lastUpdatedBy);
            updatedByUsername = updatedByUser ? updatedByUser.username : 'Bilinmeyen Kullanıcı';
        }
        
        // Değişen alanları formatlama
        let changedFieldsText = '';
        if (link.changedFields && link.changedFields.length > 0) {
            changedFieldsText = link.changedFields.join(', ');
            if (updatedByUsername) {
                changedFieldsText += ` ${updatedByUsername} tarafından düzenlendi`;
            } else {
                changedFieldsText += ' düzenlendi';
            }
        }
        
        return `
            <div class="link-select">
                ${canEdit ? `<input type="checkbox" class="link-checkbox" data-id="${link.id}">` : ''}
            </div>
            <div class="link-info">
                <div class="link-title">${link.title}</div>
                <div class="link-url">
                    <a href="${link.url}" target="_blank">${link.url}</a>
                </div>
                <div class="link-meta">
                    <div class="link-brand">
                        ${brand.logo ? `<img src="${brand.logo}" alt="${brandName}" class="brand-logo-small">` : `<i class="fas fa-building"></i>`}
                        ${brandName}
                    </div>
                    <div class="link-category">
                        ${category.icon === 'globe' || categoryName.toLowerCase().includes('web') ? 
                          `<i class="fas fa-globe"></i>` : 
                          `<i class="fab fa-${category.icon}"></i>`}
                        ${categoryName}${postTypeName ? ` • ${postTypeName}` : ''}
                    </div>
                    <div class="link-creator">
                        <i class="fas fa-user"></i>
                        ${creator.username}
                    </div>
                    <div class="link-datetime">
                        <i class="fas fa-calendar"></i>
                        ${formattedDate} ${formattedTime}
                    </div>
                </div>
                ${link.description ? `<div class="link-description">${link.description}</div>` : ''}
                ${link.lastUpdated ? `
                <div class="link-updated">
                    <i class="fas fa-edit"></i> ${changedFieldsText ? `${changedFieldsText} • ` : ''}${formattedUpdateDate} ${formattedUpdateTime}
                </div>
                ` : ''}
            </div>
            ${canEdit ? `
            <div class="link-actions">
                <button class="edit-btn" data-id="${link.id}"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${link.id}"><i class="fas fa-trash"></i></button>
            </div>
            ` : ''}
        `;
    }
    
    /**
     * Bağlantı elementine olay dinleyicileri ekler
     * @param {HTMLElement} element - Bağlantı elementi
     * @param {string} linkId - Bağlantı ID'si
     */
    attachLinkEventListeners(element, linkId) {
        // Düzenleme butonuna olay dinleyicisi ekleme
        const editBtn = element.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.editLink(linkId);
            });
        }
        
        // Silme butonuna olay dinleyicisi ekleme
        const deleteBtn = element.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteLink(linkId);
            });
        }
        
        // Seçim kutusuna tıklama olayı ekleme
        const checkbox = element.querySelector('.link-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                // Seçildiğinde bağlantı öğesine "selected" sınıfını ekle/kaldır
                const linkItem = e.target.closest('.link-item');
                if (linkItem) {
                    linkItem.classList.toggle('selected', e.target.checked);
                }
                
                // Seçili bağlantı sayısını güncelle
                this.updateSelectedCountAfterSearch();
            });
        }
    }
} 