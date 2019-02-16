<?php
/* Config */
header('Content-Type: text/html; charset=utf-8');
require 'database_kitob.php';
$mysqli = new mysqli($host, $username, $password, $dbname);

function utf8ize($d) {
    if (is_array($d)) {
        foreach ($d as $k => $v) {
            $d[$k] = utf8ize($v);
        }
    } else if (is_string ($d)) {
        return utf8_encode($d);
    }
    return $d;
}

/* Check connection */
if ($mysqli->connect_errno) {
    printf("Connect failed: %s\n", $mysqli->connect_error);
    exit();
}

$result_array = array();
$sql = "SELECT b.long_name as 'Buch', chapter as 'Kapitel', verse as 'Vers', text as 'Verstext'
        FROM verses as v 
        JOIN books as b on b.book_number = v.book_number
        WHERE v.book_number = 500 AND chapter = 2 AND verse >= 1 AND verse <= 20;";
$result = $mysqli->query($sql);

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        array_push($result_array, $row);
    }
}
echo json_encode($result_array); //utf8ize()
#print_r($result_array);
?>