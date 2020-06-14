from flask_cors import CORS
from flask import Flask, escape, request, render_template, Response
from flask import jsonify
import MySQLdb
import csv
from geojson import Feature, FeatureCollection, Point
from datetime import datetime
from decimal import Decimal
import json
import os.path

app = Flask(__name__)
if app.config["ENV"] == "production":
    app.config.from_object("config.ProductionConfig")
else:
    app.config.from_object("config.DevelopmentConfig")
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
        host=app.config["DB_HOST"])

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
                        LOC_LAT, LOC_LONG FROM OPD \
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
    default_query = "SELECT OPD_DIS_ID_A, OPD_DATE, LOC_LAT, LOC_LONG \
                        FROM OPD \
                        LEFT JOIN PATIENT ON PAT_ID = OPD_PAT_ID \
                        LEFT JOIN LOCATION ON(PAT_CITY = LOC_CITY AND PAT_ADDR = LOC_ADDRESS) \
                        WHERE OPD_DATE_VIS BETWEEN '%s' AND '%s' \
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
    return jsonify('Done')

@app.route('/query_epoch_json')
def query_epoch_json():
    # GeoJSON
    features = []
    with open('datasource/epoch.csv', newline='') as csvfile:

        reader = csv.reader(csvfile, delimiter=',')
        next(reader, None)  # skip the headers
        for disease, date, latitude, longitude in reader:

            if latitude == '': 
                next(reader, None) # skip empty geopositions

            try:    
                latitude, longitude = map(float, (latitude, longitude))
                features.append(
                    Feature(
                        geometry = Point((longitude, latitude)),
                        properties = {
                            'disease': disease,
                            'epoch': date
                        }
                    )
                )
            except:
                #print(disease, date, latitude, longitude)
                pass

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
def test_diseases(dateFrom=None, dateTo=None, return_json=False):
    # read test file from datasource/ folder
    with open("datasource/diseases.json") as json_file:
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
