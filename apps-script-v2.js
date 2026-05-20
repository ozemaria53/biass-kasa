const SHEET_ID = '1ClCsFAQn41nNIp4NnYFMTETadt33etcuqrUiF3gVflM';

function getOrCreateSheet(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = getOrCreateSheet(ss, 'KasaDB');
    const val = sheet.getRange(1, 1).getValue();
    return ContentService
      .createTextOutput(val || '{}')
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({error: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const payload = JSON.parse(e.postData.contents);
    
    // Ana veri sayfası
    const sheet = getOrCreateSheet(ss, 'KasaDB');
    
    if (payload.action === 'addTx') {
      // Tek işlem ekle — mevcut veriyi oku, işlemi ekle, geri yaz
      const current = sheet.getRange(1,1).getValue();
      const data = current ? JSON.parse(current) : {txs:[], users:[], reminders:[], debtPersons:[]};
      // Duplicate kontrolü
      const exists = data.txs && data.txs.some(t => t.id === payload.tx.id);
      if (!exists) {
        data.txs = data.txs || [];
        data.txs.push(payload.tx);
        sheet.getRange(1,1).setValue(JSON.stringify(data));
        updateLogSheet(ss, data.txs);
      }
      return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (payload.action === 'updateTx') {
      // İşlemi güncelle
      const current = sheet.getRange(1,1).getValue();
      const data = current ? JSON.parse(current) : {txs:[]};
      data.txs = data.txs || [];
      const idx = data.txs.findIndex(t => t.id === payload.tx.id);
      if (idx >= 0) data.txs[idx] = payload.tx;
      sheet.getRange(1,1).setValue(JSON.stringify(data));
      updateLogSheet(ss, data.txs);
      return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (payload.action === 'deleteTx') {
      // İşlemi sil
      const current = sheet.getRange(1,1).getValue();
      const data = current ? JSON.parse(current) : {txs:[]};
      data.txs = (data.txs || []).filter(t => t.id !== payload.txId);
      sheet.getRange(1,1).setValue(JSON.stringify(data));
      updateLogSheet(ss, data.txs);
      return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Tam veri yazma (kullanıcılar, hatırlatıcılar vb.)
    const current = sheet.getRange(1,1).getValue();
    const existing = current ? JSON.parse(current) : {};
    const merged = Object.assign(existing, payload);
    sheet.getRange(1,1).setValue(JSON.stringify(merged));
    if (merged.txs) updateLogSheet(ss, merged.txs);
    
    return ContentService
      .createTextOutput(JSON.stringify({ok: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({error: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function updateLogSheet(ss, txs) {
  if (!txs || !txs.length) return;
  const logSheet = getOrCreateSheet(ss, 'İşlemler');
  logSheet.clearContents();
  logSheet.getRange(1,1,1,9).setValues([['Tarih','Saat','Tür','Kategori','Açıklama','Not','Kullanıcı','Tutar (₺)','Düzenleme']]);
  const rows = txs
    .sort((a,b) => (b.ts||0) - (a.ts||0))
    .map(t => [
      t.date, t.time,
      t.type === 'income' ? 'Giriş' : 'Çıkış',
      t.cat, t.desc || '', t.note || '', t.user || '',
      t.type === 'income' ? t.amount : -t.amount,
      (t.history||[]).length
    ]);
  if (rows.length) logSheet.getRange(2,1,rows.length,9).setValues(rows);
}
