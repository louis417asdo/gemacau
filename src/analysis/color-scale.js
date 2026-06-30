const COLOR_STOPS = [
  { t: 0.0, r: 26,  g: 35,  b: 50  },
  { t: 0.15, r: 0,   g: 212, b: 170 },
  { t: 0.35, r: 136, g: 204, b: 0   },
  { t: 0.55, r: 255, g: 221, b: 0   },
  { t: 0.75, r: 255, g: 136, b: 0   },
  { t: 1.0, r: 255, g: 0,   b: 68  }
]

export function valueToColor(value, maxValue) {
  if (maxValue <= 0 || value <= 0) {
    return { r: 26, g: 35, b: 50, a: 180 }
  }

  const t = Math.log(1 + value) / Math.log(1 + maxValue)

  let i = 0
  for (let j = 0; j < COLOR_STOPS.length - 1; j++) {
    if (t >= COLOR_STOPS[j].t && t <= COLOR_STOPS[j + 1].t) {
      i = j
      break
    }
  }

  const a = COLOR_STOPS[i]
  const b = COLOR_STOPS[i + 1]
  const range = b.t - a.t
  const localT = range > 0 ? (t - a.t) / range : 0

  return {
    r: Math.round(a.r + (b.r - a.r) * localT),
    g: Math.round(a.g + (b.g - a.g) * localT),
    b: Math.round(a.b + (b.b - a.b) * localT),
    a: 200
  }
}
