

/* **************************************************************** */
/* *********************  WANT TO DO MORE ?  ********************** */
## Tips
#### More properties ? 
```
# Keep more properties from the original administrative shapefile:
make topo/ch-cantons.json PROPERTIES=id=+KANTONSNUM,name=NAME,abbr=ABBR
```

#### Topojson to shapefile ?
```
# Convert topoJSON into ESRI Shapefile via shell
ogr2ogr -f 'Esri Shapefile' -lco=UTF8 output.shp input.geo.json
```

### Reproject to Spherical Coordinates (0%)
If you want to combine your JSON files with other libraries like [Leaflet](http://leafletjs.com) or want to use another projection, you need to reproject the files to spherical coordinates first. You can do this by simply running

    make topo/ch-cantons.json REPROJECT=true

It's double important that you run `make clean` or `rm -rf shp` first if you've generated files in cartesian coordinates (the default mode) before. Otherwise TopoJSON will throw an error. The `WIDTH` and `HEIGHT` variables will be ignored.

## Output (50%)

**Country (L0)**
* *id* ('IT')
* *name* ('ITALY')

**State (L1)**
* *id* (the official id number)
* *name*

**District (L2)**
* *id* (the official id number)
* *name*

**Lake & waters bodies**
* *id* {WHAT}
* *name*

**Rivers**
* *id* {WHAT}
* *name*

**Topography**
* *id* (elevation)

### Data Source (80%: miss license)

We are build and tested to work with the following open sources data:

* NaturalEarth —— for administrative divisions.
 * Admin L0
 * Admin L1
* ETOPO1  ——  for topography.
* SRTM ——  for topography.
* [Wikipedia:Map Workshop/GIS resources](https://en.wikipedia.org/wiki/Wikipedia:Graphic_Lab/Resources/Gis_sources_and_palettes)


Make sure you run `make clean` if you've generated files before because `make` won't overwrite them if they already exist.




