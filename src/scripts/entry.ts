import { Constraint } from './Constraint'
import { pane } from './Gui'
import { Particle } from './Particle'

const dpr = window.devicePixelRatio

const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
canvas.width = window.innerWidth * dpr
canvas.height = window.innerHeight * dpr

const ctx = canvas.getContext('2d')!

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  createScene()
})

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    clock.restart()
  }
})

const clock = {
  prev: performance.now(),
  current: performance.now(),
  dt: 0,
  et: 0,
  update: () => {
    clock.current = performance.now()
    clock.dt = clock.current - clock.prev
    clock.et += clock.dt
    clock.prev = clock.current
  },
  restart: () => {
    clock.prev = performance.now()
    clock.current = performance.now()
  },
}

const params = {
  gravity: -9.8,
  row: 40,
  col: 40,
  distance: 0,
  resolve: 30,
}
params.distance = Math.min(canvas.width, canvas.height) / (params.row + 2)

const particles: Particle[] = []
const constraints: Constraint[] = []
let animationId: number | null = null

// ====================================================
let isMouseDown = false

canvas.addEventListener('mousedown', (e) => e.button === 0 && (isMouseDown = true))
canvas.addEventListener('mouseup', (e) => e.button === 0 && (isMouseDown = false))
canvas.addEventListener('mousemove', (e) => {
  isMouseDown && tearCloth([e.clientX * dpr, e.clientY * dpr], constraints)
})

canvas.addEventListener('touchstart', (e) => 0 < e.touches.length && (isMouseDown = true))
canvas.addEventListener('touchend', (e) => 0 < e.touches.length && (isMouseDown = false))
canvas.addEventListener('touchmove', (e) => {
  if (0 < e.touches.length && isMouseDown) {
    tearCloth([e.touches[0].clientX * dpr, e.touches[0].clientY * dpr], constraints)
  }
})

function tearCloth(mouse: [number, number], constraints: Constraint[]) {
  findNearestConstraint(mouse, constraints)?.deactive()
}

function findNearestConstraint(mouse: [number, number], constraints: Constraint[]) {
  let nearestConstraint: Constraint | null = null
  let minDistance = params.distance * 2

  for (const constraint of constraints) {
    const distance = pointToSegmentDistance(mouse, constraint.p1, constraint.p2)
    if (distance < minDistance) {
      minDistance = distance
      nearestConstraint = constraint
    }
  }

  return nearestConstraint
}

function pointToSegmentDistance(mouse: [number, number], p1: Particle, p2: Particle) {
  const [x1, y1, x2, y2] = [...p1.position, ...p2.position]
  const [mx, my] = mouse

  const [ABx, ABy] = [x2 - x1, y2 - y1]
  const [APx, APy] = [mx - x1, my - y1]
  const [BPx, BPy] = [mx - x2, my - y2]

  const AB_AP = ABx * APx + ABy * APy
  const AB_AB = ABx * ABx + ABy * ABy
  const t = AB_AP / AB_AB

  // Project point P on the line segment AB
  if (t < 0.0) {
    // P is closer to A
    return Math.sqrt(APx * APx + APy * APy)
  } else if (1.0 < t) {
    // P is closer to B
    return Math.sqrt(BPx * BPx + BPy * BPy)
  } else {
    // projection point is on the segment
    const proj_x = x1 + t * ABx
    const proj_y = y1 + t * ABy
    return Math.sqrt((mx - proj_x) * (mx - proj_x) + (my - proj_y) * (my - proj_y))
  }
}

// ====================================================
function createPhysics() {
  constraints.length = 0
  particles.length = 0

  // prettier-ignore
  const offset = [
	(params.col - 1) * params.distance / 2,
	(params.row - 1) * params.distance / 2,
]

  for (let row = 0; row < params.row; row++) {
    for (let col = 0; col < params.col; col++) {
      particles.push(
        // prettier-ignore
        new Particle(
          ctx,
          col * params.distance + canvas.width / 2 - offset[0],
          row * params.distance + canvas.height / 2 - offset[1],
          params.distance * 0.1,
          row === 0,
        ),
      )
    }
  }

  for (let row = 0; row < params.row; row++) {
    for (let col = 0; col < params.col; col++) {
      if (col < params.col - 1) {
        // prettier-ignore
        constraints.push(new Constraint(
					ctx,
					particles[row * params.col + col], 
					particles[row * params.col + col + 1]
				))
      }
      if (row < params.row - 1) {
        // prettier-ignore
        constraints.push(new Constraint(
					ctx,
					particles[row * params.col + col], 
					particles[(row + 1) * params.col + col]
				))
      }
    }
  }
}

function clearCanvas() {
  ctx.beginPath()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#0e0e0e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function draw() {
  pane.updateFps()
  clock.update()

  clearCanvas()

  for (const particle of particles) {
    particle.applyForce([0, params.gravity])
    particle.update(Math.min(1000 / 60, clock.dt * 0.01))
    particle.constrainToBounds()
    particle.draw()
  }

  for (let i = 0; i < params.resolve; i++) {
    for (const constraint of constraints) {
      constraint.satisfy()
      if (i === params.resolve - 1) constraint.draw()
    }
  }

  animationId = requestAnimationFrame(draw)
}

function createScene() {
  if (animationId) cancelAnimationFrame(animationId)

  params.distance = Math.min(canvas.width, canvas.height) / (params.row + 2)

  createPhysics()
  clock.restart()
  draw()
}

createScene()

// ====================================================
pane.addButton({ title: 'reset scene' }).on('click', () => {
  createScene()
})
