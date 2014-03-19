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
        this.ended = false;
        this.isPaused = false;

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
        // debug("++ Video Preload started: " + this.options.id);
        if (this.player == undefined) {
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
                    this.player.poster = data.poster.src;
                    this.player.src(data.video);
                    this.player.play();
                    this.ended = false;
                    this.stalledTimer = null;
                    this.paused = false;

                    if (this.getReadyState() !== 4) {//HAVE_ENOUGH_DATA
                        debug("readyState checking ", this.player.readyState);
                        //vid.addEventListener('canplaythrough', onCanPlay, false);
                        //  vid.addEventListener('load', onCanPlay, false);
                        //add load event as well to avoid errors, sometimes 'canplaythrough' won't dispatch.
                        setTimeout( function() {
                            this.pause();
                            //block play so it buffers before playing
                        }.bind(this), 2);
                        //it needs to be after a delay otherwise it doesn't work properly.
                    } else {
                        //video is ready
                        this.pause();
                    }

                    this.registerLoadEvents();
                    this.hide();

                }.bind(this)));
        }
    },
    registerLoadEvents : function() {
        if (this.player != undefined) {
            this.player.on("suspend", function() {
                debug("EVENT: suspend", this.options.id);
                if (Browser.Platform.ios == true) {
                    this._finishedLoading();
                }
                this.isSuspended = true;
            }.bind(this));

            this.player.on("waiting", function() {
                debug("EVENT: **********************   waiting", this.options.id, this.getReadyState(), this.getNetworkState());
                //this.player.load();
            }.bind(this));
            this.player.on("load", function() {
                //debug("EVENT: **********************   load", this.options.id, this.getReadyState(), this.getNetworkState());
                //this.player.load();
            }.bind(this));

            this.player.tech.el_.addEvent("stalled", function() {

                debug("EVENT: **********************   stalled", this.options.id, this.getReadyState(), this.getNetworkState());
                //  this.showControls();
                //   this.player.loadingSpinner.show();
                //  this.stalledCurrentTime = this.player.currentTime();

                // alert("stalled");
                /* this.stalledTimer = setInterval( function() {

                 if (this.player.currentTime() > this.stalledCurrentTime) {
                 this.hideControls();
                 clearInterval(this.stalledTimer);
                 this.player.loadingSpinner.hide();
                 }
                 if (this.ended == true) {
                 //alert("Cleared interval as ended" + this.ended);
                 this.hideControls();
                 clearInterval(this.stalledTimer);
                 this.player.loadingSpinner.hide();
                 }
                 }.bind(this), 2000);
                 */

            }.bind(this));
            this.player.on("progress", function() {
                // debug("EVENT: **********************   progress", this.options.id, this.getReadyState(), this.getNetworkState());
                this.isSuspended = false;
            }.bind(this));

            this.player.on("canplaythrough", function() {
                // Chrome has small buffer and will stop preloading whne full
                if (Browser.chrome) {
                    this._finishedLoading();
                }
                if (this.getReadyState() > 2 && this.getNetworkState() == 2) {
                    this._finishedLoading();
                }
                // debug("EVENT: **********************   canplaythrough", this.options.id, this.getReadyState(), this.getNetworkState());

            }.bind(this));

            this.player.on("loadedalldata", function() {
                if (this.getReadyState() == 4) {
                    debug("EVENT: **********************   loadedalldata", this.options.id, this.getReadyState(), this.getNetworkState());
                    this._finishedLoading();
                }

                this.isSuspended = false;
            }.bind(this));
        }
    },
    registerPlaybackEndEvent : function() {
        if (this.player != undefined) {
            this.player.off("ended");
            this.player.on("ended", function() {

                this.ended = true;
                this.progressChecker();

                debug("EVENT: **********************   ended", this.options.id);
                this.myParent().fireEvent("TIMELINE", {
                    type : "video.finished",
                    id : this.options.id,
                    next : this.options.next
                });
            }.bind(this));

        }
    },
    registerPlaybackStartEvent : function() {
        //  this.player.on("play", function() {
        //this.player.tech.el_.removeEvents("play");
        this.player.tech.el_.addEventListener("play", function() {
            debug("EVENT: **********************   play", this.options.id);

            this.myParent().fireEvent("TIMELINE", {
                type : "video.started",
                id : this.options.id,
                next : "video.started"
            });
            if (Main.features.clickToPlay == true) {

                if (this.stalledTimer == null) {
                    this.stalledTimer = this.progressChecker.periodical(2000, this);
                }
                this.lastCurrentTime = this.player.currentTime();
            }
        }.bind(this));
        this.player.off("pause");
        this.player.on("pause", function() {
            // alert ("paused");
            debug("EVENT: **********************   pause", this.options.id);
            // this.isPaused = true;
            // clearInterval(this.stalledTimer);
            // alert ("paused, cleared timer");
        }.bind(this));
        this.player.on("error", function(event) {
            // alert ("paused");
            debug("EVENT: **********************   error ", this.options.id, event);
            // this.isPaused = true;
            // clearInterval(this.stalledTimer);
            // alert ("paused, cleared timer");
            this.player.play();
        }.bind(this));
        
        
        // this.player.tech.el_.addEventListener("play", function() {

        //  }.bind(this));
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
            this.registerPlaybackEndEvent();
            this.registerPlaybackStartEvent();
            this.isPaused = false;
            this.player.play();
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
        debug("Obscure");
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
            this.pause();
            if (this.isVisible) {
                this.player.currentTime(0);
            }
            this.pause();
        }
    },
    // ---------------------------
    skip : function() {
        if (this.player != null) {
            // so the end event does not fire again
            this.player.off("ended");
            this.ended = true;
            this.seek(this.player.duration());
            this.progressChecker();

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
            this.isPaused = true;
            clearInterval(this.stalledTimer);
        }
    },
    seek : function(time) {
        this.isPaused = true;
        this.pause();
        this.player.currentTime(time);
        this.pause();
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
            debug("Video player is null");
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
            debug(this.playerID + " **** Video Load progress: " + (this.player.bufferedPercent() * 100.00));
            if (progress >= 1) {
                this.isReady = true;
            }
        }

        loaderInfo[this.options.id] = {
            'progress' : progress,
            'weight' : 2,
            ref : this,
            type : 'VIDEO'
        };

        // in iOS buffering does not start until play is clicked, so skip preloading
        // http://stackoverflow.com/questions/11633929/readystate-issue-with-html5-video-elements-on-ios-safari
        if (Browser.Platform.android == true) {
            //this.isReady = true;
            debug(" Abdroid device - ready: ", this.playerID);
        }

        //if (Browser.Platform.ios == true || Browser.Platform.android == true) {
        //    this.isReady = true;
        //    debug(" iOS device - readyggg: ", this.playerID);
        //}

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
        
        // http://stackoverflow.com/questions/16773986/html5-video-issue-with-chrome
        if (Browser.chrome == true) {
            data.video = [{
                type : "video/webm",
                src : videoFile + ".webm"
            }, {
                type : "video/ogg",
                src : videoFile + ".ogv"
            }];
        } else {

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
        }

        data.poster = {
            src : posterFile + "_first.jpg"
        };
        return data;
    },
    _finishedLoading : function() {

        if (this.isReady != true) {
            debug("!!!!!!!!!!!!!!!!!!! _finishedLoading ", this.options.id);
            this.isReady = true;
            // this.player.off('progress');
            this.player.off('loaded');
            this.player.off('loadstart');
            // this.player.off('suspend');
            // this.player.off('waiting');
            this.player.off('canplaythrough');
            this.player.off('loadedalldata');

        }
    },
    getReadyState : function() {
        if (this.player != null) {
            return this.player.tech.el_.readyState;
        }
    },
    getNetworkState : function() {
        if (this.player != null) {
            return this.player.tech.el_.networkState;
        }
    },
    showControls : function() {
        if (this.options.controls == false) {
            this.player.tech.el_.setAttribute("controls", "controls");
        }
    },
    hideControls : function() {
        if (this.options.controls == false) {
            this.player.tech.el_.removeAttribute("controls");
        }
    },
    progressChecker : function() {
        if (this.ended == true) {
            this.hideControls();
            clearInterval(this.stalledTimer);
            this.player.loadingSpinner.hide();
        } else {
            if (this.player.currentTime() > this.lastCurrentTime) {
                this.hideControls();
                this.player.loadingSpinner.hide();
                this.lastCurrentTime = this.player.currentTime();

            } else {
                if (this.isPaused == false) {
                    this.showControls();
                    this.player.loadingSpinner.show();
                    this.player.play();
                }
            }
        }
    }
});

