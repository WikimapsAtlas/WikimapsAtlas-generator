#DEFAULT VALUES (customizable):
# inherit NAME, WEST, NORTH, EAST, SOUTH from master.makefile or command.
#make -f ./administrative.makefile NAME= WEST=-180 NORTH=90 EAST=180 SOUTH=-90 QUANTIZATION=1e5 PLACES=60
escaped_A = $(subst $e ,_,$(NAME))
escaped_NAME = $(subst $e' ,\',$(escaped_A))# THIS TWO MAY BE MERGED ! $(subst $e' ,\',$(subst $e ,_,$(NAME)) )
QUANTIZATION=1e4
TOPOJSON_LOC=../node_modules/topojson/bin/topojson
# Admin layer:
PLACES=15
SELECTOR_L1=admin IN ('$(NAME)')
SELECTOR_PLACES=SELECT * FROM ne_10m_populated_places ORDER BY POP_MAX DESC LIMIT $(PLACES)
SELECTOR_CAPITALS=SELECT * FROM ne_10m_populated_places WHERE FEATURECLA = 'Admin-0 capital'
## Some past selector: 
#SELECTOR_PLACES=SELECT * FROM ne_10m_populated_places WHERE iso_a2 = '$(ISO2)' ORDER BY POP_MAX DESC LIMIT 50
#SELECTOR_PLACES=SELECT * FROM ne_10m_populated_places WHERE ADM0NAME = '$(NAME)' AND POP_MAX > '2000000'
#SELECTOR_PLACES=SELECT TOP 30 POP_MAX * FROM ne_10m_populated_places WHERE ADM0NAME = '$(NAME)'


#MAKEFILE
done: topojson
	mkdir -p ../output/$(NAME)
	mv *.topo.json -t ../output/$(NAME)/
	rm -f *.tmp.*

topojson: crop admin_0 admin_1 disputed places
	$(TOPOJSON_LOC) \
		--bbox \
		--id-property none \
		-p name=name \
		-p L0=L0 \
		-p L0_3=L0_3 \
		-p L1=L1 \
		-p L0_name=L0_name \
		-p L1_name=L1_name \
		-p note=note \
		-p status=status \
		-p pop=pop \
		--spherical \
		-q $(QUANTIZATION) \
        --simplify-proportion 0.9 \
		--filter=small \
		-o administrative.topo.json \
		-- admin_0=admin_0.topo.json admin_1=admin_1.topo.json disputed=disputed.topo.json places=places.topo.json

##########################################################
## NOTE on .shp attributes titles's CASE/case (2015.01) ##
## UPPER : places.shp 									## SOV_A3
## lower : admin_0.shp 									## sov_a3
## lower : 1_states_provinces_shp 						## sr_sov_a3
## lower : disputed_areas.shp 							## sov_a3
## Rule: code, then name                                ##
## Syntax: -p newattributename=inputshpattrbutename  #####

admin_0: crop
	$(TOPOJSON_LOC) \
		--bbox \
		--id-property none \
		-p L0=iso_a2 \
			-p L0_3=sov_a3 \
		-p name=sovereignt \
		-q $(QUANTIZATION) \
		--filter=small \
		-o admin_0.topo.json \
		-- admin_0=crop_L0.tmp.shp
admin_1: crop
	$(TOPOJSON_LOC) \
		--bbox \
		--id-property none \
		-p L0=iso_a2 \
			-p L0_3=sr_sov_a3 \
		-p L1=code_hasc \
		-p L0_name=admin \
		-p name=name \
		-q $(QUANTIZATION) \
		--filter=small \
		-o admin_1.topo.json \
		-- admin_1=crop_L1.tmp.shp
disputed: crop
	$(TOPOJSON_LOC) \
		--bbox \
		--id-property none \
		-p L0=iso_a2 \
			-p L0_3=sov_a3 \
		-p L1=code_hasc \
		-p L0_name=sovereignt \
		-p name=brk_name \
		-p note=note_brk \
		-q $(QUANTIZATION) \
		--filter=small \
		-o disputed.topo.json \
		-- disputed=crop_disputed.tmp.shp
places: crop
	$(TOPOJSON_LOC) \
		--bbox \
		--id-property none \
		-p L0=ISO_A2 \
			-p L0_3=SOV_A3 \
		-p L0_name=SOV0NAME \
		-p L1_name=ADM1NAME \
		-p name=NAME \
		-p status=FEATURECLA \
		-p pop=POP_MAX \
		-q $(QUANTIZATION) \
		--filter=small \
		-o places.topo.json \
		-- places=places.tmp.shp

#geojson_filters: crop
##	ogr2ogr -f GeoJSON -where "iso_a2 = ('$(NAME)')" \
#		admin_1.geo.json \
#		../data/natural_earth_vector/10m_cultural/ne_10m_admin_1_states_provinces_shp.shp
# or "iso_a2 = 'AT' AND SCALERANK < 20" , see also sr_adm0_a3
# SOV0NAME = 'Lebanon' OR SOV0NAME = 'Turkey' OR ISO_A2 = 'noFR'

crop: clean
	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) \
		./crop_L0.tmp.shp ../data/natural_earth_vector/10m_cultural/ne_10m_admin_0_countries.shp
	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) \
		./crop_L1.tmp.shp ../data/natural_earth_vector/10m_cultural/ne_10m_admin_1_states_provinces_shp.shp
	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) \
		./crop_disputed.tmp.shp ../data/natural_earth_vector/10m_cultural/ne_10m_admin_0_disputed_areas.shp
	ogr2ogr -spat $(WEST) $(NORTH) $(EAST) $(SOUTH) \
		-sql "$(SELECTOR_PLACES)" -dialect SQLITE \
		./places.tmp.shp ../data/natural_earth_vector/10m_cultural/ne_10m_populated_places.shp
	ogr2ogr -spat $(WEST) $(NORTH) $(EAST) $(SOUTH) \
		-sql "$(SELECTOR_CAPITALS)" -dialect SQLITE \
		./places_cap.tmp.shp ../data/natural_earth_vector/10m_cultural/ne_10m_populated_places.shp
	ogr2ogr -update -append places.tmp.shp places_cap.tmp.shp
clean:
	rm -f *.json
	rm -f *.dbf
	rm -f *.prj 
	rm -f *.shp
	rm -f *.shx
	rm -f *.html
	rm -f *.txt