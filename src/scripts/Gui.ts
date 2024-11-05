import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import { Pane } from 'tweakpane'

export class TweakPane extends Pane {
  private fps?: EssentialsPlugin.FpsGraphBladeApi

  constructor() {
    super()
    this.registerPlugin(EssentialsPlugin)
    this.custom()

    this.title = ''
    this.hidden = true
  }

  private custom() {
    document.querySelector<HTMLElement>('.tp-dfwv')?.style.setProperty('width', 'fit-content')
    document.querySelector<HTMLElement>('.tp-dfwv')?.style.setProperty('user-select', 'none')
    document.querySelector<HTMLElement>('.tp-dfwv .tp-rotv_c')?.style.setProperty('display', 'block')
  }

  addFpsBlade(label?: string) {
    this.hidden = false
    this.fps = this.addBlade({ view: 'fpsgraph', label: label ?? 'fps' } as any) as EssentialsPlugin.FpsGraphBladeApi
  }

  updateFps() {
    if (!this.fps) this.addFpsBlade()

    this.fps?.end()
    this.fps?.begin()
  }
}

export const pane = new TweakPane()
