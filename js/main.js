// JS loaded as last doc, so no need to wait for onload

/* Read URL-Reques and write to console */
path = window.location.pathname; // get requested path
requestedPath = decodeURI(path).substr(1, ); // decode kyrillic and omit slash
console.log(requestedPath); // show in console
document.getElementById("path").innerHTML = requestedPath; // and in html too

/* Request text from server */
function getText(book, chapter = 1, verses = 1) {
    // TODO: allow multiple verses and none (whole chapter)

    var request = {
        book: book,
        chapter: chapter,
        verses: verses,
    };
    requestString = JSON.stringify(request);

    // make request to server via ajax (without reload)
    $.ajax({
        method: "POST", // not visible in URL
        url: "/php/getText.php", // standard processing file
        //contentType: "application/json; charset=utf-8",     // set contentType
        //breaks all: dataType: "json",                                   // use only json
        data: "data=" + requestString, // send request to server
    }).done(function (data) {
        //console.log(data); // DEV
        renderText(data);
    });
}

/* Renders json-text to html */
function renderText(receivedText){
    var jsonText = $.parseJSON(receivedText);
    console.log(jsonText);
}

/* Execute now */
// TODO: don't request directly, first split apart book, chapter, ...
getText(requestedPath);