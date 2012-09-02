var VideoPlayer = new Class({
    Implements : Events,
    // ---------------------------
    initialize : function(myID, myParent) {
        this.id = myID;
        this.parent = myParent;
        this.nextAction = new String();

        this.videoSource = new Array();
        this.myVideoPlayer = null;

        this.add();

    },
    // ---------------------------
    setParams : function(params) {
        this.videoSource = params.source;

        // this.videoElement = this._getVideoTag(this.id);
        this.videoElement.setProperty("poster", params.poster.src)
        if (this.myVideoPlayer != null) {
            this.myVideoPlayer.src(this.videoSource);
        }

    },
    // ---------------------------
    preload : function() {
        if (this.myVideoPlayer == null) {
            console.log(" Video player does not exist, creating a new one for " + this.id);
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
                        console.log("Video Started to Load");
                    }.bind(this));
                    this.myVideoPlayer.addEvent("progress", function() {
                        console.log("Video Load progress: " + (this.myVideoPlayer.bufferedPercent() * 100.00));
                    }.bind(this));

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
            // TODO: move outside this class ?
            videoDiv.inject($("drivesmart"));
            this.videoElement = this._getVideoTag(this.id);
            this.videoElement.inject(videoDiv);
        }

        this.hide();
    },
    // ---------------------------
    show : function() {

        this.videoElement.fade('in');
    },
    // ---------------------------
    hide : function() {

        this.videoElement.fade('out',0);
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
    },
    remove : function(time) {
        // see http://help.videojs.com/discussions/problems/861-how-to-destroy-a-video-js-object
        // get the videojs player with id of "video_1"
        var player = _V_(this.id);

        // for html5 - clear out the src which solves a browser memory leak
        //  this workaround was found here: http://stackoverflow.com/questions/5170398/ios-safari-memory-leak-when-loading-unloading-html5-video
        if (player.techName == "html5") {
            player.tag.src = "";
            player.tech.removeTriggers();
            player.load();
        }

        // destroy the parts of the player which are specific to html5 or flash
        player.tech.destroy();

        // destroy the player
        player.destroy();

        document.getElementById('videoHolder').dispose();
        this.videoElement.dispose();
        //this.videoElement = null;
        // this.myVideoPlayer = null;

        delete this.videoElement;
        delete this.myVideoPlayer;

    },
    _getVideoTag : function(myID) {
        var myElement = document.getElementById(myID);
        if (myElement == null) {
            myElement = new Element("video", {
                'id' : myID,
                'preload' : 'auto',
                'poster' : '',
                'class' : 'video-js'
            });
        }
        return myElement;
    }
})

