<?php
$script = true;
require_once("./getConfig.php");

// EXECUTION FUNCTIONS
function startUp()
{
    global $vars;
    // Get config dir and set global var
    $GLOBALS['datadir'] = $vars["dataDir"];
    $GLOBALS['defaulttranslation'] = $vars["defTranslation"];
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
    global $vars;
    switch ($input) {
        case $vars["t1"]["name"]:
            $re = $vars["t1"]["alias"];
            break;
        case $vars["t2"]["name"]:
            $re = $vars["t2"]["alias"];
            break;
        case $vars["t3"]["name"]:
            $re = $vars["t3"]["alias"];
            break;
        case $vars["t4"]["name"]:
            $re = $vars["t4"]["alias"];
            break;
        case $vars["t5"]["name"]:
            $re = $vars["t5"]["alias"];
            break;
        case $vars["t6"]["name"]:
            $re = $vars["t6"]["alias"];
            break;
        case $vars["t7"]["name"]:
            $re = $vars["t7"]["alias"];
            break;
        case $vars["t8"]["name"]:
            $re = $vars["t8"]["alias"];
            break;
        default:
            $re = false;
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
                if($now - lstat($file)['mtime'] >= 60*60 * 24) {
                    unlink($file);
                }
            }
        }

        symlink($filename, $target);
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

$answer = giveFile($filename);
echo $answer;
