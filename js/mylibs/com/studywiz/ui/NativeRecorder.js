var NativeRecorder = new Class({

    Implements : [Options, Events],
    options : {
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
        this.player = null;
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
        }
        //-------------------------------
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
        if (this.image != null) {
            this.image.remove();
            this.image = null;
        }
        if (this.player != null) {
            this.player.destroy();
        }
        this.hide();
        this.container.destroy();
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
            var buffers = Main.audioRecorder.getBuffer( function(buffer) {
                this._gotBuffer(buffer);
            }.bind(this));
        }
    },
    startRecording : function() {
        if (Main.audioRecorder) {
            Main.audioRecorder.clear();
            Main.audioRecorder.record();
            this.recorded = true;
            this._showRecording();
        }
    },
    _gotBuffer : function(buffer) {
        Main.audioRecorder.exportWAV( function(blob) {
            this._doneEncoding(blob);
        }.bind(this));
    },
    _doneEncoding : function(blob) {
        this.recordedSound = window.URL.createObjectURL(blob);
        this._showRecordedOk();
    },
    startPlayback : function() {
        if (this.player != null) {
            // this.player.stop();
            this.player.destroy();
        }
        this.player = new Element("audio", {
            id : "playback",
            'src' : this.recordedSound,
            'autoplay' : true
        });
        this._showPlayback();
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
                    this._gotStream(stream);
                }.bind(this), function(e) {
                    alert('Access to microphone denied. Please check your browser settings.');
                    Main.audioRecorder = null;
                    this._showMicNotReady();
                    //console.log(e);
                    new Api(this).saveLog('warning', "*** HTML5 recorder - Access to microphone denied ****");
                });
            }
        } else {
            alert('Your Browser does not support Audio API. Sound cannot be recorded.');
            this._showMicNotReady();
            new Api(this).saveLog('error', "*** Could not getUserMedia ****");
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

    _gotStream : function(stream) {
        inputPoint = Main.audioContext.createGain();
        // Create an AudioNode from the stream.
        realAudioInput = Main.audioContext.createMediaStreamSource(stream);
        audioInput = realAudioInput;
        // audioInput = this._convertToMono(realAudioInput);
        audioInput.connect(inputPoint);
        var config = new Object();

        if (Main.IS_LOCAL) {
            config.workerPath = "js/mylibs/recorderJS/RecorderWorker.js";

        } else {
            config.workerPath = Main.RECORDER_WORKER_PATH;
        }

        Main.audioRecorder = new JSRecorder(inputPoint, config);
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
                'top' : '15px',
                'width' : '50px'
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
                'top' : '15px',
                'width' : '50px'
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
                'top' : '15px',
                'width' : '80px'
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
                'top' : '15px',
                'width' : '50px'
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
                'top' : '15px',
                'width' : '50px'
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
