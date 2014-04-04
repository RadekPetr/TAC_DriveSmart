"ffmpeg.exe" -i %1 -b:v 1300k -maxrate 1500k -bufsize 3000k -c:v libvpx -crf 5 -qmin 0 -qmax 50 -vf scale=640:-1 -acodec libvorbis -ab 48k -y -f webm -g 50 %~p1%~n1.webm
"ffmpeg.exe" -i %1 -b:v 1300k -maxrate 1500k -bufsize 3000k -vcodec libtheora -quality best -vf scale=640:-1 -acodec libvorbis -y -ab 48k %~p1%~n1.ogv
#"ffmpeg.exe" -i %1 -y -c:v libx264 -preset veryslow -tune film -vf scale=640:-1 -b:v 1000k -pass 1 -maxrate 1500k -bufsize 3000k -strict experimental -c:a aac -b:a 48k %~p1%~n1.mp4 
#"ffmpeg.exe" -i %1 -y -c:v libx264 -preset veryslow -tune film -vf scale=640:-1 -b:v 1000k -pass 2 -maxrate 1500k -bufsize 3000k -strict experimental -c:a aac -b:a 48k %~p1%~n1.mp4 
