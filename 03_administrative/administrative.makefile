#DEFAULT VALUES (customizable):
# inherit ITEM, WEST, NORTH, EAST, SOUTH from master.makefile or command.
#make -f ./administrative.makefile ITEM= WEST=-180 NORTH=90 EAST=180 SOUTH=-90 QUANTIZATION=1e5 PLACES=60
escaped_A = $(subst $e ,_,$(ITEM))
escaped_ITEM = $(subst $e' ,\',$(escaped_A))# THIS TWO MAY BE MERGED ! $(subst $e' ,\',$(subst $e ,_,$(ITEM)) )
QUANTIZATION=1e4
TOPOJSON_LOC=../node_modules/topojson/bin/topojson
# Admin layer:
PLACES=15
SELECTOR_L1=admin IN ('$(ITEM)')
SELECTOR_PLACES=SELECT * FROM tmp ORDER BY POP_MAX DESC LIMIT '$(PLACES)'
## Some past selector:
#SELECTOR_PLACES=SELECT * FROM ne_10m_populated_places WHERE iso_a2 = '$(ITEM)' ORDER BY POP_MAX DESC LIMIT 50
#SELECTOR_PLACES=SELECT * FROM ne_10m_populated_places WHERE ADM0NAME = '$(ITEM)' AND POP_MAX > '2000000'
#SELECTOR_PLACES=SELECT TOP 30 POP_MAX * FROM ne_10m_populated_places WHERE ADM0NAME = '$(ITEM)'
#make -f ./administrative.makefile ITEM= WEST=-180 NORTH=90 EAST=180 SOUTH=-90 QUANTIZATION=1e3 PLACES=60


#MAKEFILE
done: topojson
	mkdir -p ../output/$(ITEM)
	mv administrative.topo.json admin_0.topo.json admin_1.topo.json disputed.topo.json places.topo.json -t ../output/$(ITEM)/

topojson: crop admin_0 admin_1 disputed places 
	$(TOPOJSON_LOC) \
		--id-property name \
		--bbox \
		-p code=code \
		-p L0=L0 \
		-p L1=L1 \
		-p note=note \
		-p status=status \
		-p pop=pop \
		-q $(QUANTIZATION) \
		-s 1 \
		--filter=small \
		-o administrative.topo.json \
		-- admin_0=admin_0.topo.json admin_1=admin_1.topo.json disputed=disputed.topo.json places=places.topo.json

##########################################################
## NOTE on .shp attributes titles's CASE/case (2015.01) ##
## UPPER : places.shp 									##
## lower : admin_0.shp 									##
## lower : 1_states_provinces_shp 						##
## lower : disputed_areas.shp 							##
## Syntax: -p newattributename=inputshpattrbutename  #####

admin_0: crop
	$(TOPOJSON_LOC) \
		--bbox \
		--id-property name \
		-p name=name \
		-p code=iso_a2 \
		-q $(QUANTIZATION) \
		--filter=small \
		-o admin_0.topo.json \
		-- admin_0=crop_L0.shp
admin_1: crop
	$(TOPOJSON_LOC) \
		--bbox \
		--id-property name \
		-p name=name \
		-p code=hasc \
		-p L0=admin \
		-q $(QUANTIZATION) \
		--filter=small \
		-o admin_1.topo.json \
		-- admin_1=crop_L1.shp
disputed: crop
	$(TOPOJSON_LOC) \
		--bbox \
		--id-property none \
		-p name=brk_name \
		-p L0=sovereignt \
		-p note=note_brk \
		-q $(QUANTIZATION) \
		--filter=small \
		-o disputed.topo.json \
		-- disputed=crop_disputed.shp
places: crop filter_places
	$(TOPOJSON_LOC) \
		--bbox \
		--id-property NAME \
		-p name=NAME \
		-p code=ISO_A2 \
		-p L0=SOV0NAME \
		-p L1=ADM1NAME \
		-p status=FEATURECLA \
		-p pop=POP_MAX \
		-q $(QUANTIZATION) \
		--filter=small \
		-o places.topo.json \
		-- places=places.shp

#geojson_filters: crop
##	ogr2ogr -f GeoJSON -where "iso_a2 = ('$(ITEM)')" \
#		admin_1.geo.json \
#		../data/natural_earth_vector/10m_cultural/ne_10m_admin_1_states_provinces_shp.shp
# or "iso_a2 = 'AT' AND SCALERANK < 20" , see also sr_adm0_a3
# SOV0NAME = 'Lebanon' OR SOV0NAME = 'Turkey' OR ISO_A2 = 'noFR'
filter_places: crop
	ogr2ogr -sql "$(SELECTOR_PLACES)" -dialect SQLITE ./places.shp ./crop_places.shp


crop: clean
	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) \
		./crop_L0.shp ../data/natural_earth_vector/10m_cultural/ne_10m_admin_0_countries.shp
	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) \
		./crop_L1.shp ../data/natural_earth_vector/10m_cultural/ne_10m_admin_1_states_provinces_shp.shp
	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) \
		./crop_disputed.shp ../data/natural_earth_vector/10m_cultural/ne_10m_admin_0_disputed_areas.shp
	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) \
		./crop_places.shp ../data/natural_earth_vector/10m_cultural/ne_10m_populated_places.shp
	
clean:
	rm -f *.json
	rm -f *.dbf
	rm -f *.prj 
	rm -f *.shp
	rm -f *.shx
	rm -f *.html
	rm -f *.txt