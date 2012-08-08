var AudioPlayer = new Class({

    initialize : function() {
        this.source = new Object();
        this.preloader = new PreloadJS();
        this.preloader.installPlugin(SoundJS);

        //this.preloader.onFileError = this.handleFileError();
        //this.preloader.onProgress = this.handleProgress();

    },
    // ---------------------------
    setSource : function(src, id) {
        this.source.src = src;
        this.source.id = id;
    },
    // ---------------------------
    play : function() {

        this.preloader.loadFile(this.source, false);

        alert("Setting src: " + this.source.src);
        this.preloader.load();
        this.preloader.onComplete = this._loadComplete();

    },
    _loadComplete : function() {
        SoundJS.play(this.source.id);
        alert(this.source.id);
        if (!SoundJS.checkPlugin(true)) {
            alert('plugin issue');
        }
    }.protect()

    /*

     SoundJS.FlashPlugin.BASE_PATH = "assets/" // Initialize the base path from this document to the Flash Plugin

     // Instantiate a queue.
     queue = new PreloadJS();
     queue.installPlugin(SoundJS); // Plug in SoundJS to handle browser-specific paths
     queue.onComplete = loadComplete;
     queue.onFileError = handleFileError;
     queue.onProgress = handleProgress;
     queue.loadFile(item, true);
     }

     function stop() {
     if (queue != null) { queue.cancel(); }
     SoundJS.stop();
     }

     function handleFileError(o) {
     // An error occurred.
     displayStatus.innerText = "Error :("
     }

     function handleProgress(event) {
     // Progress happened.
     displayStatus.innerText = "Loading: " + (queue.progress.toFixed(2) * 100) + "%";
     }

     function loadComplete() {
     // Load completed.
     displayStatus.innerText = "Complete :)";
     playSound("music");
     }

     function playSound(name, loop) {
     // Play the sound using the ID created above.
     return SoundJS.play(name);
     }
     */
})

