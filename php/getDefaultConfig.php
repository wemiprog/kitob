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
    //$html = setVar($html, "lang", "newvalue");
} else { ?>

<?php }
?>