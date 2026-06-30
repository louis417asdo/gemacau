import * as Cesium from 'cesium'
import { valueToColor } from './color-scale.js'

let dataSource = null

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

  const maxPop = Math.max(...Object.values(popMap))

  dataSource.entities.values.forEach(entity => {
    const name = entity.properties.name.getValue()
    const pop = popMap[name] || 0
    const c = valueToColor(pop, maxPop)

    entity.polygon.material = Cesium.Color.fromBytes(c.r, c.g, c.b, c.a)
    entity.polygon.outline = true
    entity.polygon.outlineColor = Cesium.Color.fromBytes(255, 255, 255, 60)
    entity.polygon.outlineWidth = 1

    entity.description = `人口: ${pop.toLocaleString()}`
  })

  dataSource.show = false
  viewer.dataSources.add(dataSource)
  return dataSource
}

export function showPopulationDensity(visible) {
  if (dataSource) dataSource.show = visible
}
