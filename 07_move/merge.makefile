TOPOJSON=../node_modules/topojson/bin/topojson

final_France.json: final_layers.json
	$(TOPOJSON) --id-property none --bbox -p name=name -p name=NAME -p name=elev -q 1e3 --simplify-proportion=0.5 -o final_all_Sasanian.json -- countries.json levels.json lakes.json rivers.json

final_layers.json: countries.json levels.json rivers.json
	$(TOPOJSON) --id-property none --bbox -p name=name -p name=NAME -q 1e3 --simplify-proportion=0.5 -o final_adm_Sasanian.json  -- countries.json
	$(TOPOJSON) --id-property none --bbox -p name=name -p name=elev -q 1e3 --simplify-proportion=0.5 -o final_topo_Sasanian.json -- levels.json rivers.json
	#here is a trouble !!!!  final_topo_France.json buggy !
