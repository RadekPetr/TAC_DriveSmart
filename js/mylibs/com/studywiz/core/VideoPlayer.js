var VideoPlayer = new Class({
    Implements : Events,
    // ---------------------------
    initialize : function(myID, myParent) {
        this.id = myID;
        this.parent = myParent;
        this.nextAction = new String();

        this.videoSource = new Array();
        this.myVideoPlayer = null;
        this.videoElement = new Element("video", {
            'id' : this.id,
            'preload' : 'auto',
            'poster' : '',
            'class' : 'video-js'
        });

        this.add();

    },
    // ---------------------------
    setParams : function(params) {
        this.videoSource = params.source;
        this.videoElement.setProperty("poster", params.poster.src)
        if (this.myVideoPlayer != null) {
            this.myVideoPlayer.src(this.videoSource);
        }

    },
    // ---------------------------
    preload : function() {
        if (this.myVideoPlayer == null) {
            this.myVideoPlayer = _V_(this.id, {
                "controls" : false,
                "autoplay" : false,
                "preload" : "auto"
            });

            this.myVideoPlayer.ready(( function() {

                    this.myVideoPlayer.src(this.videoSource);
                    this.myVideoPlayer.size('640', '480');
                    //this.myVideoPlayer.play();
                    this.myVideoPlayer.pause();

                    this.myVideoPlayer.addEvent("loadstart", function() {
                        console.log("Loading");
                    });
                    this.myVideoPlayer.addEvent("progress", function() {
                        console.log("Progress");
                    });
                    // this.myVideoPlayer.removeEvents();
                    console.log("Adding ended listener");
                    this.myVideoPlayer.addEvent("ended", function() {
                        this.parent.fireEvent("TIMELINE", {
                            type : "video.finished",
                            id : this.id,
                            next : this.nextAction
                        });
                    }.bind(this));

                }.bind(this)));
        }

    },
    // ---------------------------
    start : function() {
        if (this.myVideoPlayer != null) {
            console.log(this.myVideoPlayer.bufferedPercent());
            this.myVideoPlayer.play();
            // Fire event to whotever object is my parent

        }

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

