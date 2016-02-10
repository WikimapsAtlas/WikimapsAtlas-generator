#---- SUCCESS
success: low_level utilities npm        #a task with 3 requirements, as tasks or files
	echo "======================================"   #this is the 1st command
	echo "Wikiatlas setup: done --------> 100% !"
	#tab before each command is COMPULSORY (spaces will bug!).

#---- CORE
low_level:			#for more advanced coding
	sudo apt-get -y install -y build-essential        #comment, is this needed ?
	sudo apt-get -y install -y python g++

utilities:			# a task with no dependency
	sudo apt-get install -y git curl unzip unrar gdal-bin python-gdal imagemagick python-software-properties

nodejs:				#for d3js & svg generation
	curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
	sudo apt-get install -y nodejs

npm:
	sudo npm update -g npm
	# sudo npm install   	# replaces "sudo npm install -g topojson jsdom minimist ..."
	npm cache clean

