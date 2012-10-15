var VideoPlayer = new Class({
    Implements : [Options, Events],
    // ---------------------------
    options : {
        style : {
            width : '640',
            height : '480',
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
        parentTag : 'drivesmart',
        filename : null
    },
    // ----------------------------------------------------------
    initialize : function(myParent, myOptions) {

        this.setOptions(myOptions);
        this.options.parent = myParent;

        this.source = new Array();
        this.containerID = 'container_' + this.options.id;
        this.playerID = 'player_' + this.options.id;

        this.container = null;

        this.container = new Element("div", {
            id : this.containerID,
            'class' : 'videoContainer'
        })

        this.container.setStyles(this.options.style);

        this.container.inject($(this.options.parentTag));

        this.container.player = new Element("video", {
            'id' : this.playerID,
            'preload' : 'auto',
            'poster' : '',
            'class' : 'video-js',

        });
        this.container.player.inject(this.container);
        this.player = _V_('player_' + this.options.id, {
            "controls" : this.options.controls,
            "autoplay" : this.options.autoplay,
            "preload" : this.options.preload
        });

    },
    myParent : function() {
        return this.options.parent;
    },
    // ---------------------------
    preload : function() {
        log("++ Video Preload started: " + this.options.id);

        this.player.ready(( function() {
                log('Player ready');
                var data = this._getVideoData();
                this.container.player.setProperty("poster", data.poster.src);
                this.player.src(data.video);
                //log("BLA" + this.options.style.width);
                this.player.size(this.options.style.width, this.options.style.height);
                this.player.pause();

                this.player.addEvent("loadstart", function() {
                    log("EVENT: loadstart");
                    this._reportProgress();
                }.bind(this));

                this.player.addEvent("loadedmetadata", function() {
                    log("EVENT: loadedmetadata");
                    this._reportProgress();
                }.bind(this));
                this.player.addEvent("loadeddata", function() {
                    log("EVENT: loadeddata");
                    this._reportProgress();
                }.bind(this));
                this.player.addEvent("play", function() {
                    log("EVENT: play");
                    this._reportProgress();
                }.bind(this));

                this.player.addEvent("ended", function() {
                    log("EVENT: ended");
                    this._reportProgress();
                }.bind(this));
                this.player.addEvent("progress", function() {
                    log("EVENT: progress");
                    this._reportProgress();
                }.bind(this));

                this.player.addEvent("loadedalldata", function() {
                    log("EVENT: loadedalldata");
                    this._reportProgress();
                }.bind(this));

                this.player.addEvent("timeupdate", function() {
                    log("EVENT: timeupdate");
                    this._reportProgress();
                }.bind(this));

                this.player.addEvent("suspend", function() {
                    log("EVENT: suspend");
                    this._reportProgress();
                }.bind(this));

                this.player.addEvent("waiting", function() {
                    log("EVENT: **********************   waiting");
                    this._reportProgress();
                }.bind(this));

                this.player.addEvent("canplay", function() {
                    log("EVENT: **********************   canplay");
                    this._reportProgress();
                }.bind(this));
                this.player.addEvent("canplaythrough", function() {
                    log("EVENT: **********************   canplaythrough");
                    this._reportProgress(true);
                }.bind(this));

                // this.player.removeEvents();
                //log("Adding ended listener");
                this.player.addEvent("ended", function() {
                    this.myParent().fireEvent("TIMELINE", {
                        type : "video.finished",
                        id : this.options.id,
                        next : this.options.next
                    });
                }.bind(this));
            }.bind(this)));

    },
    // ---------------------------
    start : function() {
        if (this.player != null) {
            //log(this.player.bufferedPercent());
            this.player.play();
            // Fire event to whotever object is my parent
        }
    },
    // ---------------------------
    show : function(speed) {
        this.container.fade('show');
    },
    // ---------------------------
    hide : function(speed) {
        this.container.fade('hide');
    },
    // ---------------------------
    stop : function() {
        this.player.pause();
        this.player.currentTime(0);
        this.player.pause();
    },
    // ---------------------------
    pause : function() {
        this.player.pause();
    },
    seek : function(time) {
        this.player.pause();
        this.player.currentTime = time;
        this.player.pause();
    },
    volume : function(volume) {
        this.player.volume(volume);
    },
    remove : function() {
        // see http://help.videojs.com/discussions/problems/861-how-to-destroy-a-video-js-object
        // get the videojs player with id of "video_1"
        var player = _V_(this.playerID);

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

        this.container.dispose();
        this.container.player.dispose();
        delete this.container.player;
        delete this.container
        delete this.player;
    },
    // ----------------------------------------------------------
    getLoaderInfo : function() {
        var loaderInfo = new Object();
        var progress = 0;
        if (this.player != null) {
            progress = this.player.bufferedPercent();

            //log(this.playerID + " **** Video Load progress: " + (this.player.bufferedPercent() * 100.00));
            // log(this.playerID + " **** Video Load progress buffered: " + this.player.buffered());
            //log(this.playerID + " **** Video duration: " + this.player.duration());

        }
        loaderInfo[this.options.id] = {
            'progress' : progress,
            'weight' : 2,
            ref : this,
            type : 'VIDEO'
        };
        return loaderInfo
    },
    // ----------------------------------------------------------
    _reportProgress : function(isReady) {
        var loaderInfo = this.getLoaderInfo()
        if (isReady == true) {
            loaderInfo[this.options.id].progress = 1;
        }
        this.myParent().mediaLoader.reportProgress(loaderInfo);

    },
    _getVideoData : function() {
        var data = {};
        var myFilename = stripFileExtension(this.options.filename);
        var videoFile = this.options.parent.options.videoFolder + myFilename;
        var posterFile = this.options.parent.options.imageFolder + myFilename;
        // var rand = "?" + Math.random();
        data.video = [{
            type : "video/mp4",
            src : videoFile + ".mp4"
        }, {
            type : "video/webm",
            src : videoFile + ".webm"
        }, {
            type : "video/ogg",
            src : videoFile + ".ogv"
        }];
        data.poster = {
            src : posterFile + "_first.jpg"
        };
        return data;
    }
})

