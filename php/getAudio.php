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
    $re->file = checkIfBool($input->file);

    return $re;
}

function checkTranslation($input) {
    switch($input){
        case "км92":
            $re = "km92";
            break;
        default:
            $re = false;
            break;
    }
    return $re;
}

function checkIfBool ($input) {
    if (is_bool($input)) {
        $re = $input;
    } else {
        $re = $false;
    }
    return $re;
}

// EXECUTION
startUp();
$req = giveRequest();
echo json_encode($req);
