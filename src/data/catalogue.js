/* InterSacks Apparel — curated storefront manifest.
   Edit catalogue metadata here; machine audit data lives in data/assets.json. */

export const STORE_CONFIG = { whatsappNumber: "27843252262", brandName: "InterSacks Apparel", tagline: "Built Different.", currency: "R" };

export const garments = [
  { id:"classic-tee", name:"Classic Tee", category:"T-Shirts", description:"A clean short-sleeve base for custom InterSacks artwork.", basePrice:349, colours:[
    {name:"Black",value:"#111111",frontImage:"assets/Designs/plain black tshirt.png",backImage:null},
    {name:"White",value:"#f5f5f5",frontImage:"assets/Designs/plain white tshirt.png",backImage:null}
  ], sizes:["S","M","L","XL","2XL"], featured:true, active:true, customizable:true, image:"assets/Designs/plain black tshirt.png" },
  { id:"panther-long-sleeve", name:"Panther Long Sleeve", category:"Long Sleeves", description:"Blue and black Panther long-sleeve set shown from the front and back.", basePrice:499, colours:[{name:"Blue / Black",value:"#1256a3",frontImage:"assets/products/pantherPJ_longsleeve(blue&black) (2).png",backImage:null}], sizes:["S","M","L","XL","2XL"], featured:true, active:true, customizable:false, image:"assets/products/pantherPJ_longsleeve(blue&black) (2).png" },
  { id:"panther-vest", name:"Panther Vest", category:"Vests", description:"Blue and black Panther basketball vest shown from the front and back.", basePrice:399, colours:[{name:"Blue / Black",value:"#1256a3",frontImage:"assets/products/pantherPJ_Vest(blue&black) (1).png",backImage:null}], sizes:["S","M","L","XL","2XL"], featured:true, active:true, customizable:false, image:"assets/products/pantherPJ_Vest(blue&black) (1).png" },
  { id:"skull-tracksuit", name:"Skull Tracksuit", category:"Sets", description:"Black hoodie-and-jogger set with purple skull artwork.", basePrice:899, colours:[{name:"Black / Purple",value:"#17131d",frontImage:"assets/products/product-1.png",backImage:null}], sizes:["S","M","L","XL","2XL"], featured:true, active:true, customizable:false, image:"assets/products/product-1.png" },
  { id:"graphic-long-sleeve", name:"23 Graphic Long Sleeve", category:"Long Sleeves", description:"White long sleeve with colourful basketball and sneaker artwork.", basePrice:449, colours:[{name:"White",value:"#f5f5f5",frontImage:"assets/products/product-2.png",backImage:null}], sizes:["S","M","L","XL","2XL"], featured:false, active:true, customizable:false, image:"assets/products/product-2.png" },
  { id:"cocomelon-sweatshirt", name:"Colour Splash Sweatshirt", category:"Sweatshirts", description:"Black crewneck with colourful character artwork.", basePrice:499, colours:[{name:"Black",value:"#111111",frontImage:"assets/products/product-3.png",backImage:null}], sizes:["Kids S","Kids M","Kids L"], featured:false, active:true, customizable:false, image:"assets/products/product-3.png" },
  { id:"rose-shirt", name:"Rose Panel Shirt", category:"Shirts", description:"White button-up with black panels and red rose detailing.", basePrice:549, colours:[{name:"White / Black",value:"#d8d8d8",frontImage:"assets/products/product-4.jpg",backImage:null}], sizes:["S","M","L","XL","2XL"], featured:false, active:true, customizable:false, image:"assets/products/product-4.jpg" },
  { id:"hip-hop-tee", name:"Hip-Hop Graphic Tee", category:"T-Shirts", description:"White tee with monochrome hip-hop artwork.", basePrice:399, colours:[{name:"White",value:"#f5f5f5",frontImage:"assets/products/product-5.png",backImage:null}], sizes:["S","M","L","XL","2XL"], featured:true, active:true, customizable:false, image:"assets/products/product-5.png" },
  { id:"pop-art-skirt", name:"Pop Art Skirt", category:"Skirts", description:"Pink maxi skirt with colourful pop-art portrait.", basePrice:499, colours:[{name:"Pink",value:"#ed388c",frontImage:"assets/products/product-6.png",backImage:null}], sizes:["S","M","L","XL"], featured:false, active:true, customizable:false, image:"assets/products/product-6.png" },
  { id:"birthday-queen-tee", name:"Birthday Queen Tee", category:"T-Shirts", description:"Black tee with a bright Birthday Queen graphic.", basePrice:399, colours:[{name:"Black",value:"#111111",frontImage:"assets/products/product-7.png",backImage:null}], sizes:["S","M","L","XL","2XL"], featured:false, active:true, customizable:false, image:"assets/products/product-7.png" },
  { id:"rose-tracksuit", name:"Rose Sleeve Tracksuit", category:"Sets", description:"Black hoodie-and-jogger set with rose sleeve artwork.", basePrice:899, colours:[{name:"Black / Pink",value:"#1a151a",frontImage:"assets/products/product-8.png",backImage:null}], sizes:["S","M","L","XL","2XL"], featured:true, active:true, customizable:false, image:"assets/products/product-8.png" }
];

const plannedProducts = [
  ["oversized-tee", "Oversized Tee", "T-Shirts", "Relaxed streetwear tee with a larger print area."],
  ["pullover-hoodie", "Pullover Hoodie", "Hoodies", "Heavyweight hoodie suitable for front, back and sleeve decoration."],
  ["crewneck-sweatshirt", "Crewneck Sweatshirt", "Sweatshirts", "Everyday crewneck for graphic prints or embroidery."],
  ["polo-shirt", "Polo Shirt", "Shirts", "Smart-casual polo for embroidered InterSacks branding."],
  ["tank-top", "Tank Top", "Vests", "Sleeveless warm-weather apparel with a centre-front print area."],
  ["joggers", "Joggers", "Bottoms", "Streetwear joggers for leg prints and small logo placements."],
  ["shorts", "Shorts", "Bottoms", "Casual shorts with compact logo or leg artwork placement."],
  ["bomber-jacket", "Bomber Jacket", "Jackets", "Outerwear concept for embroidered or patch-based decoration."],
  ["denim-jacket", "Denim Jacket", "Jackets", "Structured jacket concept for back artwork and patches."],
  ["baseball-cap", "Baseball Cap", "Headwear", "Six-panel cap concept for front embroidery."],
  ["bucket-hat", "Bucket Hat", "Headwear", "Streetwear headwear concept for embroidered branding."],
  ["beanie", "Beanie", "Headwear", "Cold-weather knit concept for a small embroidered mark."],
  ["tote-bag", "Tote Bag", "Accessories", "Reusable carry bag with a large printable face."],
  ["ceramic-mug", "Ceramic Mug", "Drinkware", "Custom mug concept for wraparound artwork."],
  ["bath-towel", "Bath Towel", "Homeware", "Large towel concept for printed or woven branding."],
  ["hand-towel", "Hand Towel", "Homeware", "Compact towel concept for an embroidered logo."],
  ["apron", "Apron", "Accessories", "Custom apron concept for centre-front artwork."],
  ["socks", "Graphic Socks", "Accessories", "All-over patterned sock concept."]
].map(([id, name, category, description]) => ({
  id, name, category, description, basePrice: 0, colours: [], sizes: [],
  featured: false, active: true, available: false, customizable: false, image: null
}));

garments.push(...plannedProducts);

const designDefaults = { additionalPrice:50, compatibleGarments:["classic-tee"], placements:["front-small","front-center","back-center","left-sleeve"], active:true, printable:true };
const designManifest = [
  ["design-001","Midnight Snake","assets/Designs/0ceea4478c03705b4283b673023e1450.jpg","Graphic",true],
  ["design-002","Crowned Icon","assets/Designs/104e5a912c34fd6898133b672a492a89.jpg","Character",true],
  ["design-003","Pocket Pup","assets/Designs/185ac590435857a9da23b5b7e50d5b99.jpg","Character",false],
  ["design-004","No Pain No Gain","assets/Designs/1a1bb04ef96cca4968e4442c9401c49e.jpg","Typography",true],
  ["design-005","Street Motion","assets/Designs/2.jpg","Graphic",true],
  ["design-006","Swoosh Bear","assets/Designs/210865ccdb490c7bffd0b20d0aabf8c0.jpg","Character",false],
  ["design-007","Ocean Eye","assets/Designs/2f70647aa2391d1f174627eb0437412d.jpg","Abstract",false],
  ["design-008","Colour Runner","assets/Designs/3.jpg","Graphic",true],
  ["design-009","Warrior Study","assets/Designs/38df9a87233dca6f693907a55ed23c46.jpg","Graphic",false],
  ["design-010","Twenty Three","assets/Designs/4.jpg","Graphic",false],
  ["design-011","Marked Warrior","assets/Designs/410b3288fe3732e8f27da47a8fbe478d.jpg","Character",false],
  ["design-012","Colour Crown","assets/Designs/41b2ec497924d2e529e5203ab923aa1f.jpg","Character",false],
  ["design-013","Crown of Thorns","assets/Designs/43847d66a48aa157b606ceaa49f8b386.jpg","Graphic",false],
  ["design-014","Denim Pocket Pup","assets/Designs/4774e8359a7a443c2a00923c0bb19764.jpg","Character",false],
  ["design-015","Psalm 23","assets/Designs/4cba37fb0760fa6073f9b05260a00a42.jpg","Typography",false],
  ["design-016","Let God Handle It","assets/Designs/4cfed7e87630e3a9e7f03c089546cb34.jpg","Typography",true],
  ["design-017","Street Kid","assets/Designs/5.jpg","Character",false],
  ["design-018","Rise Above Limits","assets/Designs/5aec2daaddea1c879fa2fa0465ffb314.jpg","Typography",false],
  ["design-019","Watercolour Lips","assets/Designs/61d2bdc94edd88fb2b640eeead1780ab.jpg","Abstract",false],
  ["design-020","Green Power","assets/Designs/6217097dc119e9777c723f95583f0f14.jpg","Character",false],
  ["design-021","Urban Mask","assets/Designs/701886b7d23d0efaa953e76e24c514b0.jpg","Abstract",false],
  ["design-022","Money Is Power","assets/Designs/79d35d4d6b52cef61c053188ebdcf407.jpg","Typography",false],
  ["design-023","Life Portrait","assets/Designs/8434d7c9eb841e5d27a66d63870c3f74.jpg","Character",false],
  ["design-024","Straw Hat Skull","assets/Designs/8b3e07d634a47bcb523a2576a99ef4c2.jpg","Character",false],
  ["design-025","Small Steps","assets/Designs/8e17fe895871602ebffcc9945dc40be2.jpg","Typography",false],
  ["design-026","Green Dreads","assets/Designs/8f6fcefed0f858c4e00491ed9b53e500.jpg","Character",false],
  ["design-027","Anime Flight","assets/Designs/900628fe35995de3003b1f39e8a15afc.jpg","Character",false],
  ["design-028","Ink Warrior","assets/Designs/92fbef5fa7dd87df06454563690cc17c.jpg","Abstract",false],
  ["design-029","Colour Splash Character","assets/Designs/9317c0dba87e936c9793258679d79b6e.jpg","Character",false],
  ["design-030","Grind","assets/Designs/a9dd8910173127cee9518b9385780180.jpg","Typography",false],
  ["design-031","Neon Street Bear","assets/Designs/abeaaeb96e604c9e013397e78e93e288.jpg","Character",true],
  ["design-032","Make Money Not Friends","assets/Designs/ART_PACKS/ChatGPT Image Jul 20, 2026, 01_21_03 AM.png","Typography",true,true],
  ["design-033","Baby Swoosh","assets/Designs/b9c1055add2f70b517e2e4b9c2cb710e.jpg","Character",false],
  ["design-034","Blue Panther","assets/Designs/ba848dfb063deb99fa0d27f576dd7be6.jpg","Graphic",true],
  ["design-035","Neon Mouse","assets/Designs/c0a17b20fbd83b6a0b96f8f2b154495b.jpg","Character",false],
  ["design-036","Swoosh Collage","assets/Designs/c2d72669feb4303a398b54a9bff14357.jpg","Graphic",false],
  ["design-037","Gold Chain Dog","assets/Designs/c39314c8bf0e0e06a61058a4b50163da.jpg","Character",false],
  ["design-038","Trust God and Pray","assets/Designs/c7ba146fa0f0f376177e2b7f32f6495e.jpg","Typography",true],
  ["design-039","Blue Hat Dog","assets/Designs/c8792f0286f156be8719539bbb3b3e46.jpg","Character",false],
  ["design-040","Classic Swoosh","assets/Designs/dcc13fb91b7a8b4d114cba7e588c98d8.jpg","Typography",false],
  ["design-041","Boss","assets/Designs/ddc04068f181bfd8b41b7517022b71a4.jpg","Typography",false],
  ["design-042","Pop Art Face","assets/Designs/download (1).png","Abstract",true],
  ["design-043","Linework Portrait","assets/Designs/download (3).png","Graphic",false],
  ["design-044","Life Portrait Collage","assets/Designs/download (4).png","Character",false],
  ["design-045","King","assets/Designs/download.png","Typography",false],
  ["design-046","Blue Floral Eye","assets/Designs/e72a20fd85f19d804f6bef00e7518179.jpg","Abstract",false],
  ["design-047","Wild Card","assets/Designs/f98a975d6804ffc745270de2efc0cb51.jpg","Character",true],
  ["design-048","Hip-Hop Animation","assets/Designs/hiphop animation.jpg","Character",false],
  ["design-049","GOAT Records","assets/Designs/LOGOS/494270673_708313071721779_281460282416568802_n.jpg","Logo",false],
  ["design-050","PJH Crest","assets/Designs/LOGOS/images.jpg","Logo",false]
];

/* Artwork and garments hidden from the shop because they show other people's
   trademarks, characters, real people, or another artist's signature.
   The image files are kept. Remove an id here only once you own the rights or
   have written permission to sell it. */
export const RIGHTS_HOLD = {
  "design-002": "The Notorious B.I.G. likeness",
  "design-006": "Nike logo",
  "design-009": "Kratos (God of War)",
  "design-011": "Kratos (God of War)",
  "design-012": "The Notorious B.I.G. likeness",
  "design-017": "Another creator's watermark (TP Store Creations)",
  "design-020": "adidas logo and Hulk (Marvel)",
  "design-022": "Another artist's signature (Urban Surgery)",
  "design-023": "Tupac Shakur likeness",
  "design-024": "One Piece (Straw Hat Jolly Roger)",
  "design-026": "Lil Wayne likeness",
  "design-027": "adidas logo and Goku (Dragon Ball)",
  "design-028": "Zoro (One Piece)",
  "design-029": "Cocomelon character and Nike logo",
  "design-031": "adidas logo",
  "design-033": "Nike logo and Cocomelon character",
  "design-035": "Mickey Mouse (Disney) and Chanel logo",
  "design-036": "Nike logo and Toy Story characters",
  "design-040": "Nike logo",
  "design-044": "Tupac Shakur likeness",
  "design-047": "The Joker (DC)",
  "design-049": "GOAT Records logo (another business)",
  "design-050": "PJH school crest",
  "cocomelon-sweatshirt": "Cocomelon character and Nike logo",
  "rose-tracksuit": "Nissan GT-R logo"
};

export const designs = designManifest.map(([id,name,image,category,featured,transparent]) => ({ ...designDefaults, id,name,image,category,featured, transparentImage:transparent ? image : null, hasUsableTransparency:Boolean(transparent), active: !RIGHTS_HOLD[id] }));

for (const garment of garments) if (RIGHTS_HOLD[garment.id]) garment.active = false;

export const unclassifiedAssets = [
  "assets/Designs/download (2).png",
  "assets/Designs/Screenshot 2026-08-26 210744.png",
  "assets/Designs/WhatsApp Image 2026-07-20 at 16.09.56.jpeg"
];

const placementConfigs = {
  "front-small":{name:"Front Small",price:50,view:"front",styles:{width:"18%",top:"25%",left:"50%",transform:"translateX(-50%)"}},
  "front-center":{name:"Front Centre",price:50,view:"front",styles:{width:"34%",top:"31%",left:"50%",transform:"translateX(-50%)"}},
  "back-center":{name:"Back Centre",price:80,view:"back",styles:{width:"44%",top:"24%",left:"50%",transform:"translateX(-50%)"}},
  "left-sleeve":{name:"Left Sleeve",price:40,view:"front",styles:{width:"9%",top:"26%",left:"80%",transform:"translateX(-50%) rotate(-28deg)"}}
};

/* Design collections. Ids not listed fall back to the design's category. */
const COLLECTION_BY_DESIGN = {
  "design-034":"Panther",
  "design-013":"Faith","design-015":"Faith","design-016":"Faith","design-038":"Faith","design-043":"Faith",
  "design-004":"Grind","design-018":"Grind","design-025":"Grind","design-030":"Grind","design-032":"Grind","design-041":"Grind","design-045":"Grind",
  "design-005":"Street","design-008":"Street","design-010":"Street","design-019":"Street","design-021":"Street","design-042":"Street","design-048":"Street",
  "design-001":"Wild","design-007":"Wild","design-046":"Wild",
  "design-003":"Pups","design-014":"Pups","design-037":"Pups","design-039":"Pups"
};
export const COLLECTION_ORDER = ["Panther","Built Different","Mzansi","Mascot","Skull & Rose","Faith","Grind","Street","Wild","Pups"];
for (const design of designs) design.collection = design.collection || COLLECTION_BY_DESIGN[design.id] || design.category;

export function getGarments(){return garments.filter(g=>g.active)}
export function getGarmentById(id){return garments.find(g=>g.id===id)}
export function getGarmentsByCategory(category){return getGarments().filter(g=>g.category===category)}
export function getFeaturedGarments(){return getGarments().filter(g=>g.featured)}
export function getDesigns(){return designs.filter(d=>d.active)}
export function getDesignById(id){return designs.find(d=>d.id===id)}
export function getDesignsByCategory(category){return getDesigns().filter(d=>d.category===category)}
export function getFeaturedDesigns(){return getDesigns().filter(d=>d.featured)}
export function getCompatibleDesigns(garmentId){return getDesigns().filter(d=>d.compatibleGarments.includes(garmentId))}
export function getPlacementConfig(id){return placementConfigs[id]}
export function getPlacementsForDesign(id){const d=getDesignById(id);return d?d.placements.map(p=>({id:p,...placementConfigs[p]})):[]}
export function getDesignCategories(){return [...new Set(getDesigns().map(d=>d.category))].sort()}
export function getGarmentCategories(){return [...new Set(getGarments().map(g=>g.category))].sort()}
export function artworkPrice(design, placementId = null) {
  if (!design?.active) return 0
  return placementConfigs[placementId]?.price ?? design.additionalPrice
}
export function calculatePrice(garmentId, designId = null, placementId = null) {
  const g = getGarmentById(garmentId)
  const d = designId ? getDesignById(designId) : null
  return g ? g.basePrice + artworkPrice(d, placementId) : 0
}
export function getMinArtworkPrice() {
  return Math.min(...Object.values(placementConfigs).map((p) => p.price))
}
export function getDesignCollections() {
  const present = new Set(getDesigns().map((d) => d.collection))
  return [...COLLECTION_ORDER.filter((c) => present.has(c)), ...[...present].filter((c) => !COLLECTION_ORDER.includes(c)).sort()]
}
export function formatPrice(amount){return `${STORE_CONFIG.currency}${amount}`}

export function isPurchasable(garment) {
  return Boolean(garment && garment.active && garment.available !== false)
}

export function getPurchasableGarments() {
  return getGarments().filter((garment) => garment.available !== false)
}

export function getPlannedGarments() {
  return getGarments().filter((garment) => garment.available === false)
}

export function getPurchasableCategories() {
  return [...new Set(getPurchasableGarments().map((garment) => garment.category))].sort()
}

export function getPriceBreakdown(garmentId, designId = null, placementId = null) {
  const base = calculatePrice(garmentId, null)
  const total = calculatePrice(garmentId, designId, placementId)
  return { base, artwork: total - base, total }
}

export function placementLabel(placementId) {
  if (!placementId || placementId === 'N/A') return 'N/A'
  return getPlacementConfig(placementId)?.name || placementId
}

export function getCartItemImage(item) {
  const garment = getGarmentById(item?.garmentId)
  if (!garment) return null
  const colour = garment.colours?.find((entry) => entry.name === item.colour)
  return colour?.frontImage || garment.image || null
}

export function sortGarments(list, mode = 'featured') {
  const sorted = [...list]
  if (mode === 'price-asc') sorted.sort((a, b) => a.basePrice - b.basePrice || a.name.localeCompare(b.name))
  else if (mode === 'price-desc') sorted.sort((a, b) => b.basePrice - a.basePrice || a.name.localeCompare(b.name))
  else if (mode === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
  else sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name))
  return sorted
}

export function filterGarments(list, { category = 'All', query = '' } = {}) {
  const needle = query.trim().toLowerCase()
  return list.filter((garment) => {
    const categoryMatch = category === 'All' || garment.category === category
    if (!categoryMatch) return false
    if (!needle) return true
    return [garment.name, garment.category, garment.description]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(needle))
  })
}

export function filterDesigns(list, { category = 'All', collection = 'All', query = '' } = {}) {
  const needle = query.trim().toLowerCase()
  return list.filter((design) => {
    const categoryMatch = category === 'All' || design.category === category
    if (!categoryMatch) return false
    if (collection !== 'All' && design.collection !== collection) return false
    if (!needle) return true
    return [design.name, design.category, design.collection].filter(Boolean).some((value) => value.toLowerCase().includes(needle))
  })
}
