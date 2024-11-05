export class Particle {
  public readonly position: [number, number]
  private prevPosition: [number, number]
  private acceleration: [number, number]

  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    private readonly radius: number,
    readonly isPinned = false,
  ) {
    this.position = [x, y]
    this.prevPosition = [x, y]
    this.acceleration = [x, y]
  }

  applyForce(force: [number, number]) {
    if (!this.isPinned) {
      this.acceleration[0] += force[0]
      this.acceleration[1] -= force[1]
    }
  }

  update(timeStep: number) {
    if (!this.isPinned) {
      const velo = [this.position[0] - this.prevPosition[0], this.position[1] - this.prevPosition[1]]
      this.prevPosition = [...this.position]
      this.position[0] += velo[0] + this.acceleration[0] * timeStep * timeStep
      this.position[1] += velo[1] + this.acceleration[1] * timeStep * timeStep
      this.acceleration = [0, 0] // reset
    }
  }

  constrainToBounds() {
    const { width, height } = this.ctx.canvas

    if (this.position[0] < this.radius) this.position[0] = this.radius
    if (this.position[0] > width - this.radius) this.position[0] = width - this.radius

    if (this.position[1] < this.radius) this.position[1] = this.radius
    if (this.position[1] > height - this.radius) this.position[1] = height - this.radius
  }

  draw() {
    this.ctx.fillStyle = '#fff'

    this.ctx.beginPath()
    this.ctx.arc(this.position[0], this.position[1], this.radius, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.closePath()
  }
}
