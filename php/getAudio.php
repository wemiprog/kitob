<?php

// EXECUTION FUNCTIONS
function startUp()
{
    // Get config dir and set global var
    $user = posix_getpwuid(posix_getuid());
    $homedir = $user['dir'];
    $GLOBALS['datadir'] = $homedir . '/data/';

    $GLOBALS['defaulttranslation'] = 'kmn';
}

function giveRequest()
{
    $re = new stdClass();

    $input = json_decode($_POST['data'], $true);
    if (strlen($input->translation) > 0) {
        $tr = $input->translation;
    } else {
        $tr = $GLOBALS['defaulttranslation'];
    }
    $re->translation = checkTranslation($tr);
    $re->book = checkIfNumber($input->bookNr);
    $re->chapter = checkIfNumber($input->chapter);
    $re->file = checkIfBool($input->file);

    return $re;
}

function checkTranslation($input)
{
    switch ($input) {
        case "км92":
            $re = "km92";
            break;
        default:
            $re = false;
            break;
    }
    return $re;
}

function checkIfBool($input)
{
    if (is_bool($input)) {
        $re = $input;
    } else {
        $re = $false;
    }
    return $re;
}

function checkIfNumber($input)
{
    if (is_numeric($input)) {
        $num = $input;
        $str = (string) $num;
        if ($num < 100) {
            $re = str_pad($str, 2, "0", STR_PAD_LEFT);
        } else {
            $re = $str;
        }
    } else {
        $re = false;
    }

    return $re;
}

function checkAudio($file)
{
    $filename = $GLOBALS['datadir'] . $file->translation . "/" . $file->book . "/" . $file->chapter . ".mp3";
    if (is_file($filename)) {
        return $filename;
    } else {
        return FALSE;
    }
}

// EXECUTION
startUp();
$req = giveRequest();
$available = checkAudio($req);

$answer = new stdClass();
$answer->translation = $req->translation;
$answer->available = $available;
$answer->book = $req->book;
$answer->chapter = $req->chapter; 
echo json_encode($answer);
