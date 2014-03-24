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
        parentTag : null,

    },
    initialize : function(myParent, myOptions) {
        // Initial scene setup
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.containerID = 'recorderContainer';
        this.container = null;
        this.image = null;
        this.stream = null;
        this.recordedSound = null;
        this.recorded = false;

        this.initAudio();

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
        if (Main.audioRecorder == null) {
            this.options.swiff.container = this.container;
            this.image = new ImagePlayer(this, {
                src : Main.PATHS.imageFolder + "commentary/nomic.png",
                next : "Image.Ready",
                title : 'NoMic',
                id : 'NoMic',
                style : {
                    'position' : 'relative',
                    'left' : '500px',
                    'top' : '15px'
                }
            });
        } else {
            this.options.swiff.container = this.container;
            this.image = new ImagePlayer(this, {
                src : Main.PATHS.imageFolder + "commentary/mic.png",
                next : "Image.Ready",
                title : 'Mic',
                id : 'Mic',
                style : {
                    'position' : 'relative',
                    'left' : '500px',
                    'top' : '15px'
                }
            });
        }
        this.addEvent("TIMELINE", this.handleNavigationEvent);
        this.image.preload();

        // if Main.audioRecorder = null - load mic no allowed image
        // if Main.audioRecorder != null - load mic  image

    },
    handleNavigationEvent : function(params) {
        switch (params.next) {
            case "Image.Ready":
                this.removeEvents("TIMELINE");
                debug("ImageNo Flash loaded");
                this.image.add(this.container.id);
                this.image.show();
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
        this.image = null;
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

    },
    stopRecording : function() {
        if (Main.audioRecorder) {
            Main.audioRecorder.stop();
            var buffers = Main.audioRecorder.getBuffers( function(buffers) {
                this.gotBuffers(buffers);
            }.bind(this));

            // recording animation stop
        }
    },
    startRecording : function() {
        if (Main.audioRecorder) {
            Main.audioRecorder.clear();
            Main.audioRecorder.record();
            this.recorded = true;

            // recording animation

        }
    },
    gotBuffers : function(buffers) {
        Main.audioRecorder.exportWAV( function(blob) {
            this.doneEncoding(blob);
        }.bind(this));

    },
    doneEncoding : function(blob) {
        log ("blob:", blob);
        this.recordedSound = window.URL.createObjectURL(blob);
        log(window.URL.createObjectURL(blob));
        // recorded image
    },
    startPlayback : function() {
        var player = new Element("audio", {
            id : "playback",
            'src' : this.recordedSound,
            'autoplay' : true
        });
        player.inject($m(this.options.parentTag));

    },
    _getUserMedia : function() {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    },
    initAudio : function() {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

        if (navigator.getUserMedia) {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            if (Main.audioContext == null) {
                Main.audioContext = new AudioContext();
            }

            if (Main.audioRecorder == null) {
                navigator.getUserMedia({
                    audio : true
                }, function(stream) {
                    this.gotStream(stream);
                }.bind(this), function(e) {
                    alert('Access to microphone denied. Please check your settings.');
                    Main.audioRecorder = null;
                    console.log(e);
                });
            }

        } else {
            log("no audio");
        }

    },

    gotStream : function(stream) {
        inputPoint = Main.audioContext.createGain();
        log("inputPoint", inputPoint);
        // Create an AudioNode from the stream.
        realAudioInput = Main.audioContext.createMediaStreamSource(stream);
        realAudioInput.connect(inputPoint);

        //    audioInput = convertToMono( input );

        Main.audioRecorder = new JSRecorder(inputPoint);

    }
});
