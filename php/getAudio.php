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
    $GLOBALS['file'] = checkIfBool($input->file);

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
    if($filename && $GLOBALS['file']){
        $user = posix_getpwuid(posix_getuid());
        //echo $filename;
        //$target = $user['dir'] . "/kitob/audio/asdf.mp3";
        $target = "../audio/asdf.mp3";
        //echo $target;
        delete_older_than("../audio/", 3600);
        symlink($filename, $target);
        exit();
    } else {
        return "";
    }
}

function delete_older_than($dir, $max_age) {
    $list = array();
    $limit = time() - $max_age;
    $dir = realpath($dir);
    
    if (!is_dir($dir)) {
      return;
    }
    $dh = opendir($dir);
    if ($dh === false) {
      return;
    }
    while (($file = readdir($dh)) !== false) {
      $file = $dir . '/' . $file;
      if (!is_file($file)) {
        continue;
      }
      if (filemtime($file) < $limit) {
        $list[] = $file;
        unlink($file);
      }
    }
    closedir($dh);
    return $list;
  }

// EXECUTION
startUp();
$req = giveRequest();
$filename = checkAudio($req);

$answer = new stdClass();
$answer->translation = $req->translation;
$answer->available = $filename;
$answer->book = $req->book;
$answer->chapter = $req->chapter;
$answer->file = giveFile($filename);
echo json_encode($answer);
