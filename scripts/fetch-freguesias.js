import { writeFileSync } from 'fs'
import { execSync } from 'child_process'

const FREGUEISAS = [
  { id: 9506156, name: '花地瑪堂區', nameEn: 'Nossa Senhora de Fátima' },
  { id: 9506168, name: '花王堂區', nameEn: 'Santo António' },
  { id: 12107627, name: '大堂區', nameEn: 'Sé' },
  { id: 12107628, name: '望德堂區', nameEn: 'São Lázaro' },
  { id: 12107629, name: '風順堂區', nameEn: 'São Lourenço' },
  { id: 5758865, name: '嘉模堂區', nameEn: 'Nossa Senhora do Carmo' },
  { id: 5758866, name: '聖方濟各堂區', nameEn: 'São Francisco Xavier' },
  { id: 5758867, name: '路氹填海區', nameEn: 'Zona do Aterro de Cotai' }
]

function fetchOverpass(query) {
  const tmpFile = '/tmp/overpass_query.txt'
  writeFileSync(tmpFile, query)
  const cmd = `curl -s -A "Gemacau/0.1" -G "https://overpass-api.de/api/interpreter" --data-urlencode "data@${tmpFile}" -H "Accept: application/json"`
  return JSON.parse(execSync(cmd, { encoding: 'utf-8' }))
}

function relToGeoJSON(data, meta) {
  const rel = data.elements[0]
  if (!rel || !rel.members) return null

  const outerWays = rel.members.filter(m => m.type === 'way' && m.role === 'outer' && m.geometry)
  const innerWays = rel.members.filter(m => m.type === 'way' && m.role === 'inner' && m.geometry)

  if (outerWays.length === 0) return null

  const outerCoords = outerWays.flatMap(w => w.geometry.map(p => [p.lon, p.lat]))
  const innerCoords = innerWays.flatMap(w => w.geometry.map(p => [p.lon, p.lat]))

  const coordinates = [outerCoords]
  if (innerCoords.length > 0) {
    coordinates.push(innerCoords)
  }

  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates },
    properties: {
      name: meta.name,
      nameEn: meta.nameEn,
      osmId: meta.id
    }
  }
}

function main() {
  const features = []

  for (const f of FREGUEISAS) {
    console.log(`Fetching ${f.name} (${f.nameEn})...`)
    try {
      const query = `[out:json];rel(${f.id});out geom;`
      const data = fetchOverpass(query)
      const feature = relToGeoJSON(data, f)
      if (feature) {
        features.push(feature)
        console.log(`  OK - ${f.name}`)
      } else {
        console.log(`  SKIP - ${f.name} (no geometry)`)
      }
    } catch (err) {
      console.error(`  ERROR - ${f.name}: ${err.message}`)
    }
  }

  const geojson = {
    type: 'FeatureCollection',
    features
  }

  writeFileSync('data/macau-freguesias.geojson', JSON.stringify(geojson, null, 2))
  console.log(`\nDone. Wrote ${features.length} features to data/macau-freguesias.geojson`)
}

main()
