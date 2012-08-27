var AudioPlayer = new Class({
    Implements : Events,
    initialize : function(myID, myParent) {
        this.id = myID;
        this.parent = myParent;
        this.nextAction = new String();
        this.source = new Object();
        this.preloader = new PreloadJS();
        this.preloader.installPlugin(SoundJS);

        //this.preloader.onFileError = this.handleFileError();
        //this.preloader.onProgress = this.handleProgress();

    },
    // ----------------------------------------------------------
    setSource : function(src, id) {
        this.source.src = src;
        this.source.id = id;
    },
    // ----------------------------------------------------------
    play : function() {

        this.preloader.loadFile(this.source, false);

        // alert("Setting src: " + this.source.src);
        this.preloader.load();
        // TODO: maybe move preloading to initialize so playback starts directly
        this.preloader.onComplete = this._loadComplete();

    },
    // ----------------------------------------------------------
    // PRIVATE - handle load complete
    _loadComplete : function() {
        this.soundInstance = SoundJS.play(this.source.id);

        if (!SoundJS.checkPlugin(true)) {
            alert('Sound plugin issue');
        } else {
            this.soundInstance.onComplete = function() {
                console.log("got audio finished event");
                this.parent.fireEvent("TIMELINE", {
                    type : "audio.finished",
                    id : this.id,
                    next: this.nextAction
                });
            }.bind(this);
        }
    }.protect()

})

