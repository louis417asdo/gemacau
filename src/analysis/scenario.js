import * as Cesium from 'cesium'

let currentScenario = 'current'
let scenarioEntities = []

export function setupScenario(viewer) {
  const buttons = document.querySelectorAll('.scenario-btn')

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      switchScenario(viewer, btn.dataset.scenario)
    })
  })
}

function switchScenario(viewer, scenario) {
  clearScenario(viewer)
  currentScenario = scenario

  if (scenario === 'current') return

  const viewerHeight = viewer.camera.positionCartographic.height
  const isClose = viewerHeight < 5000

  if (scenario === 'plan-a') {
    addScenarioBuildings(viewer, '重建方案 A', '#00d4aa', isClose ? 80 : 40, isClose ? 25 : 12)
  } else if (scenario === 'plan-b') {
    addScenarioBuildings(viewer, '重建方案 B', '#ff8800', isClose ? 100 : 50, isClose ? 30 : 15)
  }
}

function addScenarioBuildings(viewer, label, color, height, floors) {
  const iaoHonCenter = [113.5503, 22.2087]
  const positions = [
    [113.5495, 22.2092],
    [113.5498, 22.2088],
    [113.5501, 22.2084],
    [113.5505, 22.2090],
    [113.5508, 22.2086],
    [113.5511, 22.2082],
    [113.5503, 22.2095]
  ]

  const material = Cesium.Color.fromCssColorString(color).withAlpha(0.7)

  positions.forEach((pos, i) => {
    const entity = viewer.entities.add({
      name: `${label} 樓 ${i + 1}`,
      position: Cesium.Cartesian3.fromDegrees(pos[0], pos[1], 0),
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(
          pos[0] - 0.0003, pos[1] - 0.0003,
          pos[0] + 0.0003, pos[1] + 0.0003
        ),
        material: material,
        outline: true,
        outlineColor: Cesium.Color.WHITE.withAlpha(0.3),
        height: 0,
        extrudedHeight: height
      },
      description: `${label} 模擬建築<br>高度：${height}m<br>樓層：${floors}`
    })
    scenarioEntities.push(entity)
  })
}

function clearScenario(viewer) {
  scenarioEntities.forEach(entity => {
    viewer.entities.remove(entity)
  })
  scenarioEntities = []
}
