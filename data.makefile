## WIKIATLAS DATASOURCE DOWNLOADER ##
# ESRI's GIS summary : http://downloads2.esri.com/MappingCenter2007/arcGISResources/more/DEM_Data_Sources_Table.pdf
## GIS summary : https://lpdaac.usgs.gov/products/measures_products_table
## Data Pool: https://lpdaac.usgs.gov/data_access/data_pool/
## Online UI pool (1): http://gdex.cr.usgs.gov/gdex/
## Online UI pool (2): https://lpdaac.usgs.gov/data_access/daac2disk
## Online UI pool (3): http://earthexplorer.usgs.gov/
## Online UI pool (4): http://gisweb.ciat.cgiar.org/TRMM/SRTM_Resampled_250m/
## GADM : https://gadm.org/metadata.html
## Koppen : http://www.gloh2o.org/koppen/ https://www.nature.com/articles/sdata2018214

# UNZIP DATA
core: unzip_core

precise: unzip_precise

unzip_core: NE ETOPO1
	unzip -n ./data/natural_earth_vector/natural_earth_vector.zip  -d ./data/natural_earth_vector/
	unzip -n ./data/noaa/ETOPO1_Ice_g_geotiff.zip '*.tif'  -d ./data/noaa/

unzip_precise: SRTM_v41_250 SRTM_v41_90 GADM3 GADM4
	unzip -n ./data/gadm/gadm3.zip -d ./data/gadm/
	unzip -n ./data/gadm/gadm_4.1-levels.zip -d ./data/gadm/
	unrar e -o- './data/cgiar-csi_250/*.rar' '*.*' ./data/cgiar-csi_250/
	unzip -n './data/cgiar-csi_90/*.zip' '*.tif' -d ./data/cgiar-csi_90/

# ADMINISTRATIVE from NATURAL EARTH ------------------------------------- #
NE:
	mkdir -p ./data/natural_earth_vector/
	curl \
		-L -C - 'https://naciscdn.org/naturalearth/packages/natural_earth_vector.zip' \
		-o ./data/natural_earth_vector/natural_earth_vector.zip -f
	#* Downloaded 100% ---------------------------------------------------#


# formerly : 2.8/gadm28.shp.zip
# ADMINISTRATIVE from GADM.org ------------------------------------------ #
GADM3:
	mkdir -p ./data/gadm/
	curl \
		-L -C - 'https://biogeo.ucdavis.edu/data/gadm3.6/gadm36_shp.zip' \
		-o ./data/gadm/gadm3.zip
	#* Downloaded 100% ---------------------------------------------------#


# ADMINISTRATIVE from GADM.org ------------------------------------------ #
GADM4:
	mkdir -p ./data/gadm/
	curl \
		-L -C - 'https://geodata.ucdavis.edu/gadm/gadm4.1/gadm_410-levels.zip' \
		-o ./data/gadm/gadm_4.1-levels.zip
	#* Downloaded 100% ---------------------------------------------------#

# TOPOGRAPHIC 1km from NOAA ----------------------------------------------#
ETOPO1: clean
	mkdir -p ./data/noaa/
	curl \
		-L -C - 'https://www.ngdc.noaa.gov/mgg/global/relief/ETOPO1/data/ice_surface/grid_registered/georeferenced_tiff/ETOPO1_Ice_g_geotiff.zip' \
		-o ./data/noaa/ETOPO1_Ice_g_geotiff.zip
	#* Downloaded 100% ---------------------------------------------------#

# TOPOGRAPHIC 250m from CGIAR-CSI (SRTM) -------------------------------- #
SRTM_v41_250:
	mkdir -p ./data/cgiar-csi_250/
	# curl -L -C - 'ftp://192.156.137.225/SRTM_v41/SRTM_Resampled/SRTM_{NE,SE,W}_250m_TIF.rar' -o './data/cgiar-csi_250/srtm41_#1.rar' -f
	curl -L -C - 'http://gisweb.ciat.cgiar.org/TRMM/SRTM_Resampled_250m/SRTM_{NE,SE,W}_250m_TIF.rar' -o './data/cgiar-csi_250/srtm41_#1.rar' -f
	#* Downloaded 100% ---------------------------------------------------#


# TOPOGRAPHIC 90m from USGS (SRTMVF) ------------------------------------ #
SRTMVF:


# TOPOGRAPHIC 90m from CGIAR-CSI (SRTM) --------------------------------- #
SRTM_v41_90by30:
	mkdir -p ./data/cgiar-csi_90by30/
	curl -L -C - 'http://srtm.csi.cgiar.org/wp-content/uploads/files/srtm_30x30/TIFF/{N,S}{00,30,60}{W,E}{000,030,060,090,120,180}.zip' -o './data/cgiar-csi_90by30/srtm41_#1#2#3#4.zip' -f
	#* Downloaded 100% ---------------------------------------------------#
SRTM_v41_90:
	mkdir -p ./data/cgiar-csi_90/
	curl -L -C - 'http://srtm.csi.cgiar.org/wp-content/uploads/files/srtm_5x5/TIFF/srtm_[01-72]_[01-24].zip' -o './data/cgiar-csi_90/srtm41_#1_#2.zip' -f
	#* Downloaded 100% ---------------------------------------------------#

# Koppen Climates --------------------------------- #
	mkdir -p ./data/koppen/
	curl -L -C - 'http://s3-eu-west-1.amazonaws.com/pfigshare-u-files/12407516/Beck_KG_V1.zip' -o './data/koppen/Beck_KG_V1.zip' -f
	#* Downloaded 100% ---------------------------------------------------#

clean:
#	rm -f ./data/NE/*.zip
#	rm -f ./data/NE/*.dbf
#	rm -f ./data/NE/*.prj
#	rm -f ./data/NE/*.shp
#	rm -f ./data/NE/*.shx
#	rm -f ./data/ETOPO1/*.zip
#	rm -f ./data/ETOPO1/*.tif
#	rm -f ./data/ETOPO1/*.tiff
