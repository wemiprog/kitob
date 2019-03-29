<?php
/* Config */
//header('Content-Type: text/html; charset=utf-8');
require '/home/clients/92e9e5e26ae5a3ee2b8fa144aba996d4/config/database_kitob.php';
$kitobSqli = new mysqli($host, $username, $password, $dbname);

/* Check connection */
if ($kitobSqli->connect_errno) {
    printf("Connect failed: %s\n", $kitobSqli->connect_error);
    exit();
}

/* Read POST-Values */
// TODO: Read them
$rq = json_decode($_POST['data'],$true);    // rq --> request
printf($rq->book);

/* Query database */
$result_array = array();                    // Prepare array
// TODO: replace fixed values with vars
$sql  = "SELECT b.long_name as 'Buch', chapter as 'Kapitel', verse as 'Vers', text as 'Verstext'
         FROM verses as v
         JOIN books as b on b.book_number = v.book_number
         WHERE v.book_number = 500 AND chapter = 3 
         AND verse >= 1 AND verse <=20;";
$result = $kitobSqli->query($sql);          // execute query itself

/* Render data to array */
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        array_push($result_array, $row);
    }
}

/* Return data to client via json */
/* working but not in use now
echo json_encode($result_array);*/

/* DEV-Try read post */
// printf($_POST['data']);                  // read the post conten
//$dataArray = json_decode($_POST['data'],$true);
//printf($dataArray->book);

/* DEV-Info */
printf("jo zwar no ke text aber immerhin zeigts emojis 😂");
?>