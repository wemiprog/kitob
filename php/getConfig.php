<?php
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
        "configDirFromHome" => "/config/",
        "defBook" => "470",
        "defTranslation" => "кмн",
        "allowedChars" => 'ёйқукенгшҳзхъӯғэждлорпавҷфячсмитӣбюЁҒӮЪХЗҲШГНЕКУҚЙФҶВАПРОЛДЖЭЮБӢТИМСЧЯ:,.-1234567890kmn ',
        "replaceChars" => "ғгёеӣийиқкӯуҳхҷч",
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