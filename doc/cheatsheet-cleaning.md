/* **************************************************************** */
/* ******************  WANT CLEAN STATE ?  ************************ */

# NPM NODE-GYP -- deprecetated
npm view node-gyp version
npm uninstall -g node-gyp

# NPM NOPT -- deprecetated
npm view nopt version
npm uninstall -g nopt 

# NPM CONTEXTIFY -- deprecetated
npm view contextify version
npm uninstall -g contextify

# NODE-GYP
node-gyp --version
sudo apt-get remove node-gyp
sudo apt-get install node-gyp

# NPM MODULES
rm -rf ./node_modules				# NPM node_modules uninstall

## NPM
sudo npm uninstall npm -g			# NPM uninstall
curl -L https://www.npmjs.com/install.sh | sh	# NPM install
npm --version					# NPM version
npm list --depth=2				# Lists ./node_modules

## NVM
# NVM uninstall
# NVM install
# NVM version

# NVM sub-Nodes
nvm list					# lists installed Node versions
nvm use {number} 				# switch to Node version {number}
# remove Node version {number}
# install Node version {number} 

## NODE
sudo apt-get purge --auto-remove nodejs
# OR
# First of all you need to run the following command from command terminal as sudo.
sudo rm -rf /usr/local/bin/npm /usr/local/share/man/man1/node* /usr/local/lib/dtrace/node.d ~/.npm ~/.node-gyp /opt/local/bin/node opt/local/include/node /opt/local/lib/node_modules
# Remove node or node_modules directories from /usr/local/lib with the help of following command.
sudo rm -rf /usr/local/lib/node*
# Remove node or node_modules directories from /usr/local/include with the help of following command.
sudo rm -rf /usr/local/include/node*
#Remove any node file or dir from /usr/local/bin with the help of following command.
sudo rm -rf /usr/local/bin/node*
# Go to home directory and remove any node or node_modules directory, if exists.
