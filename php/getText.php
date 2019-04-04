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


/* Check connection */
if ($kitobSqli->connect_errno) {
    printf("Connect failed: %s\n", $kitobSqli->connect_error);
    exit();
}


/* Read POST-Values */
$req = json_decode($_POST['data'],$true);

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

/* Check input */
// Check book
$allowed = 'ёйқукенгшҳзхъӯғэждлорпавҷфячсмитӣбюЁҒӮЪХЗҲШГНЕКУҚЙФҶВАПРОЛДЖЭЮБӢТИМСЧЯ';
if(str_contains_only($req->book, $allowed)) {$book = $req->book;} else {$book = 'мат';}
//$book = $req->book;
// Check chapter
if(is_numeric($req->chapter)){$chapter = $req->chapter;} else {$chapter = 1;}
// Check verses
if(is_numeric($req->firstVerse)){$firstVerse = $req->firstVerse;} else {$firstVerse = 1;}
if(is_numeric($req->lastVerse)){$lastVerse = $req->lastVerse;} else {$lastVerse = 180;} // Psalm 119 contains 176 verses

/* Query database */
$result_array = array();
// TODO: replace fixed values with vars
$sql  = "SELECT b.long_name as 'book', chapter as 'chapter', verse as 'verse', text as 'text'
         FROM verses as v
         JOIN books as b on b.book_number = v.book_number
         WHERE v.book_number = 
            (SELECT book_number FROM `books` 
             WHERE long_name LIKE '%$book%'
             LIMIT 1) 
         AND chapter = $chapter
         AND verse >= $firstVerse AND verse <= $lastVerse;";
$result = $kitobSqli->query($sql); // execute query


/* SQLResult to Array */
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        array_push($result_array, $row);
    }
}


/* Return data to client via json */
echo json_encode($result_array);


/** Helper functions
 *
 */

?>