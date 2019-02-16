<?php
header('Content-Type: text/html; charset=utf-8');
?>
    <head>
        <title>Китоби Муқаддас</title>
		<link rel="shortcut icon" type="image/x-icon" href="book.png">
        <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet"> 
        <style>
            html, body {
                font-family: 'Open Sans', sans-serif;
            }
        </style>
    </head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
        <script>
        var book, chapter, firstVerseNumber = false, lastVerseNumber, versesContent ="";

        function getVotes() {
                $.ajax({
                    method: "POST",
                    url: "php/getText.php",
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
                        if(!firstVerseNumber) {
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
            </script>
            <h1></h1>
            <h2></h2>
            <p id="text"></p>