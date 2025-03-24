// Kullanıcı arayüzü yönetimi sınıfı
// DatePicker sınıfı - Tarih seçici işlevselliği
class DatePicker {
    constructor(config) {
        // Yapılandırma
        this.inputElement = config.inputElement;
        this.dropdownElement = config.dropdownElement;
        this.calendarElement = config.calendarElement;
        this.startDateInput = config.startDateInput;
        this.endDateInput = config.endDateInput;
        
        // Varsayılan formatDate fonksiyonu
        this.formatDate = config.formatDate || ((date) => {
            if (!date) return '';
            const d = new Date(date);
            return d.toISOString().split('T')[0];
        });
        
        // Varsayılan formatDisplayDate fonksiyonu
        this.formatDisplayDate = config.formatDisplayDate || ((dateString) => {
            if (!dateString) return '';
            const d = new Date(dateString);
            return d.toLocaleDateString('tr-TR');
        });
        
        this.onApply = config.onApply || (() => {});
        this.id = config.id || Math.random().toString(36).substring(2, 9); // Benzersiz ID
        
        // Takvim bileşenleri
        this.calendarTitle = this.calendarElement.querySelector('.calendar-title');
        this.calendarGrid = this.calendarElement.querySelector('.calendar-grid');
        this.prevMonthBtn = this.calendarElement.querySelector('.prev-month');
        this.nextMonthBtn = this.calendarElement.querySelector('.next-month');
        
        // Butonlar
        this.datePresetBtns = this.dropdownElement.querySelectorAll('.date-preset-btn');
        this.applyBtn = this.dropdownElement.querySelector('.apply-btn');
        this.cancelBtn = this.dropdownElement.querySelector('.cancel-btn');
        this.clearDateBtn = this.dropdownElement.querySelector('.clear-date-btn');
        
        // Seçili tarih aralığı göstergesi
        this.selectedDateRange = this.inputElement.querySelector('.selected-date-range');
        
        // Durum
        this.state = {
            currentDate: new Date(),
            selectedStartDate: null,
            selectedEndDate: null,
            tempStartDate: null,
            tempEndDate: null,
            isSelectingRange: false,
            viewMode: 'days' // Yeni eklendi: 'days', 'years'
        };
        
        // Olay dinleyicilerini ekle
        this.initEventListeners();
        
        // İlk takvimi oluştur
        this.renderCalendar();
    }
    
    // Olay dinleyicilerini ekleme
    initEventListeners() {
        // Tarih seçici açma/kapama
        this.inputElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.dropdownElement.classList.toggle('active');
            this.renderCalendar(); // Takvimi her açılışta yeniden oluştur
        });
        
        // Dışarı tıklandığında kapatma
        document.addEventListener('click', (e) => {
            if (!this.inputElement.contains(e.target) && !this.dropdownElement.contains(e.target)) {
                this.dropdownElement.classList.remove('active');
            }
        });
        
        // Hazır tarih aralıkları
        this.datePresetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handlePresetClick(btn);
            });
        });
        
        // Önceki ay butonu
        if (this.prevMonthBtn) {
            this.prevMonthBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.state.viewMode === 'days') {
                    this.state.currentDate.setMonth(this.state.currentDate.getMonth() - 1);
                } else if (this.state.viewMode === 'years') {
                    // Yıl görünümünde 12 yıl geriye git
                    this.state.currentDate.setFullYear(this.state.currentDate.getFullYear() - 12);
                }
                this.renderCalendar();
            });
        }
        
        // Sonraki ay butonu
        if (this.nextMonthBtn) {
            this.nextMonthBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.state.viewMode === 'days') {
                    this.state.currentDate.setMonth(this.state.currentDate.getMonth() + 1);
                } else if (this.state.viewMode === 'years') {
                    // Yıl görünümünde 12 yıl ileriye git
                    this.state.currentDate.setFullYear(this.state.currentDate.getFullYear() + 12);
                }
                this.renderCalendar();
            });
        }
        
        // Takvim başlığına tıklandığında yıl görünümüne geçme
        if (this.calendarTitle) {
            this.calendarTitle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleYearView();
            });
        }
        
        // Uygula butonu
        if (this.applyBtn) {
            this.applyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.applySelection();
            });
        }
        
        // İptal butonu
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.cancelSelection();
            });
        }
        
        // Seçimi temizle butonu
        if (this.clearDateBtn) {
            this.clearDateBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearSelection();
            });
        }
    }
    
    // Yıl görünümünü aç/kapat
    toggleYearView() {
        if (this.state.viewMode === 'days') {
            this.state.viewMode = 'years';
        } else {
            this.state.viewMode = 'days';
        }
        this.renderCalendar();
    }
    
    // Yıl seçme işlemi
    handleYearClick(year) {
        this.state.currentDate.setFullYear(year);
        this.state.viewMode = 'days';
        this.renderCalendar();
    }
    
    // Hazır tarih aralığı tıklama işlemi
    handlePresetClick(btn) {
        // Aktif sınıfını kaldırma
        this.datePresetBtns.forEach(b => b.classList.remove('active'));
        
        // Tıklanan butona aktif sınıfı ekleme
        btn.classList.add('active');
        
        // Gün sayısını alma
        const days = parseInt(btn.dataset.days);
        
        if (days === 0) {
            // Tüm zamanlar
            this.state.tempStartDate = null;
            this.state.tempEndDate = null;
            
            // Seçili tarih aralığını güncelleme
            if (this.selectedDateRange) {
                this.selectedDateRange.textContent = 'Tüm Zamanlar';
            }
            
            // Gizli input değerlerini temizleme
            if (this.startDateInput) {
                this.startDateInput.value = '';
            }
            
            if (this.endDateInput) {
                this.endDateInput.value = '';
            }
        } else {
            // Bitiş tarihi (bugün)
            const endDate = new Date();
            
            // Başlangıç tarihi (bugünden days gün önce)
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            // Geçici tarihleri güncelleme
            this.state.tempStartDate = startDate;
            this.state.tempEndDate = endDate;
            
            // Seçili tarih aralığını güncelleme
            if (this.selectedDateRange) {
                const startStr = this.formatDisplayDate(startDate.toISOString().split('T')[0]);
                const endStr = this.formatDisplayDate(endDate.toISOString().split('T')[0]);
                this.selectedDateRange.textContent = `${startStr} - ${endStr}`;
            }
            
            // Gizli input değerlerini güncelleme
            if (this.startDateInput) {
                this.startDateInput.value = this.formatDate(startDate);
            }
            
            if (this.endDateInput) {
                this.endDateInput.value = this.formatDate(endDate);
            }
        }
        
        // Seçimi temizle butonunun görünürlüğünü güncelleme
        this.updateClearDateButtonVisibility();
        
        // Filtre temizleme butonunun görünürlüğünü güncelleme
        if (window.uiManager && typeof window.uiManager.updateClearFilterButtonVisibility === 'function') {
            window.uiManager.updateClearFilterButtonVisibility();
        }
        
        // Filtreleri otomatik olarak uygula
        if (window.uiManager && typeof window.uiManager.applyFiltersImmediately === 'function') {
            window.uiManager.applyFiltersImmediately();
        }
        
        // Takvimi güncelleme
        this.renderCalendar();
    }
    
    // Seçimi uygulama
    applySelection() {
        // Geçici tarihleri kalıcı hale getirme
        this.state.selectedStartDate = this.state.tempStartDate;
        this.state.selectedEndDate = this.state.tempEndDate;
        
        // Gizli input değerlerini güncelleme
        if (this.startDateInput) {
            this.startDateInput.value = this.state.selectedStartDate ? this.formatDate(this.state.selectedStartDate) : '';
        }
        
        if (this.endDateInput) {
            this.endDateInput.value = this.state.selectedEndDate ? this.formatDate(this.state.selectedEndDate) : '';
        }
        
        // Tarih seçiciyi kapatma
        this.dropdownElement.classList.remove('active');
        
        // Seçimi temizle butonunun görünürlüğünü güncelleme
        this.updateClearDateButtonVisibility();
        
        // Filtre temizleme butonunun görünürlüğünü güncelleme
        // UIManager sınıfının updateClearFilterButtonVisibility fonksiyonunu çağırmak için
        // window nesnesi üzerinden erişim sağlıyoruz
        if (window.uiManager && typeof window.uiManager.updateClearFilterButtonVisibility === 'function') {
            window.uiManager.updateClearFilterButtonVisibility();
        }
        
        // Uygulama olayını tetikleme
        this.onApply();
    }
    
    // Seçimi iptal etme
    cancelSelection() {
        // Geçici tarihleri sıfırlama
        this.state.tempStartDate = this.state.selectedStartDate;
        this.state.tempEndDate = this.state.selectedEndDate;
        
        // Tarih seçiciyi kapatma
        this.dropdownElement.classList.remove('active');
    }
    
    // Takvimi oluşturma
    renderCalendar() {
        if (!this.calendarGrid || !this.calendarTitle) return;
        
        // Görünüm moduna göre takvimi oluştur
        if (this.state.viewMode === 'years') {
            this.renderYearView();
            return;
        }
        
        // Yıl görünümü sınıfını kaldır
        this.calendarGrid.classList.remove('year-view');
        
        // Ay ve yıl başlığını güncelleme
        const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        this.calendarTitle.textContent = `${monthNames[this.state.currentDate.getMonth()]} ${this.state.currentDate.getFullYear()}`;
        this.calendarTitle.classList.add('clickable'); // Tıklanabilir olduğunu belirtmek için sınıf ekleme
        
        // Günleri temizleme (başlıklar hariç)
        const dayHeaders = this.calendarGrid.querySelectorAll('.calendar-day-header');
        this.calendarGrid.innerHTML = '';
        
        // Gün başlıklarını yeniden ekleme
        dayHeaders.forEach(header => {
            this.calendarGrid.appendChild(header.cloneNode(true));
        });
        
        // Ayın ilk gününü alma
        const firstDay = new Date(this.state.currentDate.getFullYear(), this.state.currentDate.getMonth(), 1);
        
        // Ayın son gününü alma
        const lastDay = new Date(this.state.currentDate.getFullYear(), this.state.currentDate.getMonth() + 1, 0);
        
        // Ayın ilk gününün haftanın hangi günü olduğunu alma (0: Pazar, 1: Pazartesi, ...)
        let firstDayOfWeek = firstDay.getDay();
        
        // Pazartesi'yi haftanın ilk günü olarak ayarlama (0: Pazartesi, 1: Salı, ...)
        firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        
        // Önceki ayın son günlerini ekleme
        if (firstDayOfWeek > 0) {
            const prevMonthLastDay = new Date(this.state.currentDate.getFullYear(), this.state.currentDate.getMonth(), 0).getDate();
            for (let i = 0; i < firstDayOfWeek; i++) {
                const day = prevMonthLastDay - firstDayOfWeek + i + 1;
                const date = new Date(this.state.currentDate.getFullYear(), this.state.currentDate.getMonth() - 1, day);
                this.createDayElement(day, date, true);
            }
        }
        
        // Mevcut ayın günlerini ekleme
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(this.state.currentDate.getFullYear(), this.state.currentDate.getMonth(), day);
            this.createDayElement(day, date, false);
        }
        
        // Sonraki ayın ilk günlerini ekleme
        const totalDays = firstDayOfWeek + lastDay.getDate();
        const remainingCells = 42 - totalDays; // 6 satır x 7 gün = 42 hücre
        
        for (let i = 1; i <= remainingCells; i++) {
            const date = new Date(this.state.currentDate.getFullYear(), this.state.currentDate.getMonth() + 1, i);
            this.createDayElement(i, date, true);
        }
        
        // Seçili tarih aralığını güncelleme
        this.updateCalendarSelection();
    }
    
    // Yıl görünümünü oluşturma
    renderYearView() {
        // Takvim başlığını güncelleme
        const currentYear = this.state.currentDate.getFullYear();
        const startYear = Math.floor(currentYear / 12) * 12;
        const endYear = startYear + 11;
        this.calendarTitle.textContent = `${startYear} - ${endYear}`;
        this.calendarTitle.classList.add('clickable');
        
        // Takvim ızgarasını temizleme
        this.calendarGrid.innerHTML = '';
        
        // Yıl görünümü sınıfını ekle
        this.calendarGrid.classList.add('year-view');
        
        // Yılları oluşturma
        for (let year = startYear; year <= endYear; year++) {
            this.createYearElement(year);
        }
    }
    
    // Yıl elementi oluşturma
    createYearElement(year) {
        const yearElement = document.createElement('div');
        yearElement.className = 'calendar-year';
        yearElement.textContent = year;
        
        // Mevcut yılı vurgulama
        if (year === this.state.currentDate.getFullYear()) {
            yearElement.classList.add('current-year');
        }
        
        // Bugünden sonraki yılları devre dışı bırakma
        const today = new Date();
        if (year > today.getFullYear()) {
            yearElement.classList.add('disabled');
        } else {
            // Yıl tıklama olayı
            yearElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleYearClick(year);
            });
        }
        
        this.calendarGrid.appendChild(yearElement);
    }
    
    // Gün elementi oluşturma
    createDayElement(day, date, isOtherMonth) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        dayElement.dataset.date = this.formatDate(date);
        dayElement.dataset.pickerId = this.id; // Hangi DatePicker'a ait olduğunu belirtmek için
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        // Bugünü vurgulama
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Bugünün başlangıcı (saat, dakika, saniye, milisaniye sıfırlanır)
        
        // Bugünden sonraki günleri devre dışı bırakma
        const dateClone = new Date(date);
        dateClone.setHours(0, 0, 0, 0); // Karşılaştırma için saati sıfırla
        
        if (dateClone > today) {
            dayElement.classList.add('disabled');
            // Tıklama olayını kaldır
            dayElement.addEventListener('click', (e) => {
                e.stopPropagation();
                // Devre dışı günler için hiçbir şey yapma
            });
        } else {
            // Gün tıklama olayı (sadece bugün ve öncesi için)
            dayElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDayClick(date);
            });
        }
        
        // Bugünü vurgulama
        if (dateClone.getTime() === today.getTime()) {
            dayElement.classList.add('today');
        }
        
        // Seçili tarih aralığını vurgulama
        if (this.state.tempStartDate && this.state.tempEndDate) {
            if (date >= this.state.tempStartDate && date <= this.state.tempEndDate) {
                dayElement.classList.add('selected');
            }
            
            if (date.getDate() === this.state.tempStartDate.getDate() && 
                date.getMonth() === this.state.tempStartDate.getMonth() && 
                date.getFullYear() === this.state.tempStartDate.getFullYear()) {
                dayElement.classList.add('start-date');
            }
            
            if (date.getDate() === this.state.tempEndDate.getDate() && 
                date.getMonth() === this.state.tempEndDate.getMonth() && 
                date.getFullYear() === this.state.tempEndDate.getFullYear()) {
                dayElement.classList.add('end-date');
            }
        }
        
        this.calendarGrid.appendChild(dayElement);
    }
    
    // Gün tıklama olayını işleme
    handleDayClick(date) {
        // Gelecek tarihleri seçilemez yapma kontrolü
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Bugünün tarihini saat olmadan alıyoruz
        
        if (date > today) {
            return; // Gelecek tarihler seçilemez
        }
        
        // İlk seçim
        if (!this.state.isSelectingRange || (this.state.tempStartDate && this.state.tempEndDate)) {
            this.state.tempStartDate = date;
            this.state.tempEndDate = null;
            this.state.isSelectingRange = true;
        } 
        // İkinci seçim
        else if (this.state.tempStartDate && !this.state.tempEndDate) {
            // Başlangıç tarihinden önce bir tarih seçilirse, başlangıç ve bitiş tarihlerini değiştir
            if (date < this.state.tempStartDate) {
                this.state.tempEndDate = this.state.tempStartDate;
                this.state.tempStartDate = date;
            } else {
                this.state.tempEndDate = date;
            }
            
            this.state.isSelectingRange = false;
            
            // Tarihleri güncelleme
            if (this.startDateInput) {
                this.startDateInput.value = this.formatDate(this.state.tempStartDate);
            }
            
            if (this.endDateInput) {
                this.endDateInput.value = this.formatDate(this.state.tempEndDate);
            }
            
            // Seçili tarih aralığını güncelleme
            if (this.selectedDateRange) {
                const startStr = this.formatDisplayDate(this.formatDate(this.state.tempStartDate));
                const endStr = this.formatDisplayDate(this.formatDate(this.state.tempEndDate));
                this.selectedDateRange.textContent = `${startStr} - ${endStr}`;
            }
            
            // Hazır tarih butonlarının aktifliğini kaldırma
            this.datePresetBtns.forEach(btn => btn.classList.remove('active'));
            
            // Seçimi temizle butonunun görünürlüğünü güncelleme
            this.updateClearDateButtonVisibility();
            
            // Filtre temizleme butonunun görünürlüğünü güncelleme
            if (window.uiManager && typeof window.uiManager.updateClearFilterButtonVisibility === 'function') {
                window.uiManager.updateClearFilterButtonVisibility();
            }
            
            // Filtreleri otomatik olarak uygula - tarih seçimi tamamlandığında
            if (window.uiManager && typeof window.uiManager.applyFiltersImmediately === 'function') {
                window.uiManager.applyFiltersImmediately();
            }
        }
        
        // Seçimi temizle butonunun görünürlüğünü güncelleme
        this.updateClearDateButtonVisibility();
        
        // Takvimi güncelleme
        this.renderCalendar();
    }
    
    // Takvim seçimini güncelleme
    updateCalendarSelection() {
        // Tüm günleri temizleme
        const days = this.calendarGrid.querySelectorAll('.calendar-day');
        days.forEach(day => {
            day.classList.remove('selected', 'in-range', 'range-start', 'range-end', 'start-date', 'end-date');
        });
        
        if (!this.state.tempStartDate) {
            return;
        }
        
        // Başlangıç tarihini vurgulama
        const startDateStr = this.formatDate(this.state.tempStartDate);
        const startDay = this.calendarGrid.querySelector(`.calendar-day[data-date="${startDateStr}"][data-picker-id="${this.id}"]`);
        if (startDay) {
            if (this.state.tempEndDate) {
                startDay.classList.add('range-start');
            } else {
                startDay.classList.add('selected');
            }
        }
        
        // Bitiş tarihini vurgulama
        if (this.state.tempEndDate) {
            const endDateStr = this.formatDate(this.state.tempEndDate);
            const endDay = this.calendarGrid.querySelector(`.calendar-day[data-date="${endDateStr}"][data-picker-id="${this.id}"]`);
            if (endDay) {
                endDay.classList.add('range-end');
            }
            
            // Aralıktaki günleri vurgulama
            days.forEach(day => {
                if (!day.dataset.date) return;
                
                const date = new Date(day.dataset.date);
                if (date > this.state.tempStartDate && date < this.state.tempEndDate) {
                    day.classList.add('in-range');
                }
            });
        }
    }
    
    // Takvim seçimlerini sıfırlama
    reset() {
        // Geçici ve kalıcı tarihleri sıfırlama
        this.state.tempStartDate = null;
        this.state.tempEndDate = null;
        this.state.selectedStartDate = null;
        this.state.selectedEndDate = null;
        this.state.isSelectingRange = false;
        
        // Gizli input değerlerini temizleme
        if (this.startDateInput) {
            this.startDateInput.value = '';
        }
        
        if (this.endDateInput) {
            this.endDateInput.value = '';
        }
        
        // Seçili tarih aralığını güncelleme
        if (this.selectedDateRange) {
            this.selectedDateRange.textContent = 'Tüm Zamanlar';
        }
        
        // Preset butonlarını sıfırlama
        this.datePresetBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.days === '0') {
                btn.classList.add('active');
            }
        });
        
        // Seçimi temizle butonunu gizleme
        this.updateClearDateButtonVisibility();
        
        // Filtre temizleme butonunun görünürlüğünü ve filtreleri güncelleme
        if (window.uiManager) {
            if (typeof window.uiManager.updateClearFilterButtonVisibility === 'function') {
                window.uiManager.updateClearFilterButtonVisibility();
            }
            
            // Bu reset metodu çoğunlukla clearFilters tarafından çağrıldığından,
            // burada applyFiltersImmediately'i çağırmıyoruz çünkü clearFilters zaten applyFilters'i çağırıyor
        }
        
        // Takvimi güncelleme
        this.renderCalendar();
    }
    
    // Sadece tarih seçimlerini temizleyen metod (modali kapatmadan)
    clearSelection() {
        // Geçici tarihleri sıfırlama
        this.state.tempStartDate = null;
        this.state.tempEndDate = null;
        
        // Gizli input değerlerini temizleme
        if (this.startDateInput) {
            this.startDateInput.value = '';
        }
        
        if (this.endDateInput) {
            this.endDateInput.value = '';
        }
        
        // Seçili tarih aralığını güncelleme
        if (this.selectedDateRange) {
            this.selectedDateRange.textContent = 'Tüm Zamanlar';
        }
        
        // "Tüm Zamanlar" presetini aktif etme
        this.datePresetBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.days === '0') {
                btn.classList.add('active');
            }
        });
        
        // Seçimi temizle butonunu gizleme
        this.updateClearDateButtonVisibility();
        
        // Filtre temizleme butonunun görünürlüğünü güncelleme
        if (window.uiManager && typeof window.uiManager.updateClearFilterButtonVisibility === 'function') {
            window.uiManager.updateClearFilterButtonVisibility();
        }
        
        // Filtreleri otomatik olarak uygula
        if (window.uiManager && typeof window.uiManager.applyFiltersImmediately === 'function') {
            window.uiManager.applyFiltersImmediately();
        }
        
        // Takvimi güncelleme
        this.renderCalendar();
    }
    
    // Seçimi temizle butonunun görünürlüğünü güncelleme
    updateClearDateButtonVisibility() {
        if (!this.clearDateBtn) return;
        
        // Herhangi bir tarih seçili mi?
        const isAnyDateSelected = this.state.tempStartDate || this.state.tempEndDate;
        
        // Tarih seçilmişse butonu göster, aksi takdirde gizle
        if (isAnyDateSelected) {
            this.clearDateBtn.classList.add('visible');
        } else {
            this.clearDateBtn.classList.remove('visible');
        }
    }
}

export class UIManager {
    constructor(authManager, linkManager, dataManager, toastManager) {
        this.authManager = authManager;
        this.linkManager = linkManager;
        this.dataManager = dataManager;
        this.toastManager = toastManager;
        
        // Global referans oluşturma (DatePicker sınıfı için)
        window.uiManager = this;
        
        // Tarih seçici için gizli input alanları
        this.dateStartInput = document.getElementById('date-start');
        this.dateEndInput = document.getElementById('date-end');
        
        // Filtre seçim kutuları
        this.brandFilterSelect = document.getElementById('brand-filter');
        this.categoryFilterSelect = document.getElementById('category-filter');
        
        // Admin butonları
        this.manageUsersBtn = document.getElementById('manage-users-btn');
        this.manageBrandsBtn = document.getElementById('manage-brands-btn');
        this.manageCategoriesBtn = document.getElementById('manage-categories-btn');
        this.exportLinksBtn = document.getElementById('export-links-btn');
        
        // Kullanıcı yönetimi
        this.addUserBtn = document.getElementById('add-user-btn');
        this.editUserForm = document.getElementById('edit-user-form');
        
        // Modal elementleri
        this.userModal = document.getElementById('user-modal');
        this.brandModal = document.getElementById('brand-modal');
        this.categoryModal = document.getElementById('category-modal');
        this.linkModal = document.getElementById('link-modal');
        this.editUserModal = document.getElementById('edit-user-modal');
        
        // Modal kapatma butonları
        this.closeModalBtns = document.querySelectorAll('.close-modal');
        
        // DatePicker nesnesi
        this.filterDatePicker = null;
        
        // Son uygulanan filtreler
        this.lastAppliedFilters = {
            startDate: '',
            endDate: '',
            brandId: '',
            categoryId: '',
            postTypeId: ''
        };
    }
    
    // Kullanıcı arayüzü yöneticisini başlatma
    init() {
        // Kullanıcı oturum durumuna göre UI'ı güncelleme
        this.updateUIBasedOnAuth();
        
        // Olay dinleyicilerini ekleme
        this.addEventListeners();
        
        // Admin butonlarına olay dinleyicileri ekleme
        this.handleAdminButtons();
        
        // Modal kapatma butonlarına olay dinleyicileri ekleme
        this.handleModalClose();
        
        // Filtre seçeneklerini doldurma
        this.populateFilterOptions();
        
        // Tarih seçici başlatma
        this.initDatePicker();
        
        // Filtre temizleme butonunun görünürlüğünü ayarlama
        this.updateClearFilterButtonVisibility();
        
        // Bağlantıları yükleme
        this.linkManager.loadLinks();
    }
    
    // Olay dinleyicilerini ekleme
    addEventListeners() {
        // Filtre alanlarına değişiklik dinleyicileri ekleme
        this.dateStartInput.addEventListener('change', () => {
            this.updateClearFilterButtonVisibility();
            this.applyFiltersImmediately();
        });
        this.dateEndInput.addEventListener('change', () => {
            this.updateClearFilterButtonVisibility();
            this.applyFiltersImmediately();
        });
        this.brandFilterSelect.addEventListener('change', () => {
            this.updateClearFilterButtonVisibility();
            this.applyFiltersImmediately();
        });
        this.categoryFilterSelect.addEventListener('change', () => {
            this.updateClearFilterButtonVisibility();
            this.applyFiltersImmediately();
        });
        
        // Gönderi tipi filtresi için değişiklik dinleyicisi
        const postTypeFilter = document.getElementById('post-type-filter');
        if (postTypeFilter) {
            postTypeFilter.addEventListener('change', () => {
                this.updateClearFilterButtonVisibility();
                this.applyFiltersImmediately();
            });
        }
        
        // Filtre temizleme butonu dinleyicisi
        document.getElementById('clear-filters').addEventListener('click', () => this.clearFilters());
        
        // Link ekleme butonu - Düzenleme yetkisi kontrolü ekleniyor
        const addLinkBtn = document.getElementById('add-link-btn');
        if (addLinkBtn) {
            // Başlangıçta kullanıcı rolüne göre görünürlüğü ayarla
            const canEdit = this.authManager.canEdit();
            addLinkBtn.style.display = canEdit ? 'inline-block' : 'none';
            
            // Olay dinleyicisini ekle
            addLinkBtn.addEventListener('click', () => this.showAddLinkModal());
        }
        
        // Form gönderimi
        document.getElementById('link-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLinkFormSubmit();
        });
        
        // Kullanıcı yönetimi
        if (this.addUserBtn) {
            this.addUserBtn.addEventListener('click', () => this.showAddUserModal());
        }
        
        if (this.editUserForm) {
            this.editUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUserFormSubmit();
            });
        }
        
        // Rol değişikliğinde izin görünürlüğünü güncelle
        const roleSelect = document.getElementById('user-role');
        if (roleSelect) {
            roleSelect.addEventListener('change', (e) => this.updateBrandPermissionsVisibility(e.target.value));
        }
        
        // Modalları kapatma
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.add('hidden');
                });
            });
        });
        
        // Modal dışına tıklandığında kapatma
        window.addEventListener('click', (e) => {
            document.querySelectorAll('.modal').forEach(modal => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });
        
        console.log('UI Manager initialized');
    }
    
    // Tarih seçici başlatma
    initDatePicker() {
        try {
            // Filtre tarih seçici
            this.initFilterDatePicker();
            
            // Not: Dışa aktarma tarih seçici handleExportLinks içinde oluşturulacak
            console.log('Tarih seçici başlatıldı');
        } catch (error) {
            console.error('Tarih seçici başlatılırken hata oluştu:', error);
        }
    }
    
    // Filtre tarih seçici için olay dinleyicileri ekleme
    initFilterDatePicker() {
        try {
            const dateFilterInput = document.getElementById('date-filter-input');
            if (!dateFilterInput) {
                console.warn('date-filter-input elementi bulunamadı');
                return;
            }
            
            const datePickerDropdown = document.getElementById('date-picker-dropdown');
            if (!datePickerDropdown) {
                console.warn('date-picker-dropdown elementi bulunamadı');
                return;
            }
            
            const calendarElement = document.getElementById('date-calendar');
            if (!calendarElement) {
                console.warn('date-calendar elementi bulunamadı');
                return;
            }
            
            // Filtre takvimi için DatePicker sınıfını kullan
            this.filterDatePicker = new DatePicker({
                inputElement: dateFilterInput,
                dropdownElement: datePickerDropdown,
                calendarElement: calendarElement,
                startDateInput: this.dateStartInput,
                endDateInput: this.dateEndInput,
                formatDate: this.formatDate.bind(this),
                formatDisplayDate: this.formatDisplayDate.bind(this),
                id: 'filter-date-picker',
                onApply: () => {
                    // Filtre uygulandığında yapılacak işlemler
                    console.log('Filtre tarihi uygulandı');
                    // Filtreleri otomatik olarak uygula
                    this.applyFiltersImmediately();
                }
            });
            
            console.log('Filtre tarih seçici başlatıldı');
        } catch (error) {
            console.error('Filtre tarih seçici başlatılırken hata oluştu:', error);
        }
    }
    
    // DatePicker sınıfı - Tarih seçici işlevselliği
    createDatePicker(config) {
        return new DatePicker(config);
    }
    
    // Tarih formatını ISO formatına dönüştürme (YYYY-MM-DD)
    formatDate(date) {
        if (!date) return '';
        
        try {
            // Eğer zaten string ise ve ISO formatında ise doğrudan döndür
            if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return date;
            }
            
            // Date nesnesine dönüştür
            const dateObj = new Date(date);
            
            // Geçerli bir tarih değilse boş döndür
            if (isNaN(dateObj.getTime())) return '';
            
            // Gün, ay ve yıl değerlerini alma
            const day = dateObj.getDate().toString().padStart(2, '0');
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const year = dateObj.getFullYear();
            
            // ISO formatında döndür (YYYY-MM-DD)
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('Tarih formatlanırken hata oluştu:', error);
            return '';
        }
    }
    
    // Tarih formatını görüntüleme formatına dönüştürme (GG.AA.YYYY)
    formatDisplayDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            
            // Geçerli bir tarih değilse boş döndür
            if (isNaN(date.getTime())) return '';
            
            // Gün, ay ve yıl değerlerini alma
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            // Tarih formatını düzenleme (GG.AA.YYYY)
            return `${day}.${month}.${year}`;
        } catch (error) {
            console.error('Tarih formatlanırken hata oluştu:', error);
            return '';
        }
    }
    
    // Filtre seçeneklerini doldurma
    populateFilterOptions() {
        // Marka seçeneklerini doldurma
        this.populateBrandOptions(document.getElementById('brand-filter'));
        
        // Kategori seçeneklerini doldurma
        const categoryFilter = document.getElementById('category-filter');
        this.populateCategoryOptions(categoryFilter);
        
        // Kategori değişikliğini dinleme
        categoryFilter.addEventListener('change', () => {
            this.updatePostTypeFilterOptions(categoryFilter.value);
        });
    }
    
    // Gönderi tipi filtre seçeneklerini güncelleme
    updatePostTypeFilterOptions(categoryId) {
        const postTypeFilterContainer = document.getElementById('post-type-filter-container');
        const postTypeFilter = document.getElementById('post-type-filter');
        
        // Seçim kutusunu temizleme
        postTypeFilter.innerHTML = '<option value="">Tümü</option>';
        
        // Kategori ID'si boşsa gönderi tipi alanını gizle
        if (!categoryId) {
            postTypeFilterContainer.style.display = 'none';
            return;
        }
        
        // Seçilen kategoriye ait gönderi tipleri var mı kontrol et
        const postTypes = this.dataManager.postTypes[categoryId];
        
        if (!postTypes || postTypes.length === 0) {
            // Gönderi tipi yoksa alanı gizle
            postTypeFilterContainer.style.display = 'none';
            return;
        }
        
        // Gönderi tiplerini doldur
        postTypes.forEach(postType => {
            const option = document.createElement('option');
            option.value = postType.id;
            option.textContent = postType.name;
            postTypeFilter.appendChild(option);
        });
        
        // Gönderi tipi alanını göster
        postTypeFilterContainer.style.display = 'block';
    }
    
    // Marka seçeneklerini doldurma
    populateBrandOptions(selectElement) {
        // Seçim kutusunu temizleme
        selectElement.innerHTML = '<option value="">Tümü</option>';
        
        // Markaları alfabetik sıraya göre sıralama
        const sortedBrands = [...this.dataManager.brands].sort((a, b) => 
            a.name.localeCompare(b.name, 'tr')
        );
        
        // Her marka için seçenek ekleme
        sortedBrands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand.id;
            option.textContent = brand.displayName || brand.name; // displayName varsa onu kullan, yoksa name'i kullan
            selectElement.appendChild(option);
        });
    }
    
    // Kategori seçeneklerini doldurma
    populateCategoryOptions(selectElement) {
        // Seçim kutusunu temizleme
        selectElement.innerHTML = '<option value="">Tümü</option>';
        
        // Kategorileri alfabetik sıraya göre sıralama
        const sortedCategories = [...this.dataManager.categories].sort((a, b) => 
            a.name.localeCompare(b.name, 'tr')
        );
        
        // Her kategori için seçenek ekleme
        sortedCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            selectElement.appendChild(option);
        });
        
        // Kategori değişikliğini dinleme
        if (selectElement.id === 'link-category') {
            selectElement.addEventListener('change', () => {
                this.updatePostTypeOptions(selectElement.value);
            });
        }
    }
    
    // Gönderi tipi seçeneklerini güncelleme
    updatePostTypeOptions(categoryId) {
        const postTypeContainer = document.getElementById('post-type-container');
        const postTypeOptions = document.getElementById('post-type-options');
        const postTypeInput = document.getElementById('link-post-type');
        
        // Seçenekleri temizleme
        postTypeOptions.innerHTML = '';
        postTypeInput.value = '';
        
        // Kategori ID'si boşsa gönderi tipi alanını gizle
        if (!categoryId) {
            postTypeContainer.style.display = 'none';
            return;
        }
        
        // Seçilen kategoriye ait gönderi tipleri var mı kontrol et
        const postTypes = this.dataManager.postTypes[categoryId];
        
        if (!postTypes || postTypes.length === 0) {
            // Gönderi tipi yoksa alanı gizle
            postTypeContainer.style.display = 'none';
            return;
        }
        
        // Gönderi tiplerini doldur
        postTypes.forEach(postType => {
            const option = document.createElement('div');
            option.className = 'post-type-option';
            option.dataset.id = postType.id;
            option.dataset.name = postType.name;
            option.textContent = postType.name; // İkon yerine sadece metin kullan
            
            // Tıklama olayı ekle
            option.addEventListener('click', () => {
                // Diğer seçeneklerin seçimini kaldır
                document.querySelectorAll('.post-type-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Bu seçeneği seç
                option.classList.add('selected');
                
                // Gizli input'a değeri ata
                postTypeInput.value = postType.id;
            });
            
            postTypeOptions.appendChild(option);
        });
        
        // İlk seçeneği varsayılan olarak seç
        if (postTypes.length > 0) {
            const firstOption = postTypeOptions.querySelector('.post-type-option');
            if (firstOption) {
                firstOption.click();
            }
        }
        
        // Gönderi tipi alanını göster
        postTypeContainer.style.display = 'block';
    }
    
    // Filtreleri uygulama
    applyFilters() {
        try {
            // Tarih aralığı
            const startDate = this.dateStartInput.value;
            const endDate = this.dateEndInput.value;
            
            // Marka ve kategori
            const brandId = this.brandFilterSelect.value;
            const categoryId = this.categoryFilterSelect.value;
            
            // Gönderi tipi
            const postTypeId = document.getElementById('post-type-filter').value;
            
            // Filtre nesnesi oluşturma
            const filters = {
                startDate,
                endDate,
                brandId,
                categoryId,
                postTypeId
            };
            
            // Son uygulanan filtreleri kaydetme
            this.lastAppliedFilters = { ...filters };
            
            // Bağlantıları filtreleme
            this.linkManager.loadLinks(filters);
            
            // Filtre temizleme butonunun görünürlüğünü güncelleme
            this.updateClearFilterButtonVisibility();
            
            console.log('Filtreler uygulandı:', filters);
        } catch (error) {
            console.error('Filtreler uygulanırken hata oluştu:', error);
            this.toastManager.error('Filtreler uygulanırken bir hata oluştu: ' + error.message);
        }
    }
    
    // Filtreleri temizleme
    clearFilters() {
        try {
            // Tarih aralığını temizleme
            this.dateStartInput.value = '';
            this.dateEndInput.value = '';
            
            // Marka ve kategori filtrelerini temizleme
            this.brandFilterSelect.value = '';
            this.categoryFilterSelect.value = '';
            
            // Gönderi tipi filtresini temizleme
            const postTypeFilter = document.getElementById('post-type-filter');
            if (postTypeFilter) {
                postTypeFilter.value = '';
            }
            
            // Gönderi tipi filtre alanını gizleme
            const postTypeFilterContainer = document.getElementById('post-type-filter-container');
            if (postTypeFilterContainer) {
                postTypeFilterContainer.style.display = 'none';
            }
            
            // Takvim widget'ındaki seçimleri temizleme
            if (this.filterDatePicker) {
                this.filterDatePicker.reset();
            } else {
                // Eski yöntem (yedek olarak)
                const dateRangeElement = document.querySelector('.selected-date-range');
                if (dateRangeElement) {
                    dateRangeElement.textContent = 'Tüm Zamanlar';
                }
                
                // Takvim preset butonlarını sıfırlama
                const datePresetBtns = document.querySelectorAll('.date-preset-btn');
                datePresetBtns.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.days === '0') {
                        btn.classList.add('active');
                    }
                });
            }
            
            // Son uygulanan filtreleri temizleme
            this.lastAppliedFilters = {
                startDate: '',
                endDate: '',
                brandId: '',
                categoryId: '',
                postTypeId: ''
            };
            
            // Filtre temizleme butonunun görünürlüğünü güncelleme
            this.updateClearFilterButtonVisibility();
            
            // Filtreleri hemen uygula
            this.applyFilters();
            
            console.log('Filtreler temizlendi');
        } catch (error) {
            console.error('Filtreler temizlenirken hata oluştu:', error);
        }
    }
    
    // Filtre temizleme butonunun görünürlüğünü güncelleme
    updateClearFilterButtonVisibility() {
        try {
            const clearFilterBtn = document.getElementById('clear-filters');
            if (!clearFilterBtn) return;
            
            // Filtre değerlerini kontrol et
            const startDate = this.dateStartInput.value;
            const endDate = this.dateEndInput.value;
            const brandId = this.brandFilterSelect.value;
            const categoryId = this.categoryFilterSelect.value;
            
            // Gönderi tipi
            const postTypeFilter = document.getElementById('post-type-filter');
            const postTypeId = postTypeFilter ? postTypeFilter.value : '';
            
            // Herhangi bir filtre seçili mi kontrol et
            const isAnyFilterSelected = startDate || endDate || brandId || categoryId || postTypeId;
            
            // Filtre temizleme butonunun görünürlüğünü güncelle
            if (isAnyFilterSelected) {
                clearFilterBtn.style.display = 'inline-block';
            } else {
                clearFilterBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Filtre temizleme butonu görünürlüğü güncellenirken hata oluştu:', error);
        }
    }
    
    // Filtreleme butonunun etkinlik durumunu güncelleme
    updateFilterButtonState(isAnyFilterSelected) {
        try {
            const filterBtn = document.getElementById('apply-filters');
            if (!filterBtn) return;
            
            // Filtre seçili değilse butonu devre dışı bırak
            if (!isAnyFilterSelected) {
                filterBtn.disabled = true;
                filterBtn.classList.add('disabled');
            } else {
                filterBtn.disabled = false;
                filterBtn.classList.remove('disabled');
            }
        } catch (error) {
            console.error('Filtreleme butonu durumu güncellenirken hata oluştu:', error);
        }
    }
    
    // Bağlantı ekleme modalını açma
    showAddLinkModal() {
        try {
            // Modal başlığını güncelleme
            document.getElementById('link-modal-title').textContent = 'Yeni Bağlantı Ekle';
            
            // Form alanlarını temizleme
            document.getElementById('link-id').value = '';
            document.getElementById('link-url').value = '';
            document.getElementById('link-title').value = '';
            document.getElementById('link-description').value = '';
            
            // Marka ve kategori seçeneklerini doldurma
            const linkBrandSelect = document.getElementById('link-brand');
            this.populateBrandOptions(linkBrandSelect);
            
            const linkCategorySelect = document.getElementById('link-category');
            this.populateCategoryOptions(linkCategorySelect);
            
            // Gönderi tipi seçeneklerini temizleme
            document.getElementById('link-post-type').value = '';
            const postTypeOptions = document.getElementById('post-type-options');
            if (postTypeOptions) {
                postTypeOptions.innerHTML = '';
            }
            
            // Gönderi tipi container'ını gizleme
            const postTypeContainer = document.getElementById('post-type-container');
            if (postTypeContainer) {
                postTypeContainer.style.display = 'none';
            }
            
            // Modalı gösterme
            this.linkModal.classList.remove('hidden');
        } catch (error) {
            console.error('Bağlantı ekleme modalı açılırken hata oluştu:', error);
            this.toastManager.error('Bağlantı ekleme modalı açılırken bir hata oluştu: ' + error.message);
        }
    }
    
    // Bağlantı formunu işleme
    handleLinkFormSubmit() {
        try {
            // Form verilerini alma
            const linkId = document.getElementById('link-id').value;
            const url = document.getElementById('link-url').value;
            const title = document.getElementById('link-title').value;
            const description = document.getElementById('link-description').value;
            const brandId = document.getElementById('link-brand').value;
            const categoryId = document.getElementById('link-category').value;
            
            // Gönderi tipi bilgisini alma
            let postTypeId = '';
            if (categoryId) {
                postTypeId = document.getElementById('link-post-type').value;
            }
            
            // Form doğrulama
            if (!url) {
                // URL alanı boş ise hata göster
                this.toastManager.modalError('URL alanı boş bırakılamaz');
                return;
            }
            
            if (!title) {
                // Başlık alanı boş ise hata göster
                this.toastManager.modalError('Başlık alanı boş bırakılamaz');
                return;
            }
            
            if (!brandId) {
                // Marka seçilmemişse hata göster
                this.toastManager.modalError('Lütfen bir marka seçin');
                return;
            }
            
            if (!categoryId) {
                // Kategori seçilmemişse hata göster
                this.toastManager.modalError('Lütfen bir kategori seçin');
                return;
            }
            
            // Kategori ve Marka isimlerini alma
            const brand = this.dataManager.brands.find(b => b.id === brandId);
            const category = this.dataManager.categories.find(c => c.id === categoryId);
            
            let brandName = brand ? brand.name : '';
            let categoryName = category ? category.name : '';
            
            // Gönderi tipini ve adını bulma
            let postTypeName = '';
            if (postTypeId && categoryId) {
                const postTypes = this.dataManager.postTypes[categoryId];
                if (postTypes) {
                    const postType = postTypes.find(pt => pt.id === postTypeId);
                    if (postType) {
                        postTypeName = postType.name;
                    }
                }
            }
            
            // Tam tarih ve saat bilgisini oluşturma
            const now = new Date();
            const isoDateTime = now.toISOString();
            
            if (linkId) {
                // Mevcut bağlantıyı güncelleme
                const existingLink = this.dataManager.links.find(l => l.id === linkId);
                
                if (!existingLink) {
                    this.toastManager.modalError('Güncellenecek bağlantı bulunamadı');
                    return;
                }
                
                // Değişen alanları takip etmek için dizi oluşturma
                const changedFields = [];
                
                if (existingLink.url !== url) changedFields.push('URL');
                if (existingLink.title !== title) changedFields.push('Başlık');
                if (existingLink.description !== description) changedFields.push('Açıklama');
                if (existingLink.brandId !== brandId) changedFields.push('Marka');
                if (existingLink.categoryId !== categoryId) changedFields.push('Kategori');
                if (existingLink.postTypeId !== postTypeId) changedFields.push('Gönderi Tipi');
                
                const updatedLink = {
                    ...existingLink,
                    url,
                    title,
                    description,
                    brandId,
                    brandName,
                    categoryId,
                    categoryName,
                    postTypeId,
                    postTypeName,
                    lastUpdated: isoDateTime,
                    lastUpdatedBy: this.authManager.currentUser.id, // Düzenleyen kullanıcı bilgisini ekliyoruz
                    changedFields
                };
                
                this.linkManager.updateLink(updatedLink);
                // Başarılı bağlantı güncelleme işleminde modalı kapat
                this.linkModal.classList.add('hidden');
                this.toastManager.success(`"${title}" bağlantısı başarıyla güncellendi`);
            } else {
                // Yeni bağlantı ekleme
                const newLink = {
                    id: this.dataManager.generateId(),
                    url,
                    title,
                    description,
                    brandId,
                    brandName, // Marka ismini de kaydet
                    categoryId,
                    categoryName, // Kategori ismini de kaydet
                    postTypeId, // Gönderi tipi ID'sini kaydet
                    postTypeName, // Gönderi tipi ismini kaydet
                    createdBy: this.authManager.currentUser.id,
                    datetime: isoDateTime // Tam ekleme tarihi ve saati
                };
                
                this.linkManager.addLink(newLink);
                
                // Başarılı bağlantı ekleme işleminde modal içi bildirim yerine push notification kullan ve modalı kapat
                this.linkModal.classList.add('hidden');
                this.toastManager.success(`"${title}" bağlantısı başarıyla eklendi`);
            }
            
            // Formu sıfırlama
            document.getElementById('link-form').reset();
            document.getElementById('link-id').value = '';
            
            // Bağlantıları yeniden yükleme
            this.linkManager.loadLinks();
        } catch (error) {
            console.error('Bağlantı kaydedilirken hata oluştu:', error);
            this.toastManager.modalError('Bağlantı kaydedilirken bir hata oluştu: ' + error.message);
        }
    }
    
    // Kullanıcı modalını gösterme
    showUserModal() {
        // Kullanıcı tablosunu doldurma
        this.populateUsersTable();
        
        // Modalı gösterme
        this.userModal.classList.remove('hidden');
    }
    
    // Kullanıcı tablosunu doldurma
    populateUsersTable() {
        const tbody = document.querySelector('#users-table tbody');
        tbody.innerHTML = '';
        
        this.dataManager.users.forEach(user => {
            const tr = document.createElement('tr');
            
            // Kullanıcı adı
            const tdUsername = document.createElement('td');
            tdUsername.textContent = user.username;
            tr.appendChild(tdUsername);
            
            // Rol
            const tdRole = document.createElement('td');
            let roleText = '';
            switch (user.role) {
                case 'admin':
                    roleText = 'Admin';
                    break;
                case 'editor':
                    roleText = 'Editör';
                    break;
                default:
                    roleText = 'Kullanıcı';
            }
            tdRole.textContent = roleText;
            tr.appendChild(tdRole);
            
            // İzinli markalar
            const tdBrands = document.createElement('td');
            if (user.role === 'admin' || user.role === 'editor') {
                tdBrands.textContent = 'Tüm Markalar';
            } else if (user.allowedBrands && user.allowedBrands.length > 0) {
                const brandNames = user.allowedBrands.map(brandId => {
                    const brand = this.dataManager.brands.find(b => b.id === brandId);
                    return brand ? brand.name : '';
                }).filter(Boolean);
                
                tdBrands.textContent = brandNames.join(', ');
            } else {
                tdBrands.textContent = 'Hiçbir Marka';
            }
            tr.appendChild(tdBrands);
            
            // İşlemler
            const tdActions = document.createElement('td');
            
            // Admin kullanıcısını düzenleme ve silme işlemlerinden koruma
            if (user.id !== 'admin' || this.authManager.currentUser.id === 'admin') {
                const editBtn = document.createElement('button');
                editBtn.className = 'btn btn-small';
                editBtn.textContent = 'Düzenle';
                editBtn.addEventListener('click', () => {
                    this.showEditUserModal(user.id);
                });
                tdActions.appendChild(editBtn);
                
                if (user.id !== 'admin') {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'btn btn-small btn-danger';
                    deleteBtn.textContent = 'Sil';
                    deleteBtn.addEventListener('click', () => {
                        this.handleDeleteUser(user.id);
                    });
                    tdActions.appendChild(deleteBtn);
                }
            }
            
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        });
    }
    
    // Kullanıcı ekleme modalını gösterme
    showAddUserModal() {
        // Modal başlığını ayarlama
        document.getElementById('edit-user-modal-title').textContent = 'Kullanıcı Ekle';
        
        // Form alanlarını temizleme
        document.getElementById('edit-user-id').value = '';
        document.getElementById('edit-user-username').value = '';
        document.getElementById('edit-user-password').value = '';
        document.getElementById('edit-user-role').value = 'user';
        
        // Marka izinlerini doldurma
        this.populateUserBrandPermissions([]);
        
        // Rol değişikliğini dinleme
        this.setupRoleChangeListener();
        
        // Başlangıçta marka izinleri bölümünün görünürlüğünü ayarlama
        this.updateBrandPermissionsVisibility('user');
        
        // Modalı gösterme
        this.editUserModal.classList.remove('hidden');
    }
    
    // Kullanıcı düzenleme modalını gösterme
    showEditUserModal(userId) {
        // Kullanıcıyı bulma
        const user = this.dataManager.users.find(u => u.id === userId);
        
        if (!user) {
            console.error('Kullanıcı bulunamadı:', userId);
                return;
            }
            
        // Modal başlığını ayarlama
        document.getElementById('edit-user-modal-title').textContent = 'Kullanıcı Düzenle';
        
        // Form alanlarını doldurma
        document.getElementById('edit-user-id').value = user.id;
        document.getElementById('edit-user-username').value = user.username;
        document.getElementById('edit-user-password').value = '';
        
        const roleSelect = document.getElementById('edit-user-role');
        roleSelect.value = user.role;
        
        // Admin kullanıcısının rolünü değiştirmeyi engelleme
        if (user.id === 'admin') {
            roleSelect.disabled = true;
        } else {
            roleSelect.disabled = false;
        }
        
        // Marka izinlerini doldurma
        this.populateUserBrandPermissions(user.allowedBrands || []);
        
        // Rol değişikliğini dinleme
        this.setupRoleChangeListener();
        
        // Rol değişikliğine göre marka izinleri bölümünü güncelleme
        this.updateBrandPermissionsVisibility(user.role);
        
        // Modalı gösterme
        this.editUserModal.classList.remove('hidden');
    }
    
    // Rol değişikliğini dinleme
    setupRoleChangeListener() {
        const roleSelect = document.getElementById('edit-user-role');
        
        // Önceki event listener'ları temizleme
        const newRoleSelect = roleSelect.cloneNode(true);
        roleSelect.parentNode.replaceChild(newRoleSelect, roleSelect);
        
        // Yeni event listener ekleme
        newRoleSelect.addEventListener('change', () => {
            this.updateBrandPermissionsVisibility(newRoleSelect.value);
        });
    }
    
    // Rol değişikliğine göre marka izinleri bölümünü güncelleme
    updateBrandPermissionsVisibility(role) {
        const brandPermissionsContainer = document.getElementById('edit-user-brands').closest('.form-group');
        
        if (role === 'admin' || role === 'editor') {
            // Admin ve editör için marka izinleri bölümünü gizleme
            brandPermissionsContainer.style.display = 'none';
        } else {
            // Normal kullanıcı için marka izinleri bölümünü gösterme
            brandPermissionsContainer.style.display = 'block';
        }
    }
    
    // Kullanıcı marka izinlerini doldurma
    populateUserBrandPermissions(allowedBrands) {
        const container = document.getElementById('edit-user-brands');
        container.innerHTML = '';
        
        this.dataManager.brands.forEach(brand => {
            const div = document.createElement('div');
            div.className = 'checkbox-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `brand-${brand.id}`;
            checkbox.name = 'allowedBrands';
            checkbox.value = brand.id;
            checkbox.checked = allowedBrands.includes(brand.id);
            
            const label = document.createElement('label');
            label.htmlFor = `brand-${brand.id}`;
            label.textContent = brand.name;
            
            div.appendChild(checkbox);
            div.appendChild(label);
            container.appendChild(div);
        });
    }
    
    // Kullanıcı formu gönderimini işleme
    handleUserFormSubmit() {
        // Form verilerini alma
        const userId = document.getElementById('edit-user-id').value;
        const username = document.getElementById('edit-user-username').value;
        let role = document.getElementById('edit-user-role').value;
        
        // Eğer kullanıcı admin ise, rolünü koruyalım
        if (userId === 'admin') {
            role = 'admin'; // Admin kullanıcısının rolünü her zaman admin olarak koru
        }
        
        const userData = {
            username: username,
            role: role
        };
        
        // Rol admin veya editör değilse marka izinlerini alma
        if (userData.role !== 'admin' && userData.role !== 'editor') {
            userData.allowedBrands = Array.from(document.querySelectorAll('input[name="allowedBrands"]:checked')).map(cb => cb.value);
        } else {
            // Admin ve editör için boş dizi atama (tüm markalara erişim)
            userData.allowedBrands = [];
        }
        
        // Şifre alanı doldurulmuşsa şifreyi hashleme ve güncelleme
        const password = document.getElementById('edit-user-password').value;
        if (password) {
            // Şifreyi hashle
            const passwordHash = this.authManager.hashPassword(password);
            userData.passwordHash = passwordHash;
            // Eski şifre alanını temizleme
            userData.password = undefined;
        }
        
        try {
            if (userId) {
                // Mevcut kullanıcıyı güncelleme
                this.dataManager.updateUser(userId, userData);
                
                // Başarı mesajı gösterme
                this.toastManager.modalSuccess(`${userData.username} kullanıcısı başarıyla güncellendi`);
                
                // Form alanlarını temizle
                document.getElementById('edit-user-password').value = '';
            } else {
                // Yeni kullanıcı ekleme (şifre zorunlu)
                if (!password) {
                    this.toastManager.modalWarning('Yeni kullanıcı için şifre gereklidir');
                    return;
                }
                this.dataManager.addUser(userData);
                
                // Başarı mesajı gösterme
                this.toastManager.modalSuccess(`${userData.username} kullanıcısı başarıyla eklendi`);
                
                // Form alanlarını temizle
                document.getElementById('edit-user-username').value = '';
                document.getElementById('edit-user-password').value = '';
                document.getElementById('edit-user-role').value = 'user';
            }
            
            // Kullanıcı tablosunu güncelleme
            this.populateUsersTable();
        } catch (error) {
            console.error('Kullanıcı kaydedilirken hata oluştu:', error);
            this.toastManager.modalError('Kullanıcı kaydedilirken bir hata oluştu: ' + error.message);
        }
    }
    
    // Kullanıcı silme işlemini işleme
    handleDeleteUser(userId) {
        // Kullanıcı bilgilerini alma
        const user = this.dataManager.users.find(u => u.id === userId);
        
        if (!user) {
            this.toastManager.error('Kullanıcı bulunamadı');
            return;
        }
        
        // Onay diyaloğu gösterme
        this.toastManager.confirm(
            `"${user.username}" kullanıcısını silmek istediğinizden emin misiniz?`,
            'Kullanıcıyı Sil',
            // Onay işlemi
            () => {
                try {
                    // Kullanıcıyı silme
                    this.dataManager.deleteUser(userId);
                    
                    // Kullanıcı tablosunu güncelleme
                    this.populateUsersTable();
                    
                    // Başarı mesajı gösterme
                    this.toastManager.success(`${user.username} kullanıcısı başarıyla silindi`);
                    
                    console.log('Kullanıcı silindi:', userId);
                } catch (error) {
                    console.error('Kullanıcı silinirken hata oluştu:', error);
                    this.toastManager.error('Kullanıcı silinirken bir hata oluştu: ' + error.message);
                }
            }
        );
    }
    
    // Marka modalını gösterme
    showBrandModal() {
        // Marka tablosunu doldurma
        this.populateBrandsTable();
        
        // Marka ekleme butonuna tıklama olayı ekle
        const addBrandBtn = document.getElementById('add-brand-btn');
        if (addBrandBtn) {
            // Önceki olay dinleyicilerini temizle (çift kayıt önleme)
            const newAddBrandBtn = addBrandBtn.cloneNode(true);
            addBrandBtn.parentNode.replaceChild(newAddBrandBtn, addBrandBtn);
            
            // Yeni olay dinleyicisi ekle
            newAddBrandBtn.addEventListener('click', () => {
                this.handleAddBrand();
            });
        } else {
            console.error('Marka ekleme butonu bulunamadı: add-brand-btn');
        }
        
        // Modalı gösterme
        this.brandModal.classList.remove('hidden');
    }
    
    // Marka ekleme işlemini işleme
    handleAddBrand() {
        const brandName = document.getElementById('new-brand-name')?.value?.trim();
        const logoFile = document.getElementById('new-brand-logo')?.files?.[0];
        
        if (!brandName) {
            this.toastManager.modalWarning('Marka adı boş olamaz');
            return;
        }
        
        const addBrand = async () => {
            try {
                const newBrand = { name: brandName };
                
                // Logo dosyası varsa, Base64 formatına dönüştürme
                if (logoFile) {
                    newBrand.logo = await this.dataManager.saveImageAsBase64(logoFile);
                }
                
                // Markayı ekleme
                this.dataManager.addBrand(newBrand);
                
                // Marka tablosunu güncelleme
                this.populateBrandsTable();
                
                // Filtre seçeneklerini güncelleme
                this.populateFilterOptions();
                
                // Başarı mesajı gösterme
                this.toastManager.modalSuccess(`${brandName} markası başarıyla eklendi`);
                
                // Form alanlarını temizleme
                document.getElementById('new-brand-name').value = '';
                if (document.getElementById('new-brand-logo')) {
                    document.getElementById('new-brand-logo').value = '';
                }
                
                console.log('Marka eklendi:', newBrand);
            } catch (error) {
                console.error('Marka eklenirken hata oluştu:', error);
                this.toastManager.modalError('Marka eklenirken bir hata oluştu: ' + error.message);
            }
        };
        
        addBrand();
    }
    
    // Marka tablosunu doldurma
    populateBrandsTable() {
        const tbody = document.querySelector('#brands-table tbody');
        tbody.innerHTML = '';
        
        this.dataManager.brands.forEach(brand => {
            const tr = document.createElement('tr');
            
            // Logo
            const tdLogo = document.createElement('td');
            if (brand.logo) {
                const img = document.createElement('img');
                img.src = brand.logo; // Dosya yolu zaten assets/logos/ içinde
                img.alt = brand.name;
                img.className = 'brand-logo';
                img.onerror = function() {
                    // Logo yüklenemezse ikon göster
                    this.onerror = null;
                    this.src = '';
                    this.outerHTML = '<i class="fas fa-building"></i>';
                };
                tdLogo.appendChild(img);
            } else {
                tdLogo.innerHTML = '<i class="fas fa-building"></i>';
            }
            tr.appendChild(tdLogo);
            
            // Marka adı
            const tdName = document.createElement('td');
            tdName.textContent = brand.name;
            tr.appendChild(tdName);
            
            // İşlemler
            const tdActions = document.createElement('td');
            
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-small';
            editBtn.textContent = 'Düzenle';
            editBtn.addEventListener('click', () => {
                this.handleEditBrand(brand.id);
            });
            tdActions.appendChild(editBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-small btn-danger';
            deleteBtn.textContent = 'Sil';
            deleteBtn.addEventListener('click', () => {
                this.handleDeleteBrand(brand.id);
            });
            tdActions.appendChild(deleteBtn);
            
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        });
    }
    
    // Marka düzenleme işlemini işleme
    handleEditBrand(brandId) {
        // Markayı bulma
        const brand = this.dataManager.brands.find(b => b.id === brandId);
        
        if (!brand) {
            console.error('Marka bulunamadı:', brandId);
            return;
        }
        
        // Düzenleme modalı oluşturma
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'edit-brand-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Marka Düzenle</h2>
                <form id="edit-brand-form">
                    <div class="form-group">
                        <label for="edit-brand-name">Marka Adı:</label>
                        <input type="text" id="edit-brand-name" value="${brand.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-brand-logo">Marka Logosu:</label>
                        <input type="file" id="edit-brand-logo" accept="image/*">
                        <small>Değiştirmek istemiyorsanız boş bırakın</small>
                    </div>
                    ${brand.logo ? `
                    <div class="form-group">
                        <label>Mevcut Logo:</label>
                        <div class="current-logo">
                            <img src="${brand.logo}" alt="${brand.name}" class="brand-logo-preview">
                        </div>
                    </div>
                    ` : ''}
                    <button type="submit" class="btn">Kaydet</button>
                </form>
            </div>
        `;
        
        // Modalı sayfaya ekleme
        document.body.appendChild(modal);
        
        // Modal kapatma butonunu dinleme
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Modal dışına tıklama ile kapatma
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Form gönderimini dinleme
        const form = modal.querySelector('#edit-brand-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newName = document.getElementById('edit-brand-name').value.trim();
            const logoFile = document.getElementById('edit-brand-logo').files[0];
            
            if (!newName) {
                this.toastManager.modalWarning('Marka adı boş olamaz');
                return;
            }
            
            try {
                const updatedBrand = { name: newName };
                
                // Logo dosyası varsa, Base64 formatına dönüştürme
                if (logoFile) {
                    updatedBrand.logo = await this.dataManager.saveImageAsBase64(logoFile);
                }
                
                // Markayı güncelleme
                this.dataManager.updateBrand(brandId, updatedBrand);
                
                // Marka tablosunu güncelleme
                this.populateBrandsTable();
                
                // Filtre seçeneklerini güncelleme
                this.populateFilterOptions();
                
                // Bağlantıları yeniden yükleme
                this.linkManager.loadLinks();
                
                // Başarı mesajı gösterme
                this.toastManager.modalSuccess(`${newName} markası başarıyla güncellendi`);
                
                console.log('Marka güncellendi:', brandId);
            } catch (error) {
                console.error('Marka güncellenirken hata oluştu:', error);
                this.toastManager.modalError('Marka güncellenirken bir hata oluştu: ' + error.message);
            }
        });
    }
    
    // Marka silme işlemini işleme
    handleDeleteBrand(brandId) {
        // Marka bilgilerini alma
        const brand = this.dataManager.brands.find(b => b.id === brandId);
        
        if (!brand) {
            this.toastManager.error('Marka bulunamadı');
            return;
        }
        
        // Onay diyaloğu gösterme
        this.toastManager.confirm(
            `"${brand.name}" markasını silmek istediğinizden emin misiniz? Bu işlem, bu markaya ait tüm bağlantıları da etkileyecektir.`,
            'Markayı Sil',
            // Onay işlemi
            () => {
                try {
                    // Markayı silme
                    this.dataManager.deleteBrand(brandId);
                    
                    // Marka tablosunu güncelleme
                    this.populateBrandsTable();
                    
                    // Filtre seçeneklerini güncelleme
                    this.populateFilterOptions();
                    
                    // Başarı mesajı gösterme
                    this.toastManager.success(`${brand.name} markası başarıyla silindi`);
                    
                    console.log('Marka silindi:', brandId);
                } catch (error) {
                    console.error('Marka silinirken hata oluştu:', error);
                    this.toastManager.error('Marka silinirken bir hata oluştu: ' + error.message);
                }
            }
        );
    }
    
    // Kategori modalını gösterme
    showCategoryModal() {
        // Kategori tablosunu doldurma
        this.populateCategoriesTable();
        
        // Modalı gösterme
        this.categoryModal.classList.remove('hidden');
    }
    
    // Kategori tablosunu doldurma
    populateCategoriesTable() {
        const tbody = document.querySelector('#categories-table tbody');
        tbody.innerHTML = '';
        
        this.dataManager.categories.forEach(category => {
            const tr = document.createElement('tr');
            
            // İkon
            const tdIcon = document.createElement('td');
            
            // Özel durumlar için ikon kontrolü
            if (category.icon === 'globe' || category.name.toLowerCase().includes('web')) {
                // Web sitesi kategorisi için özel ikon
                tdIcon.innerHTML = '<i class="fas fa-globe"></i>';
            } else {
                // Diğer kategoriler için normal ikon
                tdIcon.innerHTML = `<i class="fab fa-${category.icon}"></i>`;
            }
            
            tr.appendChild(tdIcon);
            
            // Kategori adı
            const tdName = document.createElement('td');
            tdName.textContent = category.name;
            tr.appendChild(tdName);
            
            // İşlemler
            const tdActions = document.createElement('td');
            
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-small';
            editBtn.textContent = 'Düzenle';
            editBtn.addEventListener('click', () => {
                this.handleEditCategory(category.id);
            });
            tdActions.appendChild(editBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-small btn-danger';
            deleteBtn.textContent = 'Sil';
            deleteBtn.addEventListener('click', () => {
                this.handleDeleteCategory(category.id);
            });
            tdActions.appendChild(deleteBtn);
            
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        });
    }
    
    // Kategori ekleme işlemini işleme
    handleAddCategory() {
        const categoryName = document.getElementById('new-category-name').value.trim();
        
        if (!categoryName) {
            this.toastManager.warning('Kategori adı boş olamaz');
            return;
        }
        
        // Kategori adına göre uygun bir ikon belirleme
        let icon = 'globe'; // Varsayılan ikon
        
        const lowerCaseName = categoryName.toLowerCase();
        if (lowerCaseName.includes('instagram')) {
            icon = 'instagram';
        } else if (lowerCaseName.includes('linkedin')) {
            icon = 'linkedin';
        } else if (lowerCaseName.includes('youtube')) {
            icon = 'youtube';
        } else if (lowerCaseName.includes('facebook')) {
            icon = 'facebook';
        } else if (lowerCaseName.includes('twitter')) {
            icon = 'twitter';
        }
        
        try {
            // Yeni kategori ekleme
            const newCategory = this.dataManager.addCategory({ 
                name: categoryName,
                icon: icon
            });
            
            // Kategori tablosunu güncelleme
            this.populateCategoriesTable();
            
            // Filtre seçeneklerini güncelleme
            this.populateFilterOptions();
            
            // Form alanını temizleme
            document.getElementById('new-category-name').value = '';
            
            // Başarı mesajı gösterme
            this.toastManager.success(`${newCategory.name} kategorisi başarıyla eklendi`);
            
            console.log('Kategori eklendi:', categoryName);
        } catch (error) {
            console.error('Kategori eklenirken hata oluştu:', error);
            this.toastManager.error('Kategori eklenirken bir hata oluştu: ' + error.message);
        }
    }
    
    // Kategori güncelleme işlemini işleme
    handleEditCategory(categoryId) {
        // Kategoriyi bulma
        const category = this.dataManager.categories.find(c => c.id === categoryId);
        
        if (!category) {
            console.error('Kategori bulunamadı:', categoryId);
            return;
        }
        
        // Düzenleme modalı oluşturma
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'edit-category-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Kategori Düzenle</h2>
                <form id="edit-category-form">
                    <div class="form-group">
                        <label for="edit-category-name">Kategori Adı:</label>
                        <input type="text" id="edit-category-name" value="${category.name}" required>
                    </div>
                    <button type="submit" class="btn">Kaydet</button>
                </form>
            </div>
        `;
        
        // Modalı sayfaya ekleme
        document.body.appendChild(modal);
        
        // Modal kapatma butonunu dinleme
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Modal dışına tıklama ile kapatma
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Form gönderimini dinleme
        const form = modal.querySelector('#edit-category-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newName = document.getElementById('edit-category-name').value.trim();
            
            if (!newName) {
                this.toastManager.modalWarning('Kategori adı boş olamaz');
                return;
            }
            
            try {
                const updatedCategory = {
                    name: newName
                };
                
                // Kategoriyi güncelleme
                this.dataManager.updateCategory(categoryId, updatedCategory);
                
                // Kategori tablosunu güncelleme
                this.populateCategoriesTable();
                
                // Filtre seçeneklerini güncelleme
                this.populateFilterOptions();
                
                // Bağlantıları yeniden yükleme
                this.linkManager.loadLinks();
                
                // Başarı mesajı gösterme
                this.toastManager.modalSuccess(`${newName} kategorisi başarıyla güncellendi`);
                
                console.log('Kategori güncellendi:', categoryId);
            } catch (error) {
                console.error('Kategori güncellenirken hata oluştu:', error);
                this.toastManager.modalError('Kategori güncellenirken bir hata oluştu: ' + error.message);
            }
        });
    }
    
    // Kategori silme işlemini işleme
    handleDeleteCategory(categoryId) {
        // Kategori bilgilerini alma
        const category = this.dataManager.categories.find(c => c.id === categoryId);
        
        if (!category) {
            this.toastManager.error('Kategori bulunamadı');
            return;
        }
        
        // Onay diyaloğu gösterme
        this.toastManager.confirm(
            `"${category.name}" kategorisini silmek istediğinizden emin misiniz? Bu işlem, bu kategoriye ait tüm bağlantıları da etkileyecektir.`,
            'Kategoriyi Sil',
            // Onay işlemi
            () => {
                try {
                    // Kategoriyi silme
                    this.dataManager.deleteCategory(categoryId);
                    
                    // Kategori tablosunu güncelleme
                    this.populateCategoriesTable();
                    
                    // Filtre seçeneklerini güncelleme
                    this.populateFilterOptions();
                    
                    // Başarı mesajı gösterme
                    this.toastManager.success(`${category.name} kategorisi başarıyla silindi`);
                    
                    console.log('Kategori silindi:', categoryId);
                } catch (error) {
                    console.error('Kategori silinirken hata oluştu:', error);
                    this.toastManager.error('Kategori silinirken bir hata oluştu: ' + error.message);
                }
            }
        );
    }
    
    // Bağlantıları dışa aktarma işlemini işleme
    handleExportLinks() {
        // Modal içeriğini oluşturma
        const modalContent = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Bağlantıları Dışa Aktar</h2>
                <div class="form-group">
                    <label for="export-date-filter">Tarih Aralığı:</label>
                    <div class="date-picker-container">
                        <div class="date-picker-input" id="export-date-filter-input">
                            <span class="selected-date-range">Tüm Zamanlar</span>
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div class="date-picker-dropdown" id="export-date-picker-dropdown">
                            <div class="date-presets">
                                <button type="button" class="date-preset-btn" data-days="7">Son 7 Gün</button>
                                <button type="button" class="date-preset-btn" data-days="14">Son 14 Gün</button>
                                <button type="button" class="date-preset-btn" data-days="30">Son 30 Gün</button>
                                <button type="button" class="date-preset-btn" data-days="90">Son 3 Ay</button>
                                <button type="button" class="date-preset-btn active" data-days="0">Tüm Zamanlar</button>
                            </div>
                            
                            <!-- Gizli tarih alanları -->
                            <input type="hidden" id="export-date-start">
                            <input type="hidden" id="export-date-end">
                            
                            <!-- Takvim bileşeni -->
                            <div class="calendar" id="export-date-calendar">
                                <div class="calendar-header">
                                    <div class="calendar-nav">
                                        <button type="button" class="prev-month"><i class="fas fa-chevron-left"></i></button>
                                        <div class="calendar-title">Ocak 2023</div>
                                        <button type="button" class="next-month"><i class="fas fa-chevron-right"></i></button>
                                    </div>
                                </div>
                                <div class="calendar-grid">
                                    <!-- Gün başlıkları -->
                                    <div class="calendar-day-header">Pt</div>
                                    <div class="calendar-day-header">Sa</div>
                                    <div class="calendar-day-header">Ça</div>
                                    <div class="calendar-day-header">Pe</div>
                                    <div class="calendar-day-header">Cu</div>
                                    <div class="calendar-day-header">Ct</div>
                                    <div class="calendar-day-header">Pa</div>
                                    
                                    <!-- Günler buraya dinamik olarak eklenecek -->
                                </div>
                            </div>
                            
                            <div class="date-picker-actions">
                                <button type="button" class="cancel-btn">İptal</button>
                                <button type="button" class="apply-btn">Uygula</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="export-brand">Marka:</label>
                    <select id="export-brand">
                        <option value="">Tümü</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="export-category">Kategori:</label>
                    <select id="export-category">
                        <option value="">Tümü</option>
                    </select>
                </div>
                <div class="form-group" id="export-post-type-container" style="display: none;">
                    <label for="export-post-type">Gönderi Tipi:</label>
                    <select id="export-post-type">
                        <option value="">Tümü</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="export-format">Dosya Formatı:</label>
                    <div class="export-format-options">
                        <label class="export-format-option">
                            <input type="radio" name="export-format" value="csv" checked>
                            <span class="export-format-icon"><i class="fas fa-file-csv"></i></span>
                            <span class="export-format-label">CSV</span>
                        </label>
                        <label class="export-format-option">
                            <input type="radio" name="export-format" value="xlsx">
                            <span class="export-format-icon"><i class="fas fa-file-excel"></i></span>
                            <span class="export-format-label">Excel (XLSX)</span>
                        </label>
                    </div>
                </div>
                <button id="export-filtered-btn" class="btn">Dışa Aktar</button>
            </div>
        `;
        
        // Modal oluşturma
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'export-modal';
        modal.innerHTML = modalContent;
        
        // Modalı sayfaya ekleme
        document.body.appendChild(modal);
        
        // Modal dışına tıklandığında kapatma
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Marka ve kategori seçeneklerini doldurma
        setTimeout(() => {
            // DOM'un güncellenmiş olmasını sağlamak için setTimeout kullanıyoruz
            const exportBrandSelect = document.getElementById('export-brand');
            const exportCategorySelect = document.getElementById('export-category');
            
            if (exportBrandSelect) {
                this.populateBrandOptions(exportBrandSelect);
            } else {
                console.error('export-brand elementi bulunamadı');
            }
            
            if (exportCategorySelect) {
                this.populateCategoryOptions(exportCategorySelect);
                
                // Kategori değiştiğinde gönderi tipi seçeneklerini güncelleme
                exportCategorySelect.addEventListener('change', () => {
                    const categoryId = exportCategorySelect.value;
                    this.updateExportPostTypeOptions(categoryId);
                });
            } else {
                console.error('export-category elementi bulunamadı');
            }
            
            // Dışa aktarma tarih seçici için DatePicker sınıfını kullan
            let dateStartInput, dateEndInput;
            try {
                const dateFilterInput = document.getElementById('export-date-filter-input');
                const datePickerDropdown = document.getElementById('export-date-picker-dropdown');
                const calendarElement = document.getElementById('export-date-calendar');
                dateStartInput = document.getElementById('export-date-start');
                dateEndInput = document.getElementById('export-date-end');
                
                if (!dateFilterInput || !datePickerDropdown || !calendarElement || !dateStartInput || !dateEndInput) {
                    console.warn('Dışa aktarma tarih seçici elementleri bulunamadı');
                } else {
                    const exportDatePicker = this.createDatePicker({
                        inputElement: dateFilterInput,
                        dropdownElement: datePickerDropdown,
                        calendarElement: calendarElement,
                        startDateInput: dateStartInput,
                        endDateInput: dateEndInput,
                        formatDate: this.formatDate.bind(this),
                        formatDisplayDate: this.formatDisplayDate.bind(this),
                        id: 'export-date-picker',
                        onApply: () => {
                            console.log('Dışa aktarma tarihi uygulandı');
                        }
                    });
                    
                    console.log('Dışa aktarma tarih seçici başlatıldı');
                }
            } catch (error) {
                console.error('Dışa aktarma tarih seçici başlatılırken hata oluştu:', error);
            }
            
            // Dışa aktarma butonuna olay dinleyicisi ekleme
            const exportFilteredBtn = document.getElementById('export-filtered-btn');
            if (exportFilteredBtn) {
                exportFilteredBtn.addEventListener('click', () => {
                    // Filtre değerlerini alma
                    const filters = {
                        startDate: dateStartInput ? dateStartInput.value : '',
                        endDate: dateEndInput ? dateEndInput.value : '',
                        brandId: document.getElementById('export-brand')?.value || '',
                        categoryId: document.getElementById('export-category')?.value || '',
                        postTypeId: document.getElementById('export-post-type')?.value || ''
                    };
                    
                    // Seçilen formatı alma
                    const formatInput = document.querySelector('input[name="export-format"]:checked');
                    const format = formatInput ? formatInput.value : 'csv';
                    
                    // Filtrelere göre bağlantıları dışa aktarma
                    this.exportFilteredLinks(filters, format);
                });
            } else {
                console.error('export-filtered-btn elementi bulunamadı');
            }
        }, 0);
        
        // Modal kapatma butonuna olay dinleyicisi ekleme
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        // Modalı gösterme
        modal.classList.remove('hidden');
    }
    
    // Dışa aktarma için gönderi tipi seçeneklerini güncelleme
    updateExportPostTypeOptions(categoryId) {
        const postTypeContainer = document.getElementById('export-post-type-container');
        const postTypeSelect = document.getElementById('export-post-type');
        
        // Seçim kutusunu temizleme
        postTypeSelect.innerHTML = '<option value="">Tümü</option>';
        
        // Kategori ID'si boşsa gönderi tipi alanını gizle
        if (!categoryId) {
            postTypeContainer.style.display = 'none';
            return;
        }
        
        // Seçilen kategoriye ait gönderi tipleri var mı kontrol et
        const postTypes = this.dataManager.postTypes[categoryId];
        
        if (!postTypes || postTypes.length === 0) {
            // Gönderi tipi yoksa alanı gizle
            postTypeContainer.style.display = 'none';
            return;
        }
        
        // Gönderi tiplerini doldur
        postTypes.forEach(postType => {
            const option = document.createElement('option');
            option.value = postType.id;
            option.textContent = postType.name;
            postTypeSelect.appendChild(option);
        });
        
        // Gönderi tipi alanını göster
        postTypeContainer.style.display = 'block';
    }
    
    // Filtrelere göre bağlantıları dışa aktarma
    exportFilteredLinks(filters, format = 'csv') {
        // Modalı bulma
        const modal = document.getElementById('export-modal');
        const exportBtn = modal?.querySelector('#export-links-confirm');
        
        if (!exportBtn) {
            console.error('Dışa aktarma butonu bulunamadı');
            return;
        }
        
        // Butonu devre dışı bırakma
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> İşleniyor...';
        
        try {
            // Filtrelere göre bağlantıları alma
            let filteredLinks = this.linkManager.getFilteredLinks(filters);
            
            // Bağlantı bulunamadıysa kullanıcıya bildir
            if (filteredLinks.length === 0) {
                this.toastManager.modalWarning('Seçilen filtrelere uygun bağlantı bulunamadı.');
                
                // Butonu etkinleştirme
                exportBtn.disabled = false;
                exportBtn.innerHTML = 'Dışa Aktar';
                return;
            }
            
            // Dosya adını oluşturma
            const today = new Date();
            const dateString = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
            
            let fileName = `linker_export_${dateString}`;
            
            if (filters.startDate && filters.endDate) {
                fileName += `_${this.formatDate(filters.startDate)}-${this.formatDate(filters.endDate)}`;
            }
            
            if (filters.brandId) {
                const brand = this.dataManager.brands.find(b => b.id === filters.brandId);
                if (brand) {
                    fileName += `_${brand.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                }
            }
            
            if (filters.categoryId) {
                const category = this.dataManager.categories.find(c => c.id === filters.categoryId);
                if (category) {
                    fileName += `_${category.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                }
            }
            
            if (filters.postTypeId) {
                const category = this.dataManager.categories.find(c => c.id === filters.categoryId);
                if (category && this.dataManager.postTypes[filters.categoryId]) {
                    const postType = this.dataManager.postTypes[filters.categoryId].find(pt => pt.id === filters.postTypeId);
                    if (postType) {
                        fileName += `_${postType.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                    }
                }
            }
            
            if (format === 'csv') {
                // CSV formatında dışa aktarma
                const csvHeaders = ['URL', 'Başlık', 'Açıklama', 'Marka', 'Kategori', 'Gönderi Tipi', 'Ekleyen', 'Tarih'];
                const csvData = filteredLinks.map(link => [
                    link.url,
                    link.title,
                    link.description || '',
                    link.brandName || '',
                    link.categoryName || '',
                    link.postTypeName || '',
                    this.dataManager.getUsernameById(link.createdBy) || '',
                    this.formatDisplayDate(link.datetime) || ''
                ]);
                
                // CSV verilerini oluşturma
                let csv = [csvHeaders, ...csvData].map(row => row.map(cell => 
                    `"${String(cell).replace(/"/g, '""')}"`
                ).join(',')).join('\n');
                
                // BOM ekleyerek Excel'de Türkçe karakterleri doğru gösterme
                const BOM = '\uFEFF';
                csv = BOM + csv;
                
                // Blob oluşturma ve indirme
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `${fileName}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Butonu etkinleştirme
                exportBtn.disabled = false;
                exportBtn.innerHTML = 'Dışa Aktar';
                
                // Başarı mesajı gösterme
                this.toastManager.modalSuccess(`${filteredLinks.length} bağlantı CSV olarak dışa aktarıldı`);
            } else if (format === 'xlsx') {
                // XLSX formatında dışa aktarma
                // Headers - ID hariç
                const headers = ['URL', 'Başlık', 'Açıklama', 'Marka', 'Kategori', 'Gönderi Tipi', 'Ekleyen', 'Tarih'];
                
                // Data - ID hariç
                const data = filteredLinks.map(link => [
                    link.url,
                    link.title,
                    link.description || '',
                    link.brandName || '',
                    link.categoryName || '',
                    link.postTypeName || '',
                    this.dataManager.getUsernameById(link.createdBy) || '',
                    this.formatDisplayDate(link.datetime) || ''
                ]);
                
                // XLSX oluşturma
                const worksheet = this.createXLSX(headers, data);
                
                // Blob oluşturma ve indirme
                const blob = new Blob([worksheet], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `${fileName}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Butonu etkinleştirme
                exportBtn.disabled = false;
                exportBtn.innerHTML = 'Dışa Aktar';
                
                // Başarı mesajı gösterme
                this.toastManager.modalSuccess(`${filteredLinks.length} bağlantı Excel dosyası olarak dışa aktarıldı`);
            } else {
                console.error('Desteklenmeyen format:', format);
            }
        } catch (error) {
            console.error('Dışa aktarma sırasında hata oluştu:', error);
            this.toastManager.modalError('Dışa aktarma sırasında bir hata oluştu: ' + error.message);
            
            // Butonu etkinleştirme
            exportBtn.disabled = false;
            exportBtn.innerHTML = 'Dışa Aktar';
        }
    }
    
    // XLSX dosyası oluşturma (basit bir şekilde)
    createXLSX(headers, data) {
        // Bu basit bir XLSX oluşturma fonksiyonu
        // Gerçek uygulamada xlsx.js gibi bir kütüphane kullanılabilir
        
        // XML başlığı ve stil tanımları
        let xlsx = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
        xlsx += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
        xlsx += '<Styles><Style ss:ID="Default"><Alignment ss:Vertical="Top"/></Style></Styles>';
        xlsx += '<Worksheet ss:Name="Bağlantılar">';
        xlsx += '<Table>';
        
        // Başlık satırı
        xlsx += '<Row>';
        headers.forEach(header => {
            xlsx += `<Cell><Data ss:Type="String">${header}</Data></Cell>`;
        });
        xlsx += '</Row>';
        
        // Veri satırları
        data.forEach(row => {
            xlsx += '<Row>';
            row.forEach(cell => {
                xlsx += `<Cell><Data ss:Type="String">${cell}</Data></Cell>`;
            });
            xlsx += '</Row>';
        });
        
        // XML kapanış etiketleri
        xlsx += '</Table>';
        xlsx += '</Worksheet>';
        xlsx += '</Workbook>';
        
        return xlsx;
    }
    
    // Bağlantı düzenleme modalını açma
    showEditLinkModal(linkId) {
        try {
            // Bağlantıyı bulma
            const link = this.dataManager.links.find(l => l.id === linkId);
            
            if (link) {
                // Modal başlığını güncelleme
                document.getElementById('link-modal-title').textContent = 'Bağlantı Düzenle';
                
                // Form alanlarını doldurma
                document.getElementById('link-id').value = link.id;
                document.getElementById('link-url').value = link.url;
                document.getElementById('link-title').value = link.title;
                document.getElementById('link-description').value = link.description || '';
                
                // Marka ve kategori seçeneklerini doldurma
                const linkBrandSelect = document.getElementById('link-brand');
                this.populateBrandOptions(linkBrandSelect);
                linkBrandSelect.value = link.brandId;
                
                const linkCategorySelect = document.getElementById('link-category');
                this.populateCategoryOptions(linkCategorySelect);
                linkCategorySelect.value = link.categoryId;
                
                // Gönderi tipi seçeneklerini güncelleme
                this.updatePostTypeOptions(link.categoryId);
                
                // Eğer gönderi tipi varsa seç
                if (link.postTypeId) {
                    const postTypeInput = document.getElementById('link-post-type');
                    postTypeInput.value = link.postTypeId;
                    
                    // İlgili seçeneği seçili hale getir
                    const postTypeOptions = document.querySelectorAll('.post-type-option');
                    postTypeOptions.forEach(option => {
                        if (option.dataset.id === link.postTypeId) {
                            // Diğer seçeneklerin seçimini kaldır
                            postTypeOptions.forEach(opt => {
                                opt.classList.remove('selected');
                            });
                            
                            // Bu seçeneği seç
                            option.classList.add('selected');
                        }
                    });
                }
                
                // Modalı gösterme
                this.linkModal.classList.remove('hidden');
            } else {
                console.error('Düzenlenecek bağlantı bulunamadı');
                this.toastManager.error('Düzenlenecek bağlantı bulunamadı');
            }
        } catch (error) {
            console.error('Bağlantı düzenleme modalı açılırken hata oluştu:', error);
            this.toastManager.error('Bağlantı düzenleme modalı açılırken bir hata oluştu: ' + error.message);
        }
    }
    
    // Bağlantı listesini oluşturma
    renderLinks(links) {
        const linksList = document.getElementById('links-list');
        
        // Listeyi temizleme
        linksList.innerHTML = '';
        
        if (links.length === 0) {
            // Boş liste mesajı gösterme
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.innerHTML = '<i class="fas fa-info-circle"></i> Gösterilecek bağlantı bulunamadı';
            linksList.appendChild(emptyMessage);
            
            // Seçim arayüzünü sıfırlama
            if (this.linkManager && typeof this.linkManager.resetSelectionUI === 'function') {
                this.linkManager.resetSelectionUI();
            }
            
            // "Tümünü Seç" başlığını gizle
            if (this.linkManager && typeof this.linkManager.updateSelectAllHeaderVisibility === 'function') {
                this.linkManager.updateSelectAllHeaderVisibility(0);
            }
            
            return;
        }
        
        // Bağlantıları listeleme
        links.forEach(link => {
            const linkElement = this.linkManager.renderLink(link);
            linksList.appendChild(linkElement);
        });
        
        // "Tümünü Seç" başlığını göster
        if (this.linkManager && typeof this.linkManager.updateSelectAllHeaderVisibility === 'function') {
            this.linkManager.updateSelectAllHeaderVisibility(links.length);
        }
        
        // Seçim arayüzünü sıfırlama
        if (this.linkManager && typeof this.linkManager.resetSelectionUI === 'function') {
            this.linkManager.resetSelectionUI();
        } else {
            // Eski sıfırlama kodu (yedek olarak)
            const bulkActions = document.getElementById('bulk-actions');
            if (bulkActions) {
                bulkActions.classList.remove('active');
            }
            
            const countText = document.getElementById('selected-count');
            if (countText) {
                countText.textContent = '0 bağlantı seçildi';
            }
            
            // Tümünü seç checkbox'ını sıfırlama
            const selectAllCheckbox = document.getElementById('select-all-links');
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = false;
            }
        }
    }
    
    // Admin paneli butonlarına olay dinleyicileri ekleme
    handleAdminButtons() {
        // Butonlar ve ilgili işlevleri eşleştiren nesne
        const adminButtons = [
            { id: 'manage-users-btn', handler: () => this.showUserModal() },
            { id: 'manage-brands-btn', handler: () => this.showBrandModal() },
            { id: 'manage-categories-btn', handler: () => this.showCategoryModal() },
            { id: 'export-links-btn', handler: () => this.handleExportLinks() },
            { id: 'export-all-json-btn', handler: () => this.dataManager.exportAllDataAsJSON() },
            { id: 'export-links-json-btn', handler: () => this.dataManager.exportLinksAsJSON() },
            { id: 'export-users-json-btn', handler: () => this.dataManager.exportUsersAsJSON() },
            { id: 'export-brands-json-btn', handler: () => this.dataManager.exportBrandsAsJSON() },
            { id: 'export-categories-json-btn', handler: () => this.dataManager.exportCategoriesAsJSON() }
        ];
        
        // Tüm butonlara olay dinleyicileri ekle
        adminButtons.forEach(button => {
            const element = document.getElementById(button.id);
            if (element) {
                element.addEventListener('click', button.handler);
            }
        });
    }
    
    // Oturum durumuna göre UI'ı güncelleme
    updateUIBasedOnAuth() {
        const isLoggedIn = this.authManager.isLoggedIn();
        const isAdmin = this.authManager.isAdmin();
        const canEdit = this.authManager.canEdit();
        const isUserRole = isLoggedIn && !canEdit; // Sadece kullanıcı rolü (admin veya editör değil)
        
        // Giriş/çıkış butonlarını güncelleme
        document.getElementById('login-container').classList.toggle('hidden', isLoggedIn);
        document.getElementById('main-container').classList.toggle('hidden', !isLoggedIn);
        
        // Admin panelini güncelleme (sadece admin rolü için)
        document.getElementById('admin-panel').classList.toggle('hidden', !isAdmin);
        
        // Veri yönetimi panelini güncelleme (admin ve editör rolleri için)
        const dataManagementPanel = document.getElementById('data-management-panel');
        if (dataManagementPanel) {
            dataManagementPanel.classList.toggle('hidden', !canEdit);
        }
        
        // Kullanıcı bilgilerini güncelleme
        if (isLoggedIn) {
            const currentUser = this.authManager.currentUser;
            document.getElementById('current-user').textContent = currentUser.username;
            
            // Kullanıcı rolüne göre rol etiketi güncelleme
            let roleText = '';
            switch (currentUser.role) {
                case 'admin':
                    roleText = 'Yönetici';
                    break;
                case 'editor':
                    roleText = 'Editör';
                    break;
                default:
                    roleText = 'Kullanıcı';
            }
            document.getElementById('user-role').textContent = roleText;
            
            // Kullanıcı rolüne göre bağlantı ekleme butonunu göster/gizle
            const addLinkBtn = document.getElementById('add-link-btn');
            if (addLinkBtn) {
                addLinkBtn.style.display = canEdit ? 'inline-block' : 'none';
            }
            
            // Kullanıcı rolüne göre toplu işlem butonlarını göster/gizle
            const bulkActions = document.getElementById('bulk-actions');
            if (bulkActions) {
                bulkActions.style.display = canEdit ? 'flex' : 'none';
            }
            
            // Kullanıcı rolüne göre "Tümünü Seç" alanını göster/gizle
            const selectAllHeader = document.getElementById('select-all-header');
            if (selectAllHeader) {
                // Kullanıcı için tamamen gizle
                if (isUserRole) {
                    selectAllHeader.style.display = 'none';
                } else {
                    selectAllHeader.style.display = 'flex';
                }
            }
            
            // Kullanıcı rolüne göre "Tümünü Seç" konteynerini göster/gizle
            const selectAllContainer = document.querySelector('.select-all-container');
            if (selectAllContainer) {
                selectAllContainer.style.display = canEdit ? 'flex' : 'none';
            }
            
            // Link yöneticisinde de "Tümünü Seç" başlığının görünürlüğünü güncelle
            if (this.linkManager && typeof this.linkManager.updateSelectAllHeaderVisibility === 'function') {
                // Bağlantı listesindeki öğe sayısını al
                const linksList = document.getElementById('links-list');
                const linkCount = linksList ? linksList.querySelectorAll('.link-item').length : 0;
                this.linkManager.updateSelectAllHeaderVisibility(linkCount);
            }
        }
    }
    
    // Modal kapatma butonlarını işleme
    handleModalClose() {
        // Modal kapatma butonlarına olay dinleyicileri ekleme
        this.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // En yakın modal elementini bulma
                const modal = btn.closest('.modal');
                if (modal) {
                    modal.classList.add('hidden');
                }
            });
        });
        
        // Modal dışına tıklama ile kapatma
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });
    }
    
    // Seçilen tarih aralığını güncelleme
    updateSelectedDateRange() {
        const startDate = this.dateStartInput.value;
        const endDate = this.dateEndInput.value;
        const dateRangeElement = document.querySelector('.selected-date-range');
        
        if (!dateRangeElement) {
            console.warn('selected-date-range elementi bulunamadı');
            return;
        }
        
        if (startDate && endDate) {
            // Başlangıç ve bitiş tarihi varsa
            const formattedStartDate = this.formatDisplayDate(startDate);
            const formattedEndDate = this.formatDisplayDate(endDate);
            dateRangeElement.textContent = `${formattedStartDate} - ${formattedEndDate}`;
        } else if (startDate) {
            // Sadece başlangıç tarihi varsa
            const formattedStartDate = this.formatDisplayDate(startDate);
            dateRangeElement.textContent = `${formattedStartDate}'den itibaren`;
        } else if (endDate) {
            // Sadece bitiş tarihi varsa
            const formattedEndDate = this.formatDisplayDate(endDate);
            dateRangeElement.textContent = `${formattedEndDate}'e kadar`;
        } else {
            // Hiçbir tarih seçilmemişse
            dateRangeElement.textContent = 'Tüm Zamanlar';
        }
    }

    // Kategori ekleme modalını gösterme
    showAddCategoryModal() {
        // Kategori ekleme modalı içeriğini oluşturma
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'add-category-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Kategori Ekle</h2>
                <form id="add-category-form">
                    <div class="form-group">
                        <label for="category-name">Kategori Adı:</label>
                        <input type="text" id="category-name" required>
                    </div>
                    <button type="submit" class="btn">Ekle</button>
                </form>
            </div>
        `;
        
        // Modalı sayfaya ekleme
        document.body.appendChild(modal);
        
        // Modal kapatma butonu
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Modal dışına tıklama ile kapatma
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Form gönderimi
        const form = modal.querySelector('#add-category-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddCategory(modal);
        });
    }
    
    // Kategori ekleme işlemini işleme
    handleAddCategory(modal) {
        // Form verilerini alma
        const categoryName = document.getElementById('category-name').value.trim();
        
        if (!categoryName) {
            this.toastManager.modalWarning('Kategori adı boş olamaz');
            return;
        }
        
        try {
            // Kategori ekleme
            const newCategory = {
                name: categoryName
            };
            
            this.dataManager.addCategory(newCategory);
            
            // Kategori tablosunu güncelleme
            this.populateCategoriesTable();
            
            // Filtre seçeneklerini güncelleme
            this.populateFilterOptions();
            
            // Başarı mesajı gösterme
            this.toastManager.modalSuccess(`${categoryName} kategorisi başarıyla eklendi`);
            
            // Form alanlarını temizleme
            document.getElementById('category-name').value = '';
            
            console.log('Kategori eklendi:', newCategory);
        } catch (error) {
            console.error('Kategori eklenirken hata oluştu:', error);
            this.toastManager.modalError('Kategori eklenirken bir hata oluştu: ' + error.message);
        }
    }

    // Filtre alanları değiştiğinde filtrelemeyi hemen uygula
    applyFiltersImmediately() {
        // Debounce işlemi için son istek zamanını kontrol et
        const now = new Date().getTime();
        if (this.lastFilterRequestTime && now - this.lastFilterRequestTime < 300) {
            // Son istekten bu yana 300ms geçmediyse ve zamanlayıcı varsa iptal et
            if (this.filterDebounceTimer) clearTimeout(this.filterDebounceTimer);
            
            // Yeni bir zamanlayıcı ayarla
            this.filterDebounceTimer = setTimeout(() => {
                this.applyFilters();
            }, 300);
            return;
        }
        
        // Zamanlayıcıyı temizle ve filtreleri uygula
        if (this.filterDebounceTimer) clearTimeout(this.filterDebounceTimer);
        this.lastFilterRequestTime = now;
        this.applyFilters();
    }
} 