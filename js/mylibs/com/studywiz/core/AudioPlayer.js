var AudioPlayer = new Class({

    initialize : function() {
        // alert("Alive");
        this.myScript = Asset.javascript("js/mylibs/CreateJs/soundjs-0.2.0.min.js");
        this.myS

    },
    // ---------------------------
    setSource : function(src) {
        this.filename = src;
        this.myVideoPlayer.src([{
            type : "audio/mp3",
            src : "http://www.jplayer.org/video/m4v/Big_Buck_Bunny_Trailer.m4v"
        }, {
            type : "video/webm",
            src : "http://video-js.zencoder.com/oceans-clip.webm"
        }, {
            type : "video/ogg",
            src : "http://video-js.zencoder.com/oceans-clip.ogv"
        }]);
    },
    // ---------------------------
    play : function() {
        this.myVideoPlayer.ready((function(videoPlayer) {
            this.myVideoPlayer.play();
        }).bind(this))
    },
    // ---------------------------
    addVideoPlayer : function(divName) {
        videoElement = document.createElement("video");
        videoElement.setAttribute("id", divName);

        videoElement.setAttribute("preload", "auto");
        videoElement.setAttribute("width", "800");
        videoElement.setAttribute("height", "600");
        videoElement.setAttribute("poster", "http://video-js.zencoder.com/oceans-clip.png");

        videoDiv = document.createElement('div');
        document.body.appendChild(videoDiv);
        videoDiv.appendChild(videoElement);

        this.myDiv = divName;
        this.myVideoPlayer = _V_(this.myDiv);
    }
    
    /*
    
    // Create a single item to load.
        var assetsPath = "assets/";
        var item = {src:assetsPath+"18-machinae_supremacy-lord_krutors_dominion.mp3|"+assetsPath+"18-machinae_supremacy-lord_krutors_dominion.ogg", id:"music"};

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

