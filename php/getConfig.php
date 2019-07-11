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

    ];
} else { # so the browser receives the js-config instead of php
?>
console.log("js config loaded");
<?
}
if($root) {
    require "./php/getDefaultConfig.php";
} else {
    require "./getDefaultConfig.php";
}
?>