from flask_cors import CORS
from flask import Flask, render_template, Response
from markupsafe import escape
from flask import jsonify
import MySQLdb
import csv
import geojson
from geojson import Feature, FeatureCollection, Point
from datetime import datetime
import json
import os.path
import requests

with open('static/shapes/survethi-monitoring-tool.geojson', 'r') as f:
    # read the GeoJSON file
    gj = geojson.load(f)

with open('static/shapes/survethi-monitoring-tool-woreda.geojson', 'r') as f:
    # read the GeoJSON file
    gj_zonal = geojson.load(f)

print('==> working with', len(gj.features), 'features')
gjmap = {str(x['properties']['RK_CODE']) : x for x in gj.features}
gjmap_zonal = {str(x['properties']['W_CODE']) : x for x in gj_zonal.features}

app = Flask(__name__)
if app.config["ENV"] == "production":
    app.config.from_object("config.ProductionConfig")
elif app.config["ENV"] == "testing":
    app.config.from_object("config.TestingConfig")
else:
    app.config.from_object("config.DevelopmentConfig")
print(app.config["ENV"])
CORS(app)

db = MySQLdb

default_position = [8.55611, 38.9741666] #WolisoTown, Kebele 01
epoch_csv_path = 'datasource/epoch.csv'
epoch_json_path = 'datasource/epoch.geojson'
zonal_csv_path = 'datasource/zonal_data.csv'
zonal_json_path = 'datasource/zonal_data.json'

@app.before_request
def before_request():
    app.jinja_env.cache = {}

def create_db_connection():
    # database connection settings
    global db
    db = MySQLdb.connect(
        user=app.config["DB_USERNAME"],
        passwd=app.config["DB_PASSWORD"],
        db=app.config["DB_NAME"],
        host=app.config["DB_HOST"],
        port=app.config["DB_PORT"])

def get_refresh_intervals():
    # define refresh interval in minutes, default as first element
    return ['1','5','15','30']

def get_diseases():
    create_db_connection()
    default_query = "SELECT * FROM DISEASE \
                    ORDER BY DIS_DESC"
    #print(default_query)                
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(default_query)
    result = cursor.fetchall()
    cursor.close()
    return jsonify(result)

def get_locations():
    create_db_connection()
    # execute default query on the DB
    default_query = "SELECT * FROM LOCATION \
                    ORDER BY LOC_CITY, LOC_ADDRESS"
    #print(default_query)                
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(default_query)
    result = cursor.fetchall()
    cursor.close()
    return jsonify(result)

@app.route('/test_connection', methods=['GET'])
def test_connection():
    try:
        create_db_connection()
        return jsonify(True)
    except Exception:
        return jsonify(False)

@app.route('/', methods=['GET'])
def index():
    try:
        create_db_connection()
        get_diseases()
        get_locations()
    except Exception:
        pass
    return render_template('base.html', 
        title='Survethi Monitoring Tool', 
        refresh_intervals=get_refresh_intervals()
    )

@app.route('/query')
@app.route('/query/<dateFrom>/<dateTo>')
def query(dateFrom=None, dateTo=None):
    create_db_connection()
    # execute default query on the DB
    if not dateFrom:
        dateFrom = '2020-05-01'
    if not dateTo:
        dateTo = '2020-05-01'
    default_query = "SELECT OPD_ID, OPD_DATE_VIS, OPD_DIS_ID_A, DIS_DESC, PAT_CITY, LOC_CITY, PAT_ADDR, LOC_ADDRESS, \
                        LOC_LAT, LOC_LONG, LOC_RK_CODE, LOC_W_CODE FROM OPD \
                        LEFT JOIN PATIENT ON PAT_ID = OPD_PAT_ID \
                        LEFT JOIN DISEASE ON DIS_ID_A = OPD_DIS_ID_A \
                        LEFT JOIN LOCATION ON(PAT_CITY = LOC_CITY AND PAT_ADDR = LOC_ADDRESS) \
                        WHERE OPD_DATE_VIS BETWEEN '%s' AND '%s'" %(escape(dateFrom), escape(dateTo))
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(default_query)
    result = cursor.fetchall()
    cursor.close()
    return jsonify(result)

@app.route('/query_group')
@app.route('/query_group/<dateFrom>/<dateTo>')
def query_group(dateFrom=None, dateTo=None):
    create_db_connection()
    # execute default query on the DB
    if not dateFrom:
        dateFrom = '2020-01-01'
    if not dateTo:
        dateTo = '2020-05-01'
    default_query = "SELECT 'OPD' AS TYPE, COUNT(*) AS COUNT, OPD.* FROM( \
                        SELECT OPD_ID AS TYPE_ID, OPD_DATE_VIS AS DATE, OPD_DIS_ID_A AS DIS_ID_A, DIS_DESC, PAT_CITY, LOC_CITY, PAT_ADDR, LOC_ADDRESS, \
                            LOC_LAT, LOC_LONG, \
                            (SELECT LOC_RK_CODE FROM LOCATION WHERE PAT_CITY=LOC_CITY AND PAT_ADDR=LOC_ADDRESS LIMIT 1) AS LOC_RK_CODE, \
                            (SELECT LOC_W_CODE FROM LOCATION WHERE PAT_CITY=LOC_CITY LIMIT 1) AS LOC_W_CODE, \
                            IF(LOC_LAT IS NULL, 0, 1) AS LOC_OK \
                        FROM OPD \
                            LEFT JOIN PATIENT ON PAT_ID = OPD_PAT_ID \
                            LEFT JOIN DISEASE ON DIS_ID_A = OPD_DIS_ID_A \
                            LEFT JOIN LOCATION ON(PAT_CITY = LOC_CITY AND PAT_ADDR = LOC_ADDRESS) \
                        WHERE OPD_DATE_VIS BETWEEN '%s' AND '%s' \
                    ) OPD \
                    GROUP BY DIS_ID_A, PAT_CITY, LOC_CITY, PAT_ADDR \
                    UNION \
                    SELECT 'IPD' AS TYPE, COUNT(*) AS COUNT, IPD.* FROM( \
                        SELECT ADM_ID AS TYPE_ID, DATE(ADM_DATE_DIS) AS DATE, ADM_OUT_DIS_ID_A AS DIS_ID_A, DIS_DESC, PAT_CITY, LOC_CITY, PAT_ADDR, LOC_ADDRESS, \
							LOC_LAT, LOC_LONG, \
							(SELECT LOC_RK_CODE FROM LOCATION WHERE PAT_CITY=LOC_CITY AND PAT_ADDR=LOC_ADDRESS LIMIT 1) AS LOC_RK_CODE, \
							(SELECT LOC_W_CODE FROM LOCATION WHERE PAT_CITY=LOC_CITY LIMIT 1) AS LOC_W_CODE, \
							IF(LOC_LAT IS NULL, 0, 1) AS LOC_OK \
                        FROM ADMISSION \
                            LEFT JOIN PATIENT ON PAT_ID = ADM_PAT_ID \
                            LEFT JOIN DISEASE ON DIS_ID_A = ADM_OUT_DIS_ID_A \
                            LEFT JOIN LOCATION ON(PAT_CITY = LOC_CITY AND PAT_ADDR = LOC_ADDRESS) \
                        WHERE ADM_DATE_DIS IS NOT NULL AND \
							ADM_DATE_DIS BETWEEN '%s' AND '%s' \
                    ) IPD \
                    GROUP BY DIS_ID_A, PAT_CITY, LOC_CITY, PAT_ADDR \
                    ORDER BY TYPE, COUNT DESC" % (escape(dateFrom), escape(dateTo), escape(dateFrom), escape(dateTo))
    #print(default_query)                
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(default_query)
    result = cursor.fetchall()
    cursor.close()
    return jsonify(result)

@app.route('/query_epoch')
@app.route('/query_epoch/<dateFrom>/<dateTo>')
def query_epoch(dateFrom=None, dateTo=None):
    create_db_connection()
    # execute default query on the DB
    if not dateFrom:
        dateFrom = '2019-01-01'
    if not dateTo:
        dateTo = '2019-12-31'
    default_query = "SELECT 'OPD' AS TYPE, OPD_ID AS ID, OPD_DIS_ID_A, OPD_DATE, LOC_CITY, LOC_ADDRESS, LOC_LAT, LOC_LONG, \
                        (SELECT LOC_RK_CODE FROM LOCATION WHERE PAT_CITY=LOC_CITY AND PAT_ADDR=LOC_ADDRESS LIMIT 1) AS LOC_RK_CODE, \
                        (SELECT LOC_W_CODE FROM LOCATION WHERE PAT_CITY=LOC_CITY LIMIT 1) AS LOC_W_CODE \
                        FROM OPD \
                            LEFT JOIN PATIENT ON PAT_ID = OPD_PAT_ID \
                            LEFT JOIN LOCATION ON(PAT_CITY = LOC_CITY AND PAT_ADDR = LOC_ADDRESS) \
                        WHERE OPD_DATE BETWEEN '%s' AND '%s' \
                    UNION \
                    SELECT 'IPD' AS TYPE, ADM_ID AS ID, ADM_OUT_DIS_ID_A, DATE(ADM_DATE_DIS), PAT_CITY, PAT_ADDR, LOC_LAT, LOC_LONG, \
                        (SELECT LOC_RK_CODE FROM LOCATION WHERE PAT_CITY=LOC_CITY AND PAT_ADDR=LOC_ADDRESS LIMIT 1) AS LOC_RK_CODE, \
                        (SELECT LOC_W_CODE FROM LOCATION WHERE PAT_CITY=LOC_CITY LIMIT 1) AS LOC_W_CODE \
                        FROM ADMISSION \
                            LEFT JOIN PATIENT ON PAT_ID = ADM_PAT_ID \
                            LEFT JOIN LOCATION ON (PAT_CITY = LOC_CITY AND PAT_ADDR = LOC_ADDRESS) \
                            LEFT JOIN DISEASE ON DIS_ID_A = ADM_OUT_DIS_ID_A \
                        WHERE ADM_DATE_DIS IS NOT NULL AND \
							ADM_DATE_DIS BETWEEN '%s' AND '%s' \
                    ORDER BY OPD_DATE" % (escape(dateFrom), escape(dateTo), escape(dateFrom), escape(dateTo))
    
    #print(default_query)
    print('==> fetching data...', end='')             
    cursor = db.cursor()
    cursor.execute(default_query)
    result = cursor.fetchall()
    cursor.close()
    # CSV
    with open(epoch_csv_path, 'w', newline='') as csvfile:
        column_names = list()
        for i in cursor.description:
            column_names.append(i[0])

        writer = csv.writer(csvfile, delimiter=',')
        writer.writerow(column_names)
        writer.writerows(result)
        print('done!')

    return dateFrom, dateTo

@app.route('/query_zonal_range')
def query_zonal_range():
    
    zonal_range = {'min': None, 'max': None}
    try:
        with open(zonal_csv_path, newline='') as csvfile:
            print('==> check already fetched data...', end='')
            reader = csv.reader(csvfile, delimiter=';')
            next(reader, None)  # skip the headers
            for sn, lab, sex, age, region, zone, woreda, facility, date_in, result, w_code, disease, desc, type, city, count in reader:
                date = datetime.strptime(date_in, '%d/%m/%Y')
                date_str = date.strftime('%Y-%m-%d')
                if not zonal_range['min'] or date_str < zonal_range['min']:
                    zonal_range['min'] = date_str

                if not zonal_range['max'] or date_str > zonal_range['max']:
                    zonal_range['max'] = date_str

    except Exception:
        print('Warning: zonal parsing data: empty datasource (needs query)')
        
    return zonal_range

@app.route('/query_zonal_data')
@app.route('/query_zonal_data/<dateFrom>/<dateTo>')
def query_zonal_json(dateFrom=None, dateTo=None):

    data = []
    with open(zonal_csv_path, newline='') as csvfile:
        print('==> processing data...')
        reader = csv.DictReader(csvfile, delimiter=';')
        next(reader, None)  # skip the headers
        for row in reader:
            
            #date = row['Date of Specimen collection']
            date = datetime.strptime(row['Date of Specimen collection'], '%d/%m/%Y')
            date_str = date.strftime('%Y-%m-%d %H:%I:%S')
            #print('date : ', date)
            if dateFrom and dateTo and (date_str < dateFrom or date_str > dateTo):
                #print('skipped : ', date)
                continue # skip dates out of range (if any)

            #print('processing : ', row)
            data.append(row)
    
    print('zonal data : %d records' % len(data))
    with open(zonal_json_path, 'w', encoding='utf-8') as jsonf:
        jsonf.write(json.dumps(data))

    with open(zonal_json_path) as json_file:
        json_data = json.load(json_file)
    
    return jsonify(json_data)

@app.route('/query_epoch_range')
def query_epoch_range():
    
    epoch_range = {'min': None, 'max': None}
    try:
        with open(epoch_csv_path, newline='') as csvfile:
            print('==> check already fetched data...', end='')
            reader = csv.reader(csvfile, delimiter=',')
            next(reader, None)  # skip the headers
            for disease, date, city, address, latitude, longitude in reader:
                if not epoch_range['min'] or date < epoch_range['min']:
                    epoch_range['min'] = date

                if not epoch_range['max'] or date > epoch_range['max']:
                    epoch_range['max'] = date

    except Exception:
        print('Warning: epoch parsing data: empty datasource (needs query)')
        
    return epoch_range

@app.route('/query_epoch_geojson')
@app.route('/query_epoch_geojson/<dateFrom>/<dateTo>')
def query_epoch_geojson(dateFrom=None, dateTo=None):
    # GeoJSON
    features = []
    try:
        with open(epoch_csv_path, newline='') as csvfile:
            print('==> processing data...')
            reader = csv.reader(csvfile, delimiter=',')
            next(reader, None)  # skip the headers
            for type, id, disease, date, city, address, latitude, longitude, rk_code, w_code in reader:
                # if disease in ('2.1', '2.2'):
                #     print('found : ', type, id, disease, date, latitude, longitude, rk_code, w_code) 
                #print('processing : ', disease, date, latitude, longitude, rk_code, w_code)
                if dateFrom and dateTo and (date < dateFrom or date > dateTo):
                        continue # skip dates out of range (if any)

                # adding Points (Health Posts) - if latitude (or longitude) are not null
                # if latitude != '':
                #     try:    
                #         latitude, longitude = map(float, (latitude, longitude))
                #         features.append(
                #             Feature(
                #                 geometry = Point((longitude, latitude)),
                #                 properties = {
                #                     'disease': disease,
                #                     'epoch': date,
                #                     'town' : city,
                #                     'kebele' : address,
                #                     'time': date.replace(" ", "T") + '.000Z', #ISO8601 format
                #                     'RK_CODE': rk_code,
                #                     'W_CODE': w_code,
                #                     'RK_NAME': address,
                #                 }
                #             )
                #         )
                #         #print('added: Point')
                #     except Exception:
                #         print('skipped : ', disease, date, latitude, longitude, rk_code, w_code)
                #         pass #useful when log above is commented

                # adding shapes - all, but in different count number
                if rk_code != '':
                    gj_properties = gjmap.get(str(rk_code))['properties']
                    features.append(
                        Feature(
                            geometry = gjmap.get(str(rk_code))['geometry'],
                            properties = {
                                'disease': disease,
                                'epoch': date,
                                'town' : city,
                                'kebele' : address,
                                'time': date.replace(" ", "T") + '.000Z', #ISO8601 format
                                'W_NAME': gj_properties['W_NAME'],
                                'RK_NAME': gj_properties['RK_NAME'],
                                'Z_NAME': gj_properties['Z_NAME'],
                                'RK_CODE': rk_code,
                                'W_CODE': w_code,
                                'TYPE': type,
                            }
                        )
                    )

                elif w_code != '':
                    #print('skipped : ', disease, date, latitude, longitude, rk_code, w_code)
                    pass
                    
                else:
                    #print('skipped : ', type, id, disease, date, latitude, longitude, rk_code, w_code)
                    pass #useful when log above is commented
                
    except Exception as e:
        print (e)
        print('Warning: GeoJSON parsing data: empty datasource (needs query)')
        json_data = ""


    collection = FeatureCollection(features)
    print('==> parsed fatures', len(collection.features), 'features')
    with open(epoch_json_path, "w") as geojsonfile:
        geojsonfile.write('%s' % collection)

    with open(epoch_json_path) as json_file:
        json_data = json.load(json_file)
    
    return jsonify(json_data)

@app.route('/query_zonal_geojson')
@app.route('/query_zonal_geojson/<dateFrom>/<dateTo>')
def query_zonal_geojson(dateFrom=None, dateTo=None):
    # GeoJSON
    features = []
    print('zonal range : ', query_zonal_range())
    try:
        with open(zonal_csv_path, newline='') as csvfile:
            print('==> processing zonal data...')
            reader = csv.reader(csvfile, delimiter=';')
            next(reader, None)  # skip the headers
            for serial, lab, sex, age, region, zone, woreda, facility, date_in, result, w_code, disease, desc, type, city, count in reader:
                date = datetime.strptime(date_in, '%d/%m/%Y')
                date_str = date.strftime('%Y-%m-%d')
                time_str = date.strftime('%Y-%m-%d %H:%I:%S')
                
                # if disease in ('2.1', '2.2'):
                #     print('found : ', serial, lab, sex, age, region, zone, woreda, facility, date_str, result, w_code, disease, desc, type, city, count) 
                #print('processing : ', disease, date, latitude, longitude, rk_code, w_code)
                if dateFrom and dateTo and (date_str < dateFrom or date_str > dateTo):
                    #print('date : ', date_str, dateFrom, dateTo, (date_str < dateFrom or date_str > dateTo))
                    continue # skip dates out of range (if any)
                # else:
                #     print('date in range : ', date_str, dateFrom, dateTo, (date_str > dateFrom or date_str < dateTo))
                # adding shapes - all, but in different count number
                if w_code != '':
                    gj_properties = gjmap_zonal.get(str(w_code))['properties']
                    features.append(
                        Feature(
                            geometry = gjmap_zonal.get(str(w_code))['geometry'],
                            properties = {
                                'disease': disease,
                                'epoch': date_str,
                                'town' : city,
                                'woreda' : woreda,
                                'kebele' : '',
                                'time': time_str.replace(" ", "T") + '.000Z', #ISO8601 format
                                'W_NAME': gj_properties['W_NAME'],
                                'RK_NAME': gj_properties['RK_NAME'],
                                'Z_NAME': gj_properties['Z_NAME'],
                                'RK_CODE': '',
                                'W_CODE': w_code,
                                'TYPE': type,
                            }
                        )
                    )
                    
                else:
                    print('unparsed : ', serial, lab, sex, age, region, zone, woreda, facility, date_in, result, w_code, disease, desc, type, city, count)
                    pass #useful when log above is commented
                
    except Exception as e:
        print (e)
        print('Warning: Zonal GeoJSON parsing data: empty datasource (needs query)')
        json_data = ""

    collection = FeatureCollection(features)
    print('==> parsed fatures', len(collection.features), 'features')
    with open(zonal_json_path, "w") as geojsonfile:
        geojsonfile.write('%s' % collection)

    with open(zonal_json_path) as json_file:
        json_data = json.load(json_file)
    
    return jsonify(json_data)

@app.route('/query_epoch_geojson_static')
def query_epoch_geojson_static():
    with open(epoch_json_path) as json_file:
        json_data = json.load(json_file)
    
    return jsonify(json_data)

@app.route('/diseases')
def diseases():
    return get_diseases()

@app.route('/test_diseases')
def test_diseases(return_json=False):
    # read test file from datasource/ folder
    with open("datasource/diseases.json") as json_file:
        json_data = json.load(json_file)
    if return_json:
        return json_data
    else:
        return jsonify(json_data)

@app.route('/locations')
def locations():
    return get_locations()

@app.route('/test_locations')
def test_locations(return_json=False):
    # read test file from datasource/ folder
    with open("datasource/locations.json") as json_file:
        json_data = json.load(json_file)
    if return_json:
        return json_data
    else:
        return jsonify(json_data)


@app.route('/test')
def test(dateFrom=None, dateTo=None, return_json=False):
    # read test file from datasource/ folder
    with open("datasource/datasource.json") as json_file:
        json_data = json.load(json_file)
    if return_json:
        return json_data
    else:
        return jsonify(json_data)

@app.route('/test_group')
def test_group(dateFrom=None, return_json=False):
    # read test file from datasource/ folder
    with open("datasource/datasource_group.json") as json_file:
        json_data = json.load(json_file)
    if return_json:
        return json_data
    else:
        return jsonify(json_data)

    
def root_dir():  # pragma: no cover
    return os.path.abspath(os.path.dirname(__file__))

def get_file(filename):  # pragma: no cover
    try:
        src = os.path.join(root_dir(), filename)
        # Figure out how flask returns static files
        # Tried:
        # - render_template
        # - send_file
        # This should not be so non-obvious
        return open(src).read()
    except IOError as exc:
        return str(exc)

@app.route('/generate_pdf')
def generate_pdf():
    puppeteer_server_url = 'http://localhost:3000'
    url = 'http://localhost:5000'
    puppeteer_url = f'{puppeteer_server_url}/generate-pdf?url={url}'
    
    try:
        response = requests.get(puppeteer_url)
        if response.status_code == 200:
            return Response('PDF generated and sent to the distribution list.', status=200)
        elif response.status_code == 201:
            return Response('PDF generated.', status=200)
        else:
            return Response('Failed to generate PDF.', status=response.status_code)
    except requests.exceptions.RequestException as e:
        return Response(f'Error: {str(e)}', status=500)