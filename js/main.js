/* Main file of kitob */
/* GLOBAL VARS */
var avTls = {
    1: {
        name: "КМН",
        alias: "кмн",
        content: true,
        target: 3
    },
    2: {
        name: "КМ92",
        alias: "км92",
        content: true,
        target: 3
    },
    3: {
        name: "Ҳеҷ",
        alias: false,
        content: false,
        target: 2
    }
}
var curTl = avTls[1];
var secTl = avTls[3];

var currentBook = "";
var currentBookNr = "0";
var currentChapter = "0";

var searchQuest = "";
var maybeSearch = false;
var dontUpdate = false;
var dontUpdateBook = false;
var dontErase = false;
var trans2search = false;
var translationChange = false;
var blockScroll1 = false;
var blockScroll2 = false;
var timer1, timer2;
var sc = -2;
var ftts = true;

var v1Top = 0;
var v2Top = 0;

var backupSearch = "";

var chaptersAvailable = [];
var booksRendered = [];

var allowedChars = '\u0400-\u0527:,.\\-1234567890\/ ';


/* EVENT HANDLERS */
$(window).on({
    popstate: function () {
        reloadText("noUrlUpdate");
    }
});
$(document).on({
    // Show and hide the loadscreen
    ajaxSend: function (event, request, settings) {
        if (settings.url == "/php/getText.php" && !dontErase) {
            $('.book-load').show();
            $('div.text').html("");
        }
        dontErase = false;
    },
    ajaxStop: function () {
        $('.book-load').hide();
    },
});
$('#menuToggler').on({
    click: function () {
        showMenu();
    },
    touch: function () {
        showMenu();
    }
});
$('form').on('submit', function (e) {
    handleInput(e);
});
$('.form-control').on('input', function () {
    // Block all except allowedChars in input field
    var re = new RegExp('[^' + allowedChars + ']+', 'g');
    if (this.value.match(re)) {
        this.value = this.value.replace(re, '');
    }
});
$('.custom-select').on({
    change: function (e) {
        handleTranslation(e);
    }
});
$('.change-chapter').on({
    click: function (e) {
        handleNePr(e);
    },
    touch: function (e) {
        handleNePr(e);
    }
});
$('.menu-container').on({
    click: function (e) {
        handleMenu(e);
    },
    touch: function (e) {
        handleMenu(e);
    }
});
$('div.text').on({
    click: function (e) {
        textLinks(e);
    },
    touch: function (e) {
        textLinks(e);
    }
});
$(".window").on({
    scroll: function (e) {
        handleScroll(e);
    },
});

function showMenu(show = true) {
    if (show) {
        $('#collapseMenu .btn-book').removeClass('current');
        if (currentBookNr && currentBookNr != "") {
            $('#collapseMenu .btn-book').filter('[bookNr=' + currentBookNr + ']').addClass('current');
        }
        $('#collapseMenu').toggleClass("show");
    } else {
        $('#collapseMenu').removeClass("show");
    }
}

function handleInput(e) {
    event.preventDefault();
    if (e.type == "submit") {
        var request = $(e.target).find('#reference').val();
        $(e.target).find('#reference').blur();
        reloadText(request);
    }
}

function textLinks(e) {
    tg = $(e.target);
    target = tg.attr('linkTg');
    if (typeof target !== typeof undefined && target !== false) {
        reloadText(target);
    }
}

/* MAIN FUNCTIONS */
function reloadText(source = "url", target = 1) {

    if (source == "noUrlUpdate") {
        source = "url";
        dontUpdate = true;
    }
    if (source == "url") {
        var reTxt = readUrl();
    } else if (source == "numbers") {
        var reObj = interpretReq(backupSearch, true);
    } else if (typeof source == "string") {
        var reTxt = source;
    } else {
        var reObj = source;
    }
    if (typeof reObj != "object") {
        reObj = interpretReq(reTxt);
    }
    getText(reObj, target);
    getChapters();
}

function readUrl() {
    var path = window.location.pathname;
    var requestedPath = decodeURI(path).substr(1);
    return requestedPath;
}

function setUrl(book = currentBook, chapter = currentChapter, withInput = true, onlyTitle = false) {
    // Set browser url
    shortBook = shortenBook(book, "");
    translation = curTl.alias + "/";
    if (secTl.alias) {
        translation += secTl.alias + "/";
    }
    shortPath = translation + shortBook + chapter;
    if (!onlyTitle) {
        if (dontUpdate) {
            dontUpdate = false;
        } else {
            window.history.pushState("", book, "/" + shortPath);
        }
    }
    designBook = shortenBook(book, ". ");
    designPath = designBook
    if (chapter != "") {
        designPath += " " + chapter;
    }
    document.title = designPath + ' - Китоби Муқаддас';
    if (withInput) {
        $('#reference').val(designPath);
    }
}


function interpretReq(reqPath, numberIfPos = false) {
    searchQuest = reqPath.trim();
    reqPath = searchQuest.toLowerCase();
    // Extract translation
    var ex = /^([\u0400-\u05271234567890]{3,4})\//
    var trans1 = false;
    var trans2 = false;
    try {
        trans1 = ex.exec(reqPath)[0].slice(0, -1);
        reqPath = reqPath.replace(ex, '');
        searchQuest = searchQuest.replace(ex, '');
    } catch (e) { }
    try {
        trans2 = ex.exec(reqPath)[0].slice(0, -1);
        reqPath = reqPath.replace(ex, '');
        searchQuest = searchQuest.replace(ex, '');
    } catch (e) { }
    $.each(avTls, function (key, value) {
        if (value.name.toLowerCase() == trans1) {
            curTl = value;
        }
        if (value.name.toLowerCase() == trans2) {
            secTl = value;
        }
    });

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
            var bookCount = 'сеюми ';
            break;
        case "4":
            var bookCount = 'чоруми ';
            break;
        default:
            var bookCount = '';
            break;
    }
    // Get book name itself
    // Every letter except number and " ", at least one
    // Then if wanted a space with following letters
    //backupSearch = "";
    var ex = /([\u0400-\u0527]+)((( ?)([\u0400-\u0527]+))?)/ // choose all cyrillic letters
    try {
        var bookName = ex.exec(reqPath)[0];
        maybeSearch = true;
        backupSearch = searchQuest;
    } catch (e) {
        var bookName = "матто";
        maybeSearch = false;
    }
    // Combine count and name
    var reqBook = bookCount + bookName;

    // Get chapter
    ex = /(.{1})([0-9]+)/ // a random letter followed by at least one number
    try {
        var chapterRegex = ex.exec(reqPath)[0];
        var chapterString = chapterRegex.substr(1);
        var reqChapter = parseInt(chapterString);
        maybeSearch = false;
    } catch (e) {
        var reqChapter = 1;
    }

    // Get verses
    ex = /(:|,|\.)( ?)(\d+)((( ?)(-+)( ?)(\d+))?)/ // : or , followed by a number, optional - and again a number
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
    } catch (e) { // if there is no verse -> whole chapter
        var firstVerse = 0;
        var lastVerse = 180;
    }

    // Block URL reset
    notResetUrl = false;
    if (reqPath.slice(-1) == "-") {
        notResetUrl = true;
    }

    // Numbers if possible
    if (numberIfPos) {
        var mem = maybeSearch;
        maybeSearch = false;
        if (currentBookNr != "0" && currentBookNr != "") {
            reqBook = currentBookNr;
        } else if (currentBook != "") {
            if (mem) {
                maybeSearch = true;
            }
            reqBook = currentBook;
        }
        if (currentChapter != "0" && currentChapter) {
            reqChapter = currentChapter;
        }
        if (trans2search) {
            trans2search = false;
            reqBook = "фҷва";
        }

    }

    return {
        book: reqBook,
        chapter: reqChapter,
        firstVerse: firstVerse,
        lastVerse: lastVerse,
        mark: markBool,
        search: reqPath
    }
}

function getText(rq, translation) {
    var markObj = $.extend(true, {}, rq);
    // Request whole chapter if marking enabled
    if (rq.mark) {
        rq.firstVerse = 0;
        rq.lastVerse = 180;
    }
    if (translation == 1) {
        rq.translation = curTl.name;
    } else if (translation == 2) {
        if (secTl.content) {
            dontErase = true;
            rq.translation = secTl.name;
            $('.no1').removeClass("fullHeight");
        } else {
            if (!$('.no1').hasClass("fullHeight")) {
                setUrl();
                $('.no1').addClass("fullHeight");
            }
            return;
        }
    }

    var requestString = JSON.stringify(rq);

    // Send request to server via AJAX
    $.ajax({
        method: "POST", // invisible in URL
        url: "/php/getText.php",
        data: "data=" + requestString // Embed JSON into POST['data']
    }).done(function (data) {
        renderText(data, markObj, translation);
    });
}

/* Renders text to html */
function renderText(receivedText, markObj, translation) {
    if (translation == 1) {
        var target = $('.windowContainer .no1 .text');
    } else if (translation == 2) {
        var target = $('.windowContainer .no2 .text');
    }

    if (receivedText == "[]") {
        target.html("<div class=\"alert alert-danger rounded-sm\"> Ин калима вуҷуд надорад!</div> ");
        if (translation == 1) {
            $('#reference').val(searchQuest);
        }
        return;
    }
    // DEV-Info console.log(receivedText);
    var jsonText = $.parseJSON(receivedText);
    if (jsonText == "problem") {
        alert("Book doesn't exist, choose another");
    }
    if ("bookNr" in jsonText[0]) {
        renderVerses(jsonText, markObj, target);
        setTimeout(function () {
            scrollToVerse(translation);
        }, 10);
    } else {
        renderSearch(jsonText, target);
    }
    if (translation == 1) {
        //dontUpdate = true;
        reloadText("numbers", 2);
    }
    try {
        v1Top = $(".no1 div div")[0].scrollHeight + $(".no1 div div")[0].offsetTop;
        v2Top = $(".no2 div div")[0].scrollHeight + $(".no2 div div")[0].offsetTop;
    } catch (error) {
        v2Top = 0;
    }

}

function renderVerses(input, mk, tg) { // mk markobject
    /* Prepare vars */
    var book, chapter, firstVerse = false,
        lastVerse = false,
        verse, header,
        text = "";

    // Make book search possible
    if (maybeSearch) {
        text += "<div class='alert alert-info'><a href=\"javascript:forceSearch()\" style='color: inherit; text-decoration: underline;'>Ҷустуҷӯи: " + backupSearch + "</a></div>";
        maybeSearch = false;
    } else {

    }

    /* Read 'n convert each verse */
    $.each(input, function (key, value) {
        book = value['book'];
        bookNr = value['bookNr'];
        chapter = value['chapter'];
        if (verse == value['verse']) return true;
        verse = value['verse'];
        header = value['header'];
        firstVerse ? lastVerse = verse : firstVerse = verse;
        if (header) {
            text = text + "<div forVerse='" + verse + "' class='subtitle'><h3>" + header + "</h3></div>";
        }
        if (verse >= mk.firstVerse && verse <= mk.lastVerse && mk.mark) {
            text = text + "<span verse='" + verse + "' class='verse mark'>" + "<b>" + verse + " </b>" + value['text'] + " </span>";
        } else {
            text = text + "<span verse='" + verse + "' class='verse'>" + "<b>" + verse + " </b>" + value['text'] + " </span>";
        }
    });
    // If there is a last verse there will be more than one verse
    lastVerse ? verseNumbers = firstVerse + "-" + lastVerse : verseNumbers = firstVerse;
    //if (!tg.parent().hasClass("no2") || translationChange) {
    if (!tg.parent().hasClass("no2")) {
        // set currents
        currentBook = book;
        currentBookNr = bookNr;
        currentChapter = chapter;
        setUrl(currentBook, currentChapter);
    } else if (translationChange) {
        translationChange = false;
        setUrl(currentBook, currentChapter);
    }
    tg.html(text);
    $('.change-chapter:not(.show)').addClass("show");
}

function renderSearch(input, tg) {
    $('.change-chapter').removeClass("show");
    var i = 0,
        text = "";
    var searchText = searchQuest.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var searchArray = searchText.split(" ");
    if (searchArray.length == 1) {
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
        <h3><a linkTg=" + href + "'>\
        " + shortenBook(value['book'], "") + " " + value['chapter'] + ":" + value['verse'] + "\
        </a></h3>\
        </div>";

        // mark result
        var verseText = value['text'];
        verseText = verseText.replace(re, `<span class='mark'>$&</span>`);

        // Show verse text
        text += "<span result='" + i + "' class='verse'>" + verseText + " </span>";
    });

    // Add result count
    text = "<div class='count alert alert-success'><i><b>" + i + "</b> оят</i></div>" + text;
    tg.html(text);
    if (searchQuest.split(" ").length == 1) {
        var words = tg.html().split('"mark"').length; // todo fix counter
        counterText = tg.find('.count i').html();
        counterText = words + " маротиба, " + counterText;
        tg.find('.count i').html(counterText);
    }
    currentBook = searchQuest;
    currentBookNr = "";
    currentChapter = "";

    setUrl(searchQuest);
}

function forceSearch() {
    if (secTl.content) {
        trans2search = true;
    }
    reloadText({
        book: 'фҷва',
        chapter: 0,
        firstVerse: 1,
        lastVerse: 180,
        mark: false,
        search: backupSearch
    });
}


/* Get book data for verse chooser */
function getChapters() {
    if (chaptersAvailable[curTl.name]) {
        renderBookChooser(chaptersAvailable[curTl.name]);
    } else {
        $.ajax({
            method: "POST", // invisible in URL
            url: "/php/getChapters.php",
            data: "translation=" + curTl.name
        }).done(function (data) {
            try {
                answer = $.parseJSON(data);
                successfulReceived = true;
            } catch (error) {
                successfulReceived = false;
            }
            if (successfulReceived) {
                chaptersAvailable[curTl.name] = answer;
                renderBookChooser(chaptersAvailable[curTl.name]);
            }
        });
    }
}

/* Fill chapter chooser with content */
function renderBookChooser(chapterArray) {
    i = 0,
        bookButtons = "";
    if (booksRendered[curTl.name]) {
        bookButtons = booksRendered[curTl.name];
    } else {
        $.each(chapterArray, function (key, value) {
            i++;
            bookLine = '<a class="col-3 col-sm-3 btn btn-book ';
            // color attribute
            switch (value['color']) {
                case "#ccccff":
                    bookLine += 'book-mos'; // moses
                    break;
                case "#ffcc99":
                    bookLine += 'book-hiat'; // history at
                    break;
                case "#66ff99":
                    bookLine += 'book-pt'; // poetic
                    break;
                case "#ff9fb4":
                    bookLine += 'book-pr'; // prophetic
                    break;
                case "#ffff99":
                    bookLine += 'book-lt'; // little prophets
                    break;
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
        booksRendered[curTl.name] = bookButtons;
    }
    $('#collapseMenu .book-list').html(bookButtons);
    $('#collapseMenu .chapter-list').html("");
}

function handleMenu(e) {
    var tg = $(e.target);
    var pr = tg.parent();
    if (tg.hasClass("collapse-menu")) {
        showMenu(false);
    } else if (tg.hasClass("toBook") || pr.hasClass("toBook")) {
        toBookSelection();
    } else if (tg.hasClass("btn-book")) {
        handleBook(tg.attr("book"), tg.attr("shortBook"), tg.attr("bookNr"), tg.attr("count"), tg.hasClass("current"));
    } else if (pr.hasClass("btn-book")) {
        handleBook(pr.attr("book"), pr.attr("shortBook"), pr.attr("bookNr"), pr.attr("count"), pr.hasClass("current"));
    } else if (tg.hasClass("btn-chapter")) {
        handleChapter(tg.attr("bookNr"), tg.attr("chapter"));
    } else if (pr.hasClass("btn-chapter")) {
        handleChapter(pr.attr("bookNr"), tg.attr("chapter"));
    }
}

function handleNePr(e) {
    var tg = $(e.target);
    var pr = tg.parent();
    if (tg.hasClass("next")) {
        changeChapter();
    } else if (tg.hasClass("prev")) {
        changeChapter(false);
    } else if (pr.hasClass("next")) {
        changeChapter();
    } else if (pr.hasClass("prev")) {
        changeChapter(false);
    }
}

function handleScroll(e) {
    if (!secTl.content) {
        return;
    }
    var tg = $(e.target);
    if (tg.hasClass("no1") && !blockScroll2) {
        blockScroll1 = true;
        clearTimeout(timer1);
        $('.no2').scrollTop($('.no1').scrollTop() * ($('.no2 .text').outerHeight() + 20) / $('.no1 .text').outerHeight() - 0);
        timer1 = setTimeout(function () { blockScroll1 = false; }, 100);
    } else if (tg.hasClass("no2") && !blockScroll1) {
        blockScroll2 = true;
        clearTimeout(timer2)
        $('.no1').scrollTop(($('.no2').scrollTop()) * $('.no1 .text').outerHeight() / ($('.no2 .text').outerHeight() + 20));
        timer2 = setTimeout(function () { blockScroll2 = false; }, 100);
    }

}

function handleTranslation(e) {
    var tg = $(e.target);
    var tgWindow = tg.attr("tr");
    var newTlNr = parseInt(tg.val());
    if (ftts) {
        $('.menu').addClass("fullHeight");
        ffts = false;
    }
    if (tgWindow == 1) {
        curTl = avTls[newTlNr];
    } else if (tgWindow == 2) {
        dontErase = true;
        translationChange = true;
        secTl = avTls[newTlNr];
        dontUpdateBook = true;
    }
    dontUpdate = false;
    reloadText("numbers", tgWindow);
    getChapters();
}

function handleBook(bookName, bookShort, bookNr, count, current = false) {
    if (count == 1) {
        handleChapter(bookNr, count);
        return;
    }
    chapterButtons = '<a class="col-3 col-sm-2 btn btn-chapter toBook"><i class="fas fa-arrow-left" style=" font-size: 13px;"></i></a>';
    chapterButtons += '<a class="col btn btn-chapter" chapter="1" bookNr="' + bookNr + '">'
    chapterButtons += '<span class="long">' + bookName + '</span>';
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
    for (let i = 17 - count; i > 0; i--) {
        chapterButtons += '<a class="col-12"></a>';
    }
    $('#collapseMenu .book-list').html("");
    $('#collapseMenu .chapter-list').html(chapterButtons);
}

function handleChapter(bookNr, chapter) {
    maybeSearch = false; // disable booksearch
    reloadText({
        book: bookNr,
        chapter: chapter,
        firstVerse: 0,
        lastVerse: 180,
        mark: false,
        search: ""
    });
    $('#collapseMenu').removeClass("show");
}

function toBookSelection() {
    getChapters();
    $('#collapseMenu .btn-book').removeClass('current');
    $('#collapseMenu .btn-book').filter('[bookNr=' + currentBookNr + ']').addClass('current');
}

function renderTranslations(target = false) {
    var menu1 = "";
    var menu2 = "";
    if (sc == true) {
        avTls[Object.keys(avTls).length + 1] = {
            name: "ЕЛБ",
            alias: "елб",
            content: true,
            target: 3
        };
    }
    // Menu 1
    $.each(avTls, function (index, value) {
        var trOption1 = "<option value='";
        var trOption2;
        var m1sel = "",
            m2sel = "";

        var m1but = "",
            m2but = "";
        trOption1 += index + "'";
        if (value.name == curTl.name) {
            m1sel += " selected";
        }
        if (value.name == secTl.name) {
            m2sel += " selected";
        }
        trOption2 = ">" + value.name + "</option>";
        if (value.target == 1 || value.target == 3) {
            m1but = trOption1 + m1sel + trOption2;
        }
        if (value.target == 2 || value.target == 3) {
            m2but = trOption1 + m2sel + trOption2;
        }
        menu1 += m1but;
        menu2 += m2but;
    });
    $('#trans-select1').html(menu1);
    $('#trans-select2').html(menu2);
}

function changeChapter(forward = true) {
    chapterRq = {
        book: currentBookNr,
        chapter: 1,
        firstVerse: 0,
        lastVerse: 180,
        mark: false,
        search: ""
    }
    backupSearch = "";
    if (forward) {
        currentMaxChapter = "", nextBook = "";
        cpAv = chaptersAvailable[curTl.name];
        for (i in cpAv) {
            if (cpAv[i].bookNumber == currentBookNr) {
                currentMaxChapter = cpAv[i].chapterCount;
            } else if (currentMaxChapter != "") {
                nextBook = cpAv[i].bookNumber;
                break;
            }
        }
        if (parseInt(currentChapter) < parseInt(currentMaxChapter)) {
            chapterRq.chapter = parseInt(currentChapter) + 1;
        } else if (nextBook != "") {
            chapterRq.book = nextBook;
        } else {
            sc++;
            if (sc == true) renderTranslations();
            return;
        }
    } else {
        if (parseInt(currentChapter) > 1) {
            chapterRq.chapter = parseInt(currentChapter) - 1;
        } else {
            var prevBook = "",
                prevBookChapters;
            books = chaptersAvailable[curTl.name];
            for (i in books) {
                if (books[i].bookNumber == currentBookNr) {
                    break;
                } else {
                    prevBook = books[i].bookNumber;
                    prevBookChapters = books[i].chapterCount;
                }
            }
            if (prevBook != "") {
                chapterRq.book = prevBook;
                chapterRq.chapter = prevBookChapters;
            }
        }
    }
    reloadText(chapterRq);
}


/* FIRST RUN */
reloadText();
renderTranslations();


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
        case 'Чоруми':
            var bookCount = '4';
            break;
        case 'Такрори':
            var bookCount = '';
            separator = '';
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

function scrollToVerse(tg) {
    if (tg == 1) {
        try {
            $('.no1').animate({
                scrollTop: $('.no1 .mark').position().top - 3
            });
        } catch (e) {
            // continue
        }
    } else if (tg == 2) {
        try {
            $('.no2').animate({
                scrollTop: $('.no2 .mark').position().top - 3
            });
        } catch (e) {
            //
        }
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

$(window).on("load", function () {
    delete Hammer.defaults.cssProps.userSelect;
    var watchObjs = document.getElementsByClassName("text");
    var i = 0;
    var hammerText = [];
    for (watchObj of watchObjs) {
        i++;
        hammerText[i] = new Hammer(watchObj, {
            inputClass: Hammer.TouchInput
        });
        hammerText[i].get('swipe').set({
            threshold: 100
        });
        hammerText[i].on('swipe', function (e) {
            if (e.direction == 2) {
                changeChapter();
            } else if (e.direction == 4) {
                changeChapter(false);
            }
        });
    };
});