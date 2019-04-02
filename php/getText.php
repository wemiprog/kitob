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


/* Query database */
$result_array = array();
// TODO: replace fixed values with vars
$sql  = "SELECT b.long_name as 'book', chapter as 'chapter', verse as 'verse', text as 'text'
         FROM verses as v
         JOIN books as b on b.book_number = v.book_number
         WHERE v.book_number = 
            (SELECT book_number FROM `books` 
             WHERE long_name LIKE '%$req->book%'
             LIMIT 1) 
         AND chapter = $req->chapter
         AND verse >= 1 AND verse <=20;";
$result = $kitobSqli->query($sql); // execute query


/* SQLResult to Array */
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        array_push($result_array, $row);
    }
}


/* Return data to client via json */
echo json_encode($result_array);
?>