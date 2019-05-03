<?php

// EXECUTION FUNCTIONS
function startUp()
{
    // Get config dir and set global var
    $user = posix_getpwuid(posix_getuid());
    $homedir = $user['dir'];
    $GLOBALS['configdir'] = $homedir . '/config/';

    $GLOBALS['defaulttranslation'] = 'kmn';
}

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

function giveRequest()
{
    $input = $_POST['translation'];
    if (strlen($input) > 0) {
        $re = $input;
    } else {
        $re = $GLOBALS['defaulttranslation'];
    }
    return $re;
}

function giveChapters($con) {
    $sql = "SELECT 
                b.book_number AS bookNumber,
                b.short_name AS shortBook,
                b.long_name AS longBook, 
		        COUNT( DISTINCT v.chapter) AS chapterCount
	        FROM books as b
	        JOIN verses AS v ON b.book_number = v.book_number
            GROUP BY b.book_number";
    $result = $con->query($sql);
    return $result;
}

function createArrayFromSQL($myql_answer)
{
    $result_array = array();
    while ($row = $myql_answer->fetch_assoc()) {
        array_push($result_array, $row);
    }
    return $result_array;
}


// EXECUTION
startUp();
$con = createDBCon(giveRequest());
$sqlAnswer = giveChapters($con);
$answer = createArrayFromSQL($sqlAnswer);
echo json_encode($answer);
