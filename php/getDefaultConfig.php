<?php
function setVar($array, $var, $value)
{
    if (array_key_exists($var, $array)) {
        //echo ("already set");
    } else {
        $array[$var] = $value;
    }
    return $array;
}
if($script) {
    // Default html and php definitions
    //$html = setVar($html, "lang", "newvalue");
    $text = setVar($text, "sample", "nothing");
    $text = setVar($text, "sampl3", "thing");
} else { ?>
console.log("defaults loaded");
function setVar(name, value) {
    if(!(name in df)){
        df[name] = value;
    }
}

// Default JS Definitions
setVar("test2", "haha");
setVar("test3", "ni lustig");
<?php }
?>