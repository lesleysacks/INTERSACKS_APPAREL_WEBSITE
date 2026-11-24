import test from 'node:test'
import assert from 'node:assert/strict'
import {
  STORE_CONFIG,
  RIGHTS_HOLD,
  designs as allDesigns,
  calculatePrice,
  filterDesigns,
  getDesignCollections,
  getPriceBreakdown,
  filterGarments,
  formatPrice,
  garmentViews,
  getGarmentById,
  getDesigns,
  getGarments,
  getPlannedGarments,
  getPurchasableGarments,
  sortGarments
} from '../src/data/catalogue.js'
import { Cart, createMemoryStorage } from '../src/services/cart.js'
import { Customizer } from '../src/services/customizer.js'
import { createOrderReference, generateCustomEnquiryMessage, generateWhatsAppMessage } from '../src/services/orders.js'
import { buildEnquiryPayload, buildOrderPayload, sendOrderLog } from '../src/services/orderLog.js'
import { buildPreviewUrl, seasonNotifyUrl } from '../src/services/orders.js'
import { initCustomizerFromUrl } from '../src/services/customizer.js'
import { getDesignByCode, getGarmentByCode, SEASON_COLLECTION } from '../src/data/catalogue.js'
import { dropDateLabel, SEASON_DROP } from '../src/data/seasonal.js'

test('Baseline: Store configuration matches expected InterSacks brand settings', () => {
  assert.equal(STORE_CONFIG.brandName, 'InterSacks Apparel')
  assert.equal(STORE_CONFIG.tagline, 'Built Different.')
  assert.equal(STORE_CONFIG.currency, 'R')
  assert.equal(STORE_CONFIG.whatsappNumber, '27843252262')
})

test('Garment catalogue integrity (9 active real products, 19 planned)', () => {
  const allGarments = getGarments()
  const realGarments = allGarments.filter((garment) => garment.available !== false)
  const plannedGarments = allGarments.filter((garment) => garment.available === false)

  assert.equal(allGarments.length, 28, 'Total active garments should be 28 (9 real + 19 planned)')
  assert.equal(realGarments.length, 9, 'Real active garments should be 9')
  assert.ok(realGarments.every((garment) => !RIGHTS_HOLD[garment.id]))
  assert.equal(plannedGarments.length, 19, 'Planned garments should be 19')

  realGarments.forEach((garment) => {
    assert.ok(garment.basePrice > 0, `${garment.id} should have basePrice > 0`)
    assert.ok(garment.colours.length > 0, `${garment.id} should have at least 1 colour`)
    assert.ok(garment.sizes.length > 0, `${garment.id} should have at least 1 size`)
    assert.ok(garment.image, `${garment.id} should have an image`)
  })

  plannedGarments.forEach((garment) => {
    assert.equal(garment.available, false, `${garment.id} should be available: false`)
    assert.equal(garment.basePrice, 0, `${garment.id} basePrice should be 0`)
  })
})

test('Design catalogue integrity (50 in manifest, rights-held designs hidden)', () => {
  const designs = getDesigns()
  assert.equal(allDesigns.length, 62, 'There should be 62 designs in the manifest')
  assert.equal(designs.length, 62 - Object.keys(RIGHTS_HOLD).filter((id) => id.startsWith('design-')).length)
  assert.ok(designs.every((design) => !RIGHTS_HOLD[design.id]))
  designs.forEach((design) => {
    assert.ok(design.id, 'Design must have id')
    assert.ok(design.name, 'Design must have name')
    assert.ok(design.image, 'Design must have image')
    assert.ok(design.category, 'Design must have category')
  })
})

test('Baseline: Price calculations for base garments and customized designs', () => {
  assert.equal(calculatePrice('classic-tee'), 349)
  assert.equal(formatPrice(349), 'R349')
  assert.equal(calculatePrice('classic-tee', 'design-001'), 399)
  assert.equal(calculatePrice('panther-long-sleeve'), 499)
  assert.equal(calculatePrice('skull-tracksuit'), 899)
})

test('Baseline: Cart operations (add, remove, quantity update, clear, subtotal)', () => {
  const cart = new Cart(createMemoryStorage())

  assert.equal(cart.getItemCount(), 0)
  assert.equal(cart.getSubtotal(), 0)
  assert.ok(cart.isEmpty())

  cart.addItem({
    garmentId: 'classic-tee',
    garmentName: 'Classic Tee',
    colour: 'Black',
    size: 'L',
    designId: 'design-001',
    designName: 'Midnight Snake',
    placement: 'front-center',
    unitPrice: 399,
    quantity: 1
  })

  assert.equal(cart.getItemCount(), 1)
  assert.equal(cart.getSubtotal(), 399)
  assert.equal(cart.isEmpty(), false)

  cart.addItem({
    garmentId: 'classic-tee',
    garmentName: 'Classic Tee',
    colour: 'Black',
    size: 'L',
    designId: 'design-001',
    designName: 'Midnight Snake',
    placement: 'front-center',
    unitPrice: 399,
    quantity: 2
  })

  assert.equal(cart.getItemCount(), 3)
  assert.equal(cart.getSubtotal(), 1197)

  cart.updateQuantity(0, 2)
  assert.equal(cart.getItemCount(), 2)
  assert.equal(cart.getSubtotal(), 798)

  cart.removeItem(0)
  assert.equal(cart.getItemCount(), 0)
  assert.ok(cart.isEmpty())
})

test('Baseline: LocalStorage cart persistence', () => {
  const storage = createMemoryStorage()
  const cart1 = new Cart(storage)
  cart1.addItem({
    garmentId: 'panther-vest',
    garmentName: 'Panther Vest',
    colour: 'Blue / Black',
    size: 'XL',
    designId: null,
    designName: 'None',
    placement: 'N/A',
    unitPrice: 399,
    quantity: 1
  })

  const rawStorage = storage.getItem('intersacks-cart')
  assert.ok(rawStorage)
  const parsed = JSON.parse(rawStorage)
  assert.equal(parsed.length, 1)
  assert.equal(parsed[0].garmentId, 'panther-vest')

  const cart2 = new Cart(storage)
  assert.equal(cart2.getItemCount(), 1)
  assert.equal(cart2.getSubtotal(), 399)
})

test('Baseline: WhatsApp order message format generation', () => {
  const cart = new Cart(createMemoryStorage())
  cart.addItem({
    garmentId: 'classic-tee',
    garmentName: 'Classic Tee',
    colour: 'Black',
    size: 'M',
    designId: 'design-001',
    designName: 'Midnight Snake',
    placement: 'front-center',
    unitPrice: 399,
    quantity: 2
  })

  const message = generateWhatsAppMessage(cart)
  assert.ok(message.includes('Hi InterSacks Apparel 👋'))
  assert.ok(message.includes('2 × Classic Tee'))
  assert.ok(message.includes('Colour: Black'))
  assert.ok(message.includes('Size: M'))
  assert.ok(message.includes('• Front Centre: Midnight Snake'))
  assert.ok(message.includes('TOTAL: R798'))
  assert.ok(message.includes('Name:'))
  assert.ok(message.includes('Delivery Area:'))
  assert.ok(message.includes('Built Different.'))
})

test('Baseline: Customizer state management and price updates', () => {
  const customizer = new Customizer()

  customizer.setGarment('classic-tee')
  assert.equal(customizer.selectedGarmentId, 'classic-tee')
  assert.equal(customizer.selectedColourName, 'Black')
  assert.equal(customizer.selectedSize, 'S')
  assert.equal(customizer.getPrice(), 349)

  customizer.setSize('XL')
  assert.equal(customizer.selectedSize, 'XL')

  customizer.setColour('#f5f5f5', 'White')
  assert.equal(customizer.selectedColourName, 'White')

  customizer.setDesign('design-001')
  assert.equal(customizer.selectedDesignId, 'design-001')
  assert.equal(customizer.selectedPlacement, 'front-center')
  assert.equal(customizer.getPrice(), 399)

  const cartItem = customizer.createCartItem()
  assert.equal(cartItem.garmentName, 'Classic Tee')
  assert.equal(cartItem.colour, 'White')
  assert.equal(cartItem.size, 'XL')
  assert.equal(cartItem.designName, 'Midnight Snake')
  assert.equal(cartItem.unitPrice, 399)
  assert.equal(cartItem.quantity, 1)
})

test('Planned garments cannot be selected or purchased', () => {
  const customizer = new Customizer()
  customizer.setGarment('oversized-tee')
  assert.equal(customizer.selectedGarmentId, null)
  assert.equal(getPlannedGarments().length, 19)
  assert.throws(() => customizer.createCartItem(), /not available to order/)
})

test('Shop sort and filter use catalogue fields without mutating the source list', () => {
  const source = getPurchasableGarments()
  const before = source.map((garment) => garment.id).join('|')
  const priced = sortGarments(filterGarments(source, { category: 'T-Shirts', query: 'tee' }), 'price-asc')
  assert.ok(priced.length >= 2)
  assert.ok(priced.every((garment) => garment.category === 'T-Shirts'))
  assert.ok(priced[0].basePrice <= priced[1].basePrice)
  assert.equal(source.map((garment) => garment.id).join('|'), before)
})

test('Custom quantity is priced per unit and rejected outside 1 to 10', () => {
  const customizer = new Customizer()
  customizer.setGarment('classic-tee')
  customizer.setQuantity(3)
  const item = customizer.createCartItem()
  assert.equal(item.quantity, 3)
  assert.equal(item.unitPrice, 349)

  const cart = new Cart(createMemoryStorage())
  cart.addItem(item)
  assert.equal(cart.getSubtotal(), 1047)
  assert.throws(() => cart.updateQuantity(0, 11), /1 to 10/)
})

test('Adding the same piece again cannot push a line past 10', () => {
  const cart = new Cart(createMemoryStorage())
  const item = { garmentId: 'classic-tee', garmentName: 'Classic Tee', colour: 'Black', size: 'M', designId: null, designName: 'None', placement: 'N/A', unitPrice: 349, quantity: 8 }
  cart.addItem(item)
  assert.throws(() => cart.addItem(item), /up to 10/)
  assert.equal(cart.items[0].quantity, 8)
  cart.addItem({ ...item, quantity: 2 })
  assert.equal(cart.items[0].quantity, 10)
})

test('Saved bag lines for pieces no longer in the shop are dropped', () => {
  const cart = new Cart(createMemoryStorage())
  cart.addItem({ garmentId: 'classic-tee', colour: 'Black', size: 'M', designId: null, placement: 'N/A', unitPrice: 349, quantity: 1 })
  cart.addItem({ garmentId: 'rose-tracksuit', colour: 'Black / Pink', size: 'M', designId: null, placement: 'N/A', unitPrice: 899, quantity: 1 })
  cart.prune((entry) => entry.garmentId !== 'rose-tracksuit')
  assert.deepEqual(cart.items.map((entry) => entry.garmentId), ['classic-tee'])
})

test('Order message carries the customer name, area and reference', () => {
  const cart = new Cart(createMemoryStorage())
  cart.addItem({ garmentId: 'classic-tee', garmentName: 'Classic Tee', colour: 'Black', size: 'M', designId: null, designName: 'None', placement: 'N/A', unitPrice: 349, quantity: 1 })
  const reference = createOrderReference(new Date(2026, 10, 19), () => 0.5)
  assert.match(reference, /^IS-261119-[0-9A-Z]{4}$/)
  const message = generateWhatsAppMessage(cart, { name: ' Thabo ', area: 'Soweto', reference })
  assert.ok(message.includes(`(ref ${reference})`))
  assert.ok(message.includes('Name: Thabo\n'))
  assert.ok(message.includes('Delivery Area: Soweto'))
})

test('Print position sets the artwork price', () => {
  assert.equal(calculatePrice('classic-tee', 'design-001', 'front-small'), 399)
  assert.equal(calculatePrice('classic-tee', 'design-001', 'back-center'), 429)
  assert.equal(calculatePrice('classic-tee', 'design-001', 'left-sleeve'), 389)
  assert.equal(getPriceBreakdown('classic-tee', 'design-001', 'back-center').artwork, 80)
  const customizer = new Customizer()
  customizer.setGarment('classic-tee')
  customizer.setZoneDesign('back', 'design-001')
  const item = customizer.createCartItem()
  assert.equal(item.unitPrice, 429)
  assert.deepEqual(item.prints.map((print) => print.placement), ['back-center'])
})

test('Prints on several spots add up: front + back + sleeve = R519', () => {
  const customizer = new Customizer()
  customizer.setGarment('classic-tee')
  customizer.setColour('#1d2a44', 'Navy')
  customizer.setZoneDesign('front', 'design-051')
  customizer.setZoneDesign('back', 'design-054')
  customizer.setActiveZone('right-sleeve')
  assert.equal(customizer.viewMode, 'front')
  customizer.setDesign('design-055')
  assert.equal(customizer.getPrice(), 349 + 50 + 80 + 40)
  customizer.setZonePlacement('front', 'front-small')
  assert.equal(customizer.getPrice(), 519)
  const item = customizer.createCartItem()
  assert.equal(item.unitPrice, 519)
  assert.deepEqual(item.prints.map((print) => `${print.placement}:${print.designName}`), [
    'front-small:Panther Claw',
    'back-center:Built Different',
    'right-sleeve:IS Crest'
  ])
  customizer.clearZone('back')
  assert.equal(customizer.getPrice(), 439)
  customizer.setActiveZone('back')
  assert.equal(customizer.viewMode, 'back')
})

test('Bag lines merge only when every print matches', () => {
  const cart = new Cart(createMemoryStorage())
  const line = (prints) => ({ garmentId: 'classic-tee', garmentName: 'Classic Tee', colour: 'Navy', size: 'M', prints, designName: 'x', unitPrice: 469, quantity: 1 })
  cart.addItem(line([{ placement: 'front-center', designId: 'design-051', designName: 'Panther Claw' }, { placement: 'back-center', designId: 'design-054', designName: 'Built Different' }]))
  cart.addItem(line([{ placement: 'back-center', designId: 'design-054', designName: 'Built Different' }, { placement: 'front-center', designId: 'design-051', designName: 'Panther Claw' }]))
  assert.equal(cart.items.length, 1)
  assert.equal(cart.items[0].quantity, 2)
  cart.addItem(line([{ placement: 'front-center', designId: 'design-051', designName: 'Panther Claw' }]))
  assert.equal(cart.items.length, 2)
})

test('A bag saved before multi-spot printing still loads', () => {
  const storage = createMemoryStorage()
  storage.setItem('intersacks-cart', JSON.stringify([{ garmentId: 'classic-tee', garmentName: 'Classic Tee', colour: 'Black', size: 'L', designId: 'design-001', designName: 'Midnight Snake', placement: 'left-sleeve', unitPrice: 389, quantity: 1 }]))
  const cart = new Cart(storage)
  assert.deepEqual(cart.items[0].prints, [{ placement: 'left-sleeve', designId: 'design-001', designName: 'Midnight Snake' }])
  assert.equal(cart.items[0].designId, undefined)
  const message = generateWhatsAppMessage(cart)
  assert.ok(message.includes('• Left Sleeve: Midnight Snake'))
})

test('WhatsApp message lists every print on a tee', () => {
  const customizer = new Customizer()
  customizer.setGarment('classic-tee')
  customizer.setZoneDesign('front', 'design-051')
  customizer.setZoneDesign('back', 'design-054')
  customizer.setZoneDesign('left-sleeve', 'design-055')
  const cart = new Cart(createMemoryStorage())
  cart.addItem(customizer.createCartItem())
  const message = generateWhatsAppMessage(cart)
  assert.ok(message.includes('Prints (3):'))
  assert.ok(message.includes('• Front Centre: Panther Claw'))
  assert.ok(message.includes('• Back: Built Different'))
  assert.ok(message.includes('• Left Sleeve: IS Crest'))
  assert.ok(message.includes('Price: R519'))
})

test('Every Classic Tee colour has a front and back photo, and cut-outs are used for print', () => {
  const tee = getGarments().find((garment) => garment.id === 'classic-tee')
  assert.deepEqual(tee.colours.map((colour) => colour.name), ['Black', 'White', 'Navy', 'Charcoal', 'Sand', 'Olive', 'Pink', 'Light blue'])
  for (const colour of tee.colours) {
    assert.match(colour.frontImage, /classic-tee\/.+-front\.webp$/)
    assert.match(colour.backImage, /classic-tee\/.+-back\.webp$/)
  }
  const panther = getDesigns().find((design) => design.id === 'design-034')
  assert.equal(panther.transparentImage, 'assets/Designs/cutouts/design-034.webp')
  assert.ok(panther.hasUsableTransparency)
})

test('Designs can be filtered by collection', () => {
  const collections = getDesignCollections()
  assert.ok(collections.includes('Faith'))
  assert.ok(collections.includes('Panther'))
  const faith = filterDesigns(getDesigns(), { collection: 'Faith' })
  assert.ok(faith.length >= 5)
  assert.ok(faith.every((design) => design.collection === 'Faith'))
  assert.ok(getDesigns().every((design) => design.collection))
})

test('Custom order enquiry message lists the request', () => {
  const message = generateCustomEnquiryMessage({ occasion: 'matric', garment: 'Classic Tee', quantity: '40', date: '2027-09-01', printText: 'Class of 2027', name: 'Ayanda', reference: 'IS-270101-AAAA' })
  assert.ok(message.includes('Occasion: Matric & graduation'))
  assert.ok(message.includes('Quantity: 40'))
  assert.ok(message.includes('Text / names to print: Class of 2027'))
  assert.ok(message.includes('Name: Ayanda'))
  assert.ok(message.includes('(ref IS-270101-AAAA)'))
  const blank = generateCustomEnquiryMessage({ name: 'Sipho' })
  assert.ok(blank.includes('Garment: Not sure yet'))
  assert.ok(!blank.includes('Notes:'))
})

test('InterSacks 2026 originals are live, transparent and grouped', () => {
  const originals = getDesigns().filter((design) => design.image.includes('InterSacks_2026'))
  assert.equal(originals.length, 12)
  assert.ok(originals.every((design) => design.active && design.hasUsableTransparency && design.transparentImage === design.image))
  for (const collection of ['Panther', 'Built Different', 'Mzansi', 'Mascot', 'Skull & Rose']) {
    assert.ok(originals.some((design) => design.collection === collection), collection)
  }
})

test('Search suggestions rank prefixes first and skip hidden designs', async () => {
  const { getSearchSuggestions, matchText } = await import('../src/data/search.js')
  assert.deepEqual(getSearchSuggestions(''), [])
  assert.deepEqual(getSearchSuggestions('   '), [])
  const pan = getSearchSuggestions('pan')
  assert.ok(pan.length > 0)
  assert.ok(pan[0].label.toLowerCase().startsWith('pan'), 'a prefix match comes first')
  assert.ok(pan.some((item) => item.type === 'garment' && item.id === 'panther-vest'))
  assert.ok(pan.some((item) => item.type === 'collection' && item.label === 'Panther'))
  assert.equal(pan[0].match.start, 0)
  // Rights-held designs never show up.
  assert.ok(!getSearchSuggestions('swoosh').length)
  assert.ok(!getSearchSuggestions('straw hat').some((item) => item.type === 'design'))
  // Word-start beats a match in the middle of a word.
  assert.ok(matchText('No Pain No Gain', 'pain').rank === 1)
  assert.ok(matchText('Champain', 'pain').rank === 2)
  assert.ok(getSearchSuggestions('faith').some((item) => item.type === 'collection'))
  assert.ok(getSearchSuggestions('t-sh').some((item) => item.type === 'category' && item.category === 'T-Shirts'))
  assert.ok(getSearchSuggestions('a', 5).length <= 5)
})

test('Fullscreen views: Classic Tee shows front and back, ready-made pieces show the photos they have', () => {
  const tee = getGarmentById('classic-tee')
  assert.deepEqual(garmentViews(tee, tee.colours[2]).map((view) => view.label), ['Front', 'Back'])
  assert.match(garmentViews(tee, tee.colours[2])[1].src, /navy-back/)
  assert.deepEqual(garmentViews(getGarmentById('panther-vest')).map((view) => view.label), ['Front and back'])
  assert.deepEqual(garmentViews(getGarmentById('hip-hop-tee')).map((view) => view.label), ['Front'])
})

test('Quick add from the shop: same piece and size merges, and the order has no print lines', () => {
  const cart = new Cart(createMemoryStorage())
  const vest = { garmentId: 'panther-vest', garmentName: 'Panther Vest', colour: 'Blue / Black', size: 'L', prints: [], designName: 'None', unitPrice: 399, quantity: 1 }
  cart.addItem({ ...vest })
  cart.addItem({ ...vest })
  cart.addItem({ ...vest, size: 'M' })
  assert.equal(cart.items.length, 2)
  assert.equal(cart.items[0].quantity, 2)
  const message = generateWhatsAppMessage(cart)
  assert.ok(message.includes('2 × Panther Vest'))
  assert.ok(!message.includes('Print'))
  assert.ok(message.includes('TOTAL: R1197'))
})

test('Order log: the Sheet copy carries the same ref, every line, its prints and the total', () => {
  const customizer = new Customizer()
  customizer.setGarment('classic-tee')
  customizer.setColour('#1d2a44', 'Navy')
  customizer.setSize('L')
  customizer.setZoneDesign('front', 'design-051')
  customizer.setZoneDesign('back', 'design-054')
  const cart = new Cart(createMemoryStorage())
  cart.addItem(customizer.createCartItem())
  cart.addItem({ garmentId: 'panther-vest', garmentName: 'Panther Vest', colour: 'Blue / Black', size: 'M', prints: [], designName: 'None', unitPrice: 399, quantity: 2 })
  const ref = 'IS-261123-AB12'
  const payload = buildOrderPayload(cart, { ref, name: ' Ayanda ', area: 'Durban ' })
  assert.equal(payload.type, 'order')
  assert.equal(payload.ref, ref)
  assert.equal(payload.name, 'Ayanda')
  assert.equal(payload.area, 'Durban')
  assert.equal(payload.total, 479 + 798)
  const site = 'https://lesleysacks.github.io/INTERSACKS_APPAREL_WEBSITE/'
  assert.deepEqual(payload.lines[0], {
    garment: 'Classic Tee', code: 'IS-P01', colour: 'Navy', size: 'L', prints: 'Front Centre: Panther Claw; Back: Built Different',
    designCodes: 'IS-D051, IS-D054', qty: 1, unitPrice: 479,
    previewUrl: `${site}product.html?garment=classic-tee&colour=Navy&size=L&front=D051c&back=D054`,
    imageUrl: `${site}assets/Designs/InterSacks_2026/panther-claw.png`
  })
  assert.equal(payload.lines[1].code, 'IS-P03')
  assert.equal(payload.lines[1].designCodes, '')
  assert.equal(payload.lines[1].previewUrl, `${site}product.html?garment=panther-vest&size=M`)
  assert.match(payload.lines[1].imageUrl, /^https:\/\/lesleysacks\.github\.io\/INTERSACKS_APPAREL_WEBSITE\/assets\/products\/pantherPJ_Vest\(blue&black\)%20\(1\)\.png$/)
  assert.ok(generateWhatsAppMessage(cart, { reference: ref }).includes(`(ref ${ref})`))
})

test('Order log: quote requests carry the occasion name, and logging stays off without a URL', () => {
  const payload = buildEnquiryPayload({ occasion: 'matric', garment: 'Classic Tee', quantity: 40, date: '2027-09-01', printText: ' Class of 2027 ', notes: '', name: 'Ayanda', reference: 'IS-270101-AAAA' })
  assert.deepEqual(payload, { type: 'enquiry', ref: 'IS-270101-AAAA', name: 'Ayanda', occasion: 'Matric & graduation', garment: 'Classic Tee', quantity: '40', date: '2027-09-01', printText: 'Class of 2027', notes: '' })
  assert.equal(sendOrderLog(payload, ''), false)
  assert.equal(sendOrderLog(payload), false)
})

test('Every design and ready-made piece has a unique permanent code', () => {
  const designCodes = allDesigns.map((design) => design.code)
  assert.equal(new Set(designCodes).size, allDesigns.length)
  assert.ok(designCodes.every((code) => /^IS-D\d{3}$/.test(code)))
  assert.equal(getDesignByCode('IS-D051').name, 'Panther Claw')
  assert.equal(getDesignByCode('d51').name, 'Panther Claw')
  const liveCodes = getPurchasableGarments().map((garment) => garment.code)
  assert.deepEqual(liveCodes, ['IS-P01', 'IS-P02', 'IS-P03', 'IS-P04', 'IS-P05', 'IS-P06', 'IS-P07', 'IS-P08', 'IS-P09'])
  assert.equal(getGarmentByCode('P03').name, 'Panther Vest')
  assert.equal(filterDesigns(getDesigns(), { query: 'D059' })[0].name, 'Braai Master Cub')
})

test('A preview link rebuilds the exact tee: colour, size, every print and the price', () => {
  const original = new Customizer()
  original.setGarment('classic-tee')
  original.setColour('#a9c8e8', 'Light blue')
  original.setSize('XL')
  original.setZoneDesign('front', 'design-051')
  original.setZonePlacement('front', 'front-small')
  original.setZoneDesign('back', 'design-054')
  original.setZoneDesign('right-sleeve', 'design-055')
  const item = original.createCartItem()
  const url = buildPreviewUrl(item, '')
  assert.equal(url, 'product.html?garment=classic-tee&colour=Light+blue&size=XL&front=D051s&back=D054&rs=D055')
  const copy = new Customizer()
  initCustomizerFromUrl(copy, Object.fromEntries(new URL(url, 'https://example.test/').searchParams))
  assert.deepEqual(copy.createCartItem(), item)
})

test('WhatsApp order lists codes and a preview link for each piece', () => {
  const customizer = new Customizer()
  customizer.setGarment('classic-tee')
  customizer.setZoneDesign('front', 'design-051')
  const cart = new Cart(createMemoryStorage())
  cart.addItem(customizer.createCartItem())
  const message = generateWhatsAppMessage(cart)
  assert.ok(message.includes('1 × Classic Tee (IS-P01)'))
  assert.ok(message.includes('• Front Centre: Panther Claw (IS-D051)'))
  assert.ok(message.includes('Preview: https://lesleysacks.github.io/INTERSACKS_APPAREL_WEBSITE/product.html?garment=classic-tee&colour=Black&size=S&front=D051c'))
})

test('Festive Summer: filters, drop tabs and Notify me message', () => {
  const seasonal = filterDesigns(getDesigns(), { collection: SEASON_COLLECTION })
  assert.deepEqual(seasonal.map((design) => design.code), ['IS-D056', 'IS-D057', 'IS-D058', 'IS-D059'])
  assert.ok(getDesignCollections()[0] === SEASON_COLLECTION)
  assert.deepEqual(filterGarments(getPurchasableGarments(), { category: SEASON_COLLECTION }).map((g) => g.id), ['classic-tee'])
  assert.deepEqual(SEASON_DROP.tabs.map((tab) => tab.label), ['Summer', 'Festive'])
  for (const tab of SEASON_DROP.tabs) for (const entry of tab.available) assert.ok(getDesigns().some((design) => design.id === entry.designId))
  assert.equal(getPlannedGarments().find((g) => g.id === 'summer-set').season, 'summer')
  assert.equal(dropDateLabel(null), 'Dropping this December')
  assert.equal(dropDateLabel('2026-12-01'), 'Drops 1 December')
  const notify = decodeURIComponent(seasonNotifyUrl('Summer Set: Tee + Shorts', 'Summer'))
  assert.ok(notify.startsWith('https://wa.me/27843252262?text='))
  assert.ok(notify.includes('Please let me know when the Festive Summer drop lands, especially: Summer Set: Tee + Shorts (Summer).'))
})
