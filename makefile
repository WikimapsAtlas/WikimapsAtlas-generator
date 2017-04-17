#---- RUN
# make install
#---- Script
initialisation:
# install utilities | works(?)
	$(MAKE) -f install.makefile	#install required softs
# data download | to do
	$(MAKE) -f data.makefile	#data download # SEE CURL : https://sourceforge.net/p/curl/bugs/1443/ for last bug left.

