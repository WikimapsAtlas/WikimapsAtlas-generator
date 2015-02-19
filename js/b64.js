/**
* Created with Wikiatlas-d3.
* User: hugolpz
* Date: 2015-02-09
* based on: http://bl.ocks.org/hugolpz/7a2e24688591887f75c3
*/
// Convert raster data into base64 string
var converterEngine = function (input) {
    var uInt8Array = new Uint8Array(input),
        i = uInt8Array.length;
    var biStr = []; //new Array(i);
    while (i--) {
        biStr[i] = String.fromCharCode(uInt8Array[i]);
    }
    var base64 = window.btoa(biStr.join(''));
    console.log("2. base64 produced >>> " + base64); // check conversion result
    return base64;
};

// Get the target raster file and convert it, return data
var getImageBase64 = function (url, callback) {
    // 1. Loading file from url:
    var xhr = new XMLHttpRequest(url);
    xhr.open('GET', url, true); 
    xhr.responseType = 'arraybuffer'; // <= important!
    xhr.callback = callback;
    xhr.onload = function (e) {
        if (this.status == 200) { // 2. When loaded, do:
            console.log("1:Loaded response >>> " + this.response); // print-check xhr response 
            var imgBase64 = converterEngine(this.response); // convert BLOB to base64
            this.callback(imgBase64); //execute callback function with data
        }
    };
    xhr.send();
};
