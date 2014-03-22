var NativeRecorder = new Class({

    Implements : [Options, Events],
    options : {
        swiff : {
            id : 'Recorder',
            width : Main.VIDEO_WIDTH + 'px',
            height : '200px',
            params : {
            },
            callBacks : {
                isReady : this.isReady
            },
            container : null
        },
        style : {
            position : 'absolute',
            'z-index' : '99999',
            top : Main.VIDEO_TOP + 'px',
            left : Main.VIDEO_LEFT + 'px'

        },
        id : 'element.id',
        next : 'next.action',
        parent : null,
        parentTag : null

    },
    initialize : function(myParent, myOptions) {
        // Initial scene setup
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.containerID = 'recorderContainer';
        this.container = null;
        this.swiff = null;
        this.stream = null;
        this.recordedSound = null;
    },
    myParent : function() {
        return this.options.parent;
    },
    add : function(parentTagID, where) {

        var myParent = document.getElementById(parentTagID);

        if (this.container == null) {
            //debug("Container not found in " + parentTagID + " adding a new one");
            this.container = new Element("div", {
                id : this.containerID,
                styles : this.options.style
            });
            this.container.inject($m(parentTagID), where);
            // debug(this.options.style);

        }

        this.options.swiff.container = this.container;
        this.swiff = new ImagePlayer(this, {
            src : Main.PATHS.imageFolder + "commentary/noflash.png",
            next : "NoFlash.Ready",
            title : 'NoFlash',
            id : 'NoFlash',
            style : {
                'position' : 'relative',
                'left' : '500px',
                'top' : '15px'
            }
        });
        this.addEvent("TIMELINE", this.handleNavigationEvent);
        this.swiff.preload();

    },
    handleNavigationEvent : function(params) {
        switch (params.next) {
            case "NoFlash.Ready":
                this.removeEvents("TIMELINE");
                debug("ImageNo Flash loaded");
                this.swiff.add(this.container.id);
                this.swiff.show();
        }
    },
    show : function() {

        this.container.fade('in');

    },
    display : function() {

        this.container.fade('show');

    },
    // ---------------------------
    hide : function() {
        if (this.container.isVisible() == true) {
            this.container.fade('out');
        }
    },
    // ---------------------------
    remove : function() {
        this.hide();
        this.container.destroy();
        this.swiff = null;
        this.container = null;
    },
    // ----------------------------------------------------------
    getLoaderInfo : function() {
        var loaderInfo = new Object();
        var progress = 0;
        if (this.options.loaded == true) {
            progress = 1;
        }
        loaderInfo[this.options.id] = {
            'progress' : progress,
            'weight' : 1,
            ref : this,
            type : 'FLASH'
        };
        return loaderInfo;
    },
    preload : function() {
        this.image = new Asset.flash(this.options.src, {
            style : this.options.style,
            id : this.options.id,
            onLoad : function() {
                this.options.loaded = true;
                this.myParent().mediaLoader.reportProgress(this.getLoaderInfo());
                this.myParent().fireEvent("TIMELINE", {
                    type : "image.ready",
                    id : this.options.id,
                    next : this.options.next
                });
            }.bind(this)
        });
    },
    stopRecording : function() {
        log("stop", this, this.audioRecorder);

        this.audioRecorder.stop();
        var buffers = this.audioRecorder.getBuffers( function(buffers) {
            this.gotBuffers(buffers);
        }.bind(this));
    },
    startRecording : function() {

        this.initAudio();

    },
    gotBuffers : function(buffers) {
        this.audioRecorder.exportWAV( function(blob) {
            this.doneEncoding(blob);
        }.bind(this));

    },
    doneEncoding : function(blob) {
        this.recordedSound = window.URL.createObjectURL(blob);
        log(window.URL.createObjectURL(blob));
    },
    startPlayback : function() {
        var player = new Element("audio", {
            id : "playback",
            'src' : this.recordedSound,
            'autoplay' : true
        });
        //  player.inject($m(this.options.parentTag));

    },
    _getUserMedia : function() {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    },
    initAudio : function() {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        if (navigator.getUserMedia) {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!this.audioContext) {
                this.audioContext = new AudioContext();
            }
            navigator.getUserMedia({
                audio : true
            }, function(stream) {
                this.gotStream(stream);
            }.bind(this), function(e) {
                alert('Error getting audio');
                console.log(e);
            });

        } else {
            log("no audio");
        }

    },

    gotStream : function(stream) {

        inputPoint = this.audioContext.createGain();

        // Create an AudioNode from the stream.
        realAudioInput = this.audioContext.createMediaStreamSource(stream);
        realAudioInput.connect(inputPoint);

        //    audioInput = convertToMono( input );

        this.audioRecorder = new Recorder(inputPoint);
        this.audioRecorder.clear();
        this.audioRecorder.record();

    }
});
