<?php
function createDBCon($translation)
{
    // Translation declarations
    $cfg_kmn = $GLOBALS['configdir'] . 'database_kitob.php';
    //TODO: Add more translation declarations

    switch ($translation) {
        case "kmn":
            $cfg_current = $cfg_kmn;
            break;
        case "кмн":
            $cfg_current = $cfg_kmn;
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