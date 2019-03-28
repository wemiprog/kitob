// JS is loaded at end of body --> no need to wait on document loaded

// first get "path" from url
path = window.location.pathname;                             // get requested path
requestedPath = decodeURI(path).substr(1,);                  // decode kyrillic and omit slash
console.log(requestedPath);                                  // show in console
document.getElementById("path").innerHTML=requestedPath;     // and in html too

