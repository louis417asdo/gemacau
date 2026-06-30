import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { MACAU_CENTER, INITIAL_ALTITUDE, INITIAL_PITCH } from './config/macau-regions.js'
import { loadBuildingDensity, showBuildingDensity } from './analysis/building-density.js'
import { loadFARGrid, showFARGrid } from './analysis/far-grid.js'
import { loadPopulationDensity, showPopulationDensity } from './analysis/population-density.js'
import { setupSunlight, refreshSunlight } from './analysis/sunlight.js'
import { setupScenario } from './analysis/scenario.js'
import { setupSimulator, onFloorsChanged, getBuildingPositions } from './analysis/simulator.js'
import { recalculateFAR, resetFARGrid } from './analysis/far-grid.js'
import { getLegendColors } from './analysis/color-scale.js'

const token = import.meta.env.VITE_CESIUM_ION_TOKEN

if (!token) {
  console.warn(
    'Gemacau: VITE_CESIUM_ION_TOKEN is not set. ' +
    'Cesium Ion assets (terrain, imagery) will not load. ' +
    'Copy .env.example to .env and add your token from https://cesium.com/ion'
  )
}

Cesium.Ion.defaultAccessToken = token || ''

let currentAnalysis = null
let hoveredEntity = null

async function initViewer() {
  const terrainProvider = token
    ? Cesium.Terrain.fromWorldTerrain()
    : new Cesium.EllipsoidTerrainProvider()

  const baseLayer = token
    ? Cesium.ImageryLayer.fromProviderAsync(
        Cesium.IonImageryProvider.fromAssetId(2)
      )
    : Cesium.ImageryLayer.fromProviderAsync(
        Cesium.createWorldImageryAsync()
      )

  const viewer = new Cesium.Viewer('cesiumContainer', {
    terrain: terrainProvider,
    baseLayer: baseLayer,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    homeButton: false,
    sceneModePicker: false,
    baseLayerPicker: false,
    navigationHelpButton: false,
    infoBox: false,
    selectionIndicator: false,
    geocoder: false,
    creditContainer: document.createElement('div')
  })

  viewer.scene.globe.enableLighting = true
  viewer.scene.globe.depthTestAgainstTerrain = true

  try {
    const buildings = await Cesium.createOsmBuildingsAsync()
    viewer.scene.primitives.add(buildings)
  } catch (err) {
    console.warn('Gemacau: Failed to load OSM Buildings:', err)
  }

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      MACAU_CENTER[0], MACAU_CENTER[1], INITIAL_ALTITUDE
    ),
    orientation: {
      pitch: Cesium.Math.toRadians(INITIAL_PITCH)
    }
  })

  await Promise.all([
    loadBuildingDensity(viewer),
    loadFARGrid(viewer),
    loadPopulationDensity(viewer)
  ])

  setupToolbar(viewer)
  setupClickHandler(viewer)
  setupHoverHandler(viewer)
  setupSunlight(viewer)
  setupScenario(viewer)
  setupSimulator(viewer)
  setupScreenshot(viewer)

  onFloorsChanged((floors, positions) => {
    if (floors === 7) {
      resetFARGrid()
    } else {
      recalculateFAR(positions, floors)
    }
    refreshSunlight(viewer)
  })
}

function setAnalysis(viewer, mode) {
  showBuildingDensity(false)
  showFARGrid(false)
  showPopulationDensity(false)
  hideLegend()

  if (mode === currentAnalysis) {
    currentAnalysis = null
    document.getElementById('info-panel').classList.add('hidden')
    return
  }

  currentAnalysis = mode
  const infoContent = document.getElementById('info-content')
  const infoPanel = document.getElementById('info-panel')
  infoPanel.classList.remove('hidden')

  if (mode === 'density') {
    showBuildingDensity(true)
    infoContent.innerHTML = `
      <strong>建築密度熱力圖</strong><br>
      基於 OSM 建築 footprint 計算<br>
      顏色越暖 = 密度越高<br>
      數據來源：OpenStreetMap (ODbL)<br>
      精度：100m 網格<br>
      <em>點擊網格查看詳細數據</em>
    `
    showLegend('建築密度', '低', '高')
  } else if (mode === 'far') {
    showFARGrid(true)
    infoContent.innerHTML = `
      <strong>容積率估算（網格法）</strong><br>
      100m × 100m 網格<br>
      顏色越暖 = 容積率越高<br>
      ⚠️ 樓層為假設值（非官方數據）<br>
      數據來源：OSM + DSEC 估算<br>
      <em>點擊網格查看詳細數據</em>
    `
    showLegend('容積率 (FAR)', '0', '高')
  } else if (mode === 'population') {
    showPopulationDensity(true)
    infoContent.innerHTML = `
      <strong>人口密度（堂區級）</strong><br>
      顏色越暖 = 密度越高（人/km²）<br>
      數據來源：DSEC 2021 普查<br>
      精度：堂區級（7 區）<br>
      <em>點擊堂區查看詳細數據</em>
    `
    showLegend('人口密度', '低', '高')
  }
}

function showLegend(title, minLabel, maxLabel) {
  const legend = document.getElementById('legend')
  const bar = document.getElementById('legend-bar')
  const titleEl = document.getElementById('legend-title')
  const minEl = document.getElementById('legend-min')
  const maxEl = document.getElementById('legend-max')

  titleEl.textContent = title
  minEl.textContent = minLabel
  maxEl.textContent = maxLabel

  bar.innerHTML = getLegendColors().map(c =>
    `<div style="background:rgb(${c.r},${c.g},${c.b})"></div>`
  ).join('')

  legend.classList.remove('hidden')
}

function hideLegend() {
  document.getElementById('legend').classList.add('hidden')
}

function setupToolbar(viewer) {
  const buttons = document.querySelectorAll('.toolbar-btn')
  const infoPanel = document.getElementById('info-panel')
  const sunlightPanel = document.getElementById('sunlight-panel')
  const scenarioPanel = document.getElementById('scenario-panel')
  const simulatorPanel = document.getElementById('simulator-panel')

  function hideAllPanels() {
    infoPanel.classList.add('hidden')
    sunlightPanel.classList.add('hidden')
    scenarioPanel.classList.add('hidden')
    simulatorPanel.classList.add('hidden')
    document.getElementById('analysis-submenu')?.classList.add('hidden')
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      const panel = btn.dataset.panel
      hideAllPanels()

      if (panel === 'layers') {
        infoPanel.classList.remove('hidden')
        document.getElementById('info-content').textContent = '圖層面板（開發中）'
      } else if (panel === 'analysis') {
        document.getElementById('analysis-submenu').classList.toggle('hidden')
      } else if (panel === 'sunlight') {
        sunlightPanel.classList.remove('hidden')
      } else if (panel === 'scenario') {
        scenarioPanel.classList.remove('hidden')
        simulatorPanel.classList.remove('hidden')
      }
    })
  })

  document.querySelectorAll('.submenu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setAnalysis(viewer, btn.dataset.analysis)
      document.getElementById('analysis-submenu').classList.add('hidden')
    })
  })
}

function setupClickHandler(viewer) {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  handler.setInputAction((click) => {
    const picked = viewer.scene.pick(click.position)
    const infoContent = document.getElementById('info-content')
    const infoPanel = document.getElementById('info-panel')

    if (!Cesium.defined(picked) || !picked.id) return

    const entity = picked.id

    if (entity.properties && entity.properties.hasProperty('far')) {
      const far = entity.properties.far.getValue()
      const density = entity.properties.density.getValue()
      const count = entity.properties.building_count.getValue()
      infoContent.innerHTML = `
        <strong>網格數據</strong><br>
        容積率：${far.toFixed(2)}<br>
        密度：${(density * 100).toFixed(1)}%<br>
        建築數：${count}
      `
      infoPanel.classList.remove('hidden')
    } else if (entity._gemacauDensity !== undefined) {
      const density = entity._gemacauDensity
      const pop = entity._gemacauPop
      const area = entity._gemacauArea
      infoContent.innerHTML = `
        <strong>${entity.properties.name.getValue()}</strong><br>
        人口：${pop.toLocaleString()}<br>
        面積：${area.toFixed(2)} km²<br>
        密度：${Math.round(density).toLocaleString()} 人/km²
      `
      infoPanel.classList.remove('hidden')
    } else if (entity.properties && entity.properties.hasProperty('name')) {
      const props = entity.properties
      const name = props.name?.getValue() || '未命名建築'
      const height = props.height?.getValue() || '—'
      const floors = props.floors?.getValue() || '—'
      infoContent.innerHTML = `
        <strong>${name}</strong><br>
        高度：${height} m<br>
        樓層：${floors}
      `
      infoPanel.classList.remove('hidden')
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

function setupHoverHandler(viewer) {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  handler.setInputAction((move) => {
    const picked = viewer.scene.pick(move.endPosition)
    if (hoveredEntity && hoveredEntity !== (picked?.id)) {
      if (hoveredEntity.polygon?.outlineColor) {
        hoveredEntity.polygon.outlineColor = Cesium.Color.fromBytes(255, 255, 255, 60)
      }
      hoveredEntity = null
    }
    if (Cesium.defined(picked) && picked.id && picked.id.polygon?.outlineColor) {
      hoveredEntity = picked.id
      hoveredEntity.polygon.outlineColor = Cesium.Color.fromBytes(0, 212, 170, 200)
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
}

function setupScreenshot(viewer) {
  const btn = document.getElementById('screenshot-btn')
  btn.addEventListener('click', () => {
    const canvas = viewer.scene.canvas
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `gemacau-${new Date().toISOString().slice(0, 10)}.png`
    link.href = dataUrl
    link.click()
  })
}

initViewer().catch(err => {
  console.error('Gemacau: Failed to initialize viewer:', err)
  document.getElementById('cesiumContainer').innerHTML =
    '<div style="padding:40px;color:#e0e6ed;text-align:center;">' +
    '無法初始化 3D 地圖。請查看瀏覽器控制台了解詳情。</div>'
})
