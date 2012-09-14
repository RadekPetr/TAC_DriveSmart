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
        this.preloader = new createjs.PreloadJS();
        this.preloader.installPlugin(createjs.SoundJS);
        // TODO: handle these events handleFileError, handleProgress
        //this.preloader.onFileError = this.handleFileError();
        this.preloader.onProgress = function() {
            this.options.parent.mediaLoader.reportProgress(this.getLoaderInfo());
        }.bind(this)
    },
    // ----------------------------------------------------------
    setSource : function(src) {
        this.options.src = src;
    },
    // ----------------------------------------------------------
    start : function() {
        if (this.preloaded = false) {
            console.log("++ Not preloaded yet - Loading Sound" + this.options.src);
            this.preloader.loadFile({
                src : this.options.src,
                id : this.options.id
            }, false);
            this.preloader.load();
            this.preloader.onComplete = this._playSound();
        } else {
            this._playSound()
        }
    },
    // ----------------------------------------------------------
    preload : function() {
        console.log("++ Audio Preload started: " + this.options.id)
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
        console.log('Play sound: ' + this.options.id + " " + this.options.src)
        console.log(this.preloader);
        this.soundInstance = createjs.SoundJS.play(this.options.id);
        console.log(this.soundInstance);
        if (!createjs.SoundJS.checkPlugin(true)) {
            alert('Sound plugin issue');
        } else {
            this.soundInstance.onComplete = function() {
                this.options.parent.fireEvent("TIMELINE", {
                    type : "audio.finished",
                    id : this.options.id,
                    next : this.options.next
                });
            }.bind(this);
        }
    }.protect(),
    // ----------------------------------------------------------
    _preloadComplete : function() {
        console.log("++ Audio Preloaded: " + this.options.id)
        this.preloaded = true;
    }.protect(),
    // ----------------------------------------------------------
    getLoaderInfo : function() {
        var loaderInfo = new Object();

        loaderInfo[this.options.id] = {
            'progress' : this.preloader.progress,
            'weight' : 1,
            ref : this
        };
        return loaderInfo
    }
})

