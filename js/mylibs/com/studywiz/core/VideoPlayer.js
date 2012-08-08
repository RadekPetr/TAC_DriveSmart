var VideoPlayer = new Class({

    initialize : function() {
        // alert("Alive");
    },
    // ---------------------------
    setSource : function(src) {
        this.filename = src;
        this.myVideoPlayer.src([{
            type : "video/mp4",
            src : "media/video/country/country_cla01_next.m4v"
        }, {
            type : "video/webm",
            src : "media/video/country/country_cla01_next.webm"
        }, {
            type : "video/ogg",
            src : "media/video/country/country_cla01_next.ogg"
        }]);
    },
    // ---------------------------
    play : function() {
        this.myVideoPlayer.ready((function(videoPlayer) {
            this.myVideoPlayer.play();
        }).bind(this))
    },
    // ---------------------------
    addVideoPlayer : function(divName) {
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
})

