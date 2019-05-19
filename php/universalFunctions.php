<?php
function createDBCon($translation)
{
    // Translation declarations
    $cfg_kmn = $GLOBALS['configdir'] . 'database_kitob.php';
    $cfg_km92 = $GLOBALS['configdir'] . 'db_kitob_km92.php';
    $cfg_elb = $GLOBALS['configdir'] . 'db_kitob_elb.php';

    $translation = mb_strtolower($translation, 'UTF-8');

    switch ($translation) {
        case "кмн":
            $cfg_current = $cfg_kmn;
            break;
        case "км92":
            $cfg_current = $cfg_km92;
            break;
        case "елб":
            $cfg_current = $cfg_elb;
            break;
        default:
            $cfg_current = $cfg_kmn;
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
?>