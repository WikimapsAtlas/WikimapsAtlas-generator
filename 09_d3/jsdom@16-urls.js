const request = require('request')
const jsdom = require('jsdom')
const {JSDOM} = jsdom
const url = 'http://localhost:8000'

var NAME  = process.env.NAME; // variable from terminal
var jsFiles = [
    'say-hello.js',
];
request(url, (error, response, body) => {


  const options = {
    url: url,
    resources: 'usable',
    runScripts: 'dangerously',
  }
  
  const dom = new JSDOM(body, options)
  
  
/* ************************************************************************* */
/* Run page **************************************************************** */
_window.document.addEventListener('DOMContentLoaded', () => {
    console.log('mini says: DOMContentLoaded')
    _window.sayBye(NAME)

    setImmediate(() => {
        console.log('mini says: set immediate')
        _window.sayBye(NAME)
    });
  });


})