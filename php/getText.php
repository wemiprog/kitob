<?php
/**
 *  Variables
 *  rq  
 *      rq is the object with request. 
 *      to get value write $rq then -> 
 *      and { book or chapter or verses }
 *      ex. rq->book
 *  kitobSqli
 *      Connection to tgNT-Database
 */


/* Config */
require '/home/clients/92e9e5e26ae5a3ee2b8fa144aba996d4/config/database_kitob.php';
$kitobSqli = new mysqli($host, $username, $password, $dbname);
/*** Config */

/* Check connection */
if ($kitobSqli->connect_errno) {
    printf("Connect failed: %s\n", $kitobSqli->connect_error);
    exit();
}
/*** Check connection */

/* Read POST-Values */
$rq = json_decode($_POST['data'],$true);    // rq --> request
// printf($rq->book);                       // DEV-Info
/*** Read POST-Values  */

/* Query database */
$result_array = array();                    // Prepare array
// TODO: replace fixed values with vars
$sql  = "SELECT b.long_name as 'book', chapter as 'chapter', verse as 'verse', text as 'text'
         FROM verses as v
         JOIN books as b on b.book_number = v.book_number
         WHERE v.book_number = 
            (SELECT book_number FROM `books` 
             WHERE long_name LIKE '%$rq->book%'
             LIMIT 1) 
         AND chapter = $rq->chapter
         AND verse >= 1 AND verse <=20;";
$result = $kitobSqli->query($sql);          // execute query itself
/*** Query database */

/* Render data to array */
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        array_push($result_array, $row);
    }
}
/*** Render data to array */


/* Return data to client via json */
echo json_encode($result_array);

/* DEV-Try read post */
// printf($_POST['data']);                  // read the post conten
//$dataArray = json_decode($_POST['data'],$true);
//printf($dataArray->book);

/* DEV-Info */
//printf("jo zwar no ke text aber immerhin zeigts emojis 😂");
?>