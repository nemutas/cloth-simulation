import { Particle } from './Particle'

export class Constraint {
  private readonly initialLength: number

  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    readonly p1: Particle,
    readonly p2: Particle,
    private active = true,
  ) {
    // prettier-ignore
    this.initialLength = Math.hypot(
      p2.position[0] - p1.position[0],
      p2.position[1] - p1.position[1],
    )
  }

  satisfy() {
    if (!this.active) return

    // prettier-ignore
    const delta = [
      this.p2.position[0] - this.p1.position[0],
      this.p2.position[1] - this.p1.position[1],
    ]
    const currentLenght = Math.hypot(...delta)
    const difference = (currentLenght - this.initialLength) / currentLenght
    // prettier-ignore
    const correction = [
      delta[0] * 0.5 * difference,
      delta[1] * 0.5 * difference,
    ]

    if (!this.p1.isPinned) {
      this.p1.position[0] += correction[0]
      this.p1.position[1] += correction[1]
    }
    if (!this.p2.isPinned) {
      this.p2.position[0] -= correction[0]
      this.p2.position[1] -= correction[1]
    }
  }

  deactive() {
    this.active = false
  }

  draw() {
    if (!this.active) return

    this.ctx.strokeStyle = '#fff'

    this.ctx.beginPath()
    this.ctx.moveTo(this.p1.position[0], this.p1.position[1])
    this.ctx.lineTo(this.p2.position[0], this.p2.position[1])
    this.ctx.stroke()
    this.ctx.closePath()
  }
}
