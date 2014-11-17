#DEFAULT VALUES (customizable):
# inherit ITEM, WEST, NORTH, EAST, SOUTH from master.makefile or command.
escaped_A = $(subst $e ,_,$(ITEM))
escaped_ITEM = $(subst $e' ,\',$(escaped_A))# THIS TWO MAY BE MERGED ! $(subst $e' ,\',$(subst $e ,_,$(ITEM)) )
WIDTH=1980
QUANTIZATION=1e4
TOPOJSON_LOC=../node_modules/topojson/bin/topojson
TOPOJSON_GLO=topojson
# Water layer:
SELECTOR_RIVERS=SCALERANK > 0 # ??
SELECTOR_LAKES=SCALERANK > 0 #NOT WORKING with -where "$(SELECTOR_LAKES)" ??


#MAKEFILE
done: topojson
	mkdir -p ../files/$(escaped_ITEM)
	mv water.topo.json lakes.geo.json rivers.geo.json -t ../files/$(escaped_ITEM)/

topojson: geojson_filters
	$(TOPOJSON_LOC) \
		--id-property none \
		-p name=name \
		-p scalerank=scalerank \
		-q $(QUANTIZATION) \
		--filter=small \
		-o water.topo.json \
		-- lakes=lakes.geo.json rivers=rivers.geo.json

geojson_filters: crop
	ogr2ogr -f GeoJSON lakes.geo.json crop_lakes.shp
	ogr2ogr -f GeoJSON rivers.geo.json crop_rivers.shp
#or "iso_a2 = 'AT' AND SCALERANK < 20" , see also sr_adm0_a3
#ADM0NAME = 'Egypt' OR ADM0NAME = 'Iran' OR SOV0NAME = 'Saudi Arabia' OR SOV0NAME = 'Lebanon' OR SOV0NAME = 'Turkey' OR SOV0NAME = 'Syria' OR SOV0NAME = 'Iraq' OR ISO_A2 = 'noFR'

crop: touch
	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) ./crop_rivers.shp ne_10m_rivers_lake_centerlines.shp
	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) ./crop_lakes.shp ne_10m_lakes.shp
#	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) ./crop_rivers.shp ne_10m_rivers_lake_centerlines_scale_rank.shp
#	ogr2ogr -clipsrc $(WEST) $(NORTH) $(EAST) $(SOUTH) ./crop_lakes.shp ne_10m_rivers_lake_centerlines_scale_rank.shp

touch: unzip
	touch *.shp
unzip: clean
	unzip -n ../data/NE/rivers.zip 
	unzip -n ../data/NE/lakes.zip
	
clean:
	rm -f *.json
	rm -f *.dbf
	rm -f *.prj 
	rm -f *.shp
	rm -f *.shx
	rm -f *.html
	rm -f *.txt
