from flask_cors import CORS
from flask import Flask, escape, request, render_template, Response
from flask import jsonify
import MySQLdb
from datetime import datetime
from decimal import Decimal
import json
import os.path

app = Flask(__name__)

CORS(app)
db = MySQLdb

default_position = [8.55611, 38.9741666] #WolisoTown, Kebele 01

@app.before_request
def before_request():
    app.jinja_env.cache = {}

def createDBconnection():
    # database connection settings
    global db
    db = MySQLdb.connect(user="isf",passwd="isf123",db="wolisso",host="localhost")

def getRefreshIntervals():
    # define refresh interval in minutes, default as first element
    return ['1','5','15','30']

@app.route('/', methods=['GET'])
def index():
    #content_map = get_file('map.html')
    #content_data = test_group(return_json=True)
    #content_main_map_menu = get_file('map.html')

    content_refresh_intervals=getRefreshIntervals()

    #return Response(content, mimetype="text/html")
    return render_template('base.html', 
        title='Survethi Monitoring Tool', 
        #main_map_menu=content_main_map_menu,
        #main_map=content_map,
        #main_filter=content_map,
        #main_table=content_data,

        refresh_intervals=content_refresh_intervals
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
                        IFNULL(LOC_LAT, %s) AS LOC_LAT, IFNULL(LOC_LONG, %s) AS LOC_LONG FROM OPD \
                        LEFT JOIN PATIENT ON PAT_ID = OPD_PAT_ID \
                        LEFT JOIN DISEASE ON DIS_ID_A = OPD_DIS_ID_A \
                        LEFT JOIN LOCATION ON(PAT_CITY = LOC_CITY AND PAT_ADDR = LOC_ADDRESS) \
                        WHERE LOC_CITY IN('Wonchi','Wolisso Rural','Wolisso Town','Goro') \
                        AND OPD_DATE_VIS BETWEEN '%s' AND '%s'" %(default_position[0], default_position[1], escape(dateFrom), escape(dateTo))
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
                        IFNULL(LOC_LAT, %s) AS LOC_LAT, IFNULL(LOC_LONG, %s) AS LOC_LONG FROM OPD \
                        LEFT JOIN PATIENT ON PAT_ID = OPD_PAT_ID \
                        LEFT JOIN DISEASE ON DIS_ID_A = OPD_DIS_ID_A \
                        LEFT JOIN LOCATION ON(PAT_CITY = LOC_CITY AND PAT_ADDR = LOC_ADDRESS) \
                        WHERE LOC_CITY IN ('Wonchi', 'Wolisso Rural','Wolisso Town','Goro') \
                        AND OPD_DATE_VIS BETWEEN '%s' AND '%s' \
                    ) INTERNAL \
                    GROUP BY OPD_DIS_ID_A, PAT_CITY, PAT_ADDR \
                    ORDER BY COUNT DESC" %(default_position[0], default_position[1], escape(dateFrom), escape(dateTo))
    #print(default_query)                
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(default_query)
    result = cursor.fetchall()
    return jsonify(result)

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
