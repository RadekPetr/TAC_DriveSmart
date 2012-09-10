var VideoPlayer = new Class({
    Implements : [Options, Events],
    // ---------------------------
    options : {
        style : {
            width : '640px',
            height : '480px'
        },
        'class' : 'video-js',
        poster : '',
        id : 'element.id',
        next : 'next.action',
        parent : null,
        preload : 'auto',
        autoplay : false,
        controls : false
    },
    initialize : function(myParent, myOptions) {

        this.setOptions(myOptions);
        this.options.parent = myParent;

        this.videoSource = new Array();
        this.myVideoPlayer = null;

    },
    // ---------------------------
    setParams : function(params) {
        this.videoSource = params.source;

        // this.videoElement = this._getVideoTag(this.options.id);
        this.videoElement.setProperty("poster", params.poster.src)
        if (this.myVideoPlayer != null) {
            this.myVideoPlayer.src(this.videoSource);
        }

    },
    // ---------------------------
    preload : function() {
        if (this.myVideoPlayer == null) {
            console.log(" Video player does not exist, creating a new one for " + this.options.id);
            this.myVideoPlayer = _V_(this.options.id, {
                "controls" : this.options.controls,
                "autoplay" : this.options.autoplay,
                "preload" : this.options.preload
            });

            this.myVideoPlayer.ready(( function() {

                    this.myVideoPlayer.src(this.videoSource);
                    this.myVideoPlayer.size('640', '480');
                    //this.myVideoPlayer.play();
                    this.myVideoPlayer.pause();

                    this.myVideoPlayer.addEvent("loadstart", function() {
                        console.log("Video Started to Load");
                        var loaderInfo = new Object();
                        loaderInfo[this.options.id] = {
                            'progress' : this.myVideoPlayer.bufferedPercent(),
                            'weight' : 800
                        }

                        this.options.parent.mediaLoader.reportProgress(loaderInfo);
                        console.log("Video Load progress: " + (this.myVideoPlayer.bufferedPercent() * 100.00));
                    }.bind(this));
                    
                    this.myVideoPlayer.addEvent("loadedmetadata", function() {
                        var loaderInfo = new Object();
                        loaderInfo[this.options.id] = {
                            'progress' : this.myVideoPlayer.bufferedPercent(),
                            'weight' : 800
                        }

                        this.options.parent.mediaLoader.reportProgress(loaderInfo);
                        console.log("Video Load progress: " + (this.myVideoPlayer.bufferedPercent() * 100.00));
                    }.bind(this));
                    this.myVideoPlayer.addEvent("progress", function() {
                        var loaderInfo = new Object();
                        loaderInfo[this.options.id] = {
                            'progress' : this.myVideoPlayer.bufferedPercent(),
                            'weight' : 800
                        }

                        this.options.parent.mediaLoader.reportProgress(loaderInfo);
                        console.log("Video Load progress: " + (this.myVideoPlayer.bufferedPercent() * 100.00));
                    }.bind(this));

                    this.myVideoPlayer.addEvent("loadedalldata", function() {
                        var loaderInfo = {};
                        loaderInfo[this.options.id] = {
                            'progress' : 1,
                            'weight' : 800
                        };

                        this.options.parent.mediaLoader.reportProgress(loaderInfo);
                        console.log("Video Loaded all: " + (this.myVideoPlayer.bufferedPercent() * 100.00));
                    }.bind(this));

                    // this.myVideoPlayer.removeEvents();
                    console.log("Adding ended listener");
                    this.myVideoPlayer.addEvent("ended", function() {
                        this.options.parent.fireEvent("TIMELINE", {
                            type : "video.finished",
                            id : this.options.id,
                            next : this.options.next
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
    add : function(parentTagID) {
        var videoDiv = document.getElementById('videoHolder');

        if (videoDiv == null) {
            videoDiv = new Element("div", {
                id : "videoHolder"
            })
            // TODO: move outside this class ?
            videoDiv.inject($(parentTagID));
            this.videoElement = this._getVideoTag(this.options.id);
            this.videoElement.inject(videoDiv);
        }

        this.hide();
    },
    id : function() {
        return this.options.id;
    },
    // ---------------------------
    show : function() {

        this.videoElement.fade('in');
    },
    // ---------------------------
    hide : function() {

        this.videoElement.fade('out', 0);
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
        var player = _V_(this.options.id);

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

