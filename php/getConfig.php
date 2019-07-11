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
    "avTls": {
        0: {
            name: "Ҳеҷ",
            alias: false,
            content: false,
            target: 2
        },
        1: {
            name: "КМН",
            alias: "кмн",
            content: true,
            target: 3
        },
        2: {
            name: "КМ92",
            alias: "км92",
            content: true,
            target: 3
        }
    },
    "allowedChars": '\u0400-\u0527:,.\\-1234567890\/ ',
    "allowedTrans": /^([\u0400-\u05271234567890]{3,4})\//,
    "allowedBook": /([\u0400-\u0527]+)((( ?)([\u0400-\u0527]+))?)/,
    "appName": 'Китоби Муқаддас',
    "audioProvider": 'Имон Бо Шунидан аст',
    "firstOf": 'якуми',
    "secondOf": 'дуюми',
    "thirdOf": 'сеюми',
    "fourthOf": 'чоруми',
    "gospel": 'инчили',
    "pbBook1": 'такрори',
    "defBook": "матто",
    "inexistent": "фҷва",
    "noSearchResult": "Ин калима вуҷуд надорад!",
    "verseNotFound1": "Ин оятҳо дар",
    "verseNotFound2": "ёфта нашуданд!",
    "forceSearch": "Ҷустуҷӯи",
    "verse": "оят",
    "times": "маротиба",
    "scrTl": {
        name: "ЕЛБ",
        alias: "елб",
        content: true,
        target: 3
    },
    
}
<?
}
if($root) {
    require "./php/getDefaultConfig.php";
} else {
    require "./getDefaultConfig.php";
}
?>