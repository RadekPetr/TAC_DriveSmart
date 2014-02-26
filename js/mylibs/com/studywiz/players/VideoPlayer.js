var VideoPlayer = new Class({
    Implements : [Options, Events],
    // ---------------------------
    options : {
        style : {
            position : 'absolute',
            opacity : '0',
            visibility : 'hidden',
            'left' : Main.VIDEO_LEFT + 'px',
            'top' : Main.VIDEO_TOP + 'px',
            'width' : Main.VIDEO_WIDTH + 'px',
            'height' : Main.VIDEO_HEIGHT + 'px'
        },
        width : '100%',
        height : '100%',
        'class' : 'video-js vjs-default-skin vjs-big-play-hidden',
        poster : '',
        id : 'element.id',
        next : 'next.action',
        parent : null,
        preload : 'auto',
        autoplay : false,
        controls : false,
        captionFile : null,
        parentTag : Main.DIV_ID,
        filename : null
    },
    // ----------------------------------------------------------
    initialize : function(myParent, myOptions) {

        this.setOptions(myOptions);
        this.options.parent = myParent;

        this.source = new Array();
        this.containerID = 'container_' + this.options.id;
        this.playerID = 'player_' + this.options.id;
        this.isReady = false;
        this.container = null;
        this.isVisible = false;
        this.isSuspended = false;

        this.container = new Element("div", {
            id : this.containerID,
            'class' : 'videoContainer'
        });

        this.container.setStyles(this.options.style);

        this.container.inject($m(this.options.parentTag));

        this.container.player = new Element("video", {
            'id' : this.playerID,
            'class' : this.options['class']
        });
        this.container.player.inject(this.container);
        videojs.options.flash.swf = Main.PATHS.flashFolder + "video-js.swf";
    },
    myParent : function() {
        return this.options.parent;
    },
    // ---------------------------
    preload : function() {
        // log("++ Video Preload started: " + this.options.id);
        if (this.player == undefined) {
            //    log('Undefined player ERRROR');
            //     log(this);
            //      this.remove();
            //  } else {
            this.show();
            this.isReady = false;
            var data = this._getVideoData();
            this.player = videojs('player_' + this.options.id, {
                "controls" : this.options.controls,
                "autoplay" : this.options.autoplay,
                "preload" : this.options.preload,
                "width" : this.options.width,
                "height" : this.options.height,
                "poster" : data.poster.src,
                "tracks" : [{
                    'kind' : "captions",
                    'label' : "English",
                    'language' : "en",
                    'src' : Main.PATHS.captionsFolder + this.options.captionFile,
                    id : "subs"
                }]
            });

            this.player.ready(( function() {
                    var data = this._getVideoData();
                    if (this.options.captionFile != null && this.options.captionFile != "") {
                        this.showCaptions(this.options.captionFile);
                    }
                    this.player.src(data.video);

                    this.player.load();
                    log("calling play");
                    this.player.play();
                    this.player.pause();
                    this.registerLoadEvents();
                    this.hide();

                }.bind(this)));
        }
    },
    retryPreload : function() {

        this.player.load();
        this.player.play();
        this.player.pause();
        log("trying preload again");
    },
    registerLoadEvents : function() {
        if (this.player != undefined) {
            // clear any lefover events
            //  this.player.off();
            // add them again

            this.player.on("suspend", function() {
                log("EVENT: suspend", this.options.id);
                if (Browser.Platform.ios == true) {
                    log("Consider this loaded");
                    this._finishedLoading();
                }
                this.isSuspended = true;
            }.bind(this));

            this.player.on("waiting", function() {
                log("EVENT: **********************   waiting", this.options.id);
                //this.player.load();
            }.bind(this));
            this.player.on("progress", function() {
                log("EVENT: **********************   progress", this.options.id);
                this.isSuspended = false;
            }.bind(this));

            this.player.on("canplaythrough", function() {
                log("EVENT: **********************   canplaythrough", this.options.id);
                this._finishedLoading();
            }.bind(this));

            this.player.on("loadedalldata", function() {
                this._finishedLoading();
                this.isSuspended = false;
            }.bind(this));
        }
    },
    registerPlaybackEndEvent : function() {
        if (this.player != undefined) {
            this.player.on("ended", function() {
                this.player.off("ended");
                this.myParent().fireEvent("TIMELINE", {
                    type : "video.finished",
                    id : this.options.id,
                    next : this.options.next
                });
            }.bind(this));
        }
    },
    registerPlaybackStartEvent : function() {
        this.player.on("play", function() {
            this.player.off("play");
            this.myParent().fireEvent("TIMELINE", {
                type : "video.started",
                id : this.options.id,
                next : "video.started"
            });
        }.bind(this));
        this.player.on("pause", function() {
            log("EVENT: **********************   pause", this.options.id);
            //this.player.load();
        }.bind(this));
    },
    registerCueEvents : function() {
        if (this.player != undefined) {
            this.player.on("timeupdate", function() {
                this.myParent().fireEvent("TIMELINE", {
                    type : "video.time",
                    id : this.options.id,
                    next : "Video.cue"
                });
            }.bind(this));
        }
    },
    // ---------------------------
    start : function() {

        if (this.player != null) {

            //this.player.pause();
            //this.player.load();
            this.player.play();
            log("Play called", this.player, this.isSuspended);
            /* var timerFunction = function() {
             log ("this.player.player.currentTime",this.player.currentTime());
             if (this.player.currentTime()  < 1.0) {
             log ("ssssss");
             this.player.play();
             } else {
             log ("zzzzz");
             clearInterval(this.playTimer);
             }

             }.bind(this);
             this.playTimer = timerFunction.periodical(1000);
             */

            this.registerPlaybackEndEvent();
        } else {
            this.preload();
        }
    },
    // ---------------------------
    show : function() {
        this.container.fade('show');
        this.isVisible = true;
    },
    // ---------------------------
    hide : function(speed) {
        this.container.fade('hide');
        this.isVisible = false;
    },
    showCaptions : function(captionFile) {
        this.player.showTextTrack("subs");
        this.player.controlBar.captionsButton.show();
    },
    obscure : function() {
        log("Obscure");
        //TODO: finish for IE - use an image for the mask
        if (Browser.ie) {

            var myMask = new Mask(this.container, {
                style : {
                    'background' : 'rgba(00,00,00,0.98)'
                }
            });
            myMask.show();
        } else {
            this.container.set('class', 'blur');
        }
    },
    // ---------------------------
    stop : function() {
        if (this.player != null) {
            this.player.pause();
            if (this.isVisible) {
                this.player.currentTime(0);
            }
            this.player.pause();
        }
    },
    // ---------------------------
    skip : function() {
        if (this.player != null) {
            // so the end event does not fire again
            this.player.off("ended");

            this.seek(this.player.duration());

            this.myParent().fireEvent("TIMELINE", {
                type : "video.finished",
                id : this.options.id,
                next : this.options.next
            });
        }
    },
    // ---------------------------
    pause : function() {
        if (this.player != null) {
            this.player.pause();
        }
    },
    seek : function(time) {
        this.player.pause();
        this.player.currentTime(time);
        this.player.pause();
    },
    volume : function(volume) {
        if (this.player != null) {
            this.player.volume(volume);
        }
    },
    remove : function() {
        // get the videojs player with id
        var player = videojs.players[this.playerID];
        // get rid of it
        if (player == null) {
            log("Video player is null");
        } else {
            player.dispose();
        }

        if (this.container != null && this.container != undefined) {
            this.container.player.dispose();
            delete this.container.player;
            this.container.destroy();
            delete this.container;
        }
        delete this.player;
    },
    // ----------------------------------------------------------
    getLoaderInfo : function() {

        var loaderInfo = new Object();
        var progress = 0;
        if (this.player != null) {
            progress = this.player.bufferedPercent();
            log(this.playerID + " **** Video Load progress: " + (this.player.bufferedPercent() * 100.00));
        }

        loaderInfo[this.options.id] = {
            'progress' : progress,
            'weight' : 2,
            ref : this,
            type : 'VIDEO'
        };

        // in iOS buffering does not start until play is clicked, so skip preloading
        // http://stackoverflow.com/questions/11633929/readystate-issue-with-html5-video-elements-on-ios-safari
        if (Browser.Platform.ios == true || Browser.Platform.android == true) {
            //this.isReady = true;
            log(" iOS device - readyggg: ", this.playerID);
        }

        if (this.isReady == true) {
            loaderInfo[this.options.id].progress = 1;
        }
        return loaderInfo;
    },
    _getVideoData : function() {
        var data = {};
        var myFilename = stripFileExtension(this.options.filename);
        var videoFile = Main.PATHS.videoFolder + myFilename;
        var posterFile = Main.PATHS.imageFolder + myFilename;
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
    },
    _finishedLoading : function() {
        this.isReady = true;
        // this.player.off('progress');
        this.player.off('loaded');
        this.player.off('loadstart');
        // this.player.off('suspend');
        // this.player.off('waiting');
        this.player.off('canplaythrough');
    }
});

