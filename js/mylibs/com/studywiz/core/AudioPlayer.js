var AudioPlayer = new Class({
    Implements : Events,
    initialize : function(myID, myParent) {
        this.preloaded = false;
        this.id = myID;
        this.parent = myParent;
        this.nextAction = new String();
        this.source = new Object();
        this.preloader = new createjs.PreloadJS();
        this.preloader.installPlugin(createjs.SoundJS);
        console.log("New Audio created");
        // TODO: handle these events handleFileError, handleProgress
        //this.preloader.onFileError = this.handleFileError();
        //this.preloader.onProgress = this.handleProgress();

    },
    // ----------------------------------------------------------
    setSource : function(src) {
        this.source.src = src;
        this.source.id = this.id;
    },
    // ----------------------------------------------------------
    start : function() {
        if (this.preloaded = false) {
            console.log("++ Not preloaded yet - Loading Sound" + this.source);
            this.preloader.loadFile(this.source, false);
            this.preloader.load();
            this.preloader.onComplete = this._playSound();
        } else {
            this._playSound()
        }

    },
    preload : function() {
        console.log ("++ Audio Preload started: " + this.id)
        this.preloader.loadFile(this.source, false);
        this.preloader.load();
        this.preloader.onComplete = this._preloadComplete();
    },
    // ----------------------------------------------------------
    // PRIVATE - handle load complete
    _playSound : function() {
        this.soundInstance = createjs.SoundJS.play(this.source.id);

        if (!createjs.SoundJS.checkPlugin(true)) {
            alert('Sound plugin issue');
        } else {
            this.soundInstance.onComplete = function() {
                console.log("got audio finished event");
                this.parent.fireEvent("TIMELINE", {
                    type : "audio.finished",
                    id : this.id,
                    next : this.nextAction
                });
            }.bind(this);
        }
    }.protect(), // PRIVATE - handle preload complete
    // ----------------------------------------------------------
    _preloadComplete : function() {
        console.log ("++ Audio Preloaded: " + this.id)
        this.preloaded = true;
    }.protect()

})

