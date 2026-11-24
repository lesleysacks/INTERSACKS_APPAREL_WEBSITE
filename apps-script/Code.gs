/**
 * InterSacks Apparel order log.
 *
 * The website still sends every order and quote request to WhatsApp, where payment is arranged.
 * At the same moment it posts a copy here, and this script writes it into the Google Sheet:
 *   Orders            one row per order, with a Status column you update by hand
 *   Order lines       one row per garment in an order
 *   Custom enquiries  one row per quote request from the Custom orders page
 *
 * Setup (see README.md): paste into Extensions → Apps Script on a Google Sheet, run setup() once,
 * then Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 */

var SHEETS = {
  orders: {
    name: 'Orders',
    headers: ['Received', 'Ref', 'Name', 'Delivery area', 'Items', 'Pieces', 'Total shown (R)', 'Status', 'Notes'],
    widths: [150, 140, 160, 170, 420, 70, 120, 130, 240]
  },
  lines: {
    name: 'Order lines',
    headers: ['Ref', 'Garment', 'Product code', 'Colour', 'Size', 'Prints', 'Design codes', 'Qty', 'Unit price (R)', 'Line total (R)', 'Preview', 'Image'],
    widths: [140, 190, 100, 110, 60, 380, 150, 50, 110, 110, 110, 110]
  },
  enquiries: {
    name: 'Custom enquiries',
    headers: ['Received', 'Ref', 'Name', 'Occasion', 'Garment', 'Quantity', 'Needed by', 'Text to print', 'Notes', 'Status'],
    widths: [150, 140, 160, 150, 170, 90, 110, 260, 260, 130]
  }
};

var ORDER_STATUSES = ['New', 'Paid', 'In production', 'Ready', 'Delivered', 'Cancelled'];
var ENQUIRY_STATUSES = ['New', 'Quoted', 'Accepted', 'Declined'];
var MAX_BODY = 30000;
/* Only links to the shop's own website become clickable links or pictures in the sheet. */
var SITE_URL = 'https://lesleysacks.github.io/INTERSACKS_APPAREL_WEBSITE/';
var MAX_LINES = 50;

/** Run once from the editor: creates the three tabs with headers, widths and Status dropdowns. */
function setup() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(function (key) {
    var spec = SHEETS[key];
    var sheet = book.getSheetByName(spec.name) || book.insertSheet(spec.name);
    sheet.getRange(1, 1, 1, spec.headers.length).setValues([spec.headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    spec.widths.forEach(function (width, i) { sheet.setColumnWidth(i + 1, width); });
  });
  addStatusDropdown_(book.getSheetByName(SHEETS.orders.name), 8, ORDER_STATUSES);
  addStatusDropdown_(book.getSheetByName(SHEETS.enquiries.name), 10, ENQUIRY_STATUSES);
  var blank = book.getSheetByName('Sheet1');
  if (blank && book.getSheets().length > 3 && blank.getLastRow() === 0) book.deleteSheet(blank);
  return 'Order log is ready.';
}

function addStatusDropdown_(sheet, column, values) {
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
  sheet.getRange(2, column, sheet.getMaxRows() - 1, 1).setDataValidation(rule);
}

/** Quick check in a browser: opening the /exec URL shows this message. */
function doGet() {
  return json_({ ok: true, message: 'InterSacks order log is running.' });
}

function doPost(e) {
  try {
    var body = e && e.postData ? String(e.postData.contents || '') : '';
    if (!body || body.length > MAX_BODY) return json_({ ok: false, error: 'Empty or too large.' });
    var data = JSON.parse(body);
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (data.type === 'order') return json_(saveOrder_(data));
      if (data.type === 'enquiry') return json_(saveEnquiry_(data));
      return json_({ ok: false, error: 'Unknown type.' });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    return json_({ ok: false, error: 'Could not read the order.' });
  }
}

function saveOrder_(data) {
  var ref = text_(data.ref, 30);
  if (!/^IS-\d{6}-[A-Z0-9]{4}$/.test(ref)) return { ok: false, error: 'Bad reference.' };
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var orders = sheet_(book, 'orders');
  if (refExists_(orders, 2, ref)) return { ok: true, duplicate: true };

  var lines = Array.isArray(data.lines) ? data.lines.slice(0, MAX_LINES) : [];
  if (!lines.length) return { ok: false, error: 'No items.' };
  var rows = lines.map(function (line) {
    var qty = int_(line.qty, 1, 10);
    var unit = money_(line.unitPrice);
    return {
      cells: [ref, text_(line.garment, 80), code_(line.code), text_(line.colour, 40), text_(line.size, 10), text_(line.prints, 400),
        codes_(line.designCodes), qty, unit, qty * unit],
      preview: siteUrl_(line.previewUrl),
      image: siteUrl_(line.imageUrl)
    };
  });
  var pieces = rows.reduce(function (sum, row) { return sum + row.cells[7]; }, 0);
  var summary = rows.map(function (row) {
    var c = row.cells;
    return c[7] + ' × ' + c[1] + (c[2] ? ' ' + c[2] : '') + ' (' + c[3] + ', ' + c[4] + ')' + (c[5] ? ' — ' + c[5] : '') + (c[6] ? ' [' + c[6] + ']' : '');
  }).join('\n');

  orders.appendRow(safe_([new Date(), ref, text_(data.name, 80), text_(data.area, 120), summary, pieces, money_(data.total), 'New', '']));
  var linesSheet = sheet_(book, 'lines');
  var start = linesSheet.getLastRow() + 1;
  // Formulas are built here from checked site URLs only; customer text always goes through safe_().
  var values = rows.map(function (row) {
    return safe_(row.cells).concat([
      row.preview ? '=HYPERLINK("' + row.preview + '","Open build")' : '',
      row.image ? '=IMAGE("' + row.image + '")' : ''
    ]);
  });
  linesSheet.getRange(start, 1, values.length, values[0].length).setValues(values);
  if (rows.some(function (row) { return row.image; })) linesSheet.setRowHeights(start, values.length, 90);
  return { ok: true };
}

function saveEnquiry_(data) {
  var ref = text_(data.ref, 30);
  if (!/^IS-\d{6}-[A-Z0-9]{4}$/.test(ref)) return { ok: false, error: 'Bad reference.' };
  var sheet = sheet_(SpreadsheetApp.getActiveSpreadsheet(), 'enquiries');
  if (refExists_(sheet, 2, ref)) return { ok: true, duplicate: true };
  sheet.appendRow(safe_([
    new Date(), ref, text_(data.name, 80), text_(data.occasion, 60), text_(data.garment, 80),
    text_(data.quantity, 20), text_(data.date, 20), text_(data.printText, 500), text_(data.notes, 1000), 'New'
  ]));
  return { ok: true };
}

/* ---------- helpers ---------- */

function sheet_(book, key) {
  var spec = SHEETS[key];
  var sheet = book.getSheetByName(spec.name);
  if (!sheet) {
    setup();
    sheet = book.getSheetByName(spec.name);
  }
  return sheet;
}

function refExists_(sheet, column, ref) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var from = Math.max(2, last - 499);
  var values = sheet.getRange(from, column, last - from + 1, 1).getValues();
  for (var i = 0; i < values.length; i++) if (values[i][0] === ref) return true;
  return false;
}

function text_(value, max) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

/* A full URL on the shop's own site, with nothing that could break out of a formula string. */
function siteUrl_(value) {
  var url = text_(value, 600);
  if (url.indexOf(SITE_URL) !== 0) return '';
  return /^[A-Za-z0-9\-._~:\/?#\[\]@!$&'()*+,;=%]+$/.test(url) && url.indexOf('"') < 0 ? url : '';
}

function code_(value) {
  var code = text_(value, 12).toUpperCase();
  return /^IS-[DP]\d{2,3}$/.test(code) ? code : '';
}

function codes_(value) {
  return text_(value, 120).split(/\s*,\s*/).map(code_).filter(Boolean).join(', ');
}

function int_(value, min, max) {
  var n = Math.round(Number(value));
  if (!isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function money_(value) {
  var n = Number(value);
  return isFinite(n) && n >= 0 && n < 1000000 ? Math.round(n * 100) / 100 : 0;
}

/* Stop text that starts with = + - @ from being run as a spreadsheet formula. */
function safe_(row) {
  return row.map(function (cell) {
    return typeof cell === 'string' && /^[=+\-@]/.test(cell) ? "'" + cell : cell;
  });
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
