#DEFAULT VALUES (customizable):
# inherit ITEM, WEST, NORTH, EAST, SOUTH from master.makefile or command.
escaped_A = $(subst $e ,_,$(ITEM))
escaped_ITEM = $(subst $e' ,\',$(escaped_A))# THIS TWO MAY BE MERGED ! $(subst $e' ,\',$(subst $e ,_,$(ITEM)) )
QUANTIZATION=1e4
TOPOJSON_LOC=../node_modules/topojson/bin/topojson
#TOPOJSON_LOC=../node_modules/.bin/topojson
# Admin layer:
SELECTOR_L1=admin IN ('$(ITEM)')
SELECTOR_PLACES=SELECT * FROM ne_10m_populated_places WHERE ADM0NAME = '$(ITEM)' ORDER BY POP_MAX DESC LIMIT 30
#SELECTOR_PLACES=SELECT * FROM ne_10m_populated_places WHERE ADM0NAME = '$(ITEM)' AND POP_MAX > '2000000'
#SELECTOR_PLACES=SELECT TOP 30 POP_MAX * FROM ne_10m_populated_places WHERE ADM0NAME = '$(ITEM)'
# STILL TO VERIFY:
SHP_ATT2ID=NAME
SHP_ATT2id=name


#MAKEFILE
done: topojson
	mkdir -p ../files/$(escaped_ITEM)
	mv administrative.topo.json countries.geo.json subunits.geo.json disputed.geo.json places.geo.json -t ../files/$(escaped_ITEM)/

topojson: geojson_filters places_fix countries_fix disputed_fix
	$(TOPOJSON_LOC) \
		--id-property none \
		-p name=name \
		-p inL1=region \
		-q $(QUANTIZATION) \
		--filter=small \
		-o administrative.topo.json \
		-- admin_0=countries.geo.json admin_1=subunits.geo.json places=places.geo.json disputed=disputed.geo.json

places_fix: geojson_filters
	$(TOPOJSON_LOC) \
		--id-property none \
		-p name=NAME \
		-p inL1=ADMIN1NAME \
		-q $(QUANTIZATION) \
		--filter=small \
		-o places.geo.json \
		-- places=places.tmp.geo.json
countries_fix: geojson_filters
	$(TOPOJSON_LOC) \
		--id-property none \
		-p name=NAME \
		-q $(QUANTIZATION) \
		--filter=small \
		-o countries.geo.json \
		-- admin_0=countries.tmp.geo.json
disputed_fix: geojson_filters
	$(TOPOJSON_LOC) \
		--id-property none \
		-p name=BRK_NAME \
		-p sovereign=SOVEREIGNT \
		-p note=NOTE_BRK \
		-q $(QUANTIZATION) \
		--filter=small \
		-o disputed.geo.json \
		-- disputed=disputed.tmp.geo.json

geojson_filters: crop unzip
	ogr2ogr -f GeoJSON \
		countries.tmp.geo.json \
		crop_L0.shp
	ogr2ogr -f GeoJSON \
		disputed.tmp.geo.json \
		crop_disputed.shp
	ogr2ogr -f GeoJSON -where "admin IN ('India')" \
		subunits.geo.json \
		ne_10m_admin_1_states_provinces.shp

	ogr2ogr -f GeoJSON -sql "$(SELECTOR_PLACES)" -dialect SQLITE \
		places.tmp.geo.json \
		ne_10m_populated_places.shp
#or "iso_a2 = 'AT' AND SCALERANK < 20" , see also sr_adm0_a3
#ADM0NAME = 'Egypt' OR ADM0NAME = 'Iran' OR SOV0NAME = 'Saudi Arabia' OR SOV0NAME = 'Lebanon' OR SOV0NAME = 'Turkey' OR SOV0NAME = 'Syria' OR SOV0NAME = 'Iraq' OR ISO_A2 = 'noFR'

crop: unzip touch
	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) ./crop_L0.shp ne_10m_admin_0_countries.shp
	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) ./crop_disputed.shp ne_10m_admin_0_disputed_areas.shp

touch: unzip
	touch ne_10m_admin_0_countries.shp
	touch ne_10m_admin_1_states_provinces.shp
	touch ne_10m_admin_0_disputed_areas.shp
	touch ne_10m_populated_places.shp
unzip: clean
	unzip -n ../data/NE/countries.zip 
	unzip -n ../data/NE/subunits.zip
	unzip -n ../data/NE/disputed.zip
	unzip -n ../data/NE/places.zip
	
clean:
	rm -f *.json
	rm -f *.dbf
	rm -f *.prj 
	rm -f *.shp
	rm -f *.shx
	rm -f *.html
	rm -f *.txt
