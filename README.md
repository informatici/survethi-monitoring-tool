# survethi-monitoring-tool

![survethi-monitoring-tool](https://github.com/informatici/survethi-monitoring-tool/blob/master/mockups/images/SurvethiMonitoringTool-4-change-filter.png)

![survethi-analysis](https://github.com/informatici/survethi-monitoring-tool/blob/master/mockups/images/SurvethiMonitoringTool-5-analysis-1-week.png)


## First install Flask
> pip install Flask

## Install dependencies
> python -m pip install -r requirements.txt

## Set Flask Environment Variable 
> export FLASK_APP=my-map-in-flask.py
> export FLASK_ENV=development ### optional 

## Run the application
> flask run
```
 * Serving Flask app "my-map-in-flask.py"
 * Environment: production
   WARNING: This is a development server. Do not use it in a production deployment.
   Use a production WSGI server instead.
 * Debug mode: off
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
```

## API (draft)

Home (returns index.html) 
```
'/'
```

Query by dates (needs [OpenHospital](https://github.com/informatici/openhospital) DB)
```
/query (default values = '2019-01-01'/'2019-12-31'
/query/<dateFrom>/<dateTo>
```

Query Grouped (just a different query)
```
/query_group
/query_group/<dateFrom>/<dateTo>
```
   
Fixed datasets
```
/test (uses datasource/datasource.json)
/test_group (uses datasource/datasource_group.json)
```
