var VideoPlayer = new Class({
    Implements : [Options, Events],
    // ---------------------------
    options : {
        style : {
            width : '640px',
            height : '480px',
            position : 'absolute',
            left : '0px',
            top : '0px',
            opacity : '0',
            visibility : 'hidden'
        },
        'class' : 'video-js',
        poster : '',
        id : 'element.id',
        next : 'next.action',
        parent : null,
        preload : 'auto',
        autoplay : false,
        controls : false,
        parentTag : 'drivesmart'
    },
    // ----------------------------------------------------------
    initialize : function(myParent, myOptions) {

        this.setOptions(myOptions);
        this.options.parent = myParent;

        this.videoSource = new Array();
        this.containerID = 'container_' + this.options.id;
        this.playerID = 'player_' + this.options.id;

        this.videoContainer = null;

        this.videoContainer = new Element("div", {
            id : this.containerID
        })

        this.videoContainer.setStyles(this.options.style)
     
        this.videoContainer.inject($(this.options.parentTag));

        this.videoContainer.player = new Element("video", {
            'id' : this.playerID,
            'preload' : 'auto',
            'poster' : '',
            'class' : 'video-js',

        });
        this.videoContainer.player.inject(this.videoContainer);
        this.myVideoPlayer = _V_('player_' + this.options.id, {
            "controls" : this.options.controls,
            "autoplay" : this.options.autoplay,
            "preload" : this.options.preload
        });

    },
    // ---------------------------
    setParams : function(params) {
        this.videoSource = params.source;
        this.videoContainer.player.setProperty("poster", params.poster.src)
    },
    // ---------------------------
    preload : function() {

        this.myVideoPlayer.src(this.videoSource);
        console.log("++ Video Preload started: " + this.options.id);
        this.myVideoPlayer.ready(( function() {
                this.myVideoPlayer.src(this.videoSource);
                this.myVideoPlayer.size('640', '480');
                //this.myVideoPlayer.play();
                this.myVideoPlayer.pause();

                this.myVideoPlayer.addEvent("loadstart", function() {
                    console.log("Video Started to Load");

                    this.options.parent.mediaLoader.reportProgress(this.getLoaderInfo());
                    console.log("Video Load progress: " + (this.myVideoPlayer.bufferedPercent() * 100.00));
                }.bind(this));

                this.myVideoPlayer.addEvent("loadedmetadata", function() {
                    this._reportProgress()
                }.bind(this));

                this.myVideoPlayer.addEvent("progress", function() {
                    this._reportProgress()
                }.bind(this));

                this.myVideoPlayer.addEvent("loadedalldata", function() {
                    this._reportProgress()
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
    show : function() {
        this.videoContainer.fade('in');
    },
    // ---------------------------
    hide : function() {
        this.videoContainer.fade('out', 0);
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

        this.videoContainer.dispose();
        this.videoContainer.player.dispose();
        delete this.videoContainer.player;
        delete this.videoContainer
        delete this.myVideoPlayer;
    },
    // ----------------------------------------------------------
    getLoaderInfo : function() {
        var loaderInfo = new Object();
        var progress = 0;
        if (this.myVideoPlayer != null) {
            progress = this.myVideoPlayer.bufferedPercent();
        }
        loaderInfo[this.options.id] = {
            'progress' : progress,
            'weight' : 800,
            ref : this
        };
        return loaderInfo
    },
    // ----------------------------------------------------------
    _reportProgress : function() {
        this.options.parent.mediaLoader.reportProgress(this.getLoaderInfo());
        console.log("Video Load progress: " + (this.myVideoPlayer.bufferedPercent() * 100.00));
    }
})

