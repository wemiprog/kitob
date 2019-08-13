# Kitob
Kitob - a simple but powerful onlinebibel

## Current state
In development 🛠
 - A beta version is online✨

## Set up on server
 - Create a webpage at your hosting provider pointing to path/kitob
 - Go to path and execute
   git clone https://github.com/wemiprog/kitob
 - Copy a file under template with userConfig in the name to config/userConfig.php
   - Make changes, variables available can be found in getDefaultConfig.php (don't edit)
 - Create a mySQL-DB and upload bibledata (will be explained later)
 - Copy template/db_kitob_sample.php to ~/config/ and fill in the values
 - Hope it works 😜
 - Better information will come one day (maybe)

## Technologies
Backend is coded in PHP, accessing MySQL-Databases

Frontend is coded in HTML, functional in JS with jQuery, styled with SCSS.
