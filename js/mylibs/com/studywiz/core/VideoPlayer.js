function VideoPlayer() {
   alert ("Alive");
}

VideoPlayer.prototype.setSource = function(src) {
    this.filename = src;
    this.myVideoPlayer.src([{
        type : "video/mp4",
        src : "http://www.jplayer.org/video/m4v/Big_Buck_Bunny_Trailer.m4v"
    }, {
        type : "video/webm",
        src : "http://video-js.zencoder.com/oceans-clip.webm"
    }, {
        type : "video/ogg",
        src : "http://video-js.zencoder.com/oceans-clip.ogv"
    }]);
}

VideoPlayer.prototype.play = function() {
    this.myVideoPlayer.play();
}

VideoPlayer.prototype.addVideoPlayer = function (divName) {
    videoElement = document.createElement("video");
    videoElement.setAttribute("id", divName);

    videoElement.setAttribute("preload", "auto");
    videoElement.setAttribute("width", "800");
    videoElement.setAttribute("height", "600");
    videoElement.setAttribute("poster", "http://video-js.zencoder.com/oceans-clip.png");

    videoDiv = document.createElement('div');
    document.body.appendChild(videoDiv);
    videoDiv.appendChild(videoElement);
    
    this.myDiv = divName;
    this.myVideoPlayer = _V_(this.myDiv);
}