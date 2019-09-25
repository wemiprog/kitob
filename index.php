<?php
$script = true;
$root = true;
require_once("php/getConfig.php");
?>
<!DOCTYPE html>
<html lang="<?php echo($html["lang"]);?>">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <meta name="theme-color" content="#e5f2e6">

    <title><?php echo($html["title"]); ?></title>

    <link rel="stylesheet" href="//stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.2/css/all.css"
        integrity="sha384-oS3vJWv+0UjzBfQzYUhtDYW+Pj2yciDJxpsK1OYPAYjqT085Qq/1cq5FLXAZQ7Ay" crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" media="screen" href="/css/main.css?19-07-10v1">
    <link rel="shortcut icon" type="image/x-icon" href="/img/book.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/manifest.json">
</head>

<body>
    <nav class="navbar navbar-expand-sm navbar-light sticky-top" style="background-color: #e5f2e6">
        <img src="/img/book.png" width="30px" height="30px">
        <?php if($html["logo"] != ""){ ?><img id="logo" height="35px" src="/<?php echo($html["logo"]); ?>" alt="logo" style="
            padding-left: 10px;
            margin-top: 2px;
        "><?php }?>
        <form class="form-inline my-2 my-lg-0" autocomplete="off">
            <input id="reference" class="form-control rounded-sm mr-sm-2 ml-2 ml-sm-3" type="search"
                placeholder="<?php echo($html["choose"]);?>" autocomplete="off">
            <button class="btn btn-outline-success my-2 my-sm-0" type="submit" hidden>
                <span class="oi oi-arrow-thick-right" aria-hidden="true"></span>
            </button>
        </form>
        <button class="navbar-toggler" type="button" id="menuToggler" aria-controls="navbarCollapsed"
            aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
    </nav>

    <div class="info book-load">
        <img src="/img/loading-ball.gif" alt='<?php echo($html["loading"]);?>'>
    </div>

    <main id="main">
        <div class="collapse-menu menu-container" id="collapseMenu">
            <div class="menu <?php echo($html['ftts']);?>">
                <div class="container">
                    <div class="row trans-select">
                        <div class="input-group mb-3">
                            <select tr="1" class="custom-select" id="trans-select1">
                                <option selected><?php echo($html["trans1"]); ?></option>
                            </select>
                            <select tr="2" class="custom-select" id="trans-select2">
                                <option selected><?php echo($html["nothing"]); ?></option>
                            </select>
                        </div>
                    </div>
                    <div class="row book-list">
                    </div>
                    <div class="row chapter-list"></div>
                </div>
            </div>
        </div>

        <div class="windowContainer">
            <div class="window no1 container">
                <div class="text pt-1 pb-5"></div>
            </div>
            <div class="window no2 container">
                <div class="text pt-1 pb-5"></div>
            </div>
            <div class="audio container">
                <div class="btns mb-2">
                    <i class="fas fa-play play-pause"></i>
                    <button class="speed-change btn">1x</button>
                </div>

                <div class="progressWrapper">
                    <div class="time curTime">0:00</div>
                    <div class="wholeProgress rounded mt-3">
                        <div class="currentProgress rounded"></div>
                    </div>
                    <div class="time endTime">-:--</div>
                </div>

                <audio id="chapterAudio" preload="none" src=""></audio>
            </div>
        </div>
    </main>

    <div class="next change-chapter amb">
        <i class="fas fa-chevron-circle-right"></i> </div>
    <div class="prev change-chapter amb">
        <i class="fas fa-chevron-circle-left"></i>
    </div>
    <div class="audioButton amb">
        <span class="fa-stack amb" style="vertical-align: top">
            <i class="fas fa-circle fa-stack-2x"></i>
            <i class="fas fa-volume-up fa-stack-1x fa-inverse" style="left: -1px;"></i>
        </span>
        <i class="fas fa-chevron-circle-down amb"></i>
    </div>
    <script src="/php/getConfig.php"></script>

    <script src="https://code.jquery.com/jquery-3.4.0.min.js"
        integrity="sha256-BJeo0qm959uMBGb65z40ejJYGSgR7REI4+CW1fNKwOg=" crossorigin="anonymous"></script>
    <script src="/js/main.js?13-09-25v1"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"
        integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous">
        </script>
    <script src="https://hammerjs.github.io/dist/hammer.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"
        integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous">
        </script>
    <?php echo($html["tracking"]); ?>
</body>

</html>