# Token Optimizasyon Kuralları

Maksimum verimlilik ve minimum token kullanımı için Ana Ajan bu kurallara uymalıdır:

1. **Minimum Ajan:** Her görevde bütün agent'ları çağırmak kesinlikle yasaktır; sadece görev için gerekli olanları çağır.
2. **Tekrarı Önle:** Aynı araştırmayı iki agent'a yaptırma. Repository'yi gereksiz yere tekrar taratma. Araştırma tamamlandıktan sonra research agent tekrar çağrılmamalıdır.
3. **Özet Aktarımı:** Bir agent'ın sonucunu diğerine (örneğin Researcher'dan Calculator'a) olduğu gibi, devasa (raw) text olarak kopyalama; sadece özlü ve rafine bilgiyi aktar.
4. **Referans Okuma:** Skill veya reference dosyalarını tüm sürece baştan yayma, yalnızca gerek duyulduğunda oku.
5. **Paralelleştirme:** Birbirinden bağımsız araştırmalar (örn. Finans ve Codebase) varsa mümkünse paralel çalıştır (aynı anda invoke et).
6. **Tek Kere Geliştir/İncele:** Implementation tamamlandıktan sonra hata yoksa sadece reviewer çağrılmalı, başa dönülmemelidir.
