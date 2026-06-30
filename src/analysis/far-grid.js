import * as Cesium from 'cesium'
import { valueToColor } from './color-scale.js'

let dataSource = null

export async function loadFARGrid(viewer) {
  if (dataSource) return dataSource

  const res = await fetch('/data/macau-grid.geojson')
  const grid = await res.json()

  dataSource = await Cesium.GeoJsonDataSource.load(grid, { clampToGround: true })

  const maxFAR = Math.max(...grid.features.map(f => f.properties.far))

  dataSource.entities.values.forEach(entity => {
    const far = entity.properties.far.getValue()
    const c = valueToColor(far, maxFAR)
    entity.polygon.material = Cesium.Color.fromBytes(c.r, c.g, c.b, c.a)
    entity.polygon.outline = false
  })

  dataSource.show = false
  viewer.dataSources.add(dataSource)
  return dataSource
}

export function showFARGrid(visible) {
  if (dataSource) dataSource.show = visible
}
