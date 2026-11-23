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
    { garment: 'Classic Tee', colour: 'Navy', size: 'L', prints: 'Front Centre: Panther Claw; Back: Built Different', qty: 1, unitPrice: 479 },
    { garment: 'Panther Vest', colour: 'Blue / Black', size: 'M', prints: '', qty: 2, unitPrice: 399 }
  ],
  total: 1277
}

test('Apps Script setup() makes the three tabs with headers and Status dropdowns', () => {
  const { context, sheets } = loadScript()
  assert.equal(context.setup(), 'Order log is ready.')
  assert.deepEqual([...sheets.keys()], ['Orders', 'Order lines', 'Custom enquiries'])
  assert.equal(sheets.get('Orders').rows[0][7], 'Status')
  assert.deepEqual([...sheets.get('Orders').validation.rule.list], ['New', 'Paid', 'In production', 'Ready', 'Delivered', 'Cancelled'])
  assert.equal(sheets.get('Custom enquiries').validation.col, 10)
})

test('Apps Script saves an order: one Orders row, one row per line, duplicates ignored', () => {
  const { sheets, post } = loadScript()
  assert.deepEqual(post(order), { ok: true })
  const orders = sheets.get('Orders').rows
  assert.equal(orders.length, 2)
  const [, ref, name, area, items, pieces, total, status] = orders[1]
  assert.deepEqual([ref, name, area, pieces, total, status], ['IS-261123-AB12', 'Ayanda', 'Durban', 3, 1277, 'New'])
  assert.equal(items, '1 × Classic Tee (Navy, L) — Front Centre: Panther Claw; Back: Built Different\n2 × Panther Vest (Blue / Black, M)')
  const lines = sheets.get('Order lines').rows
  assert.deepEqual(lines[2], ['IS-261123-AB12', 'Panther Vest', 'Blue / Black', 'M', '', 2, 399, 798])
  assert.deepEqual(post(order), { ok: true, duplicate: true })
  assert.equal(sheets.get('Orders').rows.length, 2)
})

test('Apps Script blocks spreadsheet formulas, bad input and oversized posts', () => {
  const { sheets, post } = loadScript()
  post({ ...order, ref: 'IS-261123-ZZ99', name: '=HYPERLINK("http://x")', lines: [{ ...order.lines[0], qty: 999, unitPrice: -5 }] })
  const row = sheets.get('Orders').rows[1]
  assert.equal(row[2], '\'=HYPERLINK("http://x")')
  const line = sheets.get('Order lines').rows[1]
  assert.equal(line[5], 10)
  assert.equal(line[6], 0)
  assert.equal(post({ ...order, ref: 'not-a-ref' }).ok, false)
  assert.equal(post({ ...order, ref: 'IS-261123-ZZ98', lines: [] }).ok, false)
  assert.equal(post({ type: 'other' }).ok, false)
  assert.equal(post('x'.repeat(20001)).ok, false)
  assert.equal(post('{not json').ok, false)
})

test('Apps Script saves a custom enquiry', () => {
  const { sheets, post } = loadScript()
  assert.deepEqual(post({ type: 'enquiry', ref: 'IS-270101-AAAA', name: 'Ayanda', occasion: 'Matric & graduation', garment: 'Classic Tee', quantity: '40', date: '2027-09-01', printText: 'Class of 2027', notes: '' }), { ok: true })
  const row = sheets.get('Custom enquiries').rows[1]
  assert.deepEqual(row.slice(1), ['IS-270101-AAAA', 'Ayanda', 'Matric & graduation', 'Classic Tee', '40', '2027-09-01', 'Class of 2027', '', 'New'])
})
