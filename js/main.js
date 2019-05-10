/* Main file of kitob */
var searchQuest = "",
    notResetUrl = false;
// save chapters -> one request per translation
chaptersAvailable = [];
booksRendered = [], chaptersRendered = [];
// save translations
currentTl = "kmn";
secondTl = "";
currentBook = "0";
currentChapter = "0";

/* Events to catch */
$(document).on({
    ajaxSend: function (event, request, settings) {
        if (settings.url == "/php/getText.php") {
            $('.book-load').show();
            $('div.text').html("");
        }
    },
    ajaxStart: function () {
        //$('.book-load').show();
        //$('div.text').html("");
    },
    ajaxStop: function () {
        $('.book-load').hide();
    },
    ajaxError: function () {
        $('.book-load').hide();
    },
});
$('#menuToggler').on({
    click: function () {
        $('#collapseMenu .btn-book').removeClass('current');
        $('#collapseMenu .btn-book').filter('[bookNr=' + currentBook + ']').addClass('current');
        $('#collapseMenu').toggleClass("show");
    },
    touch: function () {
        $('#collapseMenu .btn-book').removeClass('current');
        $('#collapseMenu .btn-book').filter('[bookNr=' + currentBook + ']').addClass('current');
        $('#collapseMenu').toggleClass("show");
    }
})
$('.form-control').on('input', function () {
    if (this.value.match(/[^ёйқукенгшҳзхъӯғэждлорпавҷфячсмитӣбюЁҒӮЪХЗҲШГНЕКУҚЙФҶВАПРОЛДЖЭЮБӢТИМСЧЯ:,.\-1234567890 ]+/g)) {
        this.value = this.value.replace(/[^ёйқукенгшҳзхъӯғэждлорпавҷфячсмитӣбюЁҒӮЪХЗҲШГНЕКУҚЙФҶВАПРОЛДЖЭЮБӢТИМСЧЯ:,.\-1234567890 ]+/g, '');
    }
});
// Menu handler - bookChooser
$('.menu .book-list, .menu .chapter-list').on({
    click: function (e) {
        handleMenu(e);
    },
    touch: function (e) {
        handleMenu(e);
    }
})

/* Global vars */
var dontOverflow = 0;

/* Reload text when user presses back or forward button in browser */
window.onpopstate = function () {
    readUrl();
};

/* Read User Input */
function checkIfSend(e) {
    if (e.type == "submit") {
        var requestField = $(e.target).find('#reference').val();
        $(e.target).find('#reference').blur();
        interpretReq(requestField);
    }
}

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
    searchQuest = reqPath.trim();
    reqPath = reqPath.toLowerCase().trim();
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
    backupSearch = "";
    var ex = /([\u0400-\u0527]+)((( ?)([\u0400-\u0527]+))?)/ // choose all cyrillic letters
    try {
        var bookName = ex.exec(reqPath)[0];
        noChapter = true;
        backupSearch = searchQuest;
    } catch {
        var bookName = "матто";
        noChapter = false;
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

    // Block URL reset
    notResetUrl = false;
    if (reqPath.slice(-1) == "-") {
        notResetUrl = true;
    }
    getText(reqBook, reqChapter, firstVerse, lastVerse, markBool, reqPath);

    getChapters();
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
            $('#reference').val(searchQuest);
            $('div.text').html("<div class=\"alert alert-danger rounded-sm\"> Ин калима вуҷуд надорад!</div> ");
        } else {
            renderText(data, markBool, firstVerse, lastVerse);
            dontOverflow = 0;
        }
    });
}

function waitMessage() {
    $('div.text').html("");
    $('.book-load').show();
}

/* Renders text to html */
function renderText(receivedText, markBool, markStart, markEnd) {
    // DEV-Info console.log(receivedText);
    var jsonText = $.parseJSON(receivedText);
    if (jsonText == "problem") {
        alert("Book doesn't exist, choose another");
    }
    if ("bookNr" in jsonText[0]) {
        renderVerses(jsonText, markBool, markStart, markEnd);
        setTimeout(scrollToVerse, 10);
    } else {
        renderSearch(jsonText);
        setTimeout(scrollToTop, 10);
    }

}

function renderVerses(input, markBool, markStart, markEnd) {
    /* Prepare vars */
    var book, chapter, firstVerse = false,
        lastVerse = false,
        verse, header,
        text = "";

    // Make book search possible
    if (noChapter) {
        text += "<div class='alert alert-info'><a href=\"javascript:forceSearch()\" style='color: inherit; text-decoration: underline;'>Ҷустуҷӯи: " + backupSearch + "</a></div>";
    }

    /* Read 'n convert each verse */
    $.each(input, function (key, value) {
        book = value['book'];
        bookNr = value['bookNr'];
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
    shortBook = shortenBook(book, "");
    shortPath = shortBook + chapter;
    if (!notResetUrl) {
        window.history.pushState("", book, "/" + shortPath);
    }
    designBook = shortenBook(book, ". ");
    designPath = designBook + " " + chapter;
    document.title = designPath + ' - Китоби Муқаддас';

    // set currents
    currentBook = bookNr;
    currentChapter = chapter;
    $('#reference').val(designPath);
    $('div.text').html(text);
}

function renderSearch(input) {
    var i = 0,
        text = "";
            var searchText = searchQuest.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var searchArray = searchText.split(" ");
        if(searchArray.length == 1) {
            searchArray[1] = searchArray[0].replace(/у/ig, "ӯ");
            searchArray[2] = searchArray[0].replace(/ӯ/ig, "у");
        }
        var re = new RegExp('(' + searchArray.join('|') + ')', 'ig');


    $.each(input, function (key, value) {
        i++;
        // Create link to verse 
        href = shortenBook(value['book'], "");
        href += value['chapter'];
        href += ":" + value['verse'];

        // Search result location
        text += "<div forResult='" + i + "' class='subtitle'>\
        <h3><a href = 'javascript:interpretReq(\"" + href + "\")\' style=\"color: inherit;\">\
        " + shortenBook(value['book'], "") + " " + value['chapter'] + ":" + value['verse'] + "\
        </a></h3>\
        </div>";

        // mark result
        var verseText = value['text'];
        verseText = verseText.replace(re, `<span class='mark'>$&</span>`);

        // Show verse text
        text += "<span result='" + i + "' class='verse'>" + verseText + " </span>";
    });
    window.history.pushState("", searchQuest, "/" + searchQuest);
    document.title = searchQuest + ' - Китоби Муқаддас';

    // Add result count
    text = "<div class='count alert alert-success'><i><b>" + i + "</b> оят</i></div>" + text;
    $('#reference').val(searchQuest);
    $('div.text').html(text);
    if (searchQuest.split(" ").length == 1) {
        var words = $('.container').html().split('"mark"').length;
        counterText = $('div.count i').html();
        counterText = words + " маротиба, " + counterText;
        $('div.count i').html(counterText);
    }
    currentBook = "0";
    currentChapter = "0";
}

function forceSearch() {
    getText('фҷва', 0, 1, 180, false, backupSearch);
}


/* Get book data for verse chooser */
function getChapters() {
    if (chaptersAvailable[currentTl]) {
        renderBookChooser(chaptersAvailable[currentTl]);
    } else {
        $.ajax({
            method: "POST", // invisible in URL
            url: "/php/getChapters.php",
            data: "translation=" + currentTl
        }).done(function (data) {
            try {
                answer = $.parseJSON(data);
                successfulReceived = true;
            } catch (error) {
                successfulReceived = false;
            }
            if (successfulReceived) {
                chaptersAvailable[currentTl] = answer;
                renderBookChooser(chaptersAvailable[currentTl]);
            }
        });
    }
}

/* Fill chapter chooser with content */
function renderBookChooser(chapterArray) {
    var i = 0,
        bookButtons = "";
    if (booksRendered[currentTl]) {
        bookButtons = booksRendered[currentTl];
    } else {
        $.each(chapterArray, function (key, value) {
            i++;
            bookLine = '<a class="col-3 col-sm-3 btn btn-book ';
            // color attribute
            switch (value['color']) {
                case "#ff6600":
                    bookLine += 'book-gp'; // gospel
                    break;
                case "#00ffff":
                    bookLine += 'book-hi'; // history
                    break;
                case "#ffff00":
                    bookLine += 'book-pa'; // paulus
                    break;
                case "#00ff00":
                    bookLine += 'book-le'; // letters
                    break;
                case "#ff7c80":
                    bookLine += 'book-re'; // revelation
                    break;
                default:
                    bookLine += 'book-other';
                    break;
            }
            bookLine += '"';
            bookLine += ' count=\'' + value['chapterCount'] + '\' ';
            bookLine += ' bookNr=\'' + value['bookNumber'] + '\' ';
            bookLine += ' shortBook=\'' + value['shortBook'] + '\' ';
            bookLine += ' book=\'' + shortenBook(value['longBook'], ". ") + '\'>';
            bookLine += '<span class="long">' + shortenBook(value['longBook'], ". ") + '</span>';
            bookLine += '<span class="short">' + value['shortBook'] + '</span>';
            bookLine += '</a>';

            bookButtons += bookLine;
        });
        booksRendered[currentTl] = bookButtons;
    }
    $('#collapseMenu .book-list').html(bookButtons);
    $('#collapseMenu .chapter-list').html("");
}

function handleMenu(e) {
    noChapter = false;
    var tg = $(e.target);
    var pr = tg.parent();
    if(tg.hasClass("toBook") || pr.hasClass("toBook")){
        toBookSelection();
    }
    else if (tg.hasClass("btn-book")) {
        handleBook(tg.attr("book"), tg.attr("shortBook"),tg.attr("bookNr"), tg.attr("count"), tg.hasClass("current"));
    } else if (pr.hasClass("btn-book")) {
        handleBook(pr.attr("book"), pr.attr("shortBook"),pr.attr("bookNr"), pr.attr("count"), pr.hasClass("current"));
    } else if (tg.hasClass("btn-chapter")) {
        handleChapter(tg.attr("bookNr"), tg.attr("chapter"));
    } else if (pr.hasClass("btn-chapter")) {
        handleChapter(pr.attr("bookNr"), tg.attr("chapter"));
    }
}

function handleBook(bookName, bookShort, bookNr, count, current = false) {
    if (count == 1) {
        handleChapter(bookNr, count);
        return;
    }
    chapterButtons = '<a class="col-3 col-sm-2 btn btn-chapter toBook"><span class="oi oi-arrow-left" style="font-size: 12px;"></span></a>';
    chapterButtons += '<a class="col btn btn-chapter" chapter="1" bookNr="' + bookNr + '">'
    chapterButtons += '<span class="long">' +bookName + '</span>'; 
    chapterButtons += '<span class="short">' + bookShort + "</span></a>";
    chapterButtons += '<div class="w-100"></div>';
    for (let i = 1; i <= count; i++) {
        chapterLine = '<a class="col-3 col-sm-2 btn btn-chapter';
        if (current && i == currentChapter) {
            chapterLine += ' current';
        }
        chapterLine += '"';
        chapterLine += ' chapter="' + i + '"';
        chapterLine += ' bookNr="' + bookNr + '"';
        chapterLine += '>' + i + '</a>';
        chapterButtons += chapterLine;
    }
    $('#collapseMenu .book-list').html("");
    $('#collapseMenu .chapter-list').html(chapterButtons);
}

function handleChapter(bookNr, chapter) {
    getText(bookNr, chapter, 0, 180, false, "");
    $('#collapseMenu').removeClass("show");
    getChapters();
}

function toBookSelection() {
    getChapters();
    $('#collapseMenu .btn-book').removeClass('current');
    $('#collapseMenu .btn-book').filter('[bookNr=' + currentBook + ']').addClass('current');
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