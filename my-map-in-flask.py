from flask_cors import CORS
from flask import Flask, escape, request, render_template, Response
from flask import jsonify
import MySQLdb
import csv
from geojson import Feature, FeatureCollection, Point
import datetime
from decimal import Decimal
import json
import os.path

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

@app.before_request
def before_request():
    app.jinja_env.cache = {}

def createDBconnection():
    # database connection settings
    global db
    db = MySQLdb.connect(
        user=app.config["DB_USERNAME"],
        passwd=app.config["DB_PASSWORD"],
        db=app.config["DB_NAME"],
        host=app.config["DB_HOST"],
        port=app.config["DB_PORT"])

def getRefreshIntervals():
    # define refresh interval in minutes, default as first element
    return ['1','5','15','30']

@app.route('/', methods=['GET'])
def index():
    return render_template('base.html', 
        title='Survethi Monitoring Tool', 
        refresh_intervals=getRefreshIntervals()
    )

@app.route('/query')
@app.route('/query/<dateFrom>/<dateTo>')
def query(dateFrom=None, dateTo=None):
    createDBconnection()
    # execute default query on the DB
    if not dateFrom:
        dateFrom = '2020-05-01'
    if not dateTo:
        dateTo = '2020-05-01'
    default_query = "SELECT OPD_ID, OPD_DATE_VIS, OPD_DIS_ID_A, DIS_DESC, PAT_CITY, LOC_CITY, PAT_ADDR, LOC_ADDRESS, \
                        LOC_LAT, LOC_LONG FROM OPD \
                        LEFT JOIN PATIENT ON PAT_ID = OPD_PAT_ID \
                        LEFT JOIN DISEASE ON DIS_ID_A = OPD_DIS_ID_A \
                        LEFT JOIN LOCATION ON(PAT_CITY = LOC_CITY AND PAT_ADDR = LOC_ADDRESS) \
                        WHERE OPD_DATE_VIS BETWEEN '%s' AND '%s'" %(escape(dateFrom), escape(dateTo))
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(default_query)
    result = cursor.fetchall()
    return jsonify(result)

@app.route('/query_group')
@app.route('/query_group/<dateFrom>/<dateTo>')
def query_group(dateFrom=None, dateTo=None):
    createDBconnection()
    # execute default query on the DB
    if not dateFrom:
        dateFrom = '2020-01-01'
    if not dateTo:
        dateTo = '2020-05-01'
    default_query = "SELECT COUNT(*) AS COUNT, INTERNAL.* FROM( \
                        SELECT OPD_ID, OPD_DATE_VIS, OPD_DIS_ID_A, DIS_DESC, PAT_CITY, LOC_CITY, PAT_ADDR, LOC_ADDRESS, \
                        LOC_LAT, LOC_LONG, IF(LOC_LAT IS NULL, 0, 1) AS LOC_OK FROM OPD \
                        LEFT JOIN PATIENT ON PAT_ID = OPD_PAT_ID \
                        LEFT JOIN DISEASE ON DIS_ID_A = OPD_DIS_ID_A \
                        LEFT JOIN LOCATION ON(PAT_CITY = LOC_CITY AND PAT_ADDR = LOC_ADDRESS) \
                        WHERE OPD_DATE_VIS BETWEEN '%s' AND '%s' \
                    ) INTERNAL \
                    GROUP BY OPD_DIS_ID_A, PAT_CITY, LOC_CITY, PAT_ADDR \
                    ORDER BY COUNT DESC" %(escape(dateFrom), escape(dateTo))
    #print(default_query)                
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(default_query)
    result = cursor.fetchall()
    #TODO: cursor to be closed? cursor.close()
    return jsonify(result)

@app.route('/query_epoch')
@app.route('/query_epoch/<dateFrom>/<dateTo>')
def query_epoch(dateFrom=None, dateTo=None):
    createDBconnection()
    # execute default query on the DB
    if not dateFrom:
        dateFrom = '2019-01-01'
    if not dateTo:
        dateTo = '2019-12-31'
    default_query = "SELECT OPD_DIS_ID_A, OPD_DATE, LOC_CITY, LOC_ADDRESS, LOC_LAT, LOC_LONG \
                        FROM OPD \
                        LEFT JOIN PATIENT ON PAT_ID = OPD_PAT_ID \
                        LEFT JOIN LOCATION ON(PAT_CITY = LOC_CITY AND PAT_ADDR = LOC_ADDRESS) \
                        WHERE OPD_DATE BETWEEN '%s' AND '%s' \
                        ORDER BY OPD_DATE " %(escape(dateFrom), escape(dateTo))
    #print(default_query)                
    cursor = db.cursor()
    cursor.execute(default_query)
    result = cursor.fetchall()

    # CSV
    with open('datasource/epoch.csv', 'w', newline='') as csvfile:
        column_names = list()
        for i in cursor.description:
            column_names.append(i[0])

        writer = csv.writer(csvfile, delimiter=',')
        writer.writerow(column_names)
        writer.writerows(result)

    #cursor.close()
    #TODO: cursor to be closed? cursor.close()
    return dateFrom, dateTo

@app.route('/query_epoch_range')
def query_epoch_range():
    
    range = {'min': None, 'max': None}
    try:
        with open('datasource/epoch.csv', newline='') as csvfile:
            reader = csv.reader(csvfile, delimiter=',')
            next(reader, None)  # skip the headers
            for disease, date, city, address, latitude, longitude in reader:
                if not range['min'] or date < range['min']:
                    range['min'] = date

                if not range['max'] or date > range['max']:
                    range['max'] = date

    except:
        print('Warning: epoch parsing data: empty datasource (needs query)')
        
    return range

@app.route('/query_epoch_json')
@app.route('/query_epoch_json/<dateFrom>/<dateTo>')
def query_epoch_json(dateFrom=None, dateTo=None):
    # GeoJSON
    features = []
    try:
        with open('datasource/epoch.csv', newline='') as csvfile:
            
            reader = csv.reader(csvfile, delimiter=',')
            next(reader, None)  # skip the headers
            for disease, date, city, address, latitude, longitude in reader:

                if latitude == '':
                    continue  # skip empty geopositions

                if dateFrom and dateTo:
                    if date < dateFrom or date > dateTo:
                        continue # skip dates out of range (if any)

                try:    
                    latitude, longitude = map(float, (latitude, longitude))
                    features.append(
                        Feature(
                            geometry = Point((longitude, latitude)),
                            properties = {
                                'disease': disease,
                                'epoch': date,
                                'town' : city,
                                'kebele' : address,
                                'time': date.replace(" ", "T") + '.000Z' #ISO8601 format
                            }
                        )
                    )
                except:
                    #print(disease, date, latitude, longitude)
                    pass
    except:
        print('Warning: GeoJSON parsing data: empty datasource (needs query)')
        json_data = ""


    collection = FeatureCollection(features)
    with open("datasource/epoch.json", "w") as geojsonfile:
        geojsonfile.write('%s' % collection)

    with open("datasource/epoch.json") as json_file:
        json_data = json.load(json_file)
    
    return jsonify(json_data)

@app.route('/query_epoch_json_static')
def query_epoch_json_static():
    with open("datasource/epoch.json") as json_file:
        json_data = json.load(json_file)
    
    return jsonify(json_data)

@app.route('/diseases')
def diseases():
    createDBconnection()
    # execute default query on the DB
    default_query = "SELECT * FROM DISEASE \
                    ORDER BY DIS_DESC"
    #print(default_query)                
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(default_query)
    result = cursor.fetchall()
    return jsonify(result)

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
    createDBconnection()
    # execute default query on the DB
    default_query = "SELECT * FROM LOCATION \
                    ORDER BY LOC_CITY, LOC_ADDRESS"
    #print(default_query)                
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(default_query)
    result = cursor.fetchall()
    return jsonify(result)

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
