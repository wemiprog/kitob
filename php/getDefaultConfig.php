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
if(isset($script)) {
    // Default html and php definitions
    //$html = setVar($html, "lang", "newvalue");
    if(!isset($html)) {
        $html = [];
    }
    $html = setVar($html, "lang", "en");
    $html = setVar($html, "title", "KITOB | The Bible");
    $html = setVar($html, "logo", "img/logo.png");
    $html = setVar($html, "trans1", "ASV");
    $html = setVar($html, "nothing", "Empty");
    $html = setVar($html, "choose", "Choose");
    $html = setVar($html, "loading", "Chosen text is loading ...");
    $html = setVar($html, "ftts", "fullHeight"); // Makes menu constantly fullHeight, to disable ""
    $html = setVar($html, "tracking", "<span class='notracking'></span>");

    if(!isset($vars))  {
        $vars = [];
    }
    $vars = setVar($vars, "homedir", $homedir);
    $vars = setVar($vars, "configDirFromHome", "/config/");
    $vars = setVar($vars, "configDir", $configdir);
    $vars = setVar($vars, "dataDir", $datadir);
    $vars = setVar($vars, "defBook", "470");
    $vars = setVar($vars, "defTranslation", "asv");
    $vars = setVar($vars, "allowedChars", "ёйқукенгшҳзхъӯғэждлорпавҷфячсмитӣбюЁҒӮЪХЗҲШГНЕКУҚЙФҶВАПРОЛДЖЭЮБӢТИМСЧЯQWERTZUIOPASDFGHJKLYXCVBNMqwertzuioplkjhgfdsayxcvbnmÄÖÜäöüéàèîÉÀÈÎ:,.-1234567890 ");
    $vars = setVar($vars, "replaceChars", ""); // odd = target letter, even = source letter
    $t1 = ["name" => "asv","file" => "$configdir/db_kitob_asv.php","alias" => "asv"];
    $vars = setVar($vars, "t1", $t1);
} else { ?>
console.log("defaults loaded");
if (typeof df == 'undefined') { df = {};}
function setVar(name, value) {
    if(!(name in df)){
        df[name] = value;
    }
}

/* Default JS Definitions */
setVar("avTls", {
    0: {
        name: "Empty",
        alias: false,
        content: false,
        target: 2
    },
    1: {
        name: "ASV",
        alias: "asv",
        content: true,
        target: 3
    },
});
setVar("allowedChars", 'ёйқукенгшҳзхъӯғэждлорпавҷфячсмитӣбюЁҒӮЪХЗҲШГНЕКУҚЙФҶВАПРОЛДЖЭЮБӢТИМСЧЯQWERTZUIOPASDFGHJKLYXCVBNMqwertzuiopasdfghjklyxcvbnmäöüÄÖÜéàèîÉÀÈÎ:,.\\-1234567890\/ ');
setVar("allowedTrans", /^([ёйқукенгшҳзхъӯғэждлорпавҷфячсмитӣбюЁҒӮЪХЗҲШГНЕКУҚЙФҶВАПРОЛДЖЭЮБӢТИМСЧЯQWERTZUIOPASDFGHJKLYXCVBNMqwertzuiopasdfghjklyxcvbnmäöüÄÖÜéàèîÉÀÈÎ1234567890]{3,4})\//);
setVar("allowedBook", /([A-Za-zÄÖÜäöü]+)((( ?)([A-Za-zÄÖÜäöü]+))?)/);
setVar("appName", "KITOB | The Bible");
setVar("audioProvider","");
setVar("firstOf", "1");
setVar("secondOf", "2");
setVar("thirdOf", "3");
setVar("fourthOf", "4");
setVar("fifthOf", "5");
setVar("gospel", "gospel"); // needed if in bookname, so "matthew" instead of "gospel of ..." is displayed
setVar("pbBook1", "nothing"); // same
setVar("defBook", "470");
setVar("inexistent", "asdfjkl"); // needed to force search
setVar("noSearchResult", "This word(s) is (are) not found.");
setVar("verseNotFound1", "In");
setVar("verseNotFound2", "those verses weren't found");
setVar("forceSearch", "Search");
setVar("verse", "vers(es)");
setVar("times", "times");
setVar("ga", false); // google analytics
setVar("scrTl",{}); // if you want an easteregg language :)
<?php }
?>
