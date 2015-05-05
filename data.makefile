## WIKIATLAS DATASOURCE DOWNLOADER ##
# ESRI's GIS summary : http://downloads2.esri.com/MappingCenter2007/arcGISResources/more/DEM_Data_Sources_Table.pdf
## GIS summary : https://lpdaac.usgs.gov/products/measures_products_table
## Data Pool: https://lpdaac.usgs.gov/data_access/data_pool/
## Online UI pool (1): http://gdex.cr.usgs.gov/gdex/ 
## Online UI pool (2): https://lpdaac.usgs.gov/data_access/daac2disk
## Online UI pool (3): http://earthexplorer.usgs.gov/

# UNZIP DATA
unzip:  
	unzip -n ./data/natural_earth_vector/natural_earth_vector.zip  -d ./data/natural_earth_vector/
#	unzip -n ./data/gadm/gadm2.zip -d ./data/gadm/
	unzip -n ./data/noaa/ETOPO1_Ice_g_geotiff.zip '*.tif'  -d ./data/noaa/    
	unrar e -o- './data/cgiar-csi_250/*.rar' '*.*' ./data/cgiar-csi_250/
	unzip -n './data/cgiar-csi_90/*.zip' '*.tif' -d ./data/cgiar-csi_90/

# TOPOGRAPHIC 90m from USGS (SRTMVF) ------------------------------------ #
SRTMVF:

# TOPOGRAPHIC 90m from CGIAR-CSI (SRTM) --------------------------------- #
SRTM_v41_90:
	mkdir -p ./data/cgiar-csi_90/
	curl -L -C - 'http://gis-lab.info/data/srtm-tif/srtm_[01-72]_[01-24].zip' -o './data/cgiar-csi_90/srtm41_#1_#2.zip' -f
	#* Downloaded 100% ---------------------------------------------------#

# TOPOGRAPHIC 250m from CGIAR-CSI (SRTM) -------------------------------- #
SRTM_v41_250:
	mkdir -p ./data/cgiar-csi_250/
	curl -L -C - 'ftp://192.156.137.225/SRTM_v41/SRTM_Resampled/SRTM_{NE,SE,W}_250m_TIF.rar' -o './data/cgiar-csi_250/srtm41_#1.rar' -f
	#* Downloaded 100% ---------------------------------------------------#

# TOPOGRAPHIC 1km from NOAA ----------------------------------------------#
ETOPO1: clean
	mkdir -p ./data/noaa/
	curl \
		-L -C - 'http://www.ngdc.noaa.gov/mgg/global/relief/ETOPO1/data/ice_surface/grid_registered/georeferenced_tiff/ETOPO1_Ice_g_geotiff.zip' \
		-o ./data/noaa/ETOPO1_Ice_g_geotiff.zip
	#* Downloaded 100% ---------------------------------------------------#

# ADMINISTRATIVE from GADM.org ------------------------------------------ #
GADM2:
	mkdir -p ./data/gadm/
	curl \
		-L -C - 'http://biogeo.ucdavis.edu/data/gadm2/gadm_v2_shp.zip' \
		-o ./data/gadm/gadm2.zip
	#* Downloaded 100% ---------------------------------------------------#

# ADMINISTRATIVE from NATURAL EARTH ------------------------------------- #
NE:
	mkdir -p ./data/natural_earth_vector/
	curl \
		-L -C - 'http://naciscdn.org/naturalearth/packages/natural_earth_vector.zip' \
		-o ./data/natural_earth_vector/natural_earth_vector.zip
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
