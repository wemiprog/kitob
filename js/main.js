/* Main file of kitob */
/* GLOBAL VARS */
var avTls = df["avTls"];
var curTl = avTls[1];
var secTl = avTls[0];

// To be used as values not changing on reload
var currentBook = "";
var currentBookNr = "0";
var currentChapter = "0";

var searchQuest = "";
var backupSearch = "";
var maybeSearch = false;
var dontUpdate = false;
var dontUpdateBook = false;
var dontErase = false;
var trans2search = false; // Forces search in second translation
var translationChange = false;

// Blocks Perpetum mobile
var blockScroll1 = false;
var blockScroll2 = false;
var timer1, timer2;

var sc = -1;
var ftts = true;

// Save Menu items on client to prevent reloading each time menu rendering
var chaptersAvailable = [];
var booksRendered = [];

// Audio Vars
var audio = $('#chapterAudio');
var wasPlaying = false;
var avSpeeds = [0.5, 1, 1.5, 2];
var seekInProgress;

// Allow kyrillic chars
var allowedChars = df["allowedChars"];


/* EVENT HANDLERS */
$(window).on({
    popstate: function () {
        reloadText("noUrlUpdate");
    },
    mouseup: function (e) {
        stopSeek(e);
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
    touchend: function (e) {
        stopSeek(e);
    },
    keydown: function (e) {
        handleKeys(e);
    }
});
$('#menuToggler').on({
    click: function () {
        showMenu();
    },
    touch: function () {
        showMenu();
    }
});
$(".audioButton").on({
    click: function () {
        showAudio();
    },
    touch: function () {
        showAudio();
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
$(".audio-container").on({
    click: function (e) {
        handleAudio(e);
    },
    touch: function (e) {
        handleAudio(e);
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
audio.on({
    ended: function () {
        wasPlaying = true;
        changeChapter();
    },
    loadedmetadata: function () {
        playAudio("metadata");
    },
    timeupdate: function () {
        playAudio("updatePos");
    }
});
$(".play-pause").on({
    click: function () {
        playAudio("playpause");
    }
});
$(".speed-change").on({
    click: function () {
        playAudio("speedchange");
    }
});
$(".wholeProgress").on({
    mousemove: function (e) {
        moveProgress(e);
    },
    mousedown: function (e) {
        moveProgress(e);
    },
    touchstart: function (e) {
        moveProgress(e);
    },
    touchmove: function (e) {
        moveProgress(e);
    }
});

/* EventHandlerFunctions */
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

function showAudio(show = true) {
    if (show) {
        $('.audio').toggleClass("show");
        $('.window').toggleClass("audioHeight");
        $('.info.book-load').toggleClass("audioHeight");
        $('.amb').toggleClass("audioMove");

        if ($('.audio').hasClass("show") && audio[0].paused && audio[0].readyState == 0) {
            audio[0].load();
        }
    } else {
        $('.audio').removeClass("show");
        $('.window').removeClass("audioHeight");
        $('.info.book-load').removeClass("audioHeight");
        $('.amb').removeClass("audioMove");
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
    if (target == 1) {
        playAudio("pause");
    }

    if (source == "noUrlUpdate") {
        source = "url";
        dontUpdate = true;
    }
    if (source == "url") {
        var reTxt = readUrl();
    }
    else if (source == "numbers") {
        var reObj = interpretReq(backupSearch, true);
    }
    else if (typeof source == "string") {
        var reTxt = source;
    }
    else {
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
    document.title = designPath + ' - ' + df["appName"];
    if (withInput) {
        $('#reference').val(designPath);
    }
}


function interpretReq(reqPath, numberIfPos = false) {
    searchQuest = reqPath.trim();
    reqPath = searchQuest.toLowerCase();
    // Extract translation
    var ex = df["allowedTrans"]
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
            var bookCount = df["firstOf"] + " ";
            break;
        case "2":
            var bookCount = df["secondOf"] + " ";
            break;
        case "3":
            var bookCount = df["thirdOf"] + " ";
            break;
        case "4":
            var bookCount = df["fourthOf"] + " ";
            break;
        default:
            var bookCount = '';
            break;
    }
    // Get book name itself
    // Every letter except number and " ", at least one
    // Then if wanted a space with following letters
    //backupSearch = "";
    var ex =  df["allowedBook"]; // choose all cyrillic letters
    try {
        var bookName = ex.exec(reqPath)[0];
        maybeSearch = true;
        backupSearch = searchQuest;
    } catch (e) {
        var bookName = df["defBook"];
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
            reqBook = df["inexistent"]; // Something inexistent
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
        var tlname = curTl.name;
    } else if (translation == 2) {
        var target = $('.windowContainer .no2 .text');
        var tlname = secTl.name;
    }

    if (receivedText == "[]") {
        if (translation == 1) {
            $('#reference').val(searchQuest);
        }
        if (maybeSearch || currentChapter == "") {
            target.html("<div class=\"alert alert-danger rounded-sm\">" + df["noSearchResult"] + "</div> ");
        } else {
            target.html("<div class=\"alert alert-danger rounded-sm\"> "+ df["verseNotFound1"] + " " + tlname + " " + df["verseNotFound2"] + "</div> ");
        }
        return;
    }
    // DEV-Info console.log(receivedText);
    var jsonText = $.parseJSON(receivedText);
    if (jsonText == "problem") {
        console.log("Book doesn't exist, choose another");
    }
    if ("bookNr" in jsonText[0]) {
        renderVerses(jsonText, markObj, target);
        setTimeout(function () {
            scrollToVerse(translation);
        }, 10);
    } else {
        wasPlaying = false;
        renderSearch(jsonText, target);
    }
    if (translation == 1) {
        reloadText("numbers", 2);
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
        text += "<div class='alert alert-info'><a href=\"javascript:forceSearch()\" style='color: inherit; text-decoration: underline;'>" + df["forceSearch"] + ": " + backupSearch + "</a></div>";
        maybeSearch = false;
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
        getAudioLink();
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
    text = "<div class='count alert alert-success'><i><b>" + i + "</b> " + df["verse"] + "</i></div>" + text;
    tg.html(text);
    if (searchQuest.split(" ").length == 1) {
        var words = tg.html().split('"mark"').length; // todo fix counter
        counterText = tg.find('.count i').html();
        counterText = words + " " + df["times"] + ", " + counterText;
        tg.find('.count i').html(counterText);
    }
    currentBook = searchQuest;
    currentBookNr = "";
    currentChapter = "";

    setUrl(searchQuest);
}

function getAudioLink() {
    var request = {
        translation: curTl.name.toLowerCase(),
        bookNr: currentBookNr,
        chapter: currentChapter
    };
    var requestString = JSON.stringify(request);

    $.ajax({
        method: "POST",
        url: "/php/getAudio.php",
        data: "data=" + requestString
    }).done(function (mp3Link) {
        if (mp3Link) {
            updateAudioPlayer(mp3Link);
            if (wasPlaying) {
                wasPlaying = false;
                audio[0].load();
                playAudio("play");
            }
        } else {
            $(".audioButton").hide();
            showAudio(false);
            playAudio("pause");
        }
    });
}

function mediaSession() {
    if ('mediaSession' in navigator) {
        audioTitle = shortBook + " " + currentChapter;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: audioTitle,
            artist: df["appName"],
            album: df["audioProvider"],
            artwork: [
                { src: '/img/book-96.png', sizes: '96x96', type: 'image/png' },
                { src: '/img/book-128.png', sizes: '128x128', type: 'image/png' },
                { src: '/img/book-192.png', sizes: '192x192', type: 'image/png' },
                { src: '/img/book-256.png', sizes: '256x256', type: 'image/png' },
                { src: '/img/book-384.png', sizes: '384x384', type: 'image/png' },
                { src: '/img/book-512.png', sizes: '512x512', type: 'image/png' },
            ]
        });

        navigator.mediaSession.setActionHandler('play', playAudio);
        navigator.mediaSession.setActionHandler('pause', playAudio);
        navigator.mediaSession.setActionHandler('previoustrack', function () { changeChapter(false); wasPlaying = true; });
        navigator.mediaSession.setActionHandler('nexttrack', function () { changeChapter(); wasPlaying = true; });
    }
}

function playAudio(action) {
    var currentState = !audio[0].paused;

    if (action == "playpause" || !action) {
        if (currentState) {
            action = "pause";
        } else {
            action = "play";
        }
    }

    if (action == "play") {
        audio[0].play()
            .then(_ => {
                mediaSession();
            }).catch(error => {
                if (!error == "DOMException")
                    console.log(error);
            });
        $(".fa-volume-up").addClass("volume");
        $(".play-pause").addClass("fa-pause");
        $(".play-pause").removeClass("fa-play");
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = "playing";
        }
    }
    if (action == "pause") {
        audio[0].pause();
        $(".fa-volume-up").removeClass("volume");
        $(".play-pause").addClass("fa-play");
        $(".play-pause").removeClass("fa-pause");
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = "paused";
        }
    }
    if (action == "speedchange") {
        var text = $(".speed-change")[0].innerText;
        var num = parseFloat(text.split("x")[0]);
        var nextIndex = avSpeeds.indexOf(num) + 1;
        var nextSpeed = avSpeeds[(nextIndex + avSpeeds.length) % avSpeeds.length];
        audio[0].playbackRate = nextSpeed;
        $(".speed-change")[0].innerText = nextSpeed + "x";
    }
    if (action == "metadata") {
        var durationS = audio[0].duration;
        var seconds = durationS % 60;
        var minutes = (durationS - seconds) / 60;
        var text = minutes + ":" + twoNum(seconds);
        $(".endTime").text(text);
    }
    if (action == "updatePos") {
        var curTime = audio[0].currentTime;
        var seconds = curTime % 60;
        var minutes = (curTime - seconds) / 60;
        var text = minutes + ":" + twoNum(seconds);
        var wholeTime = audio[0].duration;
        var progress = curTime * 100 / wholeTime;
        $(".curTime").text(text);
        $(".currentProgress").css("width", progress + "%");

        if (!audio[0].paused) {
            var visHeight = $(".no1").height();
            var fullHeight = $(".no1 .text").outerHeight();
            var startHeight = (visHeight * 100) / (2 * fullHeight);
            var stopHeight = 100 - startHeight;
            if (startHeight < progress && progress < stopHeight) {
                var newScroll = (((fullHeight - visHeight * 0) * progress) / 100) - (visHeight / 2);

                $(".no1").stop(true, true).animate({
                    scrollTop: newScroll
                }, 400);
                $(".no1").scrollTop(newScroll);
                $(".window").addClass("darkScroll");
            } else if (startHeight > progress) {
                $(".no1").scrollTop(0);
                $(".window").removeClass("darkScroll");
            } else {
                console.log("test")
                $(".no1").scrollTop(fullHeight - visHeight);
                $(".window").removeClass("darkScroll");
            }
            if (secTl.content) {
                var visHeight2 = $(".no2").height();
                var fullHeight2 = $(".no2 .text").outerHeight();
                var startHeight2 = (visHeight2 * 100) / (2 * fullHeight2);
                var stopHeight2 = 100 - startHeight2;
                if (startHeight2 < progress && progress < stopHeight2) {
                    var newScroll2 = (((fullHeight2 - visHeight2 * 0) * progress) / 100) - (visHeight2 / 2);

                    $(".no2").stop(true, true).animate({
                        scrollTop: newScroll2
                    }, 400);
                    $(".no2").scrollTop(newScroll2);
                } else if (startHeight2 > progress) {
                    $(".no2").scrollTop(0);
                } else {
                    $(".no2").scrollTop(fullHeight2 - visHeight2);
                }
            }
        }
    }
}

function moveProgress(e) {
    if (e.type == "mousedown" || e.type == "touchstart") {
        seekInProgress = true;
        $("body").addClass("noselect");
    } else if (!seekInProgress) {
        return;
    }
    e.preventDefault();

    var audioProgressContainer = $(".wholeProgress")[0];
    var wholeTime = audio[0].duration;
    const boundingRect = audioProgressContainer.getBoundingClientRect();
    const isTouch = e.type.slice(0, 5) == "touch";
    const pageX = isTouch ? e.targetTouches.item(0).pageX : e.pageX;
    const position = pageX - boundingRect.left - document.body.scrollLeft;
    const containerWidth = boundingRect.width;
    const progressPercentage = Math.max(0, Math.min(1, position / containerWidth));

    var newPosition = progressPercentage * wholeTime;
    if (isNaN(newPosition)) {
        return;
    }
    audio[0].currentTime = newPosition;
}

function stopSeek(e) {
    $("body").removeClass("noselect");
    if (!seekInProgress) {
        return;
    }
    e.preventDefault();
    seekInProgress = false;
}

function forceSearch() {
    if (secTl.content) {
        trans2search = true;
    }
    reloadText({
        book: df["inexistent"],
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
    i = 0;
    var bookButtons = "";
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

function handleAudio(e) {
    var tg = $(e.target);
    if (tg.hasClass("audio-container")) {
        showAudio(false);
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

function handleKeys(e) {
    var key = e.keyCode;

    switch (key) {
        case 13:
            playAudio("playpause");
            break;
        case 32:
            playAudio("playpause");
            break;
        case 37:
            changeChapter(false);
            break;
        case 39:
            changeChapter();
            break;
        default:
            break;
    }
}

function handleScroll(e) {
    if (audio[0].paused)
        $(".window").removeClass("darkScroll");
    else
        return;
    if (!secTl.content) {
        return;
    }
    var tg = $(e.target);
    if (tg.hasClass("no1") && !blockScroll2) {
        blockScroll1 = true;
        clearTimeout(timer1);
        var scrollTg = $('.no1').scrollTop() * ($('.no2 .text').outerHeight() - $('.no2').height()) / ($('.no1 .text').outerHeight() - $('.no1').height())
        $('.no2').scrollTop(scrollTg);
        timer1 = setTimeout(function () { blockScroll1 = false; }, 100);
    } else if (tg.hasClass("no2") && !blockScroll1) {
        blockScroll2 = true;
        clearTimeout(timer2);
        var no2h = $('.no2').height();
        var scrollTg = $('.no2').scrollTop() * ($('.no1 .text').outerHeight() - $('.no1').height()) / ($('.no2 .text').outerHeight() - no2h)
        $('.no1').scrollTop(scrollTg);
        timer2 = setTimeout(function () { blockScroll2 = false; }, 100);
    }

}

function handleTranslation(e) {
    var tg = $(e.target);
    var tgWindow = tg.attr("tr");
    var newTlNr = parseInt(tg.val());
    if (ftts) { // Sets menu to full Height after first opening
        $('.menu').addClass("fullHeight");
        ftts = false;
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
        avTls[Object.keys(avTls).length + 1] = df["scrTl"];
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
    if (!audio[0].paused) {
        wasPlaying = true;
    }
    reloadText(chapterRq);
}

function updateAudioPlayer(link) {
    $(".curTime").text("0:00");
    $(".endTime").text("-:--");
    $(".currentProgress").css("width", "0%");
    $(".audioButton").show();
    audio.attr("src", link);
    if ($('.audio').hasClass("show") && audio[0].readyState == 0) {
        audio[0].load();
    }
}


/* FIRST RUN */
reloadText();
renderTranslations();


/* Helpers */
function shortenBook(book, separator) {
    var lowBookArray = book.toLowerCase().split(' ');
    var bookArray = book.split(' ');
    var bookName = bookArray[1];
    switch (lowBookArray[0]) {
        case '1.':
        case df["firstOf"]:
            var bookCount = '1';
            break;
        case '2.':
        case df["secondOf"]:
            var bookCount = '2';
            break;
        case '3.':
        case df["thirdOf"]:
            var bookCount = '3';
            break;
        case '4.':
        case df["fourthOf"]:
            var bookCount = '4';
            break;
        case '5.':
            var bookCount = '5';
            break;
        case df["pbBook1"]:
            var bookCount = '';
            separator = '';
            break;
        case df["gospel"]:
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
            // continue
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

function twoNum(number) {
    var num = "00" + parseInt(number);
    return num.substr(num.length - 2);
}