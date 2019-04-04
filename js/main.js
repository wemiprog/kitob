/* Main file of kitob */

/* Global vars */
var dontOverflow = 0;

/* Reload text when user presses back or forward button in browser */
window.onpopstate = function() {
    readUrl();
};

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
    ex = /([^1-9 \.]+)((( ?)([^1-9 \.]+))?)/ 
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
    ex = /(:|,)(\d+)(((-+)(\d+))?)/ // : or , followed by a number, optional - and again a number
    markBool = false;               // says if there are verses to mark
    try {        
        verseRegex = ex.exec(reqPath)[0];
        verseString = verseRegex.substr(1);
        verseSplit = verseString.split("-",2); // if there are multiple verses 5-8 ex.
        firstVerse = parseInt(verseSplit[0]);
        markBool = true;
        if(verseSplit.length > 1) {             // check if a second vers is given
            lastVerse = parseInt(verseSplit[1]);
        } else {
            lastVerse = firstVerse;
        }
    } catch {                                   // if there is no verse -> whole chapter
        firstVerse = 0;
        lastVerse = 180;
    }

    getText(reqBook, reqChapter, firstVerse, lastVerse, markBool);
}


/**
 * Get text from server-- > renderText()
 * @param {string} book 
 * @param {number} chapter 
 * @param {number} firstVerse 
 * @param {number} lastVerse
 * @param {bool} markBool - verse selection to mark (true) or to request (false)
 */
function getText(book, chapter, firstVerse = 0, lastVerse = 180, markBool) {

    // Request whole chapter if marking enabled
    if(markBool){
        var request = {
            book: book,
            chapter: chapter,
            firstVerse: 0,
            lastVerse: 180
        };
    } else {
        var request = {
            book: book,
            chapter: chapter,
            firstVerse: firstVerse,
            lastVerse: lastVerse,
        }
    }
    
    requestString = JSON.stringify(request);

    // Send request to server via AJAX
    $.ajax({
        method: "POST", // invisible in URL
        url: "/php/getText.php",
        data: "data=" + requestString // Embed JSON into POST['data']
    }).done(function (data) {
        if(data == "[]" && dontOverflow < 20){ // if no answer from server
            dontOverflow = dontOverflow + 1; // don't crash when ex. server unavailable
            console.log("No text received. Maybe book doesn't esxist? Redirect to matthew");            
            getText(".","",true); // restart function empty to select default values
        } else {
            renderText(data, markBool, firstVerse, lastVerse);
            dontOverflow = 0;
        }
    });
}

/* Renders text to html */
function renderText(receivedText, markBool, markStart, markEnd) {
    /* Prepare vars */
    var book, chapter, firstVerse = false,
        lastVerse = false,
        text = "";
    // DEV-Info console.log(receivedText);
    var jsonText = $.parseJSON(receivedText);

    /* Read 'n convert each verse */
    $.each(jsonText, function (key, value) {
        book = value['book'];
        chapter = value['chapter'];
        verse = value['verse']
        firstVerse ? lastVerse = verse : firstVerse = verse;
        if(verse >= markStart && verse <= markEnd && markBool) {
            text = text + "<span verse='"+ verse +"' class='verse mark'>" + " <b>" + verse + " </b>" + value['text'] + "</span>";
        } else {
            text = text + "<span verse='" + verse + "' class='verse'>" + " <b>" + verse + " </b>" + value['text'] + "</span>";
        }
    });
    // If there is a last verse there will be more than one verse
    lastVerse ? verseNumbers = firstVerse + "-" + lastVerse : verseNumbers = firstVerse;
    $('h2.chapter').html(book + " " + chapter + ":" + verseNumbers);
    $('.displayText div.text').html(text);
}

/* Execute now */
readUrl();  // chain-command, see top description of functions
