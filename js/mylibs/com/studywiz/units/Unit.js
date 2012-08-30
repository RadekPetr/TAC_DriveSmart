/**
 * @author Radek
 */

var Unit = new Class({

    Implements : [Options, Events],

    initialize : function(arguments) {
        this.setupData();
        this.addEvent("TIMELINE", this.handleNavigationEvent);
    },
    start : function() {
        this.setupScene();
        //this.data.entry_audio.play();
    },
    setupData : function(argument) {
        //TODO: define proper unit Data object or hashmap based on unit data
        this.data = new Object();
    },
    setupScene : function() {
        // Intial scene setup
        //this.data.entry_audio = this._setupAudio("media/sound/country/mp3/country_accident", "audio_1", "entry.sound.done");

        // show video and  start button
        this.data.video = this._setupVideo("media/video/country/country_cla01_start", "video_1", "entry.video.done");
        this.data.start_button = this._setupButton("Start", "button_1", "start.clicked", 10, 470);
    },
    // This handles all timeline events and emulates the timeline
    handleNavigationEvent : function(params) {
        console.log("Timeline event");
        console.log(params);
        switch (params.next) {
            case "start.clicked":
                this.data.start_button.remove();
                this.data.start_button = null;
                this.data.video.nextAction = "entry.video.done"
                this.data.video.start();
                break;
            case "entry.video.done":
                this.data.audio = this._setupAudio("media/sound/country/country_vdcb1b", "audio_1", "question.1.sound.done");
                this.data.audio.start();
                break;
            case "question.1.sound.done":
                this.log("Sound done");
                this.data.questions = this._setupQuestions({
                    data : ["Slow down immediately", "Slow down as we come into the bend", "Maintain our current speed until any hazard is visible"],
                    correct : '2'
                });

                this.data.submit_button = this._setupButton("Submit answer", "button_2", "submit.1.clicked", 10, 470);
                break;
            case "submit.1.clicked":
                this.data.submit_button.remove();
                this.data.submit_button = null;
                this.data.questions.showCorrect();
                this.data.audio = this._setupAudio("media/sound/country/country_vdcb4c", "audio_2", "feedback.1.sound.done");
                this.data.audio.start();
                
                // we want to start buffering ahead of time
                this._setVideoSource(this.data.video, "media/video/country/country_cla01_next");
                this.data.video.start();
                this.data.video.stop();
                break;
            case "feedback.1.sound.done":
                this.data.audio = this._setupAudio("media/sound/country/country_vdcb4d", "audio_3", "next.sound.done");
                this.data.audio.start();
                break;
            case "next.sound.done":
                
                

                this.data.continue_button = this._setupButton("Continue", "button_3", "continue.clicked", 10, 470);
                break;
            case "continue.clicked":
                this.data.questions.remove();
                this.data.continue_button.remove();
                this.data.continue_button = null;
                this.data.video.nextAction = "next.video.done"
                this.data.video.start();
                break;
            case "next.video.done":
                this.data.audio = this._setupAudio("media/sound/country/country_vdcb1f", "audio_4", "question.2.sound.done");
                this.data.audio.start();
                break;
            case "question.2.sound.done":
                this.log("Sound done");
                this.data.questions = this._setupQuestions({
                    data : ["Some cattle stray out in front of us, just as we come around the corner", "A farmhand on a motorbike darts out in front of us."]
                });
                this.data.submit_button = this._setupButton("Submit answer", "button_4", "submit.2.clicked", 10, 470);
                break;
            case "submit.2.clicked":
                this.data.submit_button.remove();
                this.data.submit_button = null;
                this.data.questions.showCorrect();
                this.data.audio = this._setupAudio("media/sound/country/country_vdcb4f", "audio_5", "feedback.2.sound.done");
                this.data.audio.start();
                break;

        };
    },
    log : function(logValue) {
        console.log("****** " + logValue + " ******");
    },
    //---------------------- PRIVATE FUNCTIONS --------------------------------
    _setupVideo : function(filename, id, nextAction) {
        var videoPlayer = new VideoPlayer(id, this);
        videoPlayer.nextAction = nextAction;
        this._setVideoSource(videoPlayer, filename);
        videoPlayer.add();
        videoPlayer.show();
        return videoPlayer;
    }.protect(),
    //------------------------------------------------------------------------
    _setVideoSource : function(player, filename) {
        var params = new Object();
        params.source = [{
            type : "video/mp4",
            src : filename + ".m4v"
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
        return audioPlayer;
    }.protect(),
    //------------------------------------------------------------------------
    _setupButton : function(text, id, nextAction, x, y) {
        var button = new Button({
            style : {
                left : x + 'px',
                top : y + 'px'
            },
            text : text,
            id : id,
            next : nextAction
        }, this);

        button.add();
        button.show();
        return button;
    }.protect(),

    //------------------------------------------------------------------------
    _setupQuestions : function(options) {
        var questions = new Questions(options, this);
        questions.add();
        questions.show();
        return questions;
    }
});
