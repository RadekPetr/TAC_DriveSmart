/**
 * @author Radek
 */

var Unit = new Class({

    Implements : [Options, Events],
    options : {
        unitTagId : 'drivesmart'
    },
    initialize : function(myOptions) {
        this.setOptions(myOptions);

    },
    start : function() {
        // TODO handle mobile platforms: Browser.Platform.android
        this.mediaLoader = new MediaLoader(this, { });
        this.mediaLoader.add('drivesmart')

        this.addEvent("TIMELINE", this.handleNavigationEvent);

        this.buttonPosition = {
            x : 535,
            y : 415
        }

        this.panelPosition = {
            left : '5%',
            top : '25%'
        }

        this.setupData();

    },
    setupData : function() {
        var dataLoader = new DataLoader(this, {
            src : 'data/Country.xml',
            next : 'data.ready'
        });
        dataLoader.start();
    },
    setupMedia : function() {
        // Intial scene setup
        this.intro_image = new ImageMedia(this, {
            src : 'img/country_intro.png',
            next : "image.ready",
            title : 'Country Intro',
            id : 'introImage'
        });

        this.mediaLoader.options.next = 'scene.ready';
        this.mediaLoader.show();
        // TODO: load data from external source, parse it and populate
        // TODO: define proper unit Data object or hashmap based on unit data
        // TODO: preload all required media and only then allow the user to continue, show progress

        this.data = new Object();
        this.data.video = this._setupVideo("media/video/country/country_cla01_start", "video_1", "entry.video.done");

        var loaderInfo = {};
        loaderInfo[this.data.video.id] = {
            'progress' : 0,
            'weight' : 90
        };
        // making sure the video is registered with the loader before the sounds are finished
        this.mediaLoader.register(loaderInfo);
        this.data.video.preload();

        this.data.audios = new Hash();
        this.data.audios.extend({
            audio_1 : this._setupAudio("media/sound/country/country_vdcb1b", "audio_1", "question.1.sound.done")
        });
        this.data.audios.extend({
            audio_2 : this._setupAudio("media/sound/country/country_vdcb4c", "audio_2", "feedback.1.sound.done")
        });
        this.data.audios.extend({
            audio_3 : this._setupAudio("media/sound/country/country_vdcb4d", "audio_3", "next.sound.done")
        });
        this.data.audios.extend({
            audio_4 : this._setupAudio("media/sound/country/country_vdcb1f", "audio_4", "question.2.sound.done")
        });
        this.data.audios.extend({
            audio_5 : this._setupAudio("media/sound/country/country_vdcb4f", "audio_5", "feedback.2.sound.done")
        });

    },

    // This handles all timeline events and emulates the timeline
    handleNavigationEvent : function(params) {
        console.log("****** Timeline event:" + params.next);

        switch (params.next) {
            case "data.ready":
                this.setupMedia();
                break;
            case "scene.ready":
                this.mediaLoader.options.next = null;
                this.mediaLoader.hide();
                this.intro_image.add(this.options.unitTagId);
                this.intro_image.show();

                // Tests:
                // this.shape = new Shape(this, {});
                //  this.shape.add(this.options.unitTagId);

                //this.intro_image.flash('0', '1', 50, 'opacity', 250);

                this.data.start_button = this._setupButton("Start", "button_1", "start.clicked", this.buttonPosition.x, this.buttonPosition.y);
                break;
            case "start.clicked":
                this.intro_image.hide();
                var myDiv = document.getElementById('imageHolder');
                myDiv.dispose();
                this.data.start_button.remove();
                this.data.start_button = null;
                this.data.video.nextAction = "entry.video.done"
                this.data.video.show();
                this.data.video.start();

                break;
            case "entry.video.done":

                // TEST:
                // make sure the shapes are the child of the clickable area so they recieve the click events too
                var videoDiv = document.getElementById('videoHolder');
                this.shape = new Shape(this, {});
                this.shape.add('videoHolder');

                videoDiv.addEvent('click', function(e) {
                    this.fireEvent("TIMELINE", {
                        type : "risk.clicked",
                        id : this.options.id,
                        next : 'risk.selected',
                        _x : e.page.x,
                        _y : e.page.y
                    });
                    var shapeDiv = document.getElementById('shapeHolder');
                    // console.log(e.page.x + " " + e.page.y);

                }.bind(this));

                (this.data.audios.get('audio_1')).start();
                // we want to start buffering ahead of time
                this.mediaLoader.options.next = null;
                this._setVideoSource(this.data.video, "media/video/country/country_cla01_next");
                this.data.video.preload();

                break;
            case "question.1.sound.done":
                this.log("Sound done");
                this.data.questions = this._setupQuestions({
                    data : ["Slow down immediately", "Slow down as we come into the bend", "Maintain our current speed until any hazard is visible"],
                    correct : '2',
                    style : this.panelPosition
                });
                this.data.submit_button = this._setupButton("Submit answer", "button_2", "submit.1.clicked", this.buttonPosition.x, this.buttonPosition.y);
                break;
            case "submit.1.clicked":
                this.data.submit_button.remove();
                this.data.submit_button = null;
                this.data.questions.showCorrect();
                (this.data.audios.get('audio_2')).start();
                break;
            case "feedback.1.sound.done":
                (this.data.audios.get('audio_3')).start();
                break;
            case "next.sound.done":

                this.data.continue_button = this._setupButton("Continue", "button_3", "continue.clicked", this.buttonPosition.x, this.buttonPosition.y);
                break;
            case "continue.clicked":
                this.data.questions.remove();
                this.data.continue_button.remove();
                this.data.continue_button = null;
                this.data.video.options.next = "next.video.done";
                this.data.video.start();
                break;
            case "next.video.done":
                (this.data.audios.get('audio_4')).start();
                break;
            case "question.2.sound.done":
                this.log("question.2.sound.done");
                this.data.questions = this._setupQuestions({
                    data : ["Some cattle stray out in front of us, just as we come around the corner", "A farmhand on a motorbike darts out in front of us."],
                    style : this.panelPosition
                });
                this.data.submit_button = this._setupButton("Submit answer", "button_4", "submit.2.clicked", this.buttonPosition.x, this.buttonPosition.y);
                break;
            case "submit.2.clicked":
                this.data.submit_button.remove();
                this.data.submit_button = null;
                this.data.questions.showCorrect();
                (this.data.audios.get('audio_5')).start();
                break;
            case "feedback.2.sound.done":
                this.data.repeat_button = this._setupButton("Repeat", "button_5", "repeat.clicked", this.buttonPosition.x, this.buttonPosition.y);
                break;
            case "repeat.clicked":
                this.data.repeat_button.remove();
                this.data.questions.remove();
                this.data.video.remove();

                this.setupData();

                break;

            case "risk.selected":

                var el = document.getElementById('drivesmart');

                var elOffset = getPos(el);

                this.risk_image = new ImageMedia(this, {
                    src : 'img/selected_risk.png',
                    next : "none",
                    title : 'Risk',
                    id : 'Risk',
                    style : {
                        left : params._x - elOffset.x - 30,
                        top : params._y - elOffset.y - 30
                    }
                });
                this.risk_image.add('drivesmart');
                this.risk_image.show();
                break;
            case "shape.clicked":
                console.log("Shape clicked ID: " + params.id)
                break;

        };
    },
    log : function(logValue) {
        console.log("****** " + logValue + " ******");
    },
    handleMediaReady : function(nextAction) {

    },
    //---------------------- PRIVATE FUNCTIONS --------------------------------
    _setupVideo : function(filename, id, nextAction) {
        var videoPlayer = new VideoPlayer(this, {
            id : id,
            next : nextAction
        });
        videoPlayer.add(this.options.unitTagId);
        this._setVideoSource(videoPlayer, filename);
        //  videoPlayer.add(this.options.unitTagId);
        // videoPlayer.add();
        //videoPlayer.show();
        return videoPlayer;
    }.protect(),
    //------------------------------------------------------------------------
    _setVideoSource : function(player, filename) {
        var params = new Object();
        params.source = [{
            type : "video/mp4",
            src : filename + ".mp4"
        }, {
            type : "video/webm",
            src : filename + ".webm"
        }, {
            type : "video/ogg",
            src : filename + ".ogg"
        }];
        params.poster = {
            src : filename + "_first.jpg"
        };
        console.log(params)
        player.setParams(params);
    }.protect(),
    //------------------------------------------------------------------------
    _setupAudio : function(filename, id, nextAction) {
        var audioPlayer = new AudioPlayer(id, this);
        audioPlayer.nextAction = nextAction;
        audioPlayer.setSource(filename + ".mp3|" + filename + ".ogg");
        audioPlayer.preload();
        return audioPlayer;
    }.protect(),
    //------------------------------------------------------------------------
    _setupButton : function(text, id, nextAction, x, y) {
        var button = new Button(this, {
            style : {
                left : x + 'px',
                top : y + 'px'
            },
            text : text,
            id : id,
            next : nextAction
        });

        button.add(this.options.unitTagId);
        button.show();
        return button;
    }.protect(),

    //------------------------------------------------------------------------
    _setupQuestions : function(options) {
        var questions = new Questions(this, options);
        questions.add(this.options.unitTagId);
        questions.show();
        return questions;
    }
});
