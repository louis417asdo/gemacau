import * as Cesium from 'cesium'
import { valueToColor } from './color-scale.js'

let dataSource = null

function polygonAreaKm2(coords) {
  let area = 0
  const ring = coords[0]
  const j = ring.length - 1
  for (let i = 0; i < ring.length; i++) {
    const xi = ring[i][0], yi = ring[i][1]
    const xj = ring[j][0], yj = ring[j][1]
    area += xi * yj - xj * yi
  }
  area = Math.abs(area) / 2
  const lat = ring.reduce((s, p) => s + p[1], 0) / ring.length
  const mPerDeg = 111320
  const mPerDegLon = 111320 * Math.cos(lat * Math.PI / 180)
  return area * mPerDeg * mPerDegLon / 1e6
}

export async function loadPopulationDensity(viewer) {
  if (dataSource) return dataSource

  const [fregRes, popRes] = await Promise.all([
    fetch('/data/macau-freguesias.geojson'),
    fetch('/data/macau-population.json')
  ])
  const freguesias = await fregRes.json()
  const popData = await popRes.json()

  dataSource = await Cesium.GeoJsonDataSource.load(freguesias, { clampToGround: true })

  const popMap = {}
  for (const f of popData.freguesias) {
    popMap[f.name] = f.population
  }

  const densities = []
  dataSource.entities.values.forEach(entity => {
    const name = entity.properties.name.getValue()
    const pop = popMap[name] || 0
    const coords = entity.polygon.hierarchy.getValue().positions
    const cartos = coords.map(c => Cesium.Cartographic.fromCartesian(c))
    const geoCoords = cartos.map(c => [c.longitude * 180 / Math.PI, c.latitude * 180 / Math.PI])
    const areaKm2 = polygonAreaKm2([geoCoords])
    const density = areaKm2 > 0 ? pop / areaKm2 : 0
    densities.push(density)
    entity._gemacauDensity = density
    entity._gemacauPop = pop
    entity._gemacauArea = areaKm2
  })

  const maxDensity = Math.max(...densities)

  dataSource.entities.values.forEach(entity => {
    const density = entity._gemacauDensity
    const pop = entity._gemacauPop
    const area = entity._gemacauArea
    const c = valueToColor(density, maxDensity)

    entity.polygon.material = Cesium.Color.fromBytes(c.r, c.g, c.b, c.a)
    entity.polygon.outline = true
    entity.polygon.outlineColor = Cesium.Color.fromBytes(255, 255, 255, 60)
    entity.polygon.outlineWidth = 1

    entity.description = `人口: ${pop.toLocaleString()}<br>面積: ${area.toFixed(2)} km²<br>密度: ${Math.round(density).toLocaleString()} 人/km²`
  })

  dataSource.show = false
  viewer.dataSources.add(dataSource)
  return dataSource
}

export function showPopulationDensity(visible) {
  if (dataSource) dataSource.show = visible
}
