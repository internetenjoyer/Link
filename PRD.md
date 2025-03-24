## Yapılacaklar

1.  [x] "Kullanıcı" rolündeki hesaplar, bağlantıları düzenleme, sıralama, ekleme ve silme işlemlerini yapamamalıdır. Ayrıca "Yeni Bağlantı Ekle" butonu olan "add-link-btn" kullanıcı rolünde kesinlikle kaldırılmış olmalı.
2.  [x] Çoklu seçim aracı ile tüm bağlantılar silindiğinde dahi "Tümünü Seç 2 bağlantı seçildi" şeklinde kalması sorunu düzeltilmelidir.
3.  [x] Kategorilere ek olarak gönderi tipleri de eklenmelidir. Örneğin, bağlantı ekleme modalında Instagram kategorisi seçildiğinde, hemen altında "Post, Carousel Post, Reels" şeklinde yalnızca bir adet seçilebilecek zorunlu bir seçenek olmalıdır. Ve ilgili kategorinin gönderi tipi, linklerin listelendiği alanda link metası olarak da görünmek zorunda. Gönderi tipleri aşağıdaki gibi olmalıdır:
    *   Instagram: Post, Carousel Post, Reels
    *   Facebook: Post, Carousel Post, Reels
    *   LinkedIn: Görsel, Video, Carousel Post, Blog
    *   YouTube: Video, Shorts
4.  [x] Eklenen bu gönderi tipleri, filtreleme alanında dinamik olarak ilgili kategori seçildiğinde conditional logic ile görünmelidir.
5.  [x] Gönderi Tipinin link listesindeki meta alanında icon ile görünmemesi gerekiyor. Link ekleme modalnda da icon görünmemeli. Kategori metasının içinde yer alsın.
6.  [x] Linklerin eklendiği saat verisini de almalıyız. Bu saat verisi de link listesinde meta alanında görünmelidir.
7.  [x] Filtre temizleme butonu, eğer hiçbir filtre özelliği seçilmediyse görünür olmamalıdır.
8.  [x] Link listesinde listelenen linklerin meta alanının altında eğer link düzenlendiyse bu bilgiyi linkin güncellendiği tarih ve saat şeklinde gösterelim.
9.  [x] Düzenlenen linkler için meta alanında güncelleme tarih ve saatinin yanlarında linkin güncellenen kısımlarını tanımlayalım ve o alanlar güncellendiğinde meta alanında o şekilde görünsün. Örneğin; bir linkin başlık kısmı düzenlenirse, "Başlık düzenlendi • güncellene tarih ve saati" şeklinde.
10. [x] Admin panelinde, kullanıcı yönetimi kısmında, admin rolündeki bir hesabın şifresi yenilendiğinde, o hesabın rolünün kullanıcı olarak değişmesi hatası düzeltilmelidir.
11. [x] Link listesinde gönderi düzenleme metasındaki "Son Güncelleme" metnine gerek yok. Sadece " Gönderi Tipi düzenlendi • 12.03.2025 17:24" şeklinde olsun.
12. [x] Link listesinin üstünde, mevcutta link listesindeki bağlantı sayısını gösteren bir sayaç olmalı. Filtrelemeler, kullanıcı rollerine göre izin verilen markalara göre tamamen dinamik bir biçimde linklerin sayısını gösteren bir alan oluşturalım.
13. [x] Link listesinin üst kısmındaki action bar için düzenleme yap. Yeni bağlantı ekleme solda, link sayacı sağda, toplu işlem alanını da, yeni bağlantı ekleme butounun yanında görünür hale gelecek şekilde düzenle. Action bar tüm içeriği ile, link listesini de kapsayan ana bir kapsayıcı içerisinde yer alabilir.
14. [x] Filtre temizleme butonumuz, eğer herhangi bir filtre seçildiyse ortaya çıkıyor, ancak bu durum özel takvim widgetimizi kapsamıyor. Takvimden herhangi bir gün veya ön tanımlı tarih de seçildiyse eğer, filtre temizleme butonu görünür olmalı ve seçimleri temizlemeli. Ayırca bu temizleme işlemi, takvim tekrar açıldığında seçili olarak highlight olmuş günlerin de temizlenmesini gerektiriyor. 
15. [x] Kullanıcıları yönet, Markaları yönet ve Kategorileri yönet modalları çalışmıyor. Modal elementlerinin doğru şekilde tanımlanması ve modal kapatma butonlarının işlevselliğinin sağlanması gerekiyor.
16. [x] Takvim widgetinde, bulunduğumuz günden sonrası seçilemiyor olması gerekiyor.
17. [x] Kullanıcı yönetim modalında kullanıcı düzenleme ve yeni kullanıcı ekleme butonları çalışmıyor. Modal elementlerinin doğru şekilde tanımlanması gerekiyor.
18. [x] Toplu işlem sırasında açılan kısmı daha kompakt ve projenin genel tasarımına uygun hale getirerek basitleştirmeliyiz.
19. [x] bulk actions içerisindeki tümünü seç alanı yerine, link listesindek linklerin checkbox hizasında, listenin en tepesinde bulunacak bir tamamını seçme checkboxu olsun. bu checkbox eğer listede hiçbir öğe yoksa görünür olmasın.
20. [x] Link listesinde yer alan linklerde bulunan, düzenleme, silme ve seçme checkboxlarını dikeyde ortalayalım.
21. [x] "bulk-actions" elemanı, "select-all-header" içerisinde görünür olsa daha mantıklı olacak gibi. bu şekilde düzeltelim.
22. [x] Özel takvim widgetimide, Yılların da tamamını seçebiliyor ve rahatça yıllar arasında gezinebiliyor olmalıyız. Bunun için yılları, örneğin takvim açıken görünen "Mart 2025" yazısına tıklandığında görebiliyor olmalıyız. Ancak seçilen bu yıldaki günler de normal takvimimizdeki şekilde birebir aynı olmalı.
23. [x] Filtre alanında hiçbir seçim yapılmadan filtreme tuşuna basılırsa seçim yapılmasına dair bir push notification gösterilsin. Her defasında boşa basıldığınıda arkada işlem yaparak sistemi yormamalı.
24. [x] Filtre seçilmeden filtreleme butonuna basıldığında çıkan push notification butona her basıldığında çıkıyor ve bu suiistimal edilebilir. bunu engelleyelim.
25. [x] Push notificationların tamamında kapatma butonları görünmemekte. tümünü kontrol edip görünür hale getirelim.
26. [x] Bağlantıları dışa aktarma paneli 'editör' rolündeki kullanıcılarda da görünebilir olmalı.
27. [x] Bağlantıları dışa aktarırken, gönderi tipini de seçebilmeliyiz ve dışa aktarılan dosyada gönderi tipi de bir kolon olarak eklenebilmeli.
28. [x] Projede yer alan tüm modalları kullanırken, çıkabilecek herhangi bir notification durumunda, (hata, başarı) push notificationlar yerine, modalların içerisinde gösterelim. Ve modalların içerisinde çıkacak olan bu bildirimler küçük bir close button ile kapatılabilmeli. Ancak modal stillerinde ve yapısında başka hiçbir şeyi değiştirmeyelim.
29. [x] Yeni bağlantı ekleme modalı, bağlantı eklendikten sonra kapanabilir ve sadece yeni bağlantı ekleme modalı için modal içi bildirim yerine push notification kullanılabilir. 
30. [x] Link düzenlemesinin ardından da modal kapanmalı.
31. [x] Filtre alanında herhangi bir seçim yok ise, filtreleme tuşu disabled konumunda olmalı çünkü şu anki durumda filtrele butonuna her basıldığında ve hiçbir filtre seçilmediğinde sürekli "lütfen en az bir filtre seçin." çıkıyor. 
32. [x] Projeye, link listesinde tamamen dinamik olarak çalışacak bir arama kutucuğu ekleyelim. Konumu link listesinin üstünde yer alan "tümünü seç" işleminin bulunduğu "select-all-header" olabilir, burada sağa yaslı durabilir. Bu ve benzeri tüm güncellemeleri yaparken, projedeki mevcut değişkenler ve yapıyı koruyalım ki kritik hatalar yol açmayalım.
33. [x] Filtre alanının yapısını tamamen değiştirelim. Filtreleri uygulamak için bir buton kullanmayalım. Bunun yerine daha modern ve dinamik çalışacak ajax sorgusu şeklinde yapalım. Filtre temizleme butonu da bu ajax yapısına göre şekillendirilecek ve işlevsel hale gelecek.
34. [x] Linklerin sürüklenerek yer değiştirebilmesini tamamen projeden kaldıralım.
35. [x] Checkbox ile seçilen linklerin arkaplan rengi, temamıza uygun olacak ve seçildiğini belli edecek biçimde değişmeli.
37. [ ] Toplu veya tekli link silme işlemlerinde, linkler listeden yumuşak bir animasyonla silinebilirler.
38. [ ] Filtre alanında ve dışa aktarma ekranındaki: marka, kategori ve gönderi tiplerinin tamamında bulunan dropdownları, çoklu seçim yapılabilir bir hale getirmeliyiz. Seçilen öğeler dropdownın hemen üst kısmına belirtilmeli. bu özel dropdown widgetleri içerisinde tümünü seç ve tümünü kaldır işlevleri olmalı.
39. [ ] Projenin tasarımını ve şeklini olduğu gibi koruyarak, yalnızca yapı elementlerini tamamen semantic olacak şekilde bir düzenleme yapar mısın?

## Yapılanlar

1.  **Kullanıcı Rolü Kısıtlamaları:**
    *   "Kullanıcı" rolündeki hesaplar için bağlantı yönetimi kısıtlamaları eklendi:
        *   "Yeni Bağlantı Ekle" butonu kullanıcı rolünde gizlendi
        *   Bağlantı düzenleme ve silme butonları kullanıcı rolünde gizlendi
        *   Bağlantı seçme ve toplu işlem butonları kullanıcı rolünde gizlendi
        *   Sürükle bırak ile sıralama özelliği kullanıcı rolünde devre dışı bırakıldı
2.  **Çoklu Seçim Aracı İyileştirmeleri:**
    *   Çoklu seçim aracı ile ilgili sorunlar düzeltildi:
        *   Tüm bağlantılar silindiğinde "Tümünü Seç" checkbox'ı ve seçim sayacı sıfırlanacak şekilde güncellendi
        *   Bağlantılar yüklendiğinde seçim arayüzünün her zaman sıfırlanması sağlandı
        *   Seçim arayüzünü sıfırlamak için merkezi bir fonksiyon eklendi
3.  **Gönderi Tipleri:**
    *   Gönderi tipleri eklendi:
        *   Veri yapısına gönderi tipleri tanımlandı
        *   Bağlantı ekleme/düzenleme modalına gönderi tipi seçimi eklendi
        *   Kategori seçildiğinde ilgili gönderi tipleri dinamik olarak gösteriliyor
        *   Bağlantı listesinde gönderi tipi bilgisi görüntüleniyor
        *   Bağlantı verilerine gönderi tipi bilgisi eklendi
    *   Filtreleme alanına gönderi tipi filtresi eklendi:
        *   Kategori seçildiğinde ilgili gönderi tipleri dinamik olarak gösteriliyor
        *   Gönderi tipine göre filtreleme yapılabiliyor
    *   Gönderi tipi görünümü iyileştirildi:
        *   Gönderi tipi seçeneklerinden ikonlar kaldırıldı
        *   Bağlantı listesinde gönderi tipi ayrı bir meta alanı olarak değil, kategori metasının içinde görüntüleniyor
        *   Kategori ve gönderi tipi arasında "•" sembolü kullanılarak daha estetik bir görünüm sağlandı
4.  **Bağlantı Tarih ve Saat Bilgisi:**
    *   Bağlantı tarih ve saat bilgisi eklendi:
        *   Bağlantı eklenirken ve güncellenirken tam tarih ve saat bilgisi kaydediliyor
        *   Bağlantı listesinde tarih ve saat bilgisi birlikte görüntüleniyor (GG.AA.YYYY SS:DD formatında)
5.  **Filtre Temizleme Butonu İyileştirmeleri:**
    *   Filtre temizleme butonunun görünürlüğü iyileştirildi:
        *   Hiçbir filtre seçili olmadığında filtre temizleme butonu gizleniyor
        *   Herhangi bir filtre seçildiğinde filtre temizleme butonu görünüyor
        *   Filtre alanlarına değişiklik dinleyicileri eklenerek butonun görünürlüğü dinamik olarak güncelleniyor
        *   Sayfa yüklendiğinde filtre temizleme butonunun görünürlüğü otomatik olarak ayarlanıyor
6.  **Bağlantı Güncelleme Bilgisi:**
    *   Bağlantı güncelleme bilgisi eklendi:
        *   Bağlantı düzenlendiğinde son güncelleme tarih ve saati kaydediliyor
        *   Düzenlenen bağlantıların meta alanının altında son güncelleme bilgisi görüntüleniyor
        *   Güncelleme bilgisi için özel stil eklenerek görsel olarak ayırt edilebilir hale getirildi
    *   Güncellenen alanların gösterimi eklendi:
        *   Bağlantı düzenlenirken hangi alanların değiştiği tespit ediliyor (Başlık, URL, Açıklama, Marka, Kategori, Gönderi Tipi)
        *   Değişen alanlar bağlantı nesnesinde saklanıyor
        *   Güncelleme bilgisi alanında, değişen alanlar listeleniyor (örn: "Başlık, Açıklama düzenlendi • Son güncelleme: 01.01.2023 14:30")
        *   Kullanıcılar artık hangi alanların güncellendiğini kolayca görebiliyor
    *   Güncelleme bilgisi görünümü iyileştirildi:
        *   Link listesinde gönderi düzenleme metasındaki "Son Güncelleme:" metni kaldırıldı
        *   Güncelleme bilgisi artık daha sade ve anlaşılır bir formatta gösteriliyor
        *   Değişen alanlar ve tarih/saat bilgisi doğrudan gösteriliyor (örn: "Gönderi Tipi düzenlendi • 12.03.2025 17:24")
        *   Kullanıcı deneyimi daha temiz ve odaklanmış hale getirildi
7.  **Admin Kullanıcı Rolü Koruması:**
    *   Admin kullanıcı rolü koruması eklendi:
        *   Admin rolündeki bir hesabın şifresi yenilendiğinde, rolünün değişmesi hatası düzeltildi
        *   Admin kullanıcısının rolü her zaman "admin" olarak korunuyor
        *   Hem UI tarafında hem de veri yönetimi tarafında kontroller eklendi
        *   Admin kullanıcısının rol değişikliği engellendi
8.  **Bağlantı Sayacı:**
    *   Bağlantı sayacı eklendi:
        *   Link listesinin üstünde bağlantı sayısını gösteren bir sayaç oluşturuldu
        *   Sayaç, filtreleme durumuna göre dinamik olarak güncelleniyor
        *   Filtre uygulandığında, gösterilen bağlantı sayısı ve toplam bağlantı sayısı birlikte görüntüleniyor
        *   Kullanıcı rolüne göre erişilebilir bağlantı sayısı hesaplanıyor
        *   Sayaç için özel stil ve ikon eklenerek görsel olarak zenginleştirildi
9.  **Action Bar Düzeni:**
    *   Action bar düzeni iyileştirildi:
        *   Link listesinin üst kısmındaki action bar yeniden düzenlendi
        *   Yeni bağlantı ekleme butonu solda, link sayacı sağda konumlandırıldı
        *   Toplu işlem alanı, yeni bağlantı ekleme butonunun yanında görünür hale getirildi
        *   Tüm içerik, link listesini de kapsayan ana bir kapsayıcı içerisine alındı
        *   Duyarlı tasarım için mobil görünüm düzenlemeleri yapıldı
        *   Kullanıcı deneyimi ve arayüz estetiği iyileştirildi
10. **Takvim Widget'ı ve Filtre Temizleme Butonu Entegrasyonu:**
    *   Takvim widget'ı ve filtre temizleme butonu entegrasyonu iyileştirildi:
        *   Takvimden tarih seçildiğinde filtre temizleme butonu artık otomatik olarak görünür hale geliyor
        *   Filtre temizleme butonu tıklandığında takvim seçimleri de temizleniyor
        *   Takvim widget'ındaki seçili günler ve ön tanımlı tarih butonları sıfırlanıyor
        *   Takvim widget'ı ile filtre temizleme butonu arasında tam entegrasyon sağlandı
        *   DatePicker sınıfı ve UIManager sınıfı arasında iletişim kurularak, takvim seçimlerinin filtre durumunu etkilemesi sağlandı
11. **Modal İyileştirmeleri:**
    *   "Kullanıcıları Yönet", "Markaları Yönet" ve "Kategorileri Yönet" modallarının çalışmaması sorunu çözüldü:
        *   Modal elementleri ve kapatma butonları için gerekli değişkenler tanımlandı ve olay dinleyicileri eklendi.
    *   Kullanıcı yönetim modalında kullanıcı düzenleme ve yeni kullanıcı ekleme butonlarının çalışmaması sorunu çözüldü:
        *   `editUserModal` değişkeni `UIManager` sınıfına eklenerek modal elementine doğru şekilde erişim sağlandı.
12. **Takvim Widget'ı Kısıtlaması:**
    *   Takvim widget'ında bugünden sonraki günlerin seçilememesi sağlandı:
        *   Gelecek tarihler devre dışı bırakıldı ve görsel olarak ayırt edilebilir hale getirildi.
13. **Toplu İşlem Alanı İyileştirmeleri:**
    *   Toplu işlem alanı daha kompakt ve projenin genel tasarımına uygun hale getirildi:
        *   Arka plan rengi, gölge efekti ve kenar yuvarlamaları eklenerek daha modern bir görünüm sağlandı. Seçim kutusu ve sayaç alanı yeniden tasarlandı. Mobil görünümde de daha kullanışlı bir düzen oluşturuldu.
14. **"Tümünü Seç" Başlığı ve Checkbox'ı İyileştirmeleri:**
    *   "Tümünü Seç" başlığı ve checkbox'ı için geliştirmeler yapıldı:
        *   Link listesinin en üstünde, linklerin checkbox hizasında "Tümünü Seç" checkbox'ı eklendi
        *   Bağlantı listesi boş olduğunda "Tümünü Seç" başlığı otomatik olarak gizleniyor
        *   Tüm bağlantılar silindiğinde "Tümünü Seç" başlığı otomatik olarak gizleniyor
        *   `LinkManager` sınıfına `updateSelectAllHeaderVisibility` fonksiyonu eklendi
        *   `UIManager` sınıfındaki `renderLinks` fonksiyonu güncellenerek bağlantı listesi boş olduğunda "Tümünü Seç" başlığını gizleyecek şekilde düzenlendi
        *   `resetSelectionUI` fonksiyonu güncellenerek "Tümünü Seç" başlığının görünürlüğünü güncelleyecek şekilde düzenlendi
        *   `deleteSelectedLinks` fonksiyonu güncellenerek tüm bağlantılar silindiğinde "Tümünü Seç" başlığını gizleyecek şekilde düzenlendi
15. **Link Listesi Öğelerinin Hizalanması:**
    *   Link listesindeki öğelerin dikey hizalaması iyileştirildi:
        *   Link öğelerindeki düzenleme, silme ve seçme checkboxları dikeyde ortalandı
        *   Checkbox'ların görünümü iyileştirildi ve özel stil eklendi
        *   Düzenleme ve silme butonları için hover efektleri ve gölge efektleri eklendi
        *   Mobil görünümde düzenleme ve silme butonları sağa, seçme checkboxları sola hizalandı
        *   Tüm öğeler için tutarlı bir görünüm ve hizalama sağlandı
        *   Font Awesome ikonları kullanılarak checkbox'lar için özel işaretleme eklendi
16. **"bulk-actions" Elemanı:**
    *   "bulk-actions" elemanı "select-all-header" içerisine taşındı:
        *   "bulk-actions" elemanı "action-bar" içerisinden çıkarılıp "select-all-header" içerisine taşındı
        *   "select-all-header" içerisinde "bulk-actions" elemanının doğru şekilde görüntülenmesi için CSS stilleri güncellendi
        *   "select-all-header" için "justify-content: space-between" özelliği eklenerek elemanların yatayda düzgün hizalanması sağlandı
        *   Mobil görünüm için özel düzenlemeler yapıldı, "select-all-header" dikey olarak düzenlendi
        *   "bulk-actions" elemanının görünürlüğü ve animasyonları korundu
17. **Özel Takvim Widget'ı Yıl Seçimi:**
    *   Özel takvim widget'ında yıllar arasında gezinme özelliği eklendi:
        *   Takvim açıkken ay ve yıl başlığına (örn. "Mart 2025") tıklandığında yıl seçim paneli açılıyor
        *   Yıl seçim panelinde 12 yıllık aralıklar halinde yıllar gösteriliyor
        *   Mevcut yıl vurgulanarak gösteriliyor
        *   Bugünden sonraki yıllar devre dışı bırakılıyor ve seçilemiyor
        *   Yıl seçildiğinde otomatik olarak o yılın mevcut ayına geçiliyor
        *   Önceki/sonraki butonları ile 12 yıllık aralıklar arasında gezinilebiliyor
        *   Yıl seçim panelinde de aynı takvim görünümü korunuyor
        *   Seçilen yıldaki günler normal takvim görünümüyle aynı şekilde gösteriliyor
18. **Filtre Uyarı Sistemi:**
    * Filtre alanında hiçbir seçim yapılmadan filtreleme tuşuna basıldığında uyarı sistemi eklendi:
        * Hiçbir filtre seçilmediğinde kullanıcıya "Lütfen en az bir filtre seçin" şeklinde bir uyarı mesajı gösteriliyor
        * Boş filtreleme işlemi engellenerek gereksiz sistem yükü önleniyor
        * Uyarı mesajı, kullanıcı dostu bir bildirim olarak ekranın sağ üst köşesinde görüntüleniyor
        * Uyarı mesajı 5 saniye sonra otomatik olarak kayboluyor
        * Kullanıcı, en az bir filtre seçtikten sonra filtreleme işlemi gerçekleştirilebiliyor
19. **Filtre Uyarı Sistemi İyileştirmesi:**
    * Filtre seçilmeden filtreleme butonuna basıldığında çıkan bildirim mesajının suiistimal edilmesini engellemek için iyileştirmeler yapıldı:
        * Uyarı mesajları arasında minimum 3 saniyelik bir bekleme süresi eklendi
        * Kullanıcı filtreleme butonuna hızlı ve tekrarlı bir şekilde bastığında, sadece belirli aralıklarla uyarı mesajı gösteriliyor
        * Sistem gereksiz yere uyarı mesajı göstermeyerek, hem kullanıcı deneyimini iyileştiriyor hem de sistem kaynaklarını koruyor
        * Arka planda, son uyarı zamanı takip edilerek, yeni bir uyarının gösterilip gösterilmeyeceğine karar veriliyor
        * Konsol mesajları ile sistem durumu izlenebiliyor, böylece geliştirme ve hata ayıklama süreçleri kolaylaştırılıyor
20. **Push Notification Kapatma Butonu İyileştirmesi:**
    * Tüm push notification'larda kapatma butonları görünür hale getirildi:
        * Bildirim component'i güncellenerek kapatma butonu her zaman görünür olacak şekilde düzenlendi
        * Bildirim stillerine ek özellikler eklenerek kapatma butonunun daha belirgin olması sağlandı
        * Tüm bildirim tiplerinde (başarı, hata, uyarı, bilgi) kapatma butonu aynı şekilde çalışıyor
        * Bildirim kapatma butonu için hover efekti eklenerek kullanıcı etkileşimi iyileştirildi
        * Kullanıcılar artık bildirimleri manuel olarak kapatabiliyorlar
21. **Editör Rolü İyileştirmeleri:**
    * Bağlantıları dışa aktarma paneli artık editör rolündeki kullanıcılarda da görünür hale getirildi:
        * Admin paneli ve veri yönetimi paneli birbirinden ayrıldı
        * Veri yönetimi paneli hem admin hem de editör rolündeki kullanıcılar için erişilebilir
        * UI güncelleme fonksiyonları (AuthManager.updateUI ve UIManager.updateUIBasedOnAuth) yeni yapıya uygun hale getirildi
        * Kullanıcı rol etiketi gösterimi iyileştirildi, "Editör" rolü doğru şekilde görüntüleniyor
        * Veri yönetimi bölümü arayüzde ayrı bir panel olarak sunularak kullanıcı deneyimi geliştirildi

22. **Gönderi Tipi Dışa Aktarma İyileştirmesi:**
    * Bağlantıları dışa aktarma paneline gönderi tipi seçim alanı eklendi:
        * Dışa aktarma modalında kategori seçildiğinde ilgili gönderi tipleri dinamik olarak gösteriliyor
        * Gönderi tipi seçeneği, dışa aktarma formunda koşullu olarak görüntüleniyor
        * Seçilen gönderi tipine göre filtreleme yapılabiliyor
    * CSV ve XLSX dışa aktarma işlevleri güncellendi:
        * Dışa aktarılan dosyalara "Gönderi Tipi" sütunu eklendi
        * Dışa aktarma fonksiyonları, seçilen gönderi tipini dikkate alacak şekilde güncellendi
        * Gönderi tipi bilgisi, dışa aktarılan dosya adında da görünüyor (filtre bilgisi olarak)
        * Hem CSV hem de XLSX formatlarında gönderi tipi bilgisi düzgün şekilde görüntüleniyor
    * Kullanıcı arayüzü iyileştirildi:
        * Gönderi tipi seçimi için açılır menü eklendi
        * Kategori seçimine bağlı olarak gönderi tipi seçeneği dinamik olarak güncelleniyor
        * Seçim yapıldığında, dışa aktarma butonuna hangi filtrelerle aktarım yapılacağı bilgisi ekleniyor

23. **Modal Bildirim Sistemi İyileştirmesi:**
    * Bildirim gösterme sistemi tamamen yeniden tasarlandı:
        * Modal içi bildirim sistemi kaldırıldı ve tüm bildirimler toast bildirimi olarak güncellendi
        * ToastManager sınıfına yeni metodlar eklendi: modalSuccess, modalError, modalWarning ve modalInfo
        * Bu metodlar, modalı kapatmadan toast bildirimlerini gösteriyor
        * Eski showInModal metodu geriye dönük uyumluluk için korundu ancak yeni metodlara yönlendirildi
    * Modalların içindeki HTML bildirim elementleri kaldırıldı:
        * Tüm modallardaki modal-notification sınıfları ve HTML yapıları temizlendi
        * CSS dosyasında modal-notification sınıfları display: none ile gizlendi
        * Modallar daha temiz bir kod yapısına kavuştu ve fazla HTML elementleri kaldırıldı
    * Tüm modal fonksiyonları güncellendi:
        * showBrandModal, handleAddBrand, handleEditBrand
        * showCategoryModal, handleAddCategory, handleEditCategory
        * showUserModal, handleUserFormSubmit
        * handleExportLinks, exportFilteredLinks
        * showEditLinkModal, handleLinkFormSubmit
    * Kullanıcı deneyimi iyileştirildi:
        * Bildirimler artık modalın dışında, ekranın sağ üst köşesinde gösteriliyor
        * Bildirimler 5 saniye sonra otomatik olarak kayboluyor
        * Kapatma butonları ile manuel olarak kapatılabiliyor
        * Bildirimler, modalları kapatmadan görüntülenebiliyor

24. **Yeni Bağlantı Ekleme Modalı İyileştirmesi:**
    * Yeni bağlantı ekleme modalına özel bir uygulama yapıldı:
        * Bağlantı başarıyla eklendiğinde modal otomatik olarak kapanıyor
        * Başarı bildirimi modalın içinde değil, ekranın sağ üst köşesinde gösteriliyor
        * Bu istisna sadece yeni bağlantı ekleme için geçerli, diğer modallarda modal içi bildirimler kaldırılıp, toast bildirimleri modalları kapatmadan gösteriliyor
    * showAddLinkModal ve handleLinkFormSubmit fonksiyonları güncellendi:
        * Yeni bağlantı eklendiğinde, başarı durumunda modal kapatılıyor
        * Başarı bildirimi, ekranın sağ üst köşesinde toast olarak gösteriliyor
        * Eklenen bağlantının başlığı, başarı bildiriminde gösterilerek kullanıcıya daha detaylı bilgi sağlanıyor
    * Kullanıcı deneyimi iyileştirildi:
        * Bağlantı ekleme işlemi daha hızlı ve kolay hale getirildi
        * Kullanıcı, bağlantı ekledikten hemen sonra yeni bir bağlantı eklemek isterse, tekrar "Yeni Bağlantı Ekle" butonuna tıklayarak işlemi tekrarlayabiliyor
        * Diğer tüm modallarda bildirimler gösterilirken modallar açık kalıyor

25. **Link Düzenleme Modalı İyileştirmesi:**
    * Link düzenleme işlemi tamamlandıktan sonra modalın kapanması sağlandı:
        * handleLinkFormSubmit fonksiyonu güncellenerek, link düzenleme işlemi başarıyla tamamlandığında modalın otomatik olarak kapanması eklendi
        * Başarı bildirimi modalın içinde değil, ekranın sağ üst köşesinde toast notification olarak gösteriliyor
        * Düzenlenen bağlantının başlığı, başarı bildiriminde gösterilerek kullanıcıya daha detaylı bilgi sağlanıyor
    * Kullanıcı deneyimi iyileştirildi:
        * Bağlantı düzenleme işlemi tamamlandıktan sonra modal otomatik olarak kapanarak kullanıcı akışı hızlandırıldı
        * Yeni bağlantı ekleme işlemiyle tutarlı bir deneyim sağlanarak kullanıcı alışkanlığı dikkate alındı
        * Bağlantı listesi otomatik olarak yenilenerek, yapılan değişiklikler hemen görüntüleniyor

26. **Filtreleme Butonu İyileştirmesi:**
    * Filtreleme butonunun devre dışı kalma durumu iyileştirildi:
        * Hiçbir filtre seçili olmadığında filtreleme butonu otomatik olarak devre dışı bırakılıyor
        * Herhangi bir filtre seçildiğinde buton otomatik olarak etkinleştiriliyor
        * Sayfa ilk yüklendiğinde, hiçbir filtre seçili olmadığı için buton devre dışı durumda başlıyor
    * Yeni eklenen özellikler ve fonksiyonlar:
        * UIManager sınıfına `updateFilterButtonState` fonksiyonu eklendi
        * `updateClearFilterButtonVisibility` fonksiyonu güncellenerek filtreleme butonunun durumunu da kontrol etmesi sağlandı
        * CSS dosyasına `disabled` sınıfı ve `:disabled` seçicisi için özel stiller eklendi
    * Kullanıcı deneyimi iyileştirildi:
        * Filtreleme butonunu devre dışı gösterme sayesinde kullanıcılar filtre seçmeden butona tıklayamıyor
        * Gereksiz uyarı mesajlarının önüne geçilerek daha temiz bir kullanıcı arayüzü sağlandı
        * Görsel olarak butonun devre dışı durumu açıkça belli edilerek kullanıcı yönlendirmesi iyileştirildi
        * Sistem kaynakları daha verimli kullanılarak, gereksiz filtreleme işlemleri engellendi

27. **Ajax Tarzı Dinamik Filtreleme Sistemi:**
    * Filtre uygulamak için butona tıklama ihtiyacını ortadan kaldıran modern bir filtreleme sistemi eklendi:
        * Filtreleme için ayrı bir buton kullanımı tamamen kaldırıldı
        * Filtre alanlarında değişiklik yapıldığında otomatik olarak filtreleme işlemi gerçekleştiriliyor
        * Her filtre değişikliğinde anında sonuçlar güncelleniyor (AJAX benzeri deneyim)
        * Gereksiz sayfa yenileme ve yüklemeleri ortadan kaldırıldı
    * Gelişmiş özellikler:
        * Çok hızlı filtreleme işlemlerini önlemek için "debounce" mekanizması eklendi (300ms)
        * Filtre değişikliğinden sonra kullanıcı çok hızlı art arda değişiklik yapıyorsa, son değişiklikten sonra filtreleme yapılıyor
        * Filtreleme için sunucu kaynaklarının verimli kullanılması sağlandı
    * Filtre temizleme butonu:
        * Filtre temizleme butonu, ajax filtreleme yapısıyla uyumlu hale getirildi
        * Tüm filtrelerin temizlenmesinin ardından sonuçlar otomatik olarak güncelleniyor
        * Filtre temizleme butonunun görünürlüğü, herhangi bir filtre seçildiğinde otomatik olarak ayarlanıyor
    * Kullanıcı deneyimi tamamen yenilendi:
        * Kullanıcılar filtreleri değiştirdikçe anında sonuç alabiliyorlar
        * Filtreleme işlemi için ekstra bir butona tıklama adımı kaldırıldı
        * Daha akıcı ve modern bir arayüz deneyimi sunuldu
        * Kullanıcıların filtreleme işlemini daha hızlı ve verimli bir şekilde yapabilmeleri sağlandı
        * Özel takvim widget'ı entegrasyonu:
        * Takvim widget'ı ile dinamik filtreleme sistemi tam entegre edildi
        * Tarih seçimleri yapıldığında otomatik olarak filtreleme gerçekleştiriliyor
        * Tarih aralığı seçimi tamamlandığında veya hazır tarih butonlarına tıklandığında anında sonuçlar güncelleniyor
        * Filtre temizleme butonu takvim seçimlerini de temizliyor ve bunu yaptıktan sonra otomatik filtreleme yapıyor
        * Kullanıcılar artık tarih filtresi için de anında sonuç görebiliyorlar
        * Takvim widget'ı içerisine "Seçimi Temizle" butonu eklenerek kullanıcıların tarih seçimlerini kolayca sıfırlamaları sağlandı
        * Bu buton sadece bir tarih seçildiğinde görünür oluyor ve sola yaslı olarak konumlandırılıyor
        * Takvim modalı açık kalmaya devam ederken, mevcut tarih seçimleri temizlenebiliyor
        * Tarih seçimleri temizlendiğinde filtreleme anında güncelleniyor
        * Hem genel filtre temizleme butonu hem de takvim içindeki seçim temizleme butonu tamamen uyumlu çalışıyor
28. **Checkbox ile Seçilen Linklerin Arkaplan Rengi İyileştirmesi:**
    * Checkbox ile seçilen linklerin arkaplan rengi değiştirildi:
        * Seçilen linklerin arkaplan rengi temaya uygun olacak şekilde primary-light renk değişkeni kullanılarak ayarlandı
        * Seçilen linklerin sol kenarına 3 piksel kalınlığında primary-color renk değişkeni ile kenarlık eklendi
        * Seçilen linklere ince bir gölge efekti eklenerek görsel olarak belirginleştirildi
        * Hover durumunda seçili link mavi tonunun daha koyu bir versiyonuna dönüşüyor
    * Link seçme işlevselliği güncellendi:
        * Bir link checkbox ile seçildiğinde otomatik olarak arkaplanı değişiyor
        * "Tümünü Seç" checkbox'ı ile toplu seçim yapıldığında tüm görünür linklerin arkaplanları değişiyor
        * Arama sonuçlarında veya filtrelemeden sonra arkaplan renkleri doğru şekilde korunuyor
        * Seçimler sıfırlandığında arkaplan renkleri de sıfırlanıyor
    * Kullanıcı deneyimi iyileştirildi:
        * Seçilen linkler görsel olarak daha belirgin hale getirildi
        * Kullanıcılar hangi linkleri seçtiklerini daha kolay görebiliyorlar
        * Toplu seçim ve arama işlemlerinde seçili olan linkler belirgin kalıyor
        * Linklerin seçili olduğu daha net anlaşılır hale getirildi.