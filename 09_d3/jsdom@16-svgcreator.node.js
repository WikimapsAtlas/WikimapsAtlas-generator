var jsdom = require('jsdom')
var html = '<!DOCTYPE html><head><script src="../js/bar.js"></script></head><body><div>Foo</div></body>'
var window = new jsdom.JSDOM(html, { runScripts: "dangerously", resources: "usable" }).window
window.onload = function () {
  console.log('window loaded')
}