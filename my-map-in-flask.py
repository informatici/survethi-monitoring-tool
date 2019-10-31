from flask import Flask, escape, request, render_template, Response
from flask import jsonify
import MySQLdb
from datetime import datetime
from decimal import Decimal

import os.path

app = Flask(__name__)

# database connection settings
import MySQLdb
db=MySQLdb.connect(user="isf",passwd="isf123",db="wolisso",host="localhost")

@app.route('/', methods=['GET'])
def index():
    content = get_file('index2.php')
    return Response(content, mimetype="text/html")

@app.route('/user/<username>')
def show_user_profile(username):
    # show the user profile for that user
    return 'User %s' % escape(username)

@app.route('/post/<int:post_id>')
def show_post(post_id):
    # show the post with the given id, the id is an integer
    return 'Post %d' % post_id

@app.route('/path/<path:subpath>')
def show_subpath(subpath):
    # show the subpath after /path/
    return 'Subpath %s' % escape(subpath)

@app.route('/hello')
@app.route('/hello/<name>')
def hello(name=None):
    if name:
        return render_template('hello.html', name=name)
    else:
        name = request.args.get("name", "Nessuno")
        return f'Hello, {escape(name)}!'

@app.route('/query')
@app.route('/query/<dateFrom>/<dateTo>')
def query(dateFrom=None, dateTo=None):
    # execute default query on the DB
    if not dateFrom:
        dateFrom = '2019-01-01'
    if not dateTo:
        dateTo = '2019-01-31'
    default_query = "SELECT OPD_ID, OPD_DATE_VIS, OPD_DIS_ID_A, DIS_DESC, PAT_CITY, LOC_CITY, PAT_ADDR, LOC_ADDRESS, LOC_LAT, LOC_LONG FROM OPD \
                        LEFT JOIN PATIENT ON PAT_ID = OPD_PAT_ID \
                        LEFT JOIN DISEASE ON DIS_ID_A = OPD_DIS_ID_A \
                        LEFT JOIN LOCATION ON (PAT_CITY = LOC_CITY AND PAT_ADDR = LOC_ADDRESS) \
                        WHERE LOC_CITY IN ('Wonchi','Wolisso Rural','Wolisso Town','Goro') AND OPD_DATE_VIS BETWEEN '%s' AND '%s'" % (escape(dateFrom), escape(dateTo))
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(default_query)
    result = cursor.fetchall()
    return jsonify(result)

    
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


