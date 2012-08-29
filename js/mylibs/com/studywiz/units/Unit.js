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
                this.data.questions = this._setupQuestions("Text","q","next",100, 100);
                break;
            case "entry.video.done":
                this.data.audio = this._setupAudio("media/sound/country/country_vdcb1b", "audio_1", "question.sound.done");
                this.data.audio.start();
                break;
            case "question.sound.done":
                this.log("Sound done");
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
        videoPlayer.setParams(params);
        videoPlayer.add();
        videoPlayer.show();
        return videoPlayer;
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
    _setupQuestions : function(text, id, nextAction, x, y) {
        var questions = new Questions({
            style : {
                left : x + 'px',
                top : y + 'px'
            },
            value : text,
            id : id,
            next : nextAction
        }, this);

        questions.add();
        questions.show();
        return questions;
    }
});
