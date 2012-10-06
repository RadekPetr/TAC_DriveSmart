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

        //log("++ Video Preload started: " + this.options.id);

        this.player.ready(( function() {
                var data = this._getVideoData();
                this.container.player.setProperty("poster", data.poster.src);
                this.player.src(data.video);
                //log("BLA" + this.options.style.width);
                this.player.size(this.options.style.width, this.options.style.height);
                this.player.pause();

                this.player.addEvent("loadstart", function() {

                    this.myParent().mediaLoader.reportProgress(this.getLoaderInfo());
                    //log("Video Load progress: " + (this.player.bufferedPercent() * 100.00));
                }.bind(this));

                this.player.addEvent("loadedmetadata", function() {
                    this._reportProgress()
                }.bind(this));

                this.player.addEvent("progress", function() {
                    this._reportProgress()
                }.bind(this));

                this.player.addEvent("loadedalldata", function() {
                    this._reportProgress()
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
            'weight' : 800,
            ref : this
        };
        return loaderInfo
    },
    // ----------------------------------------------------------
    _reportProgress : function() {
        this.myParent().mediaLoader.reportProgress(this.getLoaderInfo());

    },
    _getVideoData : function() {
        var data = {};
        var myFilename = this.options.filename;
        // var rand = "?" + Math.random();
        data.video = [{
            type : "video/mp4",
            src : myFilename + ".mp4"
        }, {
            type : "video/webm",
            src : myFilename + ".webm"
        }, {
            type : "video/ogg",
            src : myFilename + ".ogv"
        }];
        data.poster = {
            src : myFilename + "_first.jpg"
        };
        return data;
    }
})

