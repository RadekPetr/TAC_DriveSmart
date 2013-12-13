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
        this.preloader = new createjs.LoadQueue();
        this.preloader.parent = this;
        
        createjs.Sound.alternateExtensions = ["mp3", "ogg"];
        createjs.FlashPlugin.swfPath = Main.PATHS.flashFolder;
        createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashPlugin]);

        //createjs.Sound.registerPlugin(createjs.FlashPlugin);

        this.preloader.installPlugin(createjs.Sound);

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
            if (Browser.Platform.ios == true) {
                this._playSound();
            } else {
                log("++ Not preloaded yet - Loading Sound" + this.options.src);
                this.preloader.loadFile({
                    src : this.options.src,
                    id : this.options.id
                }, false);
                this.preloader.load();
            }

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
        log("++ Audio Preload started: " + this.options.id);
        this.preloader.addEventListener("complete", createjs.proxy(this._preloadComplete, (this)));
        this.preloader.addEventListener("error", createjs.proxy(this._preloadError, (this)));
        this.preloader.loadFile({
            src : this.options.src,
            id : this.options.id
        }, false);
        this.preloader.load();
    },
    id : function() {
        return this.options.id;
    },
    // ----------------------------------------------------------
    // PRIVATE - handle load complete
    _playSound : function() {
        log('Play sound: ' + this.options.id + " " + this.options.src);
        if (!createjs.Sound.isReady()) {
            alert('Sound plugin issue');
        } else {
            this.soundInstance = createjs.Sound.play(this.options.id);
            this.soundInstance.addEventListener("complete", createjs.proxy(this._onSoundComplete, (this)));
        }
    }.protect(),
    _onSoundComplete : function(event) {

        this.myParent().fireEvent("TIMELINE", {
            type : "audio.finished",
            id : this.options.id,
            next : this.options.next
        });
    },
    // ----------------------------------------------------------
    _preloadComplete : function(event) {
        // log("++ Audio Preloaded: " + this.options.id);
        if (Browser.Platform.ios == true) {
            this.preloaded = false;
        } else {
            this.preloaded = true;
        }
    },
    // ----------------------------------------------------------
    _preloadError : function(event) {
        log("++ Audio Preload error: " + event);

    },
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

