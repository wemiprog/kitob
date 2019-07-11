<?php
$script = true;
require_once("./getConfig.php");

// EXECUTION FUNCTIONS
function startUp()
{
    global $vars;
    // Get config dir and set global var
    $GLOBALS['configdir'] = $vars["configDir"];
    $GLOBALS['defaulttranslation'] = $vars["defTranslation"];
}

require "./universalFunctions.php";

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
                b.book_color AS color,
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
