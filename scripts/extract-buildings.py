import json
import osmium

class BuildingHandler(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.features = []

    def way(self, w):
        if 'building' in w.tags:
            tags = dict(w.tags)
            props = {
                'osm_id': w.id,
                'building': tags.get('building', 'yes'),
                'height': tags.get('height', None),
                'levels': tags.get('building:levels', None),
                'name': tags.get('name', None),
                'name_zh': tags.get('name:zh', None),
            }
            coords = []
            for n in w.nodes:
                if n.location.valid():
                    coords.append([n.lon, n.lat])
            if len(coords) >= 3:
                self.features.append({
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [coords]
                    },
                    'properties': {k: v for k, v in props.items() if v is not None}
                })

handler = BuildingHandler()
handler.apply_file('/tmp/macau.osm.pbf', locations=True)

geojson = {
    'type': 'FeatureCollection',
    'features': handler.features
}

with open('data/macau-buildings.geojson', 'w') as f:
    json.dump(geojson, f, ensure_ascii=False)

print(f"Extracted {len(handler.features)} building footprints")

with_levels = sum(1 for f in handler.features if f['properties'].get('levels'))
with_height = sum(1 for f in handler.features if f['properties'].get('height'))
with_name = sum(1 for f in handler.features if f['properties'].get('name'))
print(f"With levels: {with_levels}")
print(f"With height: {with_height}")
print(f"With name: {with_name}")
