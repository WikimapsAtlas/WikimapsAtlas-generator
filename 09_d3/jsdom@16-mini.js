// COLOR=#66AAFF NAME=India ISO2=IN WEST=67.0 NORTH=37.5 EAST=99.0 SOUTH=05.0 WIDTH=1280 node jsdom@16-mini.js  #passing var COLOR the old way
const fs    = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var NAME  = process.env.NAME; // variable from terminal

//var virtualConsole = new jsdom.VirtualConsole();
//    virtualConsole.sendTo(console);

var html = '<!DOCTYPE html><head><script src="say-hello.js"></script></head><body><div>Foo</div></body>'
var _window = new JSDOM(html, {
//    virtualConsole: virtualConsole,
    runScripts:"dangerously",
    resources: "usable" }).window;
/* ************************************************************************* */
/* Add scripts to head ***************************************************** */
var jsFiles = [
    '../js/d3.v3.min.js', // works
    'say-hello.js',
];
var scriptsContent = ``;
for(var i =0; i< jsFiles.length;i++){
    console.log("Load file: ", __dirname + '/'+ jsFiles[i])
  let scriptContent = fs.readFileSync( jsFiles[i], 'utf8');
  scriptsContent = scriptsContent + `
  /* ******************************************************************************************* */
  /* `+jsFiles[i]+` **************************************************************************** */
  `+scriptContent;
};
let scriptElement = _window.document.createElement('script');
scriptElement.textContent = scriptsContent;
_window.document.head.appendChild(scriptElement);
//_window.document.head.insertAdjacentHTML( 'beforeend', '<script>'+scriptsContent+'</script>');



/* ************************************************************************* */
/* Run page **************************************************************** */
_window.document.addEventListener('DOMContentLoaded', () => {

    console.log('mini says: DOMContentLoaded')
    _window.sayBye(NAME)

});

