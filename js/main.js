// JS loaded as last doc, so no need to wait for onload

/* Read URL-Reques and write to console */
function reloadText() {
    path = window.location.pathname; // get requested path
    requestedPath = decodeURI(path).substr(1); // decode kyrillic and omit slash
    console.log(requestedPath); // DEV-Info
    document.getElementById("path").innerHTML = requestedPath; // and in html too
    getText(requestedPath);
}

/* Request text from server */
function getText(book, chapter = 1, verses = 1) {
    // TODO: allow multiple verses and none (whole chapter)

    var request = {
        book: book,
        chapter: chapter,
        verses: verses
    };
    requestString = JSON.stringify(request);

    // make request to server via ajax (without reload)
    $.ajax({
        method: "POST", // not visible in URL
        url: "/php/getText.php", // standard processing file
        //contentType: "application/json; charset=utf-8",     // set contentType
        //breaks all: dataType: "json",                                   // use only json
        data: "data=" + requestString // send request to server
    }).done(function (data) {
        //console.log(data);            // DEV-Info
        renderText(data);
    });
}

/* Renders json-text to html */
function renderText(receivedText) {
    // Define vars for have them available in whole function not only in sub'
    // first and lastVerse are used for printing out them if needed
    var book, chapter, firstVerse = false,
        lastVerse = false,
        text = "";
    var jsonText = $.parseJSON(receivedText);
    console.log(jsonText); // DEV-Info

    // Iterate over json
    $.each(jsonText, function (key, value) {
        book = value['book'];
        chapter = value['chapter'];
        firstVerse ? lastVerse = value['verse'] : firstVerse = value['verse'];
        text = text + " <b>" + value['verse'] + "</b> " + value['text'];
    });
    lastVerse ? verseNumbers = firstVerse + "-" + lastVerse : verseNumbers = firstVerse;
    $('h2.chapter').html(book + " " + chapter + ":" + verseNumbers);
    $('div.text').html(text);
}

/* Execute now */
// TODO: don't request directly, first split apart book, chapter, ...
reloadText();