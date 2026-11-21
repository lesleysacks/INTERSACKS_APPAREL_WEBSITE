/* 3D tee viewer. Loaded only when a customer opens the 3D view.
   The tee is built in code (no model file): a T-shirt outline is extruded into a soft, padded body,
   and the front and back faces carry canvas textures with the fabric colour and the chosen artwork.
   Outline and print positions share the 2D photo's square coordinate space (0..1, y down),
   so the existing placement percentages map straight onto the 3D shirt. */
import {
  CanvasTexture,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  LinearFilter,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { drawPrint, loadImage } from './printComposite.js'

const SIZE = 2 // world units across the square
const DEPTH = 0.06 // body thickness before bevel
const BEVEL = 0.07
const TEX = 1024

/* Outline points in square coordinates (u right, v down), measured on the Canva AI tee photo. */
const OUTLINE = [
  [0.393, 0.08],
  [0.305, 0.12],
  [0.239, 0.15],
  [0.186, 0.2],
  [0.131, 0.3],
  [0.1, 0.36],
  [0.13, 0.425],
  [0.228, 0.45],
  [0.281, 0.5],
  [0.279, 0.7],
  [0.268, 0.9],
  [0.272, 0.925],
  [0.5, 0.932],
  [0.728, 0.925],
  [0.732, 0.9],
  [0.721, 0.7],
  [0.719, 0.5],
  [0.772, 0.45],
  [0.87, 0.425],
  [0.9, 0.36],
  [0.869, 0.3],
  [0.814, 0.2],
  [0.761, 0.15],
  [0.695, 0.12],
  [0.607, 0.08]
]

const toWorld = ([u, v]) => new Vector2((u - 0.5) * SIZE, (0.5 - v) * SIZE)

function teeShape() {
  const shape = new Shape()
  const [first, ...rest] = OUTLINE.map(toWorld)
  shape.moveTo(first.x, first.y)
  for (const point of rest) shape.lineTo(point.x, point.y)
  // Neckline: a curve dipping from the right collar back to the left collar.
  const right = toWorld([0.607, 0.08])
  const left = toWorld([0.393, 0.08])
  const dip = toWorld([0.5, 0.14])
  shape.bezierCurveTo(right.x - 0.05, dip.y, left.x + 0.05, dip.y, left.x, left.y)
  return shape
}

/* Map ShapeGeometry UVs onto the square texture. `mirror` flips u for the back face. */
function squareUVs(geometry, mirror) {
  const pos = geometry.attributes.position
  const uv = geometry.attributes.uv
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) / SIZE + 0.5
    uv.setXY(i, mirror ? 1 - u : u, pos.getY(i) / SIZE + 0.5)
  }
  uv.needsUpdate = true
}

function shade(hex, amount) {
  const color = new Color(hex)
  color.offsetHSL(0, 0, amount)
  return `#${color.getHexString()}`
}

/* Draw fabric + every print for this face, using the 2D placement styles (percentages). */
function paintFace(canvas, fabric, prints) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, TEX, TEX)
  const grad = ctx.createLinearGradient(0, 0, TEX, 0)
  grad.addColorStop(0, shade(fabric, -0.06))
  grad.addColorStop(0.5, shade(fabric, 0.03))
  grad.addColorStop(1, shade(fabric, -0.06))
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, TEX, TEX)
  // Soft vertical fold lines.
  ctx.globalAlpha = 0.06
  for (const x of [0.36, 0.52, 0.64]) {
    const fold = ctx.createLinearGradient(TEX * (x - 0.03), 0, TEX * (x + 0.03), 0)
    fold.addColorStop(0, 'rgba(0,0,0,0)')
    fold.addColorStop(0.5, '#000')
    fold.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = fold
    ctx.fillRect(TEX * (x - 0.03), TEX * 0.35, TEX * 0.06, TEX * 0.6)
  }
  ctx.globalAlpha = 1
  for (const { image, styles } of prints) drawPrint(ctx, image, styles, TEX)
}

export function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function createTeeViewer(container, { reducedMotion = false } = {}) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.domElement.className = 'tee3d-canvas'
  container.appendChild(renderer.domElement)

  const scene = new Scene()
  const camera = new PerspectiveCamera(32, 1, 0.1, 50)
  camera.position.set(0, 0.15, 4.4)

  scene.add(new HemisphereLight(0xffffff, 0xb8b2a6, 2.3))
  const key = new DirectionalLight(0xffffff, 1.9)
  key.position.set(2.5, 3, 4)
  scene.add(key)
  const rim = new DirectionalLight(0xbcd2ff, 0.9)
  rim.position.set(-3, 1.5, -4)
  scene.add(rim)

  const tee = new Group()
  scene.add(tee)

  const shape = teeShape()
  const bodyMaterial = new MeshStandardMaterial({ color: 0x111111, roughness: 0.92, metalness: 0 })
  const body = new Mesh(
    new ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: 0.05, bevelSegments: 8, curveSegments: 24 }),
    bodyMaterial
  )
  body.position.z = -DEPTH / 2
  tee.add(body)

  const faceZ = DEPTH / 2 + BEVEL + 0.002
  const makeFace = (mirror) => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = TEX
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    texture.minFilter = LinearFilter
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
    const geometry = new ShapeGeometry(shape, 24)
    squareUVs(geometry, mirror)
    const mesh = new Mesh(geometry, new MeshStandardMaterial({ map: texture, roughness: 0.9, metalness: 0 }))
    return { canvas, texture, mesh }
  }
  const front = makeFace(false)
  front.mesh.position.z = faceZ
  const back = makeFace(true)
  back.mesh.position.z = -faceZ
  back.mesh.rotation.y = Math.PI
  // The back face is seen from behind, so un-mirror its geometry while keeping the u flip in the UVs.
  back.mesh.scale.x = -1
  tee.add(front.mesh, back.mesh)

  // Soft contact shadow under the hem.
  const shadowCanvas = document.createElement('canvas')
  shadowCanvas.width = shadowCanvas.height = 128
  const sctx = shadowCanvas.getContext('2d')
  const radial = sctx.createRadialGradient(64, 64, 4, 64, 64, 64)
  radial.addColorStop(0, 'rgba(0,0,0,0.35)')
  radial.addColorStop(1, 'rgba(0,0,0,0)')
  sctx.fillStyle = radial
  sctx.fillRect(0, 0, 128, 128)
  const shadow = new Mesh(new PlaneGeometry(2.2, 0.7), new MeshStandardMaterial({ map: new CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }))
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = (0.5 - 0.94) * SIZE
  scene.add(shadow)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.enablePan = false
  controls.minDistance = 2.2
  controls.maxDistance = 6.5
  controls.minPolarAngle = Math.PI * 0.28
  controls.maxPolarAngle = Math.PI * 0.68
  controls.autoRotate = !reducedMotion
  controls.autoRotateSpeed = 1.6
  controls.target.set(0, 0, 0)

  let frame = 0
  let running = false
  let disposed = false
  const render = () => {
    renderer.render(scene, camera)
    container.dataset.azimuth = controls.getAzimuthalAngle().toFixed(3)
    container.dataset.distance = camera.position.length().toFixed(3)
  }
  const loop = () => {
    if (disposed) return
    const changed = controls.update()
    render()
    if (changed || controls.autoRotate || interacting) {
      frame = requestAnimationFrame(loop)
    } else {
      running = false
    }
  }
  const wake = () => {
    if (running || disposed) return
    running = true
    frame = requestAnimationFrame(loop)
  }
  let interacting = false
  controls.addEventListener('start', () => {
    interacting = true
    controls.autoRotate = false
    wake()
  })
  controls.addEventListener('end', () => {
    interacting = false
    wake()
  })
  controls.addEventListener('change', wake)

  const resize = () => {
    const width = container.clientWidth
    const height = container.clientHeight || width
    if (!width) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    wake()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(container)
  resize()

  let requestId = 0
  const withImages = (prints = []) =>
    Promise.all(prints.map(async (print) => ({ image: await loadImage(print.src), styles: print.styles }))).then((list) => list.filter((entry) => entry.image))

  async function update({ colour, front: frontPrints, back: backPrints }) {
    const id = ++requestId
    bodyMaterial.color.set(shade(colour || '#111111', -0.02))
    const [onFront, onBack] = await Promise.all([withImages(frontPrints), withImages(backPrints)])
    if (disposed || id !== requestId) return
    paintFace(front.canvas, colour || '#111111', onFront)
    paintFace(back.canvas, colour || '#111111', onBack)
    front.texture.needsUpdate = true
    back.texture.needsUpdate = true
    wake()
  }

  /* Swing the camera round to face the front (0) or back (PI) of the tee, keeping its distance and height. */
  function showSide(side) {
    controls.autoRotate = false
    const angle = side === 'back' ? Math.PI : 0
    const offset = camera.position.clone().sub(controls.target)
    const flat = Math.hypot(offset.x, offset.z)
    camera.position.set(controls.target.x + Math.sin(angle) * flat, camera.position.y, controls.target.z + Math.cos(angle) * flat)
    controls.update()
    wake()
  }

  function dispose() {
    disposed = true
    cancelAnimationFrame(frame)
    observer.disconnect()
    controls.dispose()
    scene.traverse((object) => {
      object.geometry?.dispose()
      const material = object.material
      if (material) {
        material.map?.dispose()
        material.dispose()
      }
    })
    renderer.dispose()
    renderer.domElement.remove()
  }

  return { update, showSide, dispose }
}
