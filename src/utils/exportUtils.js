import * as XLSX from 'xlsx'

/**
 * Çalışma kayıtlarını Excel dosyası olarak indir
 * @param {Array} data
 * @param {string} filename
 */
export function exportToExcel(data, filename = 'studylogger-veriler') {
  const formatted = data.map(row => ({
    'Tarih': row.date?.toDate ? row.date.toDate().toLocaleDateString('tr-TR') : new Date(row.date).toLocaleDateString('tr-TR'),
    'Sınav Türü': row.examType,
    'Ders': row.lesson,
    'Konu': row.topic,
    'Toplam Soru': row.questionCount,
    'Doğru': row.correctCount,
    'Yanlış': row.wrongCount,
    'Boş': row.emptyCount,
    'Net': Math.round((row.correctCount - row.wrongCount / 4) * 100) / 100,
    'Süre (dk)': row.duration ? Math.round(row.duration / 60) : '-',
    'Not': row.notes || ''
  }))

  const ws = XLSX.utils.json_to_sheet(formatted)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Çalışma Kayıtları')

  // Column widths
  ws['!cols'] = [
    { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 30 },
    { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 6 },
    { wch: 8 }, { wch: 10 }, { wch: 30 }
  ]

  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * Çalışma kayıtlarını CSV olarak indir
 * @param {Array} data
 * @param {string} filename
 */
export function exportToCSV(data, filename = 'studylogger-veriler') {
  const formatted = data.map(row => ({
    'Tarih': row.date?.toDate ? row.date.toDate().toLocaleDateString('tr-TR') : new Date(row.date).toLocaleDateString('tr-TR'),
    'Sınav Türü': row.examType,
    'Ders': row.lesson,
    'Konu': row.topic,
    'Toplam Soru': row.questionCount,
    'Doğru': row.correctCount,
    'Yanlış': row.wrongCount,
    'Boş': row.emptyCount,
    'Net': Math.round((row.correctCount - row.wrongCount / 4) * 100) / 100,
    'Süre (dk)': row.duration ? Math.round(row.duration / 60) : '',
    'Not': row.notes || ''
  }))

  const ws = XLSX.utils.json_to_sheet(formatted)
  const csv = XLSX.utils.sheet_to_csv(ws)
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
