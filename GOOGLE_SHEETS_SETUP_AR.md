# ربط Guest Book بـ Google Sheets + PDF تلقائي

## 1. الشيت

أنشئ Google Sheet، وفي `Sheet1` اكتب في الصف الأول:

```text
timestamp | guest_name | message
```

## 2. Apps Script

افتح **Extensions → Apps Script**، واستبدل الكود الموجود بالكامل بمحتوى:

```text
google-apps-script/Code.gs
```

الكود يقوم تلقائيًا بعد كل رسالة بـ:

- حفظ الاسم والرسالة في الشيت.
- تحديث ملف PDF واحد داخل My Drive.
- نقل النسخة القديمة إلى Trash حتى لا تتراكم الملفات.

تم إلغاء الإيميل بالكامل من النظام.

## 3. التفويض لأول مرة

من Apps Script شغّل الدالة `updateGuestBookPdf` مرة واحدة من قائمة الدوال، ثم وافق على صلاحيات Google Drive. إذا لم توجد رسائل سيُنشئ ملفًا تجريبيًا فارغًا. بعد ذلك أعد نشر Web App.

## 4. النشر

اختر **Deploy → New deployment → Web app**:

- Execute as: **Me**
- Who has access: **Anyone**

بعد تعديل الكود، استخدم **Manage deployments → Edit → New version → Deploy**. غالبًا يظل رابط `/exec` نفسه.

## 5. مكان حفظ PDF

يُحفظ PDF في My Drive افتراضيًا. لو تريد مجلدًا معينًا، ضع Folder ID في:

```javascript
const PDF_FOLDER_ID = "ضع_معرف_المجلد_هنا";
```
