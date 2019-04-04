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
        // Get book number ex. 2corinthian -> second cor...
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
    ex = /(.{1})([0-9]+)/ // a random letter followed by at least one number
    try {
        chapterRegex = ex.exec(reqPath)[0];
        chapterString = chapterRegex.substr(1);
        reqChapter = parseInt(chapterString);
    } catch {
        reqChapter = 1;
    }

    // Get verses
    firstVerse = 0;
    lastVerse = 180;
    markBool = false;

    getText(reqBook, reqChapter, firstVerse, lastVerse, markBool);
}


/**
 * Get text from server-- > renderText()
 * @param {string} book 
 * @param {number} chapter 
 * @param {number} firstVerse 
 * @param {number} lastVerse 
 */
function getText(book, chapter, firstVerse = 0, lastVerse = 180, markBool) {

    // Request whole chapter, but mark selected verses
    var request = {
        book: book,
        chapter: chapter,
        firstVerse: 0,
        lastVerse: 180
    };
    requestString = JSON.stringify(request);

    // Send request to server via AJAX
    $.ajax({
        method: "POST", // invisible in URL
        url: "/php/getText.php",
        data: "data=" + requestString // Embed JSON into POST['data']
    }).done(function (data) {
        renderText(data, markBool, firstVerse, lastVerse);
    });
}

/* Renders text to html */
function renderText(receivedText, markBool, markStart, markEnd) {
    /* Prepare vars */
    var book, chapter, firstVerse = false,
        lastVerse = false,
        text = "";
        console.log(receivedText);
    var jsonText = $.parseJSON(receivedText);

    /* Read 'n convert each verse */
    $.each(jsonText, function (key, value) {
        book = value['book'];
        chapter = value['chapter'];
        firstVerse ? lastVerse = value['verse'] : firstVerse = value['verse'];
        text = text + " <b>" + value['verse'] + "</b> "; // Add verse number
        if(value['verse'] >= markStart && value['verse'] <= markEnd && markBool) {
            text = text + "<span class='mark'>" + value['text'] + "</span>"; // Add text itself
        } else {
            text = text + value['text']; // Add text itself
        }
    });
    // If there is a last verse there will be more than one verse
    lastVerse ? verseNumbers = firstVerse + "-" + lastVerse : verseNumbers = firstVerse;
    $('h2.chapter').html(book + " " + chapter + ":" + verseNumbers);
    $('div.text').html(text);
}

/* Execute now */
readUrl();  // chain-command, see top description of functions
