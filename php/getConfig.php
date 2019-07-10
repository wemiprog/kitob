<?php
if($script){ # When calling from server add $script = true
    $html = [
        "lang" => "tg",
        "title" => "Китоби Муқаддас",
        "trans1" => "КМН",
        "nothing" => "Ҳеҷ",
        "choose" => "Интихоб",
        "loading" => "Мо Китоби интихобшударо меорем ...",
    ];
} else { # so the browser receives the js-config instead of php
    echo($_SERVER["REMOTE_ADDR"]);?>
    echo "test";
<?}
?>