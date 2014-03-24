"ffmpeg.exe" -i %1 -b:v 1500k -maxrate 1500k -bufsize 3000k -vcodec libtheora -quality best -acodec libvorbis -ab 128k %~p1%~n1.ogv
