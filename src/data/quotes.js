const MOTIVATIONAL_QUOTES = [
  { text: "Başarı, her gün tekrarlanan küçük çabaların toplamıdır.", author: "Robert Collier" },
  { text: "Bugünün fedakarlıkları, yarının zaferleridir.", author: "YKS Motivasyon" },
  { text: "Hedefine ulaşmak için her gün bir adım at.", author: "Konfüçyüs" },
  { text: "Disiplin, motivasyonun bittiği yerde başlar.", author: "Jim Rohn" },
  { text: "Başarılı insanlar, başkalarının yapmak istemediği şeyleri yapanlardır.", author: "Unknown" },
  { text: "Zor zamanlar güçlü insanlar yaratır.", author: "Atasözü" },
  { text: "Bugün zor olanı yap ki yarın kolay olsun.", author: "Jim Rohn" },
  { text: "Her uzman bir zamanlar acemiydi. Her profesyonel bir zamanlar amatördü.", author: "Helen Hayes" },
  { text: "Çalışmadan başarı, sadece sözlükte başarıdan önce gelir.", author: "Vidal Sassoon" },
  { text: "Yarınların güzelliği, bugün ne yaptığına bağlı.", author: "Mahatma Gandhi" },
  { text: "Küçük adımlar büyük yolculukları başlatır.", author: "Lao Tzu" },
  { text: "Başlamak için mükemmel anı bekleme. Başla ve mükemmelleştir.", author: "Napoleon Hill" },
  { text: "Emek vermeden kazanılan başarı yoktur.", author: "Atatürk" },
  { text: "İmkansız diye bir şey yoktur, sadece zaman alır.", author: "Dan Brown" },
  { text: "Hayallerinin peşinden git, onlar seni nereye götüreceğini bilir.", author: "YKS Motivasyon" },
  { text: "Her gün %1 daha iyi ol. Bir yılda 37 kat daha iyi olursun.", author: "James Clear" },
  { text: "Başarısızlık, yeniden başlamak için bir fırsattır.", author: "Henry Ford" },
  { text: "Azim ve kararlılık her şeye kadirdir.", author: "Calvin Coolidge" },
  { text: "Kendine inan. Sen düşündüğünden daha güçlüsün.", author: "YKS Motivasyon" },
  { text: "Yapabileceğine inanırsan yarı yoldasın demektir.", author: "Theodore Roosevelt" },
  { text: "Bugün dikilecek fidanlar, yarının gölgesini oluşturur.", author: "Atasözü" },
  { text: "Başarı bir yolculuktur, varış noktası değil.", author: "Ben Sweetland" },
  { text: "Tek bir kişi fark yaratabilir ve herkes denemeli.", author: "John F. Kennedy" },
  { text: "Bir saat çalışmak, bir gün hayal kurmaktan değerlidir.", author: "YKS Motivasyon" },
  { text: "Kaybetmekten korkma, denememekten kork.", author: "Atasözü" },
  { text: "İlham bekleyenler fazla bekler. Çalışmaya başla, ilham gelir.", author: "Jack London" },
  { text: "Zorluklar seni güçlendirir, kolay yol seni zayıflatır.", author: "YKS Motivasyon" },
  { text: "Sabır acıdır ama meyvesi tatlıdır.", author: "Jean-Jacques Rousseau" },
  { text: "Geleceği tahmin etmenin en iyi yolu onu yaratmaktır.", author: "Peter Drucker" },
  { text: "Düşen kalem değil, kaldıran el önemlidir.", author: "Atasözü" },
]

export function getDailyQuote() {
  const today = new Date()
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  )
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length]
}

export default MOTIVATIONAL_QUOTES
