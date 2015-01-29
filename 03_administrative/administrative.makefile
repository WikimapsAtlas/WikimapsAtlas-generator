#DEFAULT VALUES (customizable):
# inherit ITEM, WEST, NORTH, EAST, SOUTH from master.makefile or command.
#make -f ./administrative.makefile ITEM=World WEST=-30 NORTH=90 EAST=60 SOUTH=0 QUANTIZATION=1e5
escaped_A = $(subst $e ,_,$(ITEM))
escaped_ITEM = $(subst $e' ,\',$(escaped_A))# THIS TWO MAY BE MERGED ! $(subst $e' ,\',$(subst $e ,_,$(ITEM)) )
QUANTIZATION=1e4
TOPOJSON_LOC=../node_modules/topojson/bin/topojson
# Admin layer:
PLACES=50
SELECTOR_L1=admin IN ('$(ITEM)')
SELECTOR_PLACES=SELECT * FROM ne_10m_populated_places ORDER BY POP_MAX DESC LIMIT '$(PLACES)'
## Some past selector:
#SELECTOR_PLACES=SELECT * FROM ne_10m_populated_places WHERE iso_a2 = '$(ITEM)' ORDER BY POP_MAX DESC LIMIT 50
#SELECTOR_PLACES=SELECT * FROM ne_10m_populated_places WHERE ADM0NAME = '$(ITEM)' AND POP_MAX > '2000000'
#SELECTOR_PLACES=SELECT TOP 30 POP_MAX * FROM ne_10m_populated_places WHERE ADM0NAME = '$(ITEM)'


#MAKEFILE
done: topojson
	mkdir -p ../output/$(ITEM)
	mv administrative.topo.json countries.topo.json subunits.topo.json disputed.topo.json places.topo.json -t ../output/$(ITEM)/

topojson: crop countries subunits disputed places 
	$(TOPOJSON_LOC) \
		--id-property name \
		-p L0=L0 \
		-p L1=inL1 \
		-p note=note \
		-p status=status \
		-p pop=pop \
		-q $(QUANTIZATION) \
		--filter=small \
		-o administrative.topo.json \
		-- admin_0=countries.topo.json admin_1=subunits.topo.json disputed=disputed.topo.json places=places.topo.json

#######################################################
## NOTE on .shp attributes titles's CASE/case (2015.01)
## UPPER : places.shp
## lower : countries.shp
## lower : 1_states_provinces_shp
## lower : disputed_areas.shp
## Syntax : -p newattributename=inputattributename
countries: crop
	$(TOPOJSON_LOC) \
		--id-property none \
		-p name=name \
		-q $(QUANTIZATION) \
		--filter=small \
		-o countries.topo.json \
		-- admin_0=crop_L0.shp
subunits: crop
	$(TOPOJSON_LOC) \
		--id-property none \
		-p name=name \
		-p L0=admin \
		-q $(QUANTIZATION) \
		--filter=small \
		-o subunits.topo.json \
		-- admin_1=crop_L1.shp
disputed: crop
	$(TOPOJSON_LOC) \
		--id-property none \
		-p name=brk_name \
		-p L0=sovereignt \
		-p note=note_brk \
		-q $(QUANTIZATION) \
		--filter=small \
		-o disputed.topo.json \
		-- disputed=crop_disputed.shp
places: crop
	$(TOPOJSON_LOC) \
		--id-property none \
		-p name=NAME \
		-p L0=SOV0NAME \
		-p L1=ADM1NAME \
		-p status=FEATURECLA \
		-p pop=POP_MAX \
		-q $(QUANTIZATION) \
		--filter=small \
		-o places.topo.json \
		-- places=places.shp

#geojson_filters: crop
#	ogr2ogr -f GeoJSON \
#		countries.tmp.geo.json \
#		crop_L0.shp
#	ogr2ogr -f GeoJSON \
#		disputed.tmp.geo.json \
#		crop_disputed.shp
##	ogr2ogr -f GeoJSON -where "iso_a2 = ('$(ITEM)')" \
#		subunits.geo.json \
#		../data/natural_earth_vector/10m_cultural/ne_10m_admin_1_states_provinces_shp.shp
#	ogr2ogr -f GeoJSON -sql "$(SELECTOR_PLACES)" -dialect SQLITE \
#		places.tmp.geo.json \
#		../data/natural_earth_vector/10m_cultural/ne_10m_populated_places.shp
#or "iso_a2 = 'AT' AND SCALERANK < 20" , see also sr_adm0_a3
#ADM0NAME = 'Egypt' OR ADM0NAME = 'Iran' OR SOV0NAME = 'Saudi Arabia' OR SOV0NAME = 'Lebanon' OR SOV0NAME = 'Turkey' OR SOV0NAME = 'Syria' OR SOV0NAME = 'Iraq' OR ISO_A2 = 'noFR'

crop: clean
	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) \
		./crop_L0.shp ../data/natural_earth_vector/10m_cultural/ne_10m_admin_0_countries.shp
	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) \
		./crop_L1.shp ../data/natural_earth_vector/10m_cultural/ne_10m_admin_1_states_provinces_shp.shp
	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) \
		./crop_disputed.shp ../data/natural_earth_vector/10m_cultural/ne_10m_admin_0_disputed_areas.shp
	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) \
		 -sql "$(SELECTOR_PLACES)" -dialect SQLITE \
		./places.shp ../data/natural_earth_vector/10m_cultural/ne_10m_populated_places.shp
	
clean:
	rm -f *.json
	rm -f *.dbf
	rm -f *.prj 
	rm -f *.shp
	rm -f *.shx
	rm -f *.html
	rm -f *.txt