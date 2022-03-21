<?php
$script = true;
require_once $_SERVER['DOCUMENT_ROOT']."/php/getConfig.php";

function createDBCon($translation)
{
    global $vars;

    $translation = mb_strtolower($translation, 'UTF-8');

    switch ($translation) {
        case $vars["t1"]["name"]:
            $cfg_current = $vars["t1"]["file"];
            break;
        case $vars["t2"]["name"]:
            $cfg_current = $vars["t2"]["file"];
            break;
        case $vars["t3"]["name"]:
            $cfg_current = $vars["t3"]["file"];
            break;
        case $vars["t4"]["name"]:
            $cfg_current = $vars["t4"]["file"];
            break;
        case $vars["t5"]["name"]:
            $cfg_current = $vars["t5"]["file"];
            break;
        case $vars["t6"]["name"]:
            $cfg_current = $vars["t6"]["file"];
            break;
        case $vars["t7"]["name"]:
            $cfg_current = $vars["t7"]["file"];
            break;
        case $vars["t8"]["name"]:
            $cfg_current = $vars["t8"]["file"];
            break;
        default:
            $cfg_current = $vars["t1"]["file"];
    }
    if(!$cfg_current && $cfg_current = "") {
        $cfg_current = $vars["t1"]["file"];
    }

    require $cfg_current;
    $return = new mysqli($host, $username, $password, $dbname);

    // Test connection
    if ($return->connect_errno) {
        exit();
    }

    // Return the connection
    return $return;
}
