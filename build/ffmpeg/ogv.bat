"ffmpeg.exe" -i %1 -b:v 500k -maxrate 500k -bufsize 1000k -vcodec libtheora -quality best -acodec libvorbis -ab 128k %~p1%~n1.ogv
