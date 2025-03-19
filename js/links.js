// Bağlantı yönetimi sınıfı
export class LinkManager {
    constructor(dataManager, authManager, toastManager, uiManager) {
        this.dataManager = dataManager;
        this.authManager = authManager;
        this.toastManager = toastManager;
        this.uiManager = uiManager;
        this.linksList = document.getElementById('links-list');
        this.lastOrderUpdate = null; // Son sıralama güncelleme zamanı
    }
    
    // Bağlantı yöneticisini başlatma
    init() {
        try {
            // Bağlantıları yükleme
            this.loadLinks();
            
            // Olay dinleyicilerini ekleme
            this.addEventListeners();
            
            // Başlangıçta "Tümünü Seç" başlığının görünürlüğünü kontrol et
            this.checkSelectAllHeaderVisibility();
            
            this.initSearchBox();
            
            console.log('Bağlantı yöneticisi başlatıldı');
        } catch (error) {
            console.error('Bağlantı yöneticisi başlatılırken hata oluştu:', error);
        }
    }
    
    // Bağlantıları yükleme
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
            
            // Bağlantı sayısını güncelleme
            this.updateLinkCount(links.length, this.dataManager.getAccessibleLinkCount());
            
            // Seçim arayüzünü sıfırlama
            this.resetSelectionUI();
            
            // "Tümünü Seç" başlığının görünürlüğünü güncelleme
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
    
    // "Tümünü Seç" başlığının görünürlüğünü güncelleme
    updateSelectAllHeaderVisibility(linkCount) {
        try {
            const selectAllHeader = document.getElementById('select-all-header');
            if (selectAllHeader) {
                // Bağlantı yoksa gizle, varsa göster
                if (linkCount === 0) {
                    selectAllHeader.style.display = 'none';
                    console.log('"Tümünü Seç" başlığı gizlendi (bağlantı sayısı: 0)');
                } else {
                    selectAllHeader.style.display = 'flex';
                    console.log('"Tümünü Seç" başlığı gösterildi (bağlantı sayısı:', linkCount, ')');
                }
                
                // "Tümünü Seç" checkbox'ını da sıfırla
                const selectAllCheckbox = document.getElementById('select-all-links');
                if (selectAllCheckbox) {
                    selectAllCheckbox.checked = false;
                }
            } else {
                console.warn('select-all-header elementi bulunamadı');
            }
        } catch (error) {
            console.error('Select all header görünürlüğü güncellenirken hata oluştu:', error);
        }
    }
    
    // Bağlantıları filtreleme
    filterLinks(links, filters) {
        if (!Array.isArray(links)) {
            console.warn('Filtrelenecek bağlantılar bir dizi değil');
            return [];
        }
        
        console.log('Filtreleme başlıyor, toplam bağlantı sayısı:', links.length);
        console.log('Uygulanan filtreler:', filters);
        
        const result = links.filter(link => {
            try {
                // Tarih aralığı filtresi
                if (filters.startDate) {
                    // Bağlantı tarihini sadece gün olarak karşılaştırma
                    const linkDate = link.datetime ? link.datetime.split('T')[0] : '';
                    if (linkDate && linkDate < filters.startDate) {
                        return false;
                    }
                }
                
                if (filters.endDate) {
                    // Bağlantı tarihini sadece gün olarak karşılaştırma
                    const linkDate = link.datetime ? link.datetime.split('T')[0] : '';
                    if (linkDate && linkDate > filters.endDate) {
                        return false;
                    }
                }
                
                // Marka filtresi
                if (filters.brandId && filters.brandId !== '') {
                    if (link.brandId !== filters.brandId) {
                        return false;
                    }
                }
                
                // Kategori filtresi
                if (filters.categoryId && filters.categoryId !== '') {
                    if (link.categoryId !== filters.categoryId) {
                        return false;
                    }
                }
                
                // Gönderi tipi filtresi
                if (filters.postTypeId && filters.postTypeId !== '') {
                    if (link.postTypeId !== filters.postTypeId) {
                        return false;
                    }
                }
                
                return true;
            } catch (error) {
                console.error('Bağlantı filtrelenirken hata oluştu:', error, link);
                return false;
            }
        });
        
        console.log('Filtreleme sonucu, kalan bağlantı sayısı:', result.length);
        return result;
    }
    
    // Bağlantıyı HTML olarak oluşturma
    renderLink(link) {
        // Bağlantı öğesi oluşturma
        const li = document.createElement('li');
        li.className = 'link-item';
        li.dataset.id = link.id;
        
        // Marka ve kategori bilgilerini alma
        // Önce link nesnesindeki ismi kontrol et, yoksa veritabanından bul
        const brandName = link.brandName || (this.dataManager.brands.find(b => b.id === link.brandId)?.name || 'Bilinmeyen Marka');
        const categoryName = link.categoryName || (this.dataManager.categories.find(c => c.id === link.categoryId)?.name || 'Bilinmeyen Kategori');
        
        // Marka ve kategori nesnelerini bulma (logo ve ikon için)
        const brand = this.dataManager.brands.find(b => b.id === link.brandId) || { name: brandName, logo: null };
        const category = this.dataManager.categories.find(c => c.id === link.categoryId) || { name: categoryName, icon: 'globe' };
        
        // Oluşturan kullanıcı bilgisini alma
        const creator = this.dataManager.users.find(u => u.id === link.createdBy) || { username: 'Bilinmeyen Kullanıcı' };
        
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
        
        // Kullanıcının düzenleme yetkisi olup olmadığını kontrol et
        const canEdit = this.authManager.canEdit();
        
        // Gönderi tipi bilgisini alma
        const postTypeName = link.postTypeName || '';
        
        // Değişen alanları formatlama
        let changedFieldsText = '';
        if (link.changedFields && link.changedFields.length > 0) {
            changedFieldsText = link.changedFields.join(', ') + ' düzenlendi';
        }
        
        // Bağlantı içeriğini oluşturma
        li.innerHTML = `
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
        
        // Düzenleme ve silme butonlarına olay dinleyicileri ekleme (sadece düzenleme yetkisi varsa)
        if (canEdit) {
            // Düzenleme butonuna olay dinleyicisi ekleme
            li.querySelector('.edit-btn').addEventListener('click', () => {
                this.editLink(link.id);
            });
            
            // Silme butonuna olay dinleyicisi ekleme
            li.querySelector('.delete-btn').addEventListener('click', () => {
                this.deleteLink(link.id);
            });
            
            // Seçim kutusuna tıklama olayı ekleme
            const checkbox = li.querySelector('.link-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.updateSelectedCountAfterSearch();
                });
            }
        }
        
        return li;
    }
    
    // Yeni bağlantı ekleme
    async addLink(linkData) {
        try {
            // Yeni ID oluşturma
            const newId = this.generateId();
            
            // Bağlantı nesnesini oluşturma
            const newLink = {
                id: newId,
                ...linkData
                // Sıralama özelliği kaldırıldı (İstenilen değişiklik #32)
            };
            
            // Bağlantıyı veritabanına ekleme
            await this.dataManager.addLink(newLink);
            
            // Bağlantıları yeniden yükleme
            this.loadLinks();
            
            return newLink;
        } catch (error) {
            console.error('Bağlantı eklenirken hata oluştu:', error);
            throw error;
        }
    }
    
    // Bağlantı düzenleme
    editLink(linkId) {
        try {
            // UIManager sınıfındaki showEditLinkModal fonksiyonunu çağır
            this.uiManager.showEditLinkModal(linkId);
        } catch (error) {
            console.error('Bağlantı düzenlenirken hata oluştu:', error);
            if (this.toastManager) {
                this.toastManager.error('Bağlantı düzenlenirken bir hata oluştu: ' + error.message);
            }
        }
    }
    
    // Bağlantı silme
    async deleteLink(linkId) {
        try {
            // Silme onayı
            const confirmed = confirm('Bu bağlantıyı silmek istediğinize emin misiniz?');
            
            if (!confirmed) {
                return;
            }
            
            // Veri yöneticisi aracılığıyla bağlantı silme
            await this.dataManager.deleteLink(linkId);
            
            // Başarı mesajı gösterme
            this.toastManager.success('Bağlantı başarıyla silindi');
            
            // Bağlantıları yeniden yükleme
            this.loadLinks();
        } catch (error) {
            console.error('Bağlantı silinirken hata oluştu:', error);
            this.toastManager.error('Bağlantı silinirken bir hata oluştu: ' + error.message);
        }
    }
    
    // Bağlantı güncelleme
    async updateLink(linkData) {
        try {
            // Bağlantıyı veritabanında güncelleme
            await this.dataManager.updateLink(linkData);
            
            // Bağlantıları yeniden yükleme
            this.loadLinks();
            
            return linkData;
        } catch (error) {
            console.error('Bağlantı güncellenirken hata oluştu:', error);
            throw error;
        }
    }
    
    // Seçilen bağlantı sayısını güncelleme
    updateSelectedCount() {
        try {
            const checkboxes = document.querySelectorAll('.link-checkbox:checked');
            const count = checkboxes.length;
            const countText = document.getElementById('selected-count');
            const bulkActions = document.getElementById('bulk-actions');
            
            if (countText) {
                countText.textContent = `${count} bağlantı seçildi`;
            } else {
                console.warn('selected-count elementi bulunamadı');
            }
            
            if (bulkActions) {
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
            } else {
                console.warn('bulk-actions elementi bulunamadı');
            }
            
            console.log(`Seçilen bağlantı sayısı güncellendi: ${count}`);
        } catch (error) {
            console.error('Seçilen bağlantı sayısı güncellenirken hata oluştu:', error);
        }
    }
    
    // Tüm bağlantıları seçme/seçimi kaldırma
    toggleSelectAll(checked) {
        try {
            // Görünür bağlantıları daha güvenilir bir şekilde seçelim
            const linkItems = document.querySelectorAll('.link-item');
            const visibleCheckboxes = [];
            
            // Her bağlantı öğesini kontrol edelim ve görünür olanları bulalım
            linkItems.forEach(item => {
                // Hesaplanmış stil ile görünürlüğü kontrol edelim
                const computedStyle = window.getComputedStyle(item);
                const isVisible = computedStyle.display !== 'none';
                
                // Görünür ise, içindeki checkbox'ı bulalım
                if (isVisible) {
                    const checkbox = item.querySelector('.link-checkbox');
                    if (checkbox) {
                        visibleCheckboxes.push(checkbox);
                    }
                }
            });
            
            if (visibleCheckboxes.length === 0) {
                console.warn('Seçilecek görünür bağlantı bulunamadı');
                return;
            }
            
            // Tüm görünür checkbox'ları işaretleyelim
            visibleCheckboxes.forEach(checkbox => {
                checkbox.checked = checked;
            });
            
            this.updateSelectedCountAfterSearch();
            console.log(`Görünür bağlantıların seçimi ${checked ? 'yapıldı' : 'kaldırıldı'} (${visibleCheckboxes.length} bağlantı)`);
        } catch (error) {
            console.error('Bağlantıların seçimi değiştirilirken hata oluştu:', error);
        }
    }
    
    // Seçilen bağlantıları silme
    deleteSelectedLinks() {
        // Görünür ve seçili bağlantıları bulalım
        const linkItems = document.querySelectorAll('.link-item');
        const selectedIds = [];
        
        // Her bağlantı öğesini kontrol edelim
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
    
    // Seçim arayüzünü sıfırlama
    resetSelectionUI() {
        // "Tümünü Seç" checkbox'ını sıfırlama
        const selectAllCheckbox = document.getElementById('select-all-links');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
        
        // Seçim sayacını sıfırlama
        const countText = document.getElementById('selected-count');
        if (countText) {
            countText.textContent = '0 bağlantı seçildi';
        }
        
        // Toplu işlem butonlarını gizleme
        const bulkActions = document.getElementById('bulk-actions');
        if (bulkActions) {
            // Animasyonu daha düzgün hale getirmek için
            bulkActions.classList.remove('active');
        }
        
        // Bağlantı listesindeki öğe sayısını kontrol et ve "Tümünü Seç" başlığının görünürlüğünü güncelle
        try {
            const linksList = document.getElementById('links-list');
            if (linksList) {
                // Boş mesaj elementi varsa, liste boş demektir
                const hasEmptyMessage = linksList.querySelector('.empty-message') !== null;
                
                // Liste boşsa veya sadece boş mesaj içeriyorsa, "Tümünü Seç" başlığını gizle
                if (hasEmptyMessage || linksList.children.length === 0) {
                    this.updateSelectAllHeaderVisibility(0);
                } else {
                    // Aksi takdirde, gerçek bağlantı sayısını kullan
                    const linkCount = linksList.querySelectorAll('.link-item').length;
                    this.updateSelectAllHeaderVisibility(linkCount);
                }
            }
        } catch (error) {
            console.error('Seçim arayüzü sıfırlanırken "Tümünü Seç" başlığı güncellenemedi:', error);
        }
    }
    
    // Benzersiz ID oluşturma
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    // Bağlantı sayısını güncelleme (hem filtrelemeler hem de arama için)
    updateLinkCount(count, filters = {}) {
        // Ana sayaç güncelleme (actionbar içindeki)
        const countText = document.getElementById('link-count');
        if (countText) {
            // Filtre durumuna göre mesajı özelleştirme
            const hasFilters = Object.keys(filters).length > 0;
            
            if (hasFilters) {
                // Filtre uygulanmışsa, toplam bağlantı sayısını da göster
                const totalCount = this.dataManager.links.length;
                
                // Kullanıcının rolünü kontrol et
                const isAdmin = this.authManager.isAdmin();
                const isEditor = this.authManager.currentUser && this.authManager.currentUser.role === 'editor';
                
                let accessibleCount = totalCount;
                
                // Normal kullanıcı için erişilebilir bağlantı sayısını hesapla
                if (!isAdmin && !isEditor) {
                    const allowedBrands = this.authManager.currentUser && 
                                         Array.isArray(this.authManager.currentUser.allowedBrands) ? 
                                         this.authManager.currentUser.allowedBrands : [];
                    
                    accessibleCount = this.dataManager.links.filter(link => 
                        allowedBrands.includes(link.brandId)
                    ).length;
                }
                
                countText.textContent = `${count} bağlantı gösteriliyor (toplam ${accessibleCount})`;
            } else {
                // Filtre yoksa, sadece bağlantı sayısını göster
                countText.textContent = `${count} bağlantı`;
            }
        }
        
        // Arama sonuçları sayacı (links-list header içindeki)
        const linkCounter = document.querySelector('.link-counter');
        if (linkCounter) {
            // Toplam link sayısını alalım
            const totalLinks = document.querySelectorAll('.link-item').length;
            
            // Arama durumunu kontrol edelim (arama filtresi uygulandı mı?)
            const searchInput = document.getElementById('link-search');
            const isSearchActive = searchInput && searchInput.value.trim().length > 0;
            
            // Sayacı güncelleyelim
            if (isSearchActive && count < totalLinks) {
                linkCounter.textContent = `${count} / ${totalLinks} bağlantı gösteriliyor`;
            } else {
                linkCounter.textContent = `${totalLinks} bağlantı`;
            }
        }
    }
    
    // Olay dinleyicilerini ekleme
    addEventListeners() {
        try {
            // Toplu işlem butonlarına olay dinleyicileri ekleme
            const selectAllCheckbox = document.getElementById('select-all-links');
            const deleteSelectedBtn = document.getElementById('delete-selected-btn');
            
            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', (e) => {
                    this.toggleSelectAll(e.target.checked);
                });
                console.log('Tümünü seç checkbox\'ına olay dinleyicisi eklendi');
            } else {
                console.warn('select-all-links elementi bulunamadı');
            }
            
            if (deleteSelectedBtn) {
                deleteSelectedBtn.addEventListener('click', () => {
                    this.deleteSelectedLinks();
                });
                console.log('Seçilenleri sil butonuna olay dinleyicisi eklendi');
            } else {
                console.warn('delete-selected-btn elementi bulunamadı');
            }
        } catch (error) {
            console.error('Olay dinleyicileri eklenirken hata oluştu:', error);
        }
    }
    
    // "Tümünü Seç" başlığının görünürlüğünü kontrol etme
    checkSelectAllHeaderVisibility() {
        try {
            // Bağlantı listesindeki öğe sayısını kontrol et
            const linksList = document.getElementById('links-list');
            if (linksList) {
                const linkCount = linksList.querySelectorAll('.link-item').length;
                
                // Boş mesaj elementi varsa, liste boş demektir
                const hasEmptyMessage = linksList.querySelector('.empty-message') !== null;
                
                // Liste boşsa veya sadece boş mesaj içeriyorsa, "Tümünü Seç" başlığını gizle
                if (hasEmptyMessage || linkCount === 0) {
                    this.updateSelectAllHeaderVisibility(0);
                } else {
                    this.updateSelectAllHeaderVisibility(linkCount);
                }
            }
        } catch (error) {
            console.error('"Tümünü Seç" başlığının görünürlüğü kontrol edilirken hata oluştu:', error);
        }
    }
    
    // Sürükle bırak özelliği kaldırıldı (İstenilen değişiklik #32)
    initSortable() {
        // Bu fonksiyon artık kullanılmıyor
        console.log('Sürükle bırak özelliği kaldırıldı (İstenilen değişiklik #32)');
    }
    
    // Bağlantı sıralaması kaldırıldı (İstenilen değişiklik #32)
    async updateLinkOrder() {
        // Bu fonksiyon artık kullanılmıyor
        console.log('Bağlantı sıralaması özelliği kaldırıldı (İstenilen değişiklik #32)');
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
            let visibleCount = 0;
            
            // Her link için kontrol edelim
            linkItems.forEach(item => {
                // SADECE başlık ve marka metasını alalım (talebe göre düzeltildi)
                const title = item.querySelector('.link-title')?.textContent || '';
                const brand = item.querySelector('.link-brand')?.textContent || '';
                const searchableText = `${title} ${brand}`.toLowerCase();
                
                // Arama teriminin içerikte olup olmadığını kontrol edelim
                const matches = searchText.length === 0 || searchableText.includes(searchText);
                
                // Eşleşme durumuna göre görünürlüğü ayarlayalım
                item.style.display = matches ? 'flex' : 'none';
                
                if (matches) visibleCount++;
            });
            
            // Eğer hiç sonuç yoksa bir mesaj gösterelim
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
            
            // Filtre sonucunda gösterilen link sayısını güncelleyelim (boş filters objesi ile)
            this.updateLinkCount(visibleCount, {});
            
            // Toplu seçim kısmını güncelleyelim
            this.updateSelectAllHeaderForSearch(visibleCount);
            
            // Varolan seçimleri kontrol edelim ve güncelleyelim
            this.updateSelectedCountAfterSearch();
            
            console.log(`Arama sonucu: ${visibleCount} bağlantı gösteriliyor`);
        };
        
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
     * Arama sonuçlarına göre toplu seçim kısmını günceller
     * @param {number} visibleCount - Görünen link sayısı
     */
    updateSelectAllHeaderForSearch(visibleCount) {
        const selectAllCheckbox = document.getElementById('select-all-links');
        
        // Görünür öğe yoksa ve arama sonucunda hiçbir öğe görünmüyorsa
        if (visibleCount === 0) {
            // Tümünü seç kutusunu pasif hale getirelim
            if (selectAllCheckbox) {
                selectAllCheckbox.disabled = true;
                selectAllCheckbox.checked = false;
            }
        } else {
            // Görünür öğe varsa checkbox'ı etkinleştirelim
            if (selectAllCheckbox) {
                selectAllCheckbox.disabled = false;
                
                // Görünür bağlantıları ve seçili olanları bulalım
                const linkItems = document.querySelectorAll('.link-item');
                const visibleItems = [];
                const visibleCheckedItems = [];
                
                // Her bağlantı öğesini kontrol edelim
                linkItems.forEach(item => {
                    const computedStyle = window.getComputedStyle(item);
                    const isVisible = computedStyle.display !== 'none';
                    
                    if (isVisible) {
                        visibleItems.push(item);
                        
                        const checkbox = item.querySelector('.link-checkbox');
                        if (checkbox && checkbox.checked) {
                            visibleCheckedItems.push(item);
                        }
                    }
                });
                
                // Tüm görünür öğeler seçili ise checkbox'ı seçili yapalım
                if (visibleItems.length > 0 && visibleItems.length === visibleCheckedItems.length) {
                    selectAllCheckbox.checked = true;
                } else {
                    selectAllCheckbox.checked = false;
                }
            }
        }
    }

    /**
     * Arama sonrası seçili öğe sayısını günceller
     */
    updateSelectedCountAfterSearch() {
        // Görünür ve seçili bağlantıları bulalım
        const linkItems = document.querySelectorAll('.link-item');
        const visibleCheckedItems = [];
        
        // Her bağlantı öğesini kontrol edelim
        linkItems.forEach(item => {
            const computedStyle = window.getComputedStyle(item);
            const isVisible = computedStyle.display !== 'none';
            
            if (isVisible) {
                const checkbox = item.querySelector('.link-checkbox');
                if (checkbox && checkbox.checked) {
                    visibleCheckedItems.push(item);
                }
            }
        });
        
        const count = visibleCheckedItems.length;
        const countText = document.getElementById('selected-count');
        const bulkActions = document.getElementById('bulk-actions');
        
        if (countText) {
            countText.textContent = `${count} bağlantı seçildi`;
        }
        
        if (bulkActions) {
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
        }
    }
} 