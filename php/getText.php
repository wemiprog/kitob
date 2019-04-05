<?php
/**
 * TextSender phpfile
 * 
 * Receives $_POST['data'] with a JSON
 * Sends a JSON with bible text, separated in verse objects
 * 
 * req - request
 * kitobSqli - connection to tgNT-db
 */

/** Config */
require '/home/clients/92e9e5e26ae5a3ee2b8fa144aba996d4/config/database_kitob.php';
$kitobSqli = new mysqli($host, $username, $password, $dbname);

/** Global vars */

/* Check connection */
if ($kitobSqli->connect_errno) {
    printf("Connect failed: %s\n", $kitobSqli->connect_error);
    exit();
}


/* Read POST-Values */
$req = json_decode($_POST['data'],$true);

/* Check input */
// Check book
$allowed = 'ёйқукенгшҳзхъӯғэждлорпавҷфячсмитӣбюЁҒӮЪХЗҲШГНЕКУҚЙФҶВАПРОЛДЖЭЮБӢТИМСЧЯ ';
if(str_contains_only($req->book, $allowed)) {$book = $req->book;} else {$book = 'мат';}
//$book = $req->book;
// Check chapter
if(is_numeric($req->chapter)){$chapter = $req->chapter;} else {$chapter = 1;}
// Check verses
if(is_numeric($req->firstVerse)){$firstVerse = $req->firstVerse;} else {$firstVerse = 1;}
if(is_numeric($req->lastVerse)){$lastVerse = $req->lastVerse;} else {$lastVerse = 180;} // Psalm 119 contains 176 verses


/* Query database */
function query($book, $chapter, $firstVerse, $lastVerse) {
    global $kitobSqli;
    // TODO: replace fixed values with vars
    $sql  = "SELECT b.long_name as 'book', v.chapter as 'chapter', v.verse as 'verse', v.text as 'text', s.text as 'header'
            FROM verses as v
            JOIN books as b on b.book_number = v.book_number
            LEFT JOIN stories as s on s.book_number = v.book_number and s.chapter = v.chapter and s.verse = v.verse
            WHERE v.book_number = 
                (SELECT book_number FROM `books` 
                WHERE long_name LIKE '%$book%'
                LIMIT 1) 
            AND v.chapter = $chapter
            AND v.verse >= $firstVerse AND v.verse <= $lastVerse
            ORDER BY v.book_number, v.chapter, v.verse";
    $result = $kitobSqli->query($sql); // execute query
    return $result;
}
$result = query($book, $chapter, $firstVerse, $lastVerse);


/* SQLResult to Array */
function createArray($result, $dontRecurse = 0, $booki)
{
    //echo "boki: $booki\n";
    global $book, $chapter, $firstVerse, $lastVerse;
    $fa = mb_str_to_array("ғгёеӣийиқкӯуҳхҷч"); // fails array
    $result_array = array();

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            array_push($result_array, $row);
        }
        return $result_array;
    } elseif ( 10 > $dontRecurse) {     // check for MISSPELLING with recursion, max recursiondeep 10
        $bookHelper = $booki;           // Helper to fix var in for loop
        for ($i=0; $i < 16; $i += 2) {  // Iterate over all pairs in $fa
            $booki = $bookHelper;       // fix broken var
            if(sizeof(explode(" ",$booki))>1){  // if a space is in request, split up, to ensure
                $bookCount = explode(" ", $booki)[0] . " "; // that "first" or "second" won't be checked
                $booki = explode(" ", $booki)[1]; // book It self
            } else {
                $bookCount = "";
            }
            $fastBook = $bookCount . $booki; // used for the speedUp method below
            if(strpos($booki, $fa[$i + 1]) === false) { // if there won't be a change ...
                $answer = createArray(query($fastBook, $chapter, $firstVerse, $lastVerse),100, $fastBook);
                continue; // ... , request this and then go on instead of recurse
            }
            $tempBook = str_replace($fa[$i + 1], $fa[$i], $booki); // exchange the current pair
            $tempBook = $bookCount . $tempBook;                    // add book count again
            $answer = createArray(query($tempBook, $chapter, $firstVerse, $lastVerse), $dontRecurse + 1, $tempBook);
            if ($answer != "problem") { // if there is a real response -> break  out of for and give value back
                break;
            }
        }
        return $answer;
    }
    return "problem"; // If there isn't an answer or a recurse -> Make problems
}
$result_array = createArray($result, 0, $book);

if ($result_array == "problem") { // if no book is found -> request matthew 1
    $result_array = createArray(query("мат", 1,1,180), true, $book);
}

/* Return data to client via json */
echo json_encode($result_array);

/**
 * HELPER FUNCTIONS
 */

/* Check if only given chars in string */
function str_contains_only($string,$gama){
    $chars = mb_str_to_array($string);
    $gama = mb_str_to_array($gama);
    foreach($chars as $char) {
        if(in_array($char, $gama)==false)return false;
    }
    return true;
}
function mb_str_to_array($string){
   mb_internal_encoding("UTF-8"); // Important
   $chars = array();
   for ($i = 0; $i < mb_strlen($string); $i++ ) {
	$chars[] = mb_substr($string, $i, 1);
   }
   return $chars;
}
?>