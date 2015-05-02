# bash ./script.bash param1 param2
WEST=$1
NORTH=$2
EAST=$3
SOUTH=$4
# ------------------------------------------------------------------ #
rm ./tmp/* ./tmp/.*
mkdir -p ./tmp/
# ------------------------------------------------------------------ #
if [[ ${AREA_SIZE}>0.015 ]]; then 
	gdal_translate -projwin $WEST $NORTH $EAST $SOUTH ../data/noaa/ETOPO1_Ice_g_geotiff.tif crop_xl.tmp.tif 
fi 
# ------------------------------------------------------------------ #
if [[ ${AREA_SIZE}<=0.015 && ${AREA_SIZE} > 0.0015  ]]; then 
	files=(`ls ../data/cgiar-csi_250/ | grep .tif$`) 
	for i in "${!files[@]}"
	do 
		echo "Processing STRM: $file" 
		gdal_translate -projwin $WEST $NORTH $EAST $SOUTH ../data/cgiar-csi_250/${files[${i}]} ./tmp/crop.${i}.tmp.tif 
	done
	gdal_merge.py -o ./crop_xl.tmp.tif ./tmp/crop.*.tmp.tif -n -32768 
fi
# ------------------------------------------------------------------ #
if [[ ${AREA_SIZE}<=0.0015 ]]; then 
	files=(`ls ../data/cgiar-csi_90/ | grep .tif$`) 
	for i in "${!files[@]}"
	do 
		echo "Processing STRM: $file" 
		gdal_translate -projwin $WEST $NORTH $EAST $SOUTH ../data/cgiar-csi_90/${files[${i}]} ./tmp/crop.${i}.tmp.tif 
	done 
	gdal_merge.py -o ./crop_xl.tmp.tif ./tmp/crop.*.tmp.tif -n -32768 
fi
# ------------------------------------------------------------------ #