# survethi-monitoring-tool

**Survethi** stands for Surveillance Ethiopia, a PAT/AICS project ([link](https://www.informaticisenzafrontiere.org/en/progetti/migliorare-la-sorveglianza-e-il-controllo-delle-malattie-in-etiopia/) - AID011330) 

![image](https://user-images.githubusercontent.com/2938553/154437238-b6eb66a0-cc34-49a4-b2ba-f743669893d8.png)

Tool in Flask + Bootstrap (Python, Javascript) to show in real time and historical perspective, the data collected with [OpenHospital](https://github.com/informatici/openhospital) tool in St.Luke Hospital of Wolisso, Region of Oromia, South West Shoa Zone (SWSZ), Ethiopia.

Data are collected from phisicians in real-time, the tool queries the DB with a refresh rate for aggregated data (patients' details are never exposed!) and shows on the map the total numbers with geo-positions (provenance declared by the patients) and grouped by disease.

Historical data are meant for long term studies and comparations and are lazily (or on demand, but not automatically) queried by the DB, with filtering on provenance and diseases.

## included softwares

- Bootstrap 4.4.1 
  
  (+Essentials, +Toggle, +Select, +Popper.js, +tippy-bundle, +colors-css, +bootstrap-table, +bootstrap-table-export)

- jQuery 3.5.1

  (+ui, +touch-punch)

- Leaflet 1.5.1

  (+MarkerCluser, +Fullscreen, +heat, +history, +TimeDimension, +shpfile)

- HighCharts (+exporting, +offline-exporting, +export-data)
- DaterangePicker (+FontAwesome)
- Moment.js
- Lodash 4.17.15

## the initial idea

![survethi-monitoring-tool](https://github.com/informatici/survethi-monitoring-tool/blob/master/mockups/images/SurvethiMonitoringTool-4-change-filter.png)

![survethi-analysis](https://github.com/informatici/survethi-monitoring-tool/blob/master/mockups/images/SurvethiMonitoringTool-5-analysis-1-week.png)

## first install Flask (requires Python 3)
> pip install Flask

### install dependencies
> python -m pip install -r requirements.txt

### set Flask config.py
(edit with any text editor)

### set Flask Environment Variable
For Linux
```bash
export FLASK_APP=my-map-in-flask.py
export FLASK_ENV=development ### optional
```
For Windows
```bash
set FLASK_APP=my-map-in-flask.py
set FLASK_ENV=development
```
## run the application
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
(need OpenHospital's Wolisso-DB with `db_changes/` scripts applied)

Home (returns index.html) 
```
'/'
```

Query by dates (retrieve data for Real Time map) 
```
/query (default values = '2019-01-01'/'2019-12-31')
/query/<dateFrom>/<dateTo>
```

Query Grouped (just a different query)
```
/query_group (default values = '2019-01-01'/'2019-12-31')
/query_group/<dateFrom>/<dateTo>
```

Query Epoch (retrieve data for Historical Map)
```
/query_epoch (default values = '2019-01-01'/'2019-12-31')
/query_epoch/<dateFrom>/<dateTo>
```

Query Epoch Range (get the last available date range from historical data)
```
/query_epoch_range (default values = '2019-01-01'/'2019-12-31')
```

Query Epoch JSON (no query, just convert previous retrieved data to JSON)
```
/query_epoch_geojson_static (default values = '2019-01-01'/'2019-12-31')
```

Query Epoch GeoJSON (no query, just convert previous retrieved data to GeoJSON)
```
/query_epoch_geojson (default values = '2019-01-01'/'2019-12-31')
```

Diseases (returns the list of available diseases)
```
/diseases
```

Locations (returns the list of available locations)
```
/locations
```

## static datasets (for testing)
```
/test (uses datasource/datasource.json)
/test_group (uses datasource/datasource_group.json)
/test_diseases (uses datasource/diseases.json)
/test_locations (uses datasource/locations.json)
```
