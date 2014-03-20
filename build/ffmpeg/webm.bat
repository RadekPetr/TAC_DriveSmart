"ffmpeg.exe" -i %1 -b:v 500k -maxrate 500k -bufsize 1000k -vcodec libvpx -quality best -acodec libvorbis -ab 128k -y -f webm -g 60 %~p1%~n1.webm
"ffmpeg.exe" -i %1 -b:v 500k -maxrate 500k -bufsize 1000k -vcodec libtheora -quality best -acodec libvorbis -y -ab 128k %~p1%~n1.ogv
