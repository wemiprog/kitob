var path = window.location.pathname;
path = decodeURI(path).substr(1,);
console.log(path);
document.getElementById("path").innerHTML=path;