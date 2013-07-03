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
        width : '640',
        height : '480',
        'class' : 'video-js',
        poster : '',
        id : 'element.id',
        next : 'next.action',
        parent : null,
        preload : 'auto',
        autoplay : false,
        controls : false,
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

        this.container = null;

        this.container = new Element("div", {
            id : this.containerID,
            'class' : 'videoContainer'

        })

        this.container.setStyles(this.options.style);

        this.container.inject($m(this.options.parentTag));

        this.container.player = new Element("video", {
            'id' : this.playerID,
            'class' : this.options['class']

        });
        this.container.player.inject(this.container);

    },
    myParent : function() {
        return this.options.parent;
    },
    // ---------------------------
    preload : function() {
        log("++ Video Preload started: " + this.options.id);
        // TODO: handle sitiation player is undefined
        // TODO: use timer to check on the progress
        if (this.player == undefined) {
            //    log('Undefined player ERRROR');
            //     log(this);
            //      this.remove();
            //  } else {
            this.player = videojs('player_' + this.options.id, {
                "controls" : this.options.controls,
                "autoplay" : this.options.autoplay,
                "preload" : this.options.preload,
                "width" : this.options.width,
                "height" : this.options.height
            });

            this.player.ready(( function() {
                    this.player.options['children'] = false;
                    // this.player.TextTrack.disable();
                    log('Player ready');
                    var data = this._getVideoData();
                    //this.container.player.setProperty("poster", data.poster.src);

                    this.player.dimensions(this.options.width, this.options.height);

                    this.player.poster(data.poster.src);
                    this.player.src(data.video);
                    //log("BLA" + this.options.style.width);
                    // this.player.size(this.options.style.width, this.options.style.height);
                    this.player.pause();

                    this.player.on("loadstart", function() {
                        log("EVENT: loadstart");
                        this._reportProgress();
                    }.bind(this));

                    this.player.on("loadedmetadata", function() {
                        log("EVENT: loadedmetadata");
                        this._reportProgress();
                    }.bind(this));
                    this.player.on("loadeddata", function() {
                        // log("EVENT: loadeddata");
                        this._reportProgress();
                    }.bind(this));
                    this.player.on("play", function() {
                        //log("EVENT: play");
                        this._reportProgress();
                    }.bind(this));

                    this.player.on("progress", function() {
                        log("EVENT: progress");
                        this._reportProgress();
                    }.bind(this));

                    this.player.on("loadedalldata", function() {
                        log("EVENT: loadedalldata");
                        this.player.off("loadedalldata");
                        this.player.off("progress");
                        this.player.off("timeupdate");
                        this.player.off("canplaythrough");
                        this.player.off("canplay");
                        this.player.off("suspend");
                        this.player.off("waiting");
                        this.player.off("loadedmetadata");
                        this._reportProgress(true);
                    }.bind(this));

                    this.player.on("timeupdate", function() {
                        log("EVENT: timeupdate");
                        this._reportProgress();
                    }.bind(this));

                    this.player.on("suspend", function() {
                        log("EVENT: suspend");
                        this._reportProgress();
                    }.bind(this));

                    this.player.on("waiting", function() {
                        log("EVENT: **********************   waiting");
                        this._reportProgress();
                    }.bind(this));

                    this.player.on("canplay", function() {
                        log("EVENT: **********************   canplay");
                        this._reportProgress();
                    }.bind(this));
                    this.player.on("canplaythrough", function() {
                        log("EVENT: **********************   canplaythrough");
                        this.player.off("canplaythrough");
                        this.player.off("progress");
                        this.player.off("timeupdate");
                        this.player.off("loadedmetadata");
                        this._reportProgress(true);
                    }.bind(this));

                    // this.player.removeEvents();
                    //log("Adding ended listener");
                    this.player.on("ended", function() {
                        log("Video ended");
                        // remove all events
                        this.player.off();

                        this.myParent().fireEvent("TIMELINE", {
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
        if (this.player != null) {
            //log(this.player.bufferedPercent());
            this.player.play();
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
    obscure : function() {
        log("Obscure");
        log(this.container);
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
            this.player.currentTime(0);
            this.player.pause();
        }
    },
    // ---------------------------
    skip : function() {
        if (this.player != null) {
            // so the end event does not fire again
            this.player.off();

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

        log('Removing player: ' + this.playerID);
        // see http://help.videojs.com/discussions/problems/861-how-to-destroy-a-video-js-object
        // get the videojs player with id of "video_1"

        var player = videojs(this.playerID);
        // remove all events
        player.off();
        // get rid of it
        player.dispose();

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
            log(this.playerID + " **** Video Load progress buffered: ", this.player.buffered());
            log(this.playerID + " **** Video duration: " + this.player.duration());

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
        if (this.myParent().mediaLoader != null && this.myParent().mediaLoader != undefined) {
            this.myParent().mediaLoader.reportProgress(loaderInfo);
        }

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
    }
})

