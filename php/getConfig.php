<?php
// Get config dir and set global var
$user = posix_getpwuid(posix_getuid());
$homedir = $user['dir'];
$configdir = "$homedir/config/";
$datadir = "$homedir/data/";

if(isset($root)) {
    $path = "./config/userConfig.php";
    if(file_exists($path)){
        include $path;
    }
    require "./php/getDefaultConfig.php";
} else {
    $path = "../config/userConfig.php";
    if(file_exists($path)){
        include $path;
    }
    require "./getDefaultConfig.php";
}
?>