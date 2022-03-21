import os
import re

bookNrs = {"09": 690, "08": 680, "07": 670, "06": 660, "05": 510, "04": 500, "03": 490, "27": 730, "26": 650, "22": 610, "25": 640, "24": 630, "23": 620, "21": 600, "20": 590, "02": 480, "19": 580, "17": 560, "18": 570, "16": 550, "15": 540, "14": 530, "13": 520, "12": 720, "11": 710, "10": 700, "01": 470}
bookRegex = "(?<=B)\d{2}(?=___)"
chapterRegex = r"(?<=___)\d{2}(?=_)"

##for zahl in bookNrs.values():
##    os.mkdir(str(zahl))

for file in os.listdir():
    if (file.endswith(".mp3")):
        print("the file: " + file + "")
        book = str(bookNrs[(re.search(bookRegex, file)).group()])
        chapter = (re.search(chapterRegex, file)).group()
        newPath = book + "\\" + chapter + ".mp3"
        print(newPath)
        os.rename(file, newPath)
