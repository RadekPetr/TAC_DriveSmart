var AudioPlayer = new Class({
    Implements : [Options, Events],
    // ---------------------------
    options : {
        id : 'element.id',
        src : '',
        next : 'next.action',
        parent : null,
        preload : 'false'
    },
    // ----------------------------------------------------------
    initialize : function(myParent, myOptions) {
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.preloaded = false;
        this.soundInstance = null;
        this.preloader = new createjs.PreloadJS();
        this.preloader.installPlugin(createjs.SoundJS);
        // TODO: handle these events handleFileError, handleProgress
        //this.preloader.onFileError = this.handleFileError();
        /*  this.preloader.onProgress = function() {
         if (this.myParent().mediaLoader != null && this.myParent().mediaLoader != undefined) {
         this.myParent().mediaLoader.reportProgress(this.getLoaderInfo());
         }
         }.bind(this)
         */
    },
    myParent : function() {
        return this.options.parent;
    },
    //----------------------------------------------------------
    setSource : function(src) {
        this.options.src = src;
    },
    // ----------------------------------------------------------
    start : function() {
        if (this.preloaded == false) {
            log("++ Not preloaded yet - Loading Sound" + this.options.src);
            this.preloader.loadFile({
                src : this.options.src,
                id : this.options.id
            }, false);
            this.preloader.load();
            this.preloader.onComplete = this._playSound();
        } else {
            this._playSound();
        }
    },

    // ----------------------------------------------------------
    stop : function() {
        if (this.soundInstance != null) {
            this.soundInstance.stop();
        }

        // createjs.SoundJS.stop();
    },
    // ----------------------------------------------------------
    preload : function() {
        //log("++ Audio Preload started: " + this.options.id)
        this.preloader.loadFile({
            src : this.options.src,
            id : this.options.id
        }, false);
        this.preloader.load();
        this.preloader.onComplete = this._preloadComplete();
    },
    id : function() {
        return this.options.id;
    },
    // ----------------------------------------------------------
    // PRIVATE - handle load complete
    _playSound : function() {
        log('Play sound: ' + this.options.id + " " + this.options.src);
        if (!createjs.SoundJS.checkPlugin(true)) {
            alert('Sound plugin issue');
        } else {          

            this.soundInstance = createjs.SoundJS.play(this.options.id);
            log(this.soundInstance);

            this.soundInstance.onComplete = function() {
                this.myParent().fireEvent("TIMELINE", {
                    type : "audio.finished",
                    id : this.options.id,
                    next : this.options.next
                });
            }.bind(this);
        }
    }.protect(),
    // ----------------------------------------------------------
    _preloadComplete : function() {
        log("++ Audio Preloaded: " + this.options.id);
         if (Browser.Platform.ios == true) {
             this.preloaded = false;
         } else {
             this.preloaded = true;
         }
        
    }.protect(),
    // ----------------------------------------------------------
    getLoaderInfo : function() {
        var loaderInfo = new Object();

        loaderInfo[this.options.id] = {
            'progress' : this.preloader.progress,
            'weight' : 1,
            ref : this,
            type : 'AUDIO'
        };

        if (Browser.Platform.ios == true) {
            loaderInfo[this.options.id].progress = 1;
            log(" iOS device - ready");
        }

        return loaderInfo;
    }
});

