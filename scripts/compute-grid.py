import json
import math

# Load buildings
with open('data/macau-buildings.geojson') as f:
    buildings = json.load(f)

# Macau bounding box (from OSM relation 1867188)
MIN_LON, MIN_LAT = 113.5282, 22.0767
MAX_LON, MAX_LAT = 113.6301, 22.2170

# 100m grid in degrees (approximate: 1° lat ≈ 111km, 1° lon ≈ 111*cos(22.15°) ≈ 102.8km)
DEG_PER_M = 1 / 111000  # ~0.000009° per meter
LON_DEG_PER_M = 1 / (111000 * math.cos(math.radians(22.15)))  # ~0.0000097° per meter
GRID_SIZE_DEG_LAT = 100 * DEG_PER_M
GRID_SIZE_DEG_LON = 100 * LON_DEG_PER_M

# Create grid
grid_cells = []
lon = MIN_LON
while lon < MAX_LON:
    lat = MIN_LAT
    while lat < MAX_LAT:
        grid_cells.append({
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': [[
                    [lon, lat],
                    [lon + GRID_SIZE_DEG_LON, lat],
                    [lon + GRID_SIZE_DEG_LON, lat + GRID_SIZE_DEG_LAT],
                    [lon, lat + GRID_SIZE_DEG_LAT],
                    [lon, lat]
                ]]
            },
            'properties': {
                'cell_lon': round(lon, 6),
                'cell_lat': round(lat, 6),
                'building_count': 0,
                'footprint_area': 0,
                'floor_area': 0,
                'density': 0,
                'far': 0
            }
        })
        lat += GRID_SIZE_DEG_LAT
    lon += GRID_SIZE_DEG_LON

print(f"Grid cells: {len(grid_cells)}")

# Simple point-in-polygon test (centroid of building in cell)
def point_in_polygon(lon, lat, poly_coords):
    inside = False
    j = len(poly_coords) - 1
    for i in range(len(poly_coords)):
        yi, xi = poly_coords[i][1], poly_coords[i][0]
        yj, xj = poly_coords[j][1], poly_coords[j][0]
        if ((yi > lat) != (yj > lat)) and (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside

def polygon_area(coords):
    """Shoelace formula for area in sq meters (approximate)"""
    area = 0
    j = len(coords) - 1
    for i in range(len(coords)):
        xi, yi = coords[i]
        xj, yj = coords[j]
        area += xi * yj
        area -= xj * yi
        j = i
    area = abs(area) / 2
    # Convert from degree^2 to m^2 (approximate)
    lat = sum(p[1] for p in coords) / len(coords)
    m_per_deg_lat = 111320
    m_per_deg_lon = 111320 * math.cos(math.radians(lat))
    area_m2 = area * m_per_deg_lat * m_per_deg_lon
    return area_m2

def get_floors(props):
    if props.get('levels'):
        try:
            return int(float(props['levels']))
        except (ValueError, TypeError):
            pass
    if props.get('height'):
        try:
            h = float(props['height'])
            return max(1, round(h / 3))
        except (ValueError, TypeError):
            pass
    # Default by building type
    btype = props.get('building', 'yes')
    defaults = {
        'apartments': 15, 'residential': 6, 'house': 3, 'detached': 2,
        'commercial': 4, 'retail': 3, 'office': 8, 'industrial': 3,
        'warehouse': 2, 'hotel': 15, 'school': 4, 'hospital': 8,
        'university': 6, 'government': 5, 'public': 4, 'church': 3,
        'yes': 3
    }
    return defaults.get(btype, 3)

# Assign buildings to grid cells
for b in buildings['features']:
    props = b['properties']
    coords = b['geometry']['coordinates'][0]
    # Use centroid
    centroid_lon = sum(p[0] for p in coords) / len(coords)
    centroid_lat = sum(p[1] for p in coords) / len(coords)
    area_m2 = polygon_area(coords)
    floors = get_floors(props)

    for cell in grid_cells:
        cell_coords = cell['geometry']['coordinates'][0]
        if point_in_polygon(centroid_lon, centroid_lat, cell_coords):
            cell['properties']['building_count'] += 1
            cell['properties']['footprint_area'] += area_m2
            cell['properties']['floor_area'] += area_m2 * floors
            break

# Calculate density and FAR
cell_area_m2 = 100 * 100  # 10,000 m²
for cell in grid_cells:
    p = cell['properties']
    p['density'] = round(p['footprint_area'] / cell_area_m2, 4)
    p['far'] = round(p['floor_area'] / cell_area_m2, 2)

# Filter out cells with no buildings
grid_with_buildings = [c for c in grid_cells if c['properties']['building_count'] > 0]
print(f"Cells with buildings: {len(grid_with_buildings)}")

# Stats
max_far = max(c['properties']['far'] for c in grid_with_buildings)
avg_far = sum(c['properties']['far'] for c in grid_with_buildings) / len(grid_with_buildings)
max_density = max(c['properties']['density'] for c in grid_with_buildings)
print(f"Max FAR: {max_far}, Avg FAR: {avg_far:.2f}")
print(f"Max density: {max_density:.4f}")

# Save
geojson = {
    'type': 'FeatureCollection',
    'features': grid_with_buildings
}
with open('data/macau-grid.geojson', 'w') as f:
    json.dump(geojson, f, ensure_ascii=False)

print(f"Saved data/macau-grid.geojson ({len(json.dumps(geojson))} bytes)")
