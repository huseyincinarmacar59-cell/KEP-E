# Kepçe yemek veritabanı

- `temel.txt`: Temel gıdalar. Değerler **USDA SR28** (ABD Tarım Bakanlığı, kamu malı) laboratuvar ölçümlerinden çekilir.
- `yemek1-4.txt`: Türk yemekleri ve hazır ürünler. Tipik ev/esnaf tarifine göre 100 g başına **yaklaşık** değerler.
- Biçim: `ad | kategori | kcal,protein,karb,yağ (veya USDA adı) | ölçü:gram;... | diğer adlar`
- `eslestir.py` + `derle.py` ile `db.json` üretilir ve `index.html` içine gömülür.

Yeni yemek eklemek için ilgili dosyaya aynı biçimde bir satır ekle.
