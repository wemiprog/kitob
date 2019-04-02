/* Main file of kitob */

/* Read URL-Reques --> interpretUrl() */
function readUrl() {
    // Get path from URL and decode kyrillic, omit slash
    path = window.location.pathname;
    requestedPath = decodeURI(path).substr(1);

    // Send to splitter
    interpretReq(requestedPath);
}


/**
 * Split Request into parts-- > getText()
 * @param {string} reqPath - Requested path to split
 */
function interpretReq(reqPath) {
    reqBook = reqPath;
    getText(reqBook);
}


/**
 * Get text from server-- > renderText()
 * @param {string} book - Book, default matthew
 * @param {number} chapter - Chapter, default 1
 * @param {number} verses - Verses, default 0 -> whole chapter
 */
function getText(book = "мат", chapter = 1, verses = 0) {
    // TODO: allow multiple verses and none (whole chapter)

    var request = {
        book: book,
        chapter: chapter,
        verses: verses
    };
    requestString = JSON.stringify(request);

    // Send request to server via AJAX
    $.ajax({
        method: "POST", // invisible in URL
        url: "/php/getText.php",
        data: "data=" + requestString // Embed JSON into POST['data']
    }).done(function (data) {
        renderText(data);
    });
}

/* Renders text to html */
function renderText(receivedText) {
    /* Prepare vars */
    var book, chapter, firstVerse = false,
        lastVerse = false,
        text = "";
    var jsonText = $.parseJSON(receivedText);

    /* Read 'n convert each verse */
    $.each(jsonText, function (key, value) {
        book = value['book'];
        chapter = value['chapter'];
        firstVerse ? lastVerse = value['verse'] : firstVerse = value['verse'];
        text = text + " <b>" + value['verse'] + "</b> " + value['text'];
    });
    // If there is a last verse there will be more than one verse
    lastVerse ? verseNumbers = firstVerse + "-" + lastVerse : verseNumbers = firstVerse;
    $('h2.chapter').html(book + " " + chapter + ":" + verseNumbers);
    $('div.text').html(text);
}

/* Execute now */
readUrl();  // chain-command, see top description of functions
