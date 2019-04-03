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
    // Extract book
        // Get book number ex. 2corinthian
    ex = /^(\d?)/g; // One number at beginning of string
    bookNumber = ex.exec(reqPath)[0];
    switch (bookNumber) {
        case "1":
            bookCount = 'якуми ';
            break;
        case "2":
            bookCount = 'дуюми ';
            break;
        case "3":
            bookCount = 'Сеюми ';
            break;
        default:
            bookCount = '';
            break;
    }
        // Get book name itself
        // Every letter except number and " ", at least one
        // Then if wanted a space with following letters
    ex = /([^1-9 ]+)( ?)([^1-9 ]*)/ 
    try { bookName = ex.exec(reqPath)[0];} catch {bookName = "";}
        // Combine count and name
    reqBook = bookCount + bookName;

    // Get chapter
    ex = /(.{1})([1-9]+)/ // a random letter followed by at least one number
    try {
        chapterString = ex.exec(reqPath)[0];
        chapterSubstring = chapterString.substr(1);
        chapter = parseInt(chapterSubstring);
    } catch {
        chapter = 1;
    }

    getText(reqBook, chapter);
}


/**
 * Get text from server-- > renderText()
 * @param {string} book - Book
 * @param {number} chapter - Chapter
 * @param {number} verses - Verses, 0 -> whole chapter
 */
function getText(book, chapter, verses = 0) {
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
