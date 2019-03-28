<?php
/* Config */
header('Content-Type: text/html; charset=utf-8');
require '/home/clients/92e9e5e26ae5a3ee2b8fa144aba996d4/config/database_kitob.php';
$kitobSqli = new mysqli($host, $username, $password, $dbname);

/* Check connection */
if ($kitobSqli->connect_errno) {
    printf("Connect failed: %s\n", $kitobSqli->connect_error);
    exit();
}
printf("immerhin zeigts emojis 😂");
?>