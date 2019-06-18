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

function giveFile($filename) {
    if($filename){
        $user = posix_getpwuid(posix_getuid());

        $target = "../audio/" . random_str(20) . ".mp3";
        
        // Recycling
        $files = glob("../audio/*");
        $now = time();
        foreach ($files as $file) {
            if(is_file($file) && !($file == ".gitkeep")) {
                if($now - lstat($file)['mtime'] >= 60*10) {
                    unlink($file);
                }
            }
        }

        symlink($filename, $target);
        // echo $target;
        // exit();
        return substr($target,2);
    } else {
        return FALSE;
    }
}

function random_str($length, $keyspace = '0123456789abcdefghijklmnopqrstuvwxyz')
{
    $pieces = [];
    $max = mb_strlen($keyspace, '8bit') - 1;
    for ($i = 0; $i < $length; ++$i) {
        $pieces []= $keyspace[random_int(0, $max)];
    }
    return implode('', $pieces);
}

// EXECUTION
startUp();
$req = giveRequest();
$filename = checkAudio($req);

/*$answer = new stdClass();
$answer->translation = $req->translation;
$answer->available = $filename;
$answer->book = $req->book;
$answer->chapter = $req->chapter;*/
$answer = giveFile($filename);
echo $answer;
