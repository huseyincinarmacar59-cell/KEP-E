// =============================================================
//  Kepçe yerel sunucu
//  - Kepçe uygulamasını http://localhost:3000 adresinde açar
//  - Tabak fotoğraflarını bilgisayarındaki yapay zekâya (Ollama) sorar
//  Ek paket gerekmez, sadece Node.js yeter.
// =============================================================
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ---- AYARLAR (istersen değiştir) ----
const PORT = 3000;                                    // uygulamanın açılacağı port
const OLLAMA = "http://127.0.0.1:11434";              // Ollama'nın adresi
const MODEL = process.env.KEPCE_MODEL || "gemma3:4b"; // kullanılacak yapay zekâ modeli
const MAX_FOTO = 8 * 1024 * 1024;                     // en fazla 8 MB fotoğraf

const TALIMAT = path.join(__dirname, "abi-talimati.txt");
const PUBLIC = path.join(__dirname, "public");
// Telefona servis edilen dosyalar (sadece bunlar, güvenlik için liste)
const DOSYALAR = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/manifest.webmanifest": ["manifest.webmanifest", "application/manifest+json"],
  "/sw.js": ["sw.js", "text/javascript"],
  "/icon-192.png": ["icon-192.png", "image/png"],
  "/icon-512.png": ["icon-512.png", "image/png"],
  "/icon-maskable-512.png": ["icon-maskable-512.png", "image/png"],
  "/apple-touch-icon.png": ["apple-touch-icon.png", "image/png"],
};
function yerelAdresler() {
  return Object.values(os.networkInterfaces()).flat()
    .filter(a => a && a.family === "IPv4" && !a.internal).map(a => "http://" + a.address + ":" + PORT);
}

// Talimat dosyasını her seferinde yeniden okuyoruz: düzenlersen hemen etkili olur.
function talimatOku() {
  return fs.readFileSync(TALIMAT, "utf8")
    .split("\n").filter(s => !s.trim().startsWith("#")).join("\n");
}

// Yapay zekânın cevabını güvenli hâle getir
function temizle(cevap) {
  let veri;
  try { veri = JSON.parse(cevap); }
  catch {
    const m = String(cevap).match(/\{[\s\S]*\}/);   // JSON'un etrafında yazı varsa ayıkla
    veri = m ? JSON.parse(m[0]) : { yemekler: [] };
  }
  const liste = Array.isArray(veri.yemekler) ? veri.yemekler : [];
  return {
    yemekler: liste.filter(x => x && x.ad).slice(0, 12).map(x => ({
      ad: String(x.ad).slice(0, 60),
      emoji: String(x.emoji || "🍽️").slice(0, 4),
      birim: String(x.birim || "1 porsiyon").slice(0, 40),
      kcal: Math.max(0, Math.min(3000, Math.round(Number(x.kcal) || 0))),
    })),
    not: veri.not ? String(veri.not).slice(0, 200) : "",
  };
}

async function fotoAnaliz(fotoBuffer) {
  const r = await fetch(OLLAMA + "/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      format: "json",
      options: { temperature: 0.2 },
      messages: [
        { role: "system", content: talimatOku() },
        { role: "user", content: "Bu fotoğraftaki yemekleri tanı ve JSON olarak cevap ver.",
          images: [fotoBuffer.toString("base64")] },
      ],
    }),
  });
  if (!r.ok) throw new Error("Ollama hata verdi: " + r.status + " " + (await r.text()).slice(0, 200));
  const j = await r.json();
  return temizle(j.message && j.message.content);
}

function gonder(res, kod, tip, govde) {
  res.writeHead(kod, { "Content-Type": tip, "Cache-Control": "no-store" });
  res.end(govde);
}

const sunucu = http.createServer((req, res) => {
  const yol = req.url.split("?")[0];
  // 1) Uygulamanın dosyaları
  if (req.method === "GET" && DOSYALAR[yol]) {
    const [ad, tip] = DOSYALAR[yol];
    return gonder(res, 200, tip, fs.readFileSync(path.join(PUBLIC, ad)));
  }
  // Telefon bağlantı adresleri (QR kod için)
  if (req.method === "GET" && yol === "/adres") {
    return gonder(res, 200, "application/json", JSON.stringify({ adresler: yerelAdresler() }));
  }
  // 2) Uygulama "sunucu açık mı?" diye sorar
  if (req.method === "GET" && yol === "/saglik") {
    return gonder(res, 200, "application/json", JSON.stringify({ ok: true, model: MODEL }));
  }
  // 3) Fotoğraf analizi
  if (req.method === "POST" && yol === "/analiz") {
    const parcalar = []; let boyut = 0;
    req.on("data", p => {
      boyut += p.length;
      if (boyut > MAX_FOTO) { req.destroy(); return; }
      parcalar.push(p);
    });
    req.on("end", async () => {
      const bas = Date.now();
      try {
        const sonuc = await fotoAnaliz(Buffer.concat(parcalar));
        console.log(`📸 Analiz tamam (${((Date.now() - bas) / 1000).toFixed(1)} sn): ` +
          sonuc.yemekler.map(y => y.ad).join(", "));
        gonder(res, 200, "application/json", JSON.stringify(sonuc));
      } catch (e) {
        console.error("❌ Analiz hatası:", e.message);
        gonder(res, 500, "application/json", JSON.stringify({ hata: e.message }));
      }
    });
    return;
  }
  gonder(res, 404, "text/plain; charset=utf-8", "Bulunamadı");
});

sunucu.listen(PORT, "0.0.0.0", async () => {
  console.log("\n🥄 Kepçe sunucusu çalışıyor!\n");
  console.log("   Bu bilgisayardan:  http://localhost:" + PORT);
  for (const a of yerelAdresler()) console.log("   Telefondan:        " + a);
  console.log("   (Bilgisayarda açınca Bugün ekranında telefon için QR kod çıkar)");
  console.log("\n   Yapay zekâ modeli: " + MODEL);
  console.log("   Kapatmak için bu pencerede Ctrl + C\n");
  await modelHazirla();
});

// Model yoksa kendisi indirir (ilk açılışta ~3 GB, bir kere iner)
async function modelHazirla() {
  let j;
  try { j = await (await fetch(OLLAMA + "/api/tags")).json(); }
  catch {
    console.log("   ⚠️  Ollama'ya ulaşılamadı. Başlat menüsünden Ollama'yı aç, sonra bu pencereyi kapatıp baslat.bat'ı tekrar çalıştır.\n");
    return;
  }
  if ((j.models || []).some(m => m.name === MODEL || m.name === MODEL + ":latest")) {
    console.log("   ✅ Ollama ve model hazır. Fotoğraf analizi çalışıyor!\n");
    return;
  }
  console.log("   📥 Yapay zekâ modeli indiriliyor (" + MODEL + "). İlk sefere mahsus, internet hızına göre birkaç dakika sürer...");
  try {
    const r = await fetch(OLLAMA + "/api/pull", { method: "POST", body: JSON.stringify({ model: MODEL, stream: true }) });
    const okuyucu = r.body.getReader(); const dec = new TextDecoder(); let tampon = "", son = -1;
    while (true) {
      const { done, value } = await okuyucu.read(); if (done) break;
      tampon += dec.decode(value, { stream: true });
      const satirlar = tampon.split("\n"); tampon = satirlar.pop();
      for (const s of satirlar) {
        if (!s.trim()) continue;
        const d = JSON.parse(s);
        if (d.error) throw new Error(d.error);
        if (d.total && d.completed) {
          const yuzde = Math.floor(d.completed / d.total * 100);
          if (yuzde !== son && yuzde % 5 === 0) { son = yuzde; process.stdout.write("\r   📥 %" + yuzde + "   "); }
        }
        if (d.status === "success") console.log("\n   ✅ Model indi! Fotoğraf analizi artık çalışıyor.\n");
      }
    }
  } catch (e) {
    console.log("\n   ❌ Model indirilemedi: " + e.message + "\n   İnterneti kontrol edip baslat.bat'ı tekrar çalıştır.\n");
  }
}
