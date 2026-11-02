/**
 * Tiny Web Audio chime used for timer transitions.
 * No audio files needed — generated with an oscillator.
 */
let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  return ctx
}

export type ChimeKind = 'focus_done' | 'break_done' | 'soft'

const PRESETS: Record<ChimeKind, { freqs: number[]; duration: number; volume: number }> = {
  focus_done: { freqs: [660, 880, 1100], duration: 0.55, volume: 0.18 },
  break_done: { freqs: [520, 660], duration: 0.4, volume: 0.14 },
  soft: { freqs: [440], duration: 0.2, volume: 0.1 },
}

export function playChime(kind: ChimeKind = 'soft'): void {
  try {
    const audio = getCtx()
    if (!audio) return
    if (audio.state === 'suspended') void audio.resume()

    const preset = PRESETS[kind]
    const now = audio.currentTime
    preset.freqs.forEach((freq, i) => {
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = now + i * 0.12
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(preset.volume, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + preset.duration)
      osc.connect(gain).connect(audio.destination)
      osc.start(start)
      osc.stop(start + preset.duration + 0.05)
    })
  } catch {
    /* audio unavailable — silently ignore */
  }
}
