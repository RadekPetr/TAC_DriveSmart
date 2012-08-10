var VideoPlayer = new Class({

    initialize : function(myID) {
        this.id = myID
        this.videoSource = new Array();
        this.myVideoPlayer = {};
        this.videoElement = new Element("video", {
            id : this.id,
            preload : "auto",
            width : "800",
            height : "600",
            poster : ""
        });

        console.log("-------------- Created Video Player: " + myID);
    },
    // ---------------------------
    setParams : function(params) {
        this.videoSource = params.source;
        this.videoElement.setProperty("poster", params.poster.src)
    },
    // ---------------------------
    play : function() {
        this.myVideoPlayer = _V_(this.id);
        this.myVideoPlayer.src(this.videoSource);
        this.myVideoPlayer.ready((function(videoPlayer) {
            this.myVideoPlayer.play();
        }).bind(this))
    },
    // ---------------------------
    addVideoPlayer : function() {
        var videoDiv = new Element("div", {
            id : "videoHolder"
        });
        videoDiv.inject(document.body);
        this.videoElement.inject(videoDiv)
    },
    
    show : function (){
        this.videoElement.show();
    }, 
    
    hide : function () {
        this.videoElement.hide();
    }
})

