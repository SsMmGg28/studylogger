/**
 * Süreyi saat:dakika:saniye formatına çevirir
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Süreyi okunabilir metne çevirir (ör. "2 saat 15 dakika")
 * @param {number} seconds
 * @returns {string}
 */
export function formatDurationText(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0 && m > 0) return `${h} saat ${m} dk`
  if (h > 0) return `${h} saat`
  if (m > 0) return `${m} dk`
  return `${seconds} sn`
}

/**
 * Tarihi TR formatında gösterir
 * @param {Date|{toDate: Function}|string} date
 * @returns {string}
 */
export function formatDate(date) {
  const d = date?.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Tarihi kısa TR formatında gösterir
 * @param {Date|{toDate: Function}|string} date
 * @returns {string}
 */
export function formatDateShort(date) {
  const d = date?.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short'
  })
}

/**
 * Tarihi YYYY-MM-DD formatına çevirir (input[type=date] için)
 * @param {Date} date
 * @returns {string}
 */
export function toDateInputValue(date = new Date()) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Net soru hesaplar (doğru - yanlış/4)
 */
export function calculateNet(correct, wrong) {
  return Math.round((correct - wrong / 4) * 100) / 100
}
