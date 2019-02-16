var book, chapter, firstVerseNumber = false, lastVerseNumber, versesContent = "";

function getVotes() {
    $.ajax({
        method: "POST",
        url: "/php/getText.php",
        //data: {'name': content,},
    }).done(function (data) {
        console.log(data);
        var result = $.parseJSON(data);
        console.log(result);
        $.each(result, function (key, value) {
            /*console.log("qid: " + value['qid'] + " votes: " + value['votes']);*/
            $('[q-id=' + value['qid'] + ']').find(".vote_ziffer").html(value['votes']);
            book = value['Buch'];
            chapter = value['Kapitel'];
            lastVerseNumber = value['Vers'];
            if (!firstVerseNumber) {
                firstVerseNumber = value['Vers'];
            }
            versesContent = versesContent + " <b>" + value['Vers'] + "</b> " + value['Verstext'];

        });
        $('h1').html(book);
        $('h2').html(chapter + "," + firstVerseNumber + "-" + lastVerseNumber);
        $('#text').html(versesContent);

    });
}
getVotes();