import * as Cesium from 'cesium'

const BUILDING_POSITIONS = [
  [113.5498, 22.2092],
  [113.5501, 22.2092],
  [113.5504, 22.2092],
  [113.5507, 22.2092],
  [113.5499, 22.2087],
  [113.5502, 22.2087],
  [113.5505, 22.2087],
]

const BUILDING_SIZE_DEG = { lon: 0.0004, lat: 0.00036 }
const BUILDING_AREA_M2 = 1600
const PLOT_AREA_M2 = 30000
const FLOOR_HEIGHT = 3
const CURRENT_FLOORS = 7
const PLAN_A_FLOORS = 15
const PLAN_B_FLOORS = 25
const UNIT_SIZE_M2 = 50
const PERSONS_PER_UNIT = 3
const RESIDENTIAL_RATIO = 0.6

let buildingEntities = []
let currentFloors = CURRENT_FLOORS
let animFrameId = null

export function setupSimulator(viewer) {
  buildingEntities = BUILDING_POSITIONS.map((pos, i) => {
    const entity = viewer.entities.add({
      name: `益隆 樓 ${i + 1}`,
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(
          pos[0] - BUILDING_SIZE_DEG.lon / 2,
          pos[1] - BUILDING_SIZE_DEG.lat / 2,
          pos[0] + BUILDING_SIZE_DEG.lon / 2,
          pos[1] + BUILDING_SIZE_DEG.lat / 2,
        ),
        material: Cesium.Color.fromCssColorString('#00d4aa').withAlpha(0.6),
        outline: true,
        outlineColor: Cesium.Color.WHITE.withAlpha(0.3),
        height: 0,
        extrudedHeight: CURRENT_FLOORS * FLOOR_HEIGHT,
      },
      description: `益隆新村 樓 ${i + 1}<br>現狀：${CURRENT_FLOORS} 層`,
    })
    return entity
  })

  const slider = document.getElementById('sim-slider')
  const floorsEl = document.getElementById('sim-floors')
  const farEl = document.getElementById('sim-far')
  const popEl = document.getElementById('sim-pop')
  const deltaEl = document.getElementById('sim-delta')

  function updateUI() {
    const stats = getStats(currentFloors)
    if (floorsEl) floorsEl.textContent = `${currentFloors} 層`
    if (farEl) farEl.textContent = stats.far.toFixed(1)
    if (popEl) popEl.textContent = stats.population.toLocaleString()
    if (deltaEl) {
      const base = getStats(CURRENT_FLOORS)
      const dFar = stats.far - base.far
      const dPop = stats.population - base.population
      deltaEl.innerHTML = `Δ FAR: ${dFar >= 0 ? '+' : ''}${dFar.toFixed(1)}<br>Δ 人口: ${dPop >= 0 ? '+' : ''}${dPop.toLocaleString()}`
    }
  }

  if (slider) {
    slider.value = CURRENT_FLOORS
    slider.addEventListener('input', () => {
      currentFloors = parseInt(slider.value)
      setBuildingHeights(currentFloors * FLOOR_HEIGHT, false)
      updateUI()
    })
  }

  document.querySelectorAll('.sim-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sim-preset').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      const target = parseInt(btn.dataset.floors)
      if (slider) slider.value = target
      currentFloors = target
      setBuildingHeights(target * FLOOR_HEIGHT, true)
      updateUI()
    })
  })

  updateUI()
}

function setBuildingHeights(targetHeight, animate) {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }

  if (!animate) {
    buildingEntities.forEach(e => { e.rectangle.extrudedHeight = targetHeight })
    return
  }

  const startHeights = buildingEntities.map(e => e.rectangle.extrudedHeight.getValue())
  const duration = 1500
  const startTime = performance.now()

  function step(now) {
    const elapsed = now - startTime
    const t = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    buildingEntities.forEach((e, i) => {
      e.rectangle.extrudedHeight = startHeights[i] + (targetHeight - startHeights[i]) * eased
    })
    if (t < 1) {
      animFrameId = requestAnimationFrame(step)
    }
  }

  animFrameId = requestAnimationFrame(step)
}

export function getStats(floors) {
  const totalFloorArea = BUILDING_AREA_M2 * floors * 7
  const far = totalFloorArea / PLOT_AREA_M2
  const residentialArea = totalFloorArea * RESIDENTIAL_RATIO
  const units = Math.round(residentialArea / UNIT_SIZE_M2)
  const population = units * PERSONS_PER_UNIT
  return { floors, far, population, units, totalFloorArea }
}

export function getCurrentStats() {
  return getStats(currentFloors)
}

export function getComparisonReport() {
  const current = getStats(CURRENT_FLOORS)
  const proposed = getStats(currentFloors)
  return {
    current,
    proposed,
    deltaFar: proposed.far - current.far,
    deltaPop: proposed.population - current.population,
    deltaUnits: proposed.units - current.units,
  }
}
