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
            this._showMicNotReady();
        } else {
            this._showMicReady();
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
        this.image.remove();
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
            this._showRecording();
            // recording animation
        }
    },
    gotBuffers : function(buffers) {
        Main.audioRecorder.exportWAV( function(blob) {
            this.doneEncoding(blob);
        }.bind(this));
    },
    doneEncoding : function(blob) {
        this.recordedSound = window.URL.createObjectURL(blob);
        // recorded image
        this._showRecordedOk();
    },
    startPlayback : function() {
        var player = new Element("audio", {
            id : "playback",
            'src' : this.recordedSound,
            'autoplay' : true
        });
        //player.inject($m(this.options.parentTag));
        this._showPlayback();
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
                    this._showMicReady();
                    this.gotStream(stream);
                }.bind(this), function(e) {
                    alert('Access to microphone denied. Please check your browser settings.');
                    Main.audioRecorder = null;
                    this._showMicNotReady();
                    console.log(e);
                });
            }

        } else {
            log("no audio");
            this._showMicNotReady();
        }

    },
    _convertToMono : function(input) {
        var splitter = Main.audioContext.createChannelSplitter(2);
        var merger = Main.audioContext.createChannelMerger(2);

        input.connect(splitter);
        splitter.connect(merger, 0, 0);
        splitter.connect(merger, 0, 1);
        return merger;
    },

    gotStream : function(stream) {
        inputPoint = Main.audioContext.createGain();
        // Create an AudioNode from the stream.
        realAudioInput = Main.audioContext.createMediaStreamSource(stream);
        audioInput = realAudioInput;
        // audioInput = this._convertToMono(realAudioInput);
        audioInput.connect(inputPoint);

        Main.audioRecorder = new JSRecorder(inputPoint);
    },
    _showMicReady : function() {
        this._showStatus({
            src : Main.PATHS.imageFolder + "commentary/mic.png",
            next : "-",
            title : 'Microphone ready',
            id : 'Mic ready',
            style : {
                'position' : 'relative',
                'left' : '500px',
                'top' : '15px'
            }
        });

    },
    _showMicNotReady : function() {
        this._showStatus({
            src : Main.PATHS.imageFolder + "commentary/nomic.png",
            next : "-",
            title : 'Microphone not ready',
            id : 'Mic not ready',
            style : {
                'position' : 'relative',
                'left' : '500px',
                'top' : '15px'
            }
        });

    },
    _showRecording : function() {
        this._showStatus({
            src : Main.PATHS.imageFolder + "commentary/rec.png",
            next : "-",
            title : 'Microphone not ready',
            id : 'Mic not ready',
            style : {
                'position' : 'relative',
                'left' : '500px',
                'top' : '15px'
            }
        });
        this.image.tween('0', '1', 1000, 'opacity', 500);
    },
    _showRecordedOk : function() {
        this._showStatus({
            src : Main.PATHS.imageFolder + "commentary/tick.png",
            next : "-",
            title : 'Recorded ok',
            id : 'Recorded ok',
            style : {
                'position' : 'relative',
                'left' : '500px',
                'top' : '15px'
            }
        });
    },
    _showPlayback : function() {
        this._showStatus({
            src : Main.PATHS.imageFolder + "commentary/playback.png",
            next : "-",
            title : 'Playback commentary',
            id : 'Playback commentary',
            style : {
                'position' : 'relative',
                'left' : '500px',
                'top' : '15px'
            }
        });
        this.image.tween('0', '1', 1000, 'opacity', 500);
    },
    _showStatus : function(options) {
        if (this.image != null) {
            if (this.image.options.id != options.id) {
                this.image.remove();
            }
        }
        this.image = new ImagePlayer(this, options);
        this.image.preload();
        this.image.add(this.container.id);
        this.image.display();

    }
});
