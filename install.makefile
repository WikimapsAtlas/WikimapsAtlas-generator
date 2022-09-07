#---- SUCCESS
success: low_level utilities        #a task with 3 requirements, as tasks or files
	echo "======================================"
	echo "Wikiatlas setup: done --------> 100% !"
	#tab before each command is COMPULSORY (spaces will bug!).

#---- CORE
low_level:			#for more advanced coding
	# sudo apt-get install software-properties-common
	# sudo apt-get -y install build-essential		#comment, is this needed ?
	sudo apt-get -y install g++
	sudo apt-get -y install nodejs
	# Python & dependencies
	sudo apt-get -y install python
	sudo apt-get -y install python3-gdal 			# install osgeo ?
	python3 -m pip install scipy
	sudo apt-get -y install qgis 
	sudo apt-get -y python-matplotlib
	sudo apt-get -y python-scipy

utilities:			# a task with no dependency
	sudo apt-get install -y git make curl unzip unrar gdal-bin imagemagick