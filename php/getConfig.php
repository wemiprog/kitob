<?php
// Get config dir and set global var
$user = posix_getpwuid(posix_getuid());
$homedir = $user['dir'];
$configdir = "$homedir/config/";
$datadir = "$homedir/data/";

if($script) { # When calling from server add $script = true
    $html = [
        "lang" => "tg",
        "title" => "Китоби Муқаддас",
        "trans1" => "КМН",
        "nothing" => "Ҳеҷ",
        "choose" => "Интихоб",
        "loading" => "Мо Китоби интихобшударо меорем ...",
    ];
    $text = [ # php
        "sample" => "interestingText",
        "secSample" => "notreally"
    ];
    $vars = [ #php
        "homedir" => $homedir,
        "configDirFromHome" => "/config/",
        "configDir" => $configdir,
        "dataDir" => $datadir,
        "defBook" => "470",
        "defTranslation" => "кмн",
        "allowedChars" => 'ёйқукенгшҳзхъӯғэждлорпавҷфячсмитӣбюЁҒӮЪХЗҲШГНЕКУҚЙФҶВАПРОЛДЖЭЮБӢТИМСЧЯ:,.-1234567890kmn ',
        "replaceChars" => "ғгёеӣийиқкӯуҳхҷч",
        "t1" => [
            "name" => "кмн",
            "file" => "$configdir/database_kitob.php",
            "alias" => "kmn"
        ],
        "t2" => [
            "name" => "км92",
            "file" => "$configdir/db_kitob_km92.php",
            "alias" => "km92"
        ],
        "t3" => [
            "name" => "елб",
            "file" => "$configdir/db_kitob_elb.php",
            "alias" => "elb"
        ],
    ];
} else { # so the browser receives the js-config instead of php
?>
console.log("js config loaded");
df = { //defined
    "test": "testText",
    "test2": "untestText"
}
<?
}
if($root) {
    require "./php/getDefaultConfig.php";
} else {
    require "./getDefaultConfig.php";
}
?>