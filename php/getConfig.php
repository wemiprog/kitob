<?php
// Get config dir and set global var
$user = posix_getpwuid(posix_getuid());
$homedir = $user['dir'];
$configdir = "$homedir/config/";
$datadir = "$homedir/data/";

if($root) {
    include "./config/userConfig.php";
    require "./php/getDefaultConfig.php";
} else {
    include "../config/userConfig.php";
    require "./getDefaultConfig.php";
}
?>