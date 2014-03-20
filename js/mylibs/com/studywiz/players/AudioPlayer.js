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
            if (Browser.Platform.ios == true || Browser.Platform.android == true) {
                this._playSound();
            } else {
                debug("++ Not preloaded yet - Loading Sound" + this.options.src);
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
    },
    // ----------------------------------------------------------
    preload : function() {
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
        debug('Play sound: ' + this.options.id + " " + this.options.src);
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
        debug("++ Audio Preloaded: " + this.options.id);
        this.preloaded = true;
    },
    // ----------------------------------------------------------
    _preloadError : function(event) {
        debug("++ Audio Preload error: ", event);
        new Api(this).saveLog('error', "****** Load error for audio: " + this.options.src + " ******");
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

        if (Browser.Platform.ios == true || Browser.Platform.android == true) {
            loaderInfo[this.options.id].progress = 1;
            debug(" iOS device - audio ready");
        }

        return loaderInfo;
    }
});

