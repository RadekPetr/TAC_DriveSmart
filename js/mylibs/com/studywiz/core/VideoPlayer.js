var VideoPlayer = new Class({
    Implements : Events,
    // ---------------------------
    initialize : function(myID, myParent) {
        this.id = myID;
        this.parent = myParent;
        this.nextAction = new String();
        // TODO: change to .source - Object
        this.videoSource = new Array();
        this.myVideoPlayer = null;
        this.videoElement = new Element("video", {
            'id' : this.id,
            'preload' : 'auto',
            'poster' : '',
            'class' : 'video-js'
        });
        console.log("-------------- Created Video Player: " + myID);

    },
    // ---------------------------
    setParams : function(params) {
        this.videoSource = params.source;
        this.videoElement.setProperty("poster", params.poster.src)

    },
    // ---------------------------
    start : function() {
        if (this.myVideoPlayer == null) {
            this.myVideoPlayer = _V_(this.id);

            // Fire event to whotever object is my parent
            this.myVideoPlayer.addEvent("ended", function() {
                this.parent.fireEvent("TIMELINE", {
                    type : "video.finished",
                    id : this.id,
                    next : this.nextAction
                });
            }.bind(this));
        }
        this.myVideoPlayer.src(this.videoSource);

        this.myVideoPlayer.ready(( function() {
                this.myVideoPlayer.size('640', '480');
                this.myVideoPlayer.play();
            }.bind(this)));

    },
    // ---------------------------
    add : function() {
        var videoDiv = document.getElementById('videoHolder');

        if (videoDiv == null) {
            videoDiv = new Element("div", {
                id : "videoHolder"
            })
            videoDiv.inject(document.body);
            this.videoElement.inject(videoDiv);
        }
        this.start();
        this.stop();
        this.hide();
    },
    // ---------------------------
    show : function() {
        // this.videoElement.show();
        this.videoElement.fade('in');
    },
    // ---------------------------
    hide : function() {
        // this.videoElement.hide();
        this.videoElement.fade('out');
    },
    // ---------------------------
    stop : function() {
        this.myVideoPlayer.pause();
        this.myVideoPlayer.currentTime(0);
        this.myVideoPlayer.pause();
    },
    // ---------------------------
    pause : function() {
        this.myVideoPlayer.pause();
    },
    seek : function(time) {
        this.myVideoPlayer.pause();
        this.myVideoPlayer.currentTime = time;
        this.myVideoPlayer.pause();
    }
})

