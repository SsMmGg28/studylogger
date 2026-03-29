// YKS Ders ve Konu Listesi
// Alan seçimine göre TYT (herkes) + AYT (alan bazlı) filtrelenir

export const FIELDS = {
  sayisal: { label: 'Sayısal (MF)', value: 'sayisal' },
  sozel: { label: 'Sözel (TS)', value: 'sozel' },
  esit: { label: 'Eşit Ağırlık (TM)', value: 'esit' }
}

export const TYT_LESSONS = {
  turkce: {
    label: 'Türkçe',
    icon: '📖',
    topics: [
      'Sözcükte Anlam',
      'Söz Yorumu',
      'Deyim ve Atasözleri',
      'Cümlede Anlam',
      'Paragrafta Anlam',
      'Paragrafta Yapı',
      'Anlatım Bozuklukları',
      'Ses Bilgisi',
      'Yazım Kuralları',
      'Noktalama İşaretleri',
      'Sözcükte Yapı (Yapım Ekleri)',
      'İsim ve Sıfat',
      'Zamir ve Zarf',
      'Edat - Bağlaç - Ünlem',
      'Fiiller (Eylemler)',
      'Fiilimsi (Eylemsi)',
      'Cümlenin Öğeleri',
      'Cümle Türleri',
      'Fiilde Çatı',
      'Anlatım Türleri'
    ]
  },
  matematik: {
    label: 'Matematik',
    icon: '🔢',
    topics: [
      'Temel Kavramlar',
      'Sayı Basamakları',
      'Bölünebilme Kuralları',
      'EBOB - EKOK',
      'Rasyonel Sayılar',
      'Basit Eşitsizlikler',
      'Mutlak Değer',
      'Üslü Sayılar',
      'Köklü Sayılar',
      'Çarpanlara Ayırma',
      'Oran - Orantı',
      'Denklem Çözme',
      'Problemler (Sayı, Yaş, İşçi, Havuz, Kesir)',
      'Kümeler',
      'Fonksiyonlar',
      'Mantık',
      'Permütasyon - Kombinasyon',
      'Olasılık',
      'Veri Analizi (İstatistik)',
      'Polinomlar',
      '2. Dereceden Denklemler'
    ]
  },
  fizik: {
    label: 'Fizik',
    icon: '⚡',
    topics: [
      'Fizik Bilimine Giriş',
      'Madde ve Özellikleri',
      'Sıvıların Kaldırma Kuvveti',
      'Basınç',
      'Isı ve Sıcaklık',
      'Elektrostatik',
      'Elektrik Akımı',
      'Manyetizma',
      'Dalgalar',
      'Optik'
    ]
  },
  kimya: {
    label: 'Kimya',
    icon: '🧪',
    topics: [
      'Kimya Bilimi',
      'Atom ve Periyodik Sistem',
      'Kimyasal Türler Arası Etkileşimler',
      'Maddenin Halleri',
      'Doğa ve Kimya',
      'Kimyasal Tepkimeler',
      'Kimya Her Yerde',
      'Asitler ve Bazlar',
      'Karışımlar',
      'Endüstride ve Canlılarda Enerji'
    ]
  },
  biyoloji: {
    label: 'Biyoloji',
    icon: '🧬',
    topics: [
      'Canlıların Ortak Özellikleri',
      'Hücre',
      'Canlılar Dünyası',
      'Ekoloji',
      'Mitoz ve Eşeysiz Üreme',
      'Mayoz ve Eşeyli Üreme',
      'Kalıtım',
      'DNA ve Genetik Kod',
      'Ekosistem Ekolojisi',
      'Güncel Çevre Sorunları'
    ]
  },
  tarih: {
    label: 'Tarih',
    icon: '🏛️',
    topics: [
      'Tarih Bilimi',
      'İlk ve Orta Çağlarda Türk Dünyası',
      'İslam Medeniyetinin Doğuşu',
      'Türklerin İslamiyet\'i Kabulü',
      'Beylikten Devlete Osmanlı',
      'Dünya Gücü Osmanlı',
      'Osmanlı Medeniyeti',
      'Avrupa Tarihi',
      'Osmanlı Devleti Duraklama - Gerileme',
      'Osmanlı Devleti XIX. ve XX. Yüzyıl',
      'I. Dünya Savaşı ve Mondros',
      'Kurtuluş Savaşı Hazırlık Dönemi',
      'I. TBMM Dönemi',
      'Mudanya - Lozan'
    ]
  },
  cografya: {
    label: 'Coğrafya',
    icon: '🌍',
    topics: [
      'Doğa ve İnsan',
      'Dünya\'nın Şekli ve Hareketleri',
      'Harita Bilgisi',
      'İklim Bilgisi',
      'Türkiye\'nin İklimi',
      'İç ve Dış Kuvvetler',
      'Türkiye\'nin Yer Şekilleri',
      'Nüfus',
      'Göç',
      'Yerleşme',
      'Türkiye Ekonomisi',
      'Uluslararası Ulaşım Hatları'
    ]
  },
  felsefe: {
    label: 'Felsefe',
    icon: '🤔',
    topics: [
      'Felsefeye Giriş',
      'Bilgi Felsefesi',
      'Varlık Felsefesi',
      'Ahlak Felsefesi',
      'Sanat Felsefesi',
      'Din Felsefesi',
      'Siyaset Felsefesi',
      'Bilim Felsefesi'
    ]
  },
  din: {
    label: 'Din Kültürü',
    icon: '🕌',
    topics: [
      'İnsanın Doğası ve Din',
      'İnanç',
      'İbadet',
      'Hz. Muhammed\'in Hayatı',
      'Kur\'an ve Yorumlanması',
      'Ahlak ve Değerler',
      'Din ve Laiklik',
      'Yaşayan Dinler ve Benzerlikler'
    ]
  }
}

export const AYT_LESSONS = {
  sayisal: {
    matematik: {
      label: 'AYT Matematik',
      icon: '📐',
      topics: [
        'Fonksiyonlar (İleri)',
        'Polinomlar (İleri)',
        'İkinci Dereceden Denklemler (İleri)',
        'Karmaşık Sayılar',
        'Parabol',
        'Trigonometri',
        'Logaritma',
        'Diziler',
        'Seriler',
        'Limit',
        'Türev',
        'Türev Uygulamaları',
        'İntegral',
        'İntegral Uygulamaları',
        'Analitik Geometri',
        'Doğrunun Analitik İncelenmesi',
        'Çemberin Analitik İncelenmesi',
        'Konikler (Elips, Hiperbol, Parabol)'
      ]
    },
    fizik: {
      label: 'AYT Fizik',
      icon: '🔬',
      topics: [
        'Vektörler',
        'Kuvvet ve Hareket',
        'Enerji',
        'İtme ve Momentum',
        'Tork ve Denge',
        'Basit Harmonik Hareket',
        'Dalga Mekaniği',
        'Elektrik Alan ve Potansiyel',
        'Manyetik Alan ve Kuvvet',
        'Elektromanyetik İndüksiyon',
        'Alternatif Akım',
        'Modern Fizik',
        'Atom Fiziği',
        'Radyoaktivite'
      ]
    },
    kimya: {
      label: 'AYT Kimya',
      icon: '⚗️',
      topics: [
        'Kimyasal Türler ve Etkileşimleri',
        'Mol Kavramı',
        'Gazlar',
        'Kimyasal Tepkimelerde Enerji',
        'Tepkime Hızları',
        'Kimyasal Tepkimelerde Denge',
        'Çözünürlük Dengesi',
        'Asitler ve Bazlar (İleri)',
        'Elektrokimya',
        'Organik Kimya',
        'Hidrokarbonlar',
        'Fonksiyonlu Organik Bileşikler',
        'Polimerler',
        'Karbonhidratlar, Yağlar, Proteinler'
      ]
    },
    biyoloji: {
      label: 'AYT Biyoloji',
      icon: '🔬',
      topics: [
        'Nükleik Asitler ve Protein Sentezi',
        'Enzimler',
        'Hücre Bölünmeleri (İleri)',
        'Kalıtım (İleri)',
        'Gen Mühendisliği ve Biyoteknoloji',
        'Canlılarda Enerji Dönüşümleri',
        'Fotosentez',
        'Kemosentez',
        'Bitki Biyolojisi',
        'Sinir Sistemi',
        'Endokrin Sistem',
        'Duyu Organları',
        'Destek ve Hareket Sistemi',
        'Sindirim Sistemi',
        'Dolaşım Sistemi',
        'Solunum Sistemi',
        'Üriner Sistem',
        'Üreme Sistemi',
        'Komünite ve Popülasyon Ekolojisi'
      ]
    }
  },
  sozel: {
    edebiyat: {
      label: 'Edebiyat',
      icon: '✍️',
      topics: [
        'Şiir Bilgisi',
        'Edebi Akımlar',
        'İslamiyet Öncesi Türk Edebiyatı',
        'Geçiş Dönemi Eserleri',
        'Divan Edebiyatı',
        'Halk Edebiyatı',
        'Tanzimat Edebiyatı',
        'Servet-i Fünûn',
        'Fecr-i Âti',
        'Milli Edebiyat',
        'Cumhuriyet Dönemi Türk Edebiyatı',
        'Roman İnceleme',
        'Hikâye İnceleme',
        'Tiyatro',
        'Deneme - Makale - Fıkra - Sohbet'
      ]
    },
    tarih: {
      label: 'AYT Tarih',
      icon: '📜',
      topics: [
        'Atatürk İlkeleri',
        'Atatürk Dönemi İç Politika',
        'Atatürk Dönemi Dış Politika',
        'II. Dünya Savaşı',
        'Soğuk Savaş Dönemi',
        'Yumuşama Dönemi',
        'Sovyetler Birliği\'nin Dağılması',
        'XXI. Yüzyılda Dünya',
        'Toplumsal Devrim Hareketleri',
        'Bilim ve Teknoloji Tarihi',
        'Osmanlı Kültür ve Medeniyeti (İleri)'
      ]
    },
    cografya: {
      label: 'AYT Coğrafya',
      icon: '🗺️',
      topics: [
        'Doğal Sistemler',
        'Beşeri Sistemler',
        'Küresel Ortam: Bölgeler ve Ülkeler',
        'Çevre ve Toplum',
        'Türkiye\'de Nüfus ve Yerleşme',
        'Türkiye\'de Tarım, Hayvancılık, Ormancılık',
        'Türkiye\'de Sanayi ve Enerji',
        'Türkiye\'de Ulaşım ve Ticaret',
        'Türkiye\'de Turizm',
        'Uluslararası Kuruluşlar'
      ]
    }
  },
  esit: {
    matematik: {
      label: 'AYT Matematik',
      icon: '📐',
      // Eşit ağırlık ile sayısal aynı AYT mat konuları
      topics: [
        'Fonksiyonlar (İleri)',
        'Polinomlar (İleri)',
        'İkinci Dereceden Denklemler (İleri)',
        'Karmaşık Sayılar',
        'Parabol',
        'Trigonometri',
        'Logaritma',
        'Diziler',
        'Seriler',
        'Limit',
        'Türev',
        'Türev Uygulamaları',
        'İntegral',
        'İntegral Uygulamaları',
        'Analitik Geometri',
        'Doğrunun Analitik İncelenmesi',
        'Çemberin Analitik İncelenmesi',
        'Konikler (Elips, Hiperbol, Parabol)'
      ]
    },
    edebiyat: {
      label: 'Edebiyat',
      icon: '✍️',
      topics: [
        'Şiir Bilgisi',
        'Edebi Akımlar',
        'İslamiyet Öncesi Türk Edebiyatı',
        'Geçiş Dönemi Eserleri',
        'Divan Edebiyatı',
        'Halk Edebiyatı',
        'Tanzimat Edebiyatı',
        'Servet-i Fünûn',
        'Fecr-i Âti',
        'Milli Edebiyat',
        'Cumhuriyet Dönemi Türk Edebiyatı',
        'Roman İnceleme',
        'Hikâye İnceleme',
        'Tiyatro',
        'Deneme - Makale - Fıkra - Sohbet'
      ]
    },
    tarih: {
      label: 'AYT Tarih',
      icon: '📜',
      topics: [
        'Atatürk İlkeleri',
        'Atatürk Dönemi İç Politika',
        'Atatürk Dönemi Dış Politika',
        'II. Dünya Savaşı',
        'Soğuk Savaş Dönemi',
        'Yumuşama Dönemi',
        'Sovyetler Birliği\'nin Dağılması',
        'XXI. Yüzyılda Dünya',
        'Toplumsal Devrim Hareketleri',
        'Bilim ve Teknoloji Tarihi',
        'Osmanlı Kültür ve Medeniyeti (İleri)'
      ]
    },
    cografya: {
      label: 'AYT Coğrafya',
      icon: '🗺️',
      topics: [
        'Doğal Sistemler',
        'Beşeri Sistemler',
        'Küresel Ortam: Bölgeler ve Ülkeler',
        'Çevre ve Toplum',
        'Türkiye\'de Nüfus ve Yerleşme',
        'Türkiye\'de Tarım, Hayvancılık, Ormancılık',
        'Türkiye\'de Sanayi ve Enerji',
        'Türkiye\'de Ulaşım ve Ticaret',
        'Türkiye\'de Turizm',
        'Uluslararası Kuruluşlar'
      ]
    }
  }
}

/**
 * Kullanıcının alan seçimine göre tüm dersleri getirir (TYT + AYT)
 * @param {string} field - 'sayisal' | 'sozel' | 'esit'
 * @returns {{ tyt: object, ayt: object }}
 */
export function getLessonsByField(field) {
  const ayt = AYT_LESSONS[field] || {}
  return { tyt: TYT_LESSONS, ayt }
}

/**
 * Belirli bir ders ve sınav türü için konuları getirir
 * @param {string} examType - 'TYT' | 'AYT'
 * @param {string} lessonKey - ders anahtarı (orn. 'matematik')
 * @param {string} field - kullanıcının alanı
 * @returns {string[]}
 */
export function getTopics(examType, lessonKey, field) {
  if (examType === 'TYT') {
    return TYT_LESSONS[lessonKey]?.topics || []
  }
  return AYT_LESSONS[field]?.[lessonKey]?.topics || []
}

/**
 * Tüm ders seçeneklerini dropdown için hazır formatta getirir
 * @param {string} examType - 'TYT' | 'AYT'
 * @param {string} field - kullanıcının alanı
 * @returns {Array<{key: string, label: string, icon: string}>}
 */
export function getLessonOptions(examType, field) {
  if (examType === 'TYT') {
    return Object.entries(TYT_LESSONS).map(([key, val]) => ({
      key,
      label: val.label,
      icon: val.icon
    }))
  }
  const aytLessons = AYT_LESSONS[field] || {}
  return Object.entries(aytLessons).map(([key, val]) => ({
    key,
    label: val.label,
    icon: val.icon
  }))
}
