/* Runs apps-script/Code.gs in Node against a small in-memory stand-in for Google Sheets,
   so the order log can be checked before it is pasted into Apps Script. */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

function fakeSheet(name) {
  const rows = []
  const sheet = {
    name,
    rows,
    validation: null,
    getLastRow: () => rows.length,
    getMaxRows: () => 1000,
    setFrozenRows() {},
    setColumnWidth() {},
    appendRow: (row) => rows.push([...row]),
    heights: [],
    setRowHeights(start, count, px) { sheet.heights.push([start, count, px]) },
    getRange(row, col, numRows = 1, numCols = 1) {
      return {
        setValues(values) {
          values.forEach((value, i) => { rows[row - 1 + i] = [...value] })
          return this
        },
        getValues: () => Array.from({ length: numRows }, (_, i) => (rows[row - 1 + i] || []).slice(col - 1, col - 1 + numCols)),
        setFontWeight() { return this },
        setDataValidation(rule) { sheet.validation = { col, rule }; return this }
      }
    }
  }
  return sheet
}

function loadScript() {
  const sheets = new Map()
  const book = {
    getSheetByName: (name) => sheets.get(name) || null,
    insertSheet: (name) => { const s = fakeSheet(name); sheets.set(name, s); return s },
    getSheets: () => [...sheets.values()],
    deleteSheet: (s) => sheets.delete(s.name)
  }
  const context = {
    SpreadsheetApp: {
      getActiveSpreadsheet: () => book,
      newDataValidation: () => ({ requireValueInList(list) { this.list = list; return this }, setAllowInvalid() { return this }, build() { return { list: this.list } } })
    },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (text) => ({ text, setMimeType() { return this } }) },
    Date
  }
  vm.createContext(context)
  vm.runInContext(readFileSync(new URL('../apps-script/Code.gs', import.meta.url), 'utf8'), context)
  const post = (payload) => JSON.parse(context.doPost({ postData: { contents: typeof payload === 'string' ? payload : JSON.stringify(payload) } }).text)
  return { context, sheets, post }
}

const order = {
  type: 'order', ref: 'IS-261123-AB12', name: 'Ayanda', area: 'Durban',
  lines: [
    { garment: 'Classic Tee', code: 'IS-P01', colour: 'Navy', size: 'L', prints: 'Front Centre: Panther Claw; Back: Built Different', designCodes: 'IS-D051, IS-D054', qty: 1, unitPrice: 479,
      previewUrl: 'https://lesleysacks.github.io/INTERSACKS_APPAREL_WEBSITE/product.html?garment=classic-tee&colour=Navy&size=L&front=D051c&back=D054',
      imageUrl: 'https://lesleysacks.github.io/INTERSACKS_APPAREL_WEBSITE/assets/Designs/InterSacks_2026/panther-claw.png' },
    { garment: 'Panther Vest', code: 'IS-P03', colour: 'Blue / Black', size: 'M', prints: '', designCodes: '', qty: 2, unitPrice: 399,
      previewUrl: 'https://lesleysacks.github.io/INTERSACKS_APPAREL_WEBSITE/product.html?garment=panther-vest&size=M', imageUrl: '' }
  ],
  total: 1277
}

test('Apps Script setup() makes the three tabs with headers and Status dropdowns', () => {
  const { context, sheets } = loadScript()
  assert.equal(context.setup(), 'Order log is ready.')
  assert.deepEqual([...sheets.keys()], ['Orders', 'Order lines', 'Custom enquiries'])
  assert.equal(sheets.get('Orders').rows[0][8], 'Status')
  assert.equal(sheets.get('Orders').rows[0][6], 'Discount (R)')
  assert.deepEqual([...sheets.get('Orders').validation.rule.list], ['New', 'Paid', 'In production', 'Ready', 'Delivered', 'Cancelled'])
  assert.equal(sheets.get('Custom enquiries').validation.col, 10)
  assert.equal(sheets.get('Orders').validation.col, 9)
})

test('Apps Script saves an order: one Orders row, one row per line, duplicates ignored', () => {
  const { sheets, post } = loadScript()
  assert.deepEqual(post(order), { ok: true })
  const orders = sheets.get('Orders').rows
  assert.equal(orders.length, 2)
  const [, ref, name, area, items, pieces, discount, total, status] = orders[1]
  assert.deepEqual([ref, name, area, pieces, discount, total, status], ['IS-261123-AB12', 'Ayanda', 'Durban', 3, 0, 1277, 'New'])
  assert.equal(items, '1 × Classic Tee IS-P01 (Navy, L) — Front Centre: Panther Claw; Back: Built Different [IS-D051, IS-D054]\n2 × Panther Vest IS-P03 (Blue / Black, M)')
  const lines = sheets.get('Order lines').rows
  assert.deepEqual(lines[1].slice(0, 10), ['IS-261123-AB12', 'Classic Tee', 'IS-P01', 'Navy', 'L', 'Front Centre: Panther Claw; Back: Built Different', 'IS-D051, IS-D054', 1, 479, 479])
  assert.equal(lines[1][10], '=HYPERLINK("https://lesleysacks.github.io/INTERSACKS_APPAREL_WEBSITE/product.html?garment=classic-tee&colour=Navy&size=L&front=D051c&back=D054","Open build")')
  assert.equal(lines[1][11], '=IMAGE("https://lesleysacks.github.io/INTERSACKS_APPAREL_WEBSITE/assets/Designs/InterSacks_2026/panther-claw.png")')
  assert.deepEqual(lines[2], ['IS-261123-AB12', 'Panther Vest', 'IS-P03', 'Blue / Black', 'M', '', '', 2, 399, 798, '=HYPERLINK("https://lesleysacks.github.io/INTERSACKS_APPAREL_WEBSITE/product.html?garment=panther-vest&size=M","Open build")', ''])
  assert.deepEqual(sheets.get('Order lines').heights, [[2, 2, 90]])
  assert.deepEqual(post(order), { ok: true, duplicate: true })
  assert.equal(sheets.get('Orders').rows.length, 2)
})

test('Apps Script blocks spreadsheet formulas, spoofed links, bad input and oversized posts', () => {
  const { sheets, post } = loadScript()
  post({ ...order, ref: 'IS-261123-ZZ99', name: '=HYPERLINK("http://x")', lines: [{ ...order.lines[0], qty: 999, unitPrice: -5 }] })
  const row = sheets.get('Orders').rows[1]
  assert.equal(row[2], '\'=HYPERLINK("http://x")')
  const line = sheets.get('Order lines').rows[1]
  assert.equal(line[7], 10)
  assert.equal(line[8], 0)
  // Links and pictures only for the shop's own site, and nothing that can break out of the formula.
  post({ ...order, ref: 'IS-261123-ZZ97', lines: [{ ...order.lines[0], code: '=1+1', designCodes: 'IS-D051, evil', previewUrl: 'https://evil.example/x', imageUrl: 'https://lesleysacks.github.io/INTERSACKS_APPAREL_WEBSITE/a"),HYPERLINK("x' }] })
  const spoof = sheets.get('Order lines').rows[2]
  assert.deepEqual(spoof.slice(2, 3), [''])
  assert.equal(spoof[6], 'IS-D051')
  assert.deepEqual(spoof.slice(10), ['', ''])
  assert.equal(post({ ...order, ref: 'not-a-ref' }).ok, false)
  assert.equal(post({ ...order, ref: 'IS-261123-ZZ98', lines: [] }).ok, false)
  assert.equal(post({ type: 'other' }).ok, false)
  assert.equal(post('x'.repeat(30001)).ok, false)
  assert.equal(post('{not json').ok, false)
})

test('Apps Script saves a custom enquiry', () => {
  const { sheets, post } = loadScript()
  assert.deepEqual(post({ type: 'enquiry', ref: 'IS-270101-AAAA', name: 'Ayanda', occasion: 'Matric & graduation', garment: 'Classic Tee', quantity: '40', date: '2027-09-01', printText: 'Class of 2027', notes: '' }), { ok: true })
  const row = sheets.get('Custom enquiries').rows[1]
  assert.deepEqual(row.slice(1), ['IS-270101-AAAA', 'Ayanda', 'Matric & graduation', 'Classic Tee', '40', '2027-09-01', 'Class of 2027', '', 'New'])
})

test('Apps Script records the Family Kit discount next to the total', () => {
  const { sheets, post } = loadScript()
  post({ ...order, ref: 'IS-261124-FAM1', subtotal: 1396, discount: 140, total: 1256 })
  const row = sheets.get('Orders').rows[1]
  assert.deepEqual([row[6], row[7]], [140, 1256])
})
