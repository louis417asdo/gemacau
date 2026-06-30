import * as Cesium from 'cesium'
import { valueToColor } from './color-scale.js'

let dataSource = null
let originalFloorAreas = new Map()
let originalFARs = new Map()
let maxFAR = 0

export async function loadFARGrid(viewer) {
  if (dataSource) return dataSource

  const res = await fetch('/data/macau-grid.geojson')
  const grid = await res.json()

  dataSource = await Cesium.GeoJsonDataSource.load(grid, { clampToGround: true })
  maxFAR = Math.max(...grid.features.map(f => f.properties.far))

  dataSource.entities.values.forEach(entity => {
    const far = entity.properties.far.getValue()
    const floorArea = entity.properties.floor_area.getValue()
    const cellLon = entity.properties.cell_lon.getValue()
    const cellLat = entity.properties.cell_lat.getValue()
    const key = `${cellLon.toFixed(6)},${cellLat.toFixed(6)}`
    originalFloorAreas.set(key, floorArea)
    originalFARs.set(key, far)
    const c = valueToColor(far, maxFAR)
    entity.polygon.material = Cesium.Color.fromBytes(c.r, c.g, c.b, c.a)
    entity.polygon.outline = false
  })

  dataSource.show = false
  viewer.dataSources.add(dataSource)
  return dataSource
}

export function recalculateFAR(buildingPositions, floors) {
  if (!dataSource) return

  const buildingFloorArea = 1600 * floors

  dataSource.entities.values.forEach(entity => {
    const cellLon = entity.properties.cell_lon.getValue()
    const cellLat = entity.properties.cell_lat.getValue()
    const key = `${cellLon.toFixed(6)},${cellLat.toFixed(6)}`
    const originalFloorArea = originalFloorAreas.get(key) || 0

    let addedArea = 0
    for (const pos of buildingPositions) {
      const dLon = Math.abs(pos[0] - cellLon)
      const dLat = Math.abs(pos[1] - cellLat)
      if (dLon < 0.0009 && dLat < 0.0009) {
        addedArea += buildingFloorArea
      }
    }

    const newFloorArea = originalFloorArea + addedArea
    const newFAR = newFloorArea / 10000
    const c = valueToColor(newFAR, Math.max(maxFAR, newFAR))
    entity.polygon.material = Cesium.Color.fromBytes(c.r, c.g, c.b, c.a)
  })
}

export function resetFARGrid() {
  if (!dataSource) return

  dataSource.entities.values.forEach(entity => {
    const cellLon = entity.properties.cell_lon.getValue()
    const cellLat = entity.properties.cell_lat.getValue()
    const key = `${cellLon.toFixed(6)},${cellLat.toFixed(6)}`
    const far = originalFARs.get(key) || 0
    const c = valueToColor(far, maxFAR)
    entity.polygon.material = Cesium.Color.fromBytes(c.r, c.g, c.b, c.a)
  })
}

export function showFARGrid(visible) {
  if (dataSource) dataSource.show = visible
}
