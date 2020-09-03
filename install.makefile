#---- SUCCESS
success: low_level utilities        #a task with 3 requirements, as tasks or files
	echo "======================================"   #this is the 1st command
	echo "Wikiatlas setup: done --------> 100% !"
	#tab before each command is COMPULSORY (spaces will bug!).

#---- CORE
low_level:			#for more advanced coding
	# sudo apt-get install software-properties-common
	# sudo apt-get -y install -y build-essential        #comment, is this needed ?
	sudo apt-get -y install -y python g++
	sudo apt-get install nodejs -y

utilities:			# a task with no dependency
	sudo apt-get install -y git curl unzip unrar gdal-bin imagemagick
