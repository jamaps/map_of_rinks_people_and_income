ogr2ogr -f "GeoJSON" tor_boundary.geojson tor_boundary.shp

ogr2ogr -f "CSV" rinks.csv rinks.kml -lco GEOMETRY=AS_WKT

ogr2ogr -f "GeoJSON" rinks.geojson rinks.csv -dialect sqlite -sql "SELECT MakePoint(CAST(Long as REAL), CAST(Lat as REAL), 4326) Geometry, * FROM rinks"
