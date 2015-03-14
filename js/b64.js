/**
* Created with Wikiatlas-d3.
* User: hugolpz
* Date: 2015-02-09
* based on: http://bl.ocks.org/hugolpz/7a2e24688591887f75c3
*/
// Convert raster data into base64 string
var converterEngine = function (input) { // fn BLOB => Binary => Base64 ?
    var uInt8Array = new Uint8Array(input),
          i = uInt8Array.length;
    var biStr = []; //new Array(i);
    while (i--) { biStr[i] = String.fromCharCode(uInt8Array[i]);  }
    var base64 = window.btoa(biStr.join(''));
    return base64;
};

var getImageBase64 = function (url, callback) {
    // to comment better
    var xhr = new XMLHttpRequest(url), img64;
    xhr.open('GET', url, true); // url is the url of a PNG/JPG image.
    xhr.responseType = 'arraybuffer';
    xhr.callback = callback;
    xhr.onload  = function(){
        img64 = converterEngine(this.response); // convert BLOB to base64
        this.callback(null,img64); // callback : err, data
    };
    xhr.onerror = function(){ callback('B64 ERROR', null); };
    xhr.send();
};

d3.uri = function(url, callback) {
    return getImageBase64(url, callback);
  };
