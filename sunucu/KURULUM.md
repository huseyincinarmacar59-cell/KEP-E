# 🥄 Kepçe Yerel Yapay Zekâ — Kurulum Rehberi

Bu rehberle kendi bilgisayarında, internete ve API'ye gerek kalmadan tabak fotoğrafına bakan
bir yapay zekâ kuracaksın. Toplam süre ~20-30 dakika (çoğu indirme beklemesi).

---

## 1. Adım — Node.js'i kur (sunucuyu çalıştıran program)
1. **nodejs.org** adresine gir.
2. Yeşil **LTS** butonuna basıp indir, kur. Hep "Next" de, ayarlara dokunma.
3. Kontrol: Başlat menüsüne `cmd` yaz, aç ve şunu yaz:
   ```
   node -v
   ```
   `v22...` gibi bir sürüm yazıyorsa tamamdır. ✅

## 2. Adım — Ollama'yı kur (yapay zekâyı çalıştıran program)
1. **ollama.com** adresine gir, **Download for Windows**'a bas, kur.
2. Kurulunca sağ alttaki saat yanında 🦙 lama simgesi çıkar. Bu, Ollama'nın açık olduğu anlamına gelir.

## 3. Adım — Yapay zekâ modelini indir (~3,3 GB)
`cmd` penceresine şunu yaz:
```
ollama pull gemma3:4b
```
İndirme bitene kadar bekle. Sonra hızlı bir test:
```
ollama run gemma3:4b "Merhaba, kimsin?"
```
Cevap veriyorsa yapay zekân çalışıyor demektir. 🎉

## 4. Adım — Kepçe sunucusunu başlat
1. Bu klasördeki **`baslat.bat`** dosyasına çift tıkla.
2. Windows Güvenlik Duvarı izin sorarsa **"Özel ağlar"** kutusunu işaretleyip **İzin ver** de.
   (Telefonun bağlanabilmesi için gerekli.)
3. Pencerede şunu görmelisin:
   ```
   🥄 Kepçe sunucusu çalışıyor!
      Bu bilgisayardan:  http://localhost:3000
      Telefondan:        http://192.168.1.xx:3000
      ✅ Ollama ve model hazır.
   ```

## 5. Adım — Bilgisayarda aç
Tarayıcıda `http://localhost:3000` adresini aç. Ekle sekmesindeki 📸 butonunun altında
**"Yerel yapay zekâ hazır"** yazmalı.

## 6. Adım — Telefonuna uygulama olarak kur 📱
1. Bilgisayardaki Kepçe'de, Bugün ekranının en üstündeki **"📱 Telefonuna kur"** kartına bas. QR kod çıkar.
2. Telefonun bilgisayarla **aynı Wi-Fi**'de olsun, kamerayla QR'ı okut.
3. **iPhone:** Safari'de açılır → alttaki **Paylaş** (□↑) → **Ana Ekrana Ekle** → Ekle.
   **Android:** Chrome'da açılır → sağ üstteki **⋮** → **Ana ekrana ekle**.
4. Ana ekranında 🥄 Kepçe ikonu çıkar. Bastığında normal bir uygulama gibi tam ekran açılır!

> 💡 Fotoğraf analizi için bilgisayarın açık ve `baslat.bat` penceresi çalışıyor olmalı.
> Yemek, su ve spor kayıtları telefonunda saklanır.
> Bilgisayarının yerel IP adresi değişirse (modem yeniden başlarsa), QR'ı tekrar okutup yeniden eklemen gerekebilir.

> ⏱️ Ekran kartın yoksa bir fotoğrafın analizi 10-60 saniye sürebilir. Bu normal.
> İlk fotoğraf en yavaşıdır, çünkü model o sırada belleğe yükleniyor.

---

## 🧠 Yapay zekâya yeni şeyler öğretmek ("abilik")
`abi-talimati.txt` dosyası yapay zekânın "ders kitabı". İçinde:
- Nasıl davranacağı (Türk mutfağını bilen diyetisyen gibi),
- Cevabı hangi formatta vereceği,
- Yemeklerin referans kalori listesi var.

Yeni bir yemek öğretmek için listenin sonuna aynı formatta bir satır ekle:
```
- Hünkar beğendi: 1 porsiyon ≈ 550 kcal
```
Kaydet. Bir sonraki fotoğrafta yapay zekâ bunu bilir, sunucuyu kapatıp açmana gerek yok.

## ⚡ Daha akıllı bir model denemek
Bilgisayarın güçlüyse (8 GB+ ekran kartı veya 16 GB+ RAM) daha iyi tanıyan bir modeli dene:
```
ollama pull qwen3-vl:4b-instruct
set KEPCE_MODEL=qwen3-vl:4b-instruct
node server.js
```

## 🛠️ Sorun giderme
| Sorun | Çözüm |
|---|---|
| "Node.js bulunamadı" | 1. Adımı yap, sonra bilgisayarı yeniden başlat. |
| "Ollama'ya ulaşılamadı" | Başlat menüsünden Ollama'yı aç, 🦙 simgesi çıksın. |
| "Model bulunamadı" | `ollama pull gemma3:4b` komutunu çalıştır. |
| Telefondan açılmıyor | Aynı Wi-Fi'de misin? Güvenlik duvarında Node.js'e izin verdin mi? |
| Yemekleri yanlış tanıyor | `abi-talimati.txt`'ye ipucu ekle ya da daha güçlü bir model dene. |
| Çok yavaş | Normal, ekran kartı olmadan böyle. Fotoğrafı yakından ve aydınlık çek. |
