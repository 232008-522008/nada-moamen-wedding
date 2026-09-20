const SHEET_NAME = "Sheet1";
const PDF_FOLDER_ID = ""; // اتركه فارغًا للحفظ في My Drive أو ضع Folder ID
const PDF_FILE_NAME = "Moamen & Nada - Guest Book.pdf";
const TIME_ZONE = "Africa/Cairo";

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) return json({ success: false, error: "Sheet not found" });

    const data = JSON.parse(e.postData.contents || "{}");
    const guestName = String(data.guest_name || "").trim();
    const message = String(data.message || "").trim();

    if (!guestName || !message) {
      return json({ success: false, error: "الاسم والرسالة مطلوبان" });
    }
    if (guestName.length > 80 || message.length > 500) {
      return json({ success: false, error: "البيانات أطول من الحد المسموح" });
    }
    if (/<script|javascript:|https?:\/\//i.test(`${guestName} ${message}`)) {
      return json({ success: false, error: "المحتوى غير مسموح" });
    }

    sheet.appendRow([new Date(), guestName, message]);
    try { updateGuestBookPdf(); } catch (pdfError) { console.log(pdfError); }
    return json({ success: true });
  } catch (error) {
    console.log(error);
    return json({ success: false, error: "حدث خطأ أثناء الحفظ" });
  }
}

function updateGuestBookPdf() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues().slice(1).filter(row => row[1] && row[2]);
  const cards = values.map(row => {
    const date = row[0] instanceof Date ? Utilities.formatDate(row[0], TIME_ZONE, "dd/MM/yyyy · hh:mm a") : "";
    return `<article class="card"><h2>${escapeHtml(String(row[1]))}</h2><p>${escapeHtml(String(row[2])).replace(/\n/g, "<br>")}</p><small>${date}</small></article>`;
  }).join("\n");

  const html = `<!doctype html><html><head><meta charset="UTF-8"><style>
    @page { size: A4; margin: 22mm 16mm; }
    * { box-sizing: border-box; }
    body { margin:0; direction:rtl; color:#2c161d; background:#fffaf0; font-family:Arial,Tahoma,sans-serif; }
    .cover { text-align:center; padding:28px 0 22px; border-bottom:1px solid #d8b476; margin-bottom:22px; }
    .ornament { color:#d8b476; font-size:24px; }
    h1 { margin:10px 0 4px; color:#3c0c18; font-size:30px; }
    .en { direction:ltr; color:#80686a; font-size:16px; letter-spacing:1px; }
    .card { page-break-inside:avoid; margin:0 0 16px; padding:18px 20px; background:#fbf1df; border:1px solid #ead5ad; border-right:5px solid #d8b476; border-radius:14px 5px 14px 5px; }
    .card h2 { margin:0 0 7px; color:#3c0c18; font-size:19px; }
    .card p { margin:0; color:#5f1525; font-size:16px; line-height:1.9; }
    .card small { display:block; margin-top:9px; color:#80686a; direction:ltr; font-size:10px; }
    .empty { text-align:center; color:#80686a; padding:40px; }
  </style></head><body><header class="cover"><div class="ornament">✦</div><h1>دفتر تهاني مؤمن وندى</h1><div class="en">Moamen & Nada · Guest Book</div></header>${cards || '<p class="empty">لا توجد رسائل بعد</p>'}</body></html>`;

  const pdfBlob = HtmlService.createHtmlOutput(html).getBlob().getAs(MimeType.PDF).setName(PDF_FILE_NAME);
  const folder = PDF_FOLDER_ID ? DriveApp.getFolderById(PDF_FOLDER_ID) : DriveApp.getRootFolder();
  const properties = PropertiesService.getScriptProperties();
  const oldId = properties.getProperty("GUEST_BOOK_PDF_ID");
  if (oldId) {
    try { DriveApp.getFileById(oldId).setTrashed(true); } catch (error) { console.log(error); }
  }
  const newFile = folder.createFile(pdfBlob);
  properties.setProperty("GUEST_BOOK_PDF_ID", newFile.getId());
}

function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
