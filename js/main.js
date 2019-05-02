/* Main file of kitob */
var searchQuest = "";

/* Events to catch */
$(document).on({
    ajaxSend: function () {
        $('.book-load').show();
    },
    ajaxStart: function () {
        $('.book-load').show();
    },
    ajaxStop: function () {
        $('.book-load').hide();
    },
    ajaxError: function () {
        $('.book-load').hide();
    },
});

/* Global vars */
var dontOverflow = 0;

/* Reload text when user presses back or forward button in browser */
window.onpopstate = function () {
    readUrl();
};

/* Read User Input */
function checkIfSend(e) {
    /*if (e.keyCode == 13) {
        e.preventDefault();
        //var requestField = $(e.target)[0].innerHTML;
        var requestField = $(e.target).val();
        //window.history.pushState("", "", "/" + requestField);
        interpretReq(requestField);
    } else*/
    if (e.type == "submit") {
        var requestField = $(e.target).find('#reference').val();
        $(e.target).find('#reference').blur();
        interpretReq(requestField);
    }
}
//$('h2.chapter').on('keypress', checkIfSend);
//$('#reference').on('keypress', checkIfSend); // not needed because of use of form
/* Read URL-Reques --> interpretUrl() */
function readUrl() {
    // Get path from URL and decode kyrillic, omit slash
    var path = window.location.pathname;
    var requestedPath = decodeURI(path).substr(1);

    // Send to splitter
    interpretReq(requestedPath);
}

/**
 * Split Request into parts-- > getText()
 * @param {string} reqPath - Requested path to split
 */
function interpretReq(reqPath) {
    searchQuest = reqPath;
    reqPath = reqPath.toLowerCase();
    // Extract book
    // Get book number ex. 2corinthian -> second cor...
    var ex = /^(\d?)/g; // One number at beginning of string
    var bookNumber = ex.exec(reqPath)[0];
    switch (bookNumber) {
        case "1":
            var bookCount = 'якуми ';
            break;
        case "2":
            var bookCount = 'дуюми ';
            break;
        case "3":
            var bookCount = 'Сеюми ';
            break;
        default:
            var bookCount = '';
            break;
        }
        // Get book name itself
        // Every letter except number and " ", at least one
        // Then if wanted a space with following letters
        //var ex = /([^1-9 \.]+)((( ?)([^1-9 \.]+))?)/
        noChapter = false;
        backupSearch="";
    var ex = /([\u0400-\u0527]+)((( ?)([\u0400-\u0527]+))?)/ // choose all cyrillic letters
    try {
        var bookName = ex.exec(reqPath)[0];
        noChapter = true;
        backupSearch = searchQuest;
    } catch {
        var bookName = "матто";
        noChapter= false;
    }
    // Combine count and name
    var reqBook = bookCount + bookName;
    
    // Get chapter
    ex = /(.{1})([0-9]+)/ // a random letter followed by at least one number
    try {
        var chapterRegex = ex.exec(reqPath)[0];
        var chapterString = chapterRegex.substr(1);
        var reqChapter = parseInt(chapterString);
        noChapter = false;
    } catch {
        var reqChapter = 1;
    }

    // Get verses
    ex = /(:|,|\.)( ?)(\d+)(((-+)(\d+))?)/ // : or , followed by a number, optional - and again a number
    var markBool = false; // says if there are verses to mark
    try {
        var verseRegex = ex.exec(reqPath)[0];
        var verseString = verseRegex.substr(1);
        var verseSplit = verseString.split("-", 2); // if there are multiple verses 5-8 ex.
        var firstVerse = parseInt(verseSplit[0]);
        markBool = true;
        if (verseSplit.length > 1) { // check if a second vers is given
            var lastVerse = parseInt(verseSplit[1]);
        } else {
            var lastVerse = firstVerse;
        }
    } catch { // if there is no verse -> whole chapter
        var firstVerse = 0;
        var lastVerse = 180;
    }
    getText(reqBook, reqChapter, firstVerse, lastVerse, markBool, reqPath);
}


/**
 * Get text from server-- > renderText()
 * @param {string} book 
 * @param {number} chapter 
 * @param {number} firstVerse 
 * @param {number} lastVerse
 * @param {bool} markBool - verse selection to mark (true) or to request (false)
 */
function getText(book, chapter, firstVerse = 0, lastVerse = 180, markBool, wholeQuest) {

    // Request whole chapter if marking enabled
    if (markBool) {
        var request = {
            book: book,
            chapter: chapter,
            firstVerse: 0,
            lastVerse: 180,
            search: wholeQuest,
        };
    } else {
        var request = {
            book: book,
            chapter: chapter,
            firstVerse: firstVerse,
            lastVerse: lastVerse,
            search: wholeQuest,
        }
    }

    var requestString = JSON.stringify(request);

    // Send request to server via AJAX
    $.ajax({
        method: "POST", // invisible in URL
        url: "/php/getText.php",
        data: "data=" + requestString // Embed JSON into POST['data']
    }).done(function (data) {
        if (data == "[]" && dontOverflow < 20) { // if no answer from server
            dontOverflow = dontOverflow + 1; // don't crash when ex. server unavailable
            console.log("No text received. Maybe book doesn't esxist? Redirect to matthew");
            getText(".", "", true); // restart function empty to select default values
        } else {
            renderText(data, markBool, firstVerse, lastVerse);
            dontOverflow = 0;
        }
    });
}

function waitMessage() {
    $('.book-load').show();
}

/* Renders text to html */
function renderText(receivedText, markBool, markStart, markEnd) {
    // DEV-Info 
    console.log(receivedText);
    var jsonText = $.parseJSON(receivedText);
    if (jsonText == "problem") {
        alert("Book doesn't exist, choose another");
    }
    if ("bookNr" in jsonText[0]) {
        renderVerses(jsonText, markBool, markStart, markEnd);
        setTimeout(scrollToVerse, 10);
    } else {
        renderSearch(jsonText);
        setTimeout(scrollToTop,10);
    }

}

function renderVerses(input, markBool, markStart, markEnd) {
    /* Prepare vars */
    var book, chapter, firstVerse = false,
        lastVerse = false,
        verse, header,
        text = "";

    // Make book search possible
    if (noChapter){
        text += "<p><a href=\"javascript:forceSearch()\">Ҷустуҷӯ</a></p>"
    }

    /* Read 'n convert each verse */
    $.each(input, function (key, value) {
        book = value['book'];
        chapter = value['chapter'];
        verse = value['verse'];
        header = value['header'];
        firstVerse ? lastVerse = verse : firstVerse = verse;
        if (header) {
            text = text + "<div forVerse='" + verse + "' class='subtitle'><h3>" + header + "</h3></div>";
        }
        if (verse >= markStart && verse <= markEnd && markBool) {
            text = text + "<span verse='" + verse + "' class='verse mark'>" + "<b>" + verse + " </b>" + value['text'] + " </span>";
        } else {
            text = text + "<span verse='" + verse + "' class='verse'>" + "<b>" + verse + " </b>" + value['text'] + " </span>";
        }
    });
    // If there is a last verse there will be more than one verse
    lastVerse ? verseNumbers = firstVerse + "-" + lastVerse : verseNumbers = firstVerse;
    // Set browser url
    console.log(book);
    shortBook = shortenBook(book, "");
    shortPath = shortBook + chapter;
    window.history.pushState("", book, "/" + shortPath);
    designBook = shortenBook(book, ". ");
    designPath = designBook + " " + chapter;
    document.title = designPath + ' - Китоби Муқаддас';
    // $('h2.chapter').html(designPath);
    $('#reference').val(designPath);
    $('div.text').html(text);
}

function renderSearch(input) {
    var i = 0,
        text = "";

    $.each(input, function (key, value) {
        i++;
        // Search result location
        text += "<div forResult='" + i + "' class='subtitle'><h3>" + shortenBook(value['book'],"") + " " + value['chapter'] + ":" + value['verse'] + "</h3></div>";

        // mark result
        var verseText = value['text'];
        var searchText = searchQuest.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var searchArray = searchText.split(" ");
        var re = new RegExp('('+searchArray.join('|')+')', 'ig');
        verseText = verseText.replace(re, `<span class='mark'>$&</span>`);

        // Show verse text
        text += "<span result='" + i + "' class='verse'>" + verseText + " </span>";
    });
    console.log(searchQuest);
    window.history.pushState("", searchQuest, "/" + searchQuest);
    document.title = searchQuest + ' - Китоби Муқаддас';

    $('#reference').val(searchQuest);
    $('div.text').html(text);
}

function forceSearch() {
    getText('фҷва', 0, 1, 180, false, backupSearch);
}

/* Get book data for verse chooser */
function getBibleBooks() {

}

/* Get chapter and verses for verse chooser */
function getVersesAndChapters() {

}

/* Fill chapter chooser with content */
function renderVerseChooser() {

}

/* Execute now */
readUrl(); // chain-command, see top description of functions



/* Helpers */
function shortenBook(book, separator) {
    var bookArray = book.split(' ');
    var bookName = bookArray[1];
    switch (bookArray[0]) {
        case 'Якуми':
            var bookCount = '1';
            break;
        case 'Дуюми':
            var bookCount = '2';
            break;
        case 'Сеюми':
            var bookCount = '3';
            break;
        case 'Инчили':
            var bookCount = '';
            separator = '';
            break;
        default:
            var bookCount = '';
            separator = '';
            bookName = bookArray[0];
            break;
    }
    shortVersion = bookCount + separator + bookName;
    return shortVersion;
}

function scrollToVerse() {
    try {
        var position = $(".mark").offset().top - $("nav").outerHeight() - 8;
        $('body, html').animate({
            scrollTop: position
        }, 800);
    } catch {
        //
    }
}
function scrollToTop() {
    try {
        var position = 0;
        $('body, html').animate({
            scrollTop: position
        }, 800);
    } catch {
        //
    }
}

// show the keyboard users currently selected key
function handleFirstTab(e) {
    if (e.keyCode === 9) { // the "I am a keyboard user" key
        document.body.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', handleFirstTab);
    }
}
window.addEventListener('keydown', handleFirstTab);