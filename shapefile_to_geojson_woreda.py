# https://stackoverflow.com/a/47296605/5309541
import shapefile
from json import dumps

# read the shapefile
reader = shapefile.Reader('static/shapes/survethi-monitoring-tool-woreda.shp')
fields = reader.fields[1:]
field_names = [field[0] for field in fields]
buffer = []
for sr in reader.shapeRecords():
    atr = dict(zip(field_names, sr.record))
    geom = sr.shape.__geo_interface__
    buffer.append(dict(type='Feature', \
    geometry=geom, properties=atr)) 
   
# write the GeoJSON file   
geojson = open('static/shapes/survethi-monitoring-tool-woreda.geojson', 'w')
geojson.write(dumps({'type': 'FeatureCollection', 'features': buffer}, indent=2) + '\n')
geojson.close()

# https://stackoverflow.com/a/47792385/5309541
import geojson
with open('static/shapes/survethi-monitoring-tool-woreda.geojson', 'r') as f:

    # read the GeoJSON file
    gj = geojson.load(f)

#print(gj['features'][5])
print(len(gj.features), 'features found')