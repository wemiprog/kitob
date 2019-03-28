// JS is loaded at end of body --> no need to wait on document loaded

// first get "path" from url
path = window.location.pathname;                             // get requested path
requestedPath = decodeURI(path).substr(1,);                  // decode kyrillic and omit slash
console.log(requestedPath);                                  // show in console
document.getElementById("path").innerHTML=requestedPath;     // and in html too

// request text with parameter book and render
function getText(book, chapter=1, verses=1) {
    // TODO: allow multiple verses and none (whole chapter)

    // make request to server via ajax (without reload)
    $.ajax({
        method: "POST",                                     // not visible in URL
        url: "/php/getText.php",                            // standard processing file
    }).done(function (data) {
        console.log(data);                                  // DEV
    });
}

console.log("sayHello");

getText(requestedPath);