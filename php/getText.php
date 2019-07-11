<?php
$script = true;
require_once("./getConfig.php");
/**
 * File is of 4 parts
 *  - EXECTION FUNCTIONS, mostly visible in main execution
 *  - ADVANCED HELPER, do complicated things
 *  - HELPER FUNCTIONS, convert and compare and similar
 *  - EXECUTION ITSELF
 */

// EXECUTION FUNCTIONS

function startUp()
{
    // Get config dir and set global var
    $user = posix_getpwuid(posix_getuid());
    $homedir = $user['dir'];
    $GLOBALS['configdir'] = $homedir . '/config/';

    $GLOBALS['defaultbook'] = 'мат';
}

require "./universalFunctions.php";

function giveRequest()
{
    global $true;
    $re = new stdClass();

    $input = json_decode($_POST['data'], $true);

    // Security check and default value setting
    $re->translation = checkIt($input->translation, "trString");
    $re->book = checkIt($input->book, "tgString");
    $con = createDBCon($re->translation);
    $re->bookNr = giveBookNr($re->book, $con); // 0 means "start search"
    $re->search = checkIt($input->search, "richString");
    $re->chapter = checkIt($input->chapter, "number");
    $re->firstVerse = checkIt($input->firstVerse, "number");
    $re->lastVerse = checkIt($input->lastVerse, "number", true);

    $GLOBALS['kitobSqli'] = $con;
    return $re;
}

function giveAnswer($input)
{
    if ($input->bookNr == 0) {
        $mysql_answer = getSearchResults($input);
    } else {
        $mysql_answer = getVerses($input);
    }

    $array = createArrayFromSQL($mysql_answer);
    return $array;
}

// ADVANCED HELPER FUNCTIONS
function checkIt($value, $type, $max = false)
{
    switch ($type) {
        case "richString":
            $allowed = 'ёйқукенгшҳзхъӯғэждлорпавҷфячсмитӣбюЁҒӮЪХЗҲШГНЕКУҚЙФҶВАПРОЛДЖЭЮБӢТИМСЧЯ:,.-1234567890kmn ';
            if (str_contains_only($value, $allowed)) {
                $return = $value;
            } else {
                $return = "FAIL";
            }
            break;
        case "trString":
            $allowed = 'ёйқукенгшҳзхъӯғэждлорпавҷфячсмитӣбюЁҒӮЪХЗҲШГНЕКУҚЙФҶВАПРОЛДЖЭЮБӢТИМСЧЯ:,.-1234567890kmn ';
            if (str_contains_only($value, $allowed)) {
                $return = $value;
            } else {
                $return = "kmn";
            }
            break;
        case "tgString":
            $allowed = 'ёйқукенгшҳзхъӯғэждлорпавҷфячсмитӣбюЁҒӮЪХЗҲШГНЕКУҚЙФҶВАПРОЛДЖЭЮБӢТИМСЧЯ1234567890 ';
            if (str_contains_only($value, $allowed)) {
                $return = $value;
            } else {
                $return = $GLOBALS['defaultbook'];
            }
            break;
        case "number":
            if (is_numeric($value)) {
                $return = $value;
            } else {
                $return = 1;
                if ($max) {
                    $return = 180;
                }
            }
            break;
    }
    return $return;
}

function giveBookNr($input, $con, $dontRecurse = 0)
{
    if(is_numeric($input)){
        return $input;
    }
    $sql = "SELECT book_number FROM `books` 
                WHERE long_name LIKE '%$input%'
                LIMIT 1";
    $result = $con->query($sql);
    if ($result->num_rows == 0 && $dontRecurse < 8) { // Correct up to 8 typos
        $typos = mb_str_to_array("ғгёеӣийиқкӯуҳхҷч"); // typo correction array
        $modBook = $input;
        $helper = $modBook;
        for ($i = 0; $i < 16; $i += 2) {
            $modBook = $helper;
            
            if (sizeof(explode(" ", $modBook)) > 1) {  // if a space is in request, split up, to ensure
                $countBook = explode(" ", $modBook)[0] . " "; // that "first" or "second" won't be corrected
                $plainBook = explode(" ", $modBook)[1];
            } else {
                $countBook = "";
                $plainBook = $modBook;
            }

            // Don't correct non-exisiting letters :)
            if (strpos($plainBook, $typos[$i + 1]) === false) {
                continue;
            }

            $plainEditBook = str_replace($typos[$i + 1], $typos[$i], $plainBook);
            $modBook = $countBook . $plainEditBook;
            $bookNr = giveBookNr($modBook, $con, $dontRecurse + 1);
            if ($bookNr != 0) { // If successfully found book don't search longer
                break;
            }
        }
    } else if ($result->num_rows > 0) {
        $bookNr = $result->fetch_all()[0][0];
    } else {
        return 0; // 0 -> Search the input instead
    }
    return $bookNr;
}

function getVerses($req, $recurseChapter = true)
{
    global $kitobSqli;
    $sql  = "SELECT b.long_name as 'book', v.chapter as 'chapter', v.verse as 'verse', v.text as 'text', s.text as 'header', v.book_number as 'bookNr'
            FROM verses as v
            JOIN books as b on b.book_number = v.book_number
            LEFT JOIN stories as s on s.book_number = v.book_number and s.chapter = v.chapter and s.verse = v.verse
            WHERE v.book_number = " . $req->bookNr . "
            AND v.chapter = " . $req->chapter . "
            AND v.verse >= " . $req->firstVerse . " AND v.verse <= " . $req->lastVerse . "
            ORDER BY v.book_number, v.chapter, v.verse";
    $result = $kitobSqli->query($sql);
    if (!($result->num_rows > 0) && $recurseChapter) { // If chapter doesn't contain verses, choose first one
        $req->chapter = 1;
        $result = getVerses($req, false);
    }
    return $result;
}

function getSearchResults($req) {
    global $kitobSqli;
    $array = explode(" ", $req->search);
    $var1 = $array[0];
    $sql = "SELECT b.long_name as 'book', v.chapter as 'chapter', v.verse as 'verse', v.text as 'text'
            FROM verses as v
            JOIN books as b on b.book_number = v.book_number
            WHERE v.text LIKE \"%". $var1 ."%\"";
    
    // Multiple search words
    if (sizeof($array) > 1) {
        for ($i = 1; $i <= sizeof($array);$i ++){
            $sql .= "AND v.text LIKE \"%". $array[$i] ."%\"";
        }
    }
    $sql .= "ORDER BY v.book_number, v.chapter, v.verse
            LIMIT 15000";
    $result = $kitobSqli->query($sql);
    return $result;
}

// SIMPLE HELPER FUNCTIONS
function str_contains_only($string, $gama)
{
    $chars = mb_str_to_array($string);
    $gama = mb_str_to_array($gama);
    foreach ($chars as $char) {
        if (in_array($char, $gama) == false) return false;
    }
    return true;
}
function mb_str_to_array($string)
{
    mb_internal_encoding("UTF-8");
    $chars = array();
    for ($i = 0; $i < mb_strlen($string); $i++) {
        $chars[] = mb_substr($string, $i, 1);
    }
    return $chars;
}
function createArrayFromSQL($myql_answer)
{
    $result_array = array();
    while ($row = $myql_answer->fetch_assoc()) {
        array_push($result_array, $row);
    }
    return $result_array;
}

// START EXECUTION
startUp();                  // Define global vars
$req = giveRequest();       // Read input (and calculate missing informations)
$answer = giveAnswer($req); // Ask the db for the request information
echo json_encode($answer);  // Return data as json to client
