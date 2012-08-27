/**
 * @author Radek
 */

var Unit = new Class({

    Implements : [Options, Events],

    initialize : function(arguments) {
        this.setupData();
        this.setupMedia();
        this.addEvent("TIMELINE", this.handleNavigationEvent);
    },
    start : function() {
        this.data.entry_sound.play();
    },
    setupData : function(argument) {
        //TODO: define proper unit Data object or hashmap based on unit data
        this.data = new Object();
        this.data.entry_sound = new AudioPlayer("Sound_1", this);
        this.data.entry_video = new VideoPlayer("Video_1", this);
        
        
        this.data.button = new Button({
            text : "some textttt",
            style : {
                left : '150px'
            }
        });
        this.data.button.addButton();
        this.data.button.show();
        
        
        this.data.button_1 = new Button({
            text : "some other",
            style : {
                left : '250px'
            }
        });
        this.data.button_1.addButton();
        this.data.button_1.show();
    },
    setupMedia : function() {
        //TODO : split to separate methods for each media type
        this.data.entry_sound.nextAction = "entry.sound.done";
        this.data.entry_sound.setSource("media/sound/country/mp3/country_accident.mp3|media/sound/country/mp3/country_accident.ogg", "Sound_1");

        this.data.entry_video.nextAction = "entry.video.done";
        var params = new Object();
        params.source = [{
            type : "video/mp4",
            src : "media/video/country/country_cla01_next.m4v"
        }, {
            type : "video/webm",
            src : "media/video/country/country_cla01_next.webm"
        }, {
            type : "video/ogg",
            src : "media/video/country/country_cla01_next.ogg"
        }];
        params.poster = {
            src : "http://video-js.zencoder.com/oceans-clip.png"
        };
        this.data.entry_video.setParams(params);
        this.data.entry_video.addVideoPlayer();
        this.data.entry_video.show();
    },
    // This handles all timeline events and emulates the timeline
    handleNavigationEvent : function(params) {
        console.log("Timeline event");
        console.log(params);
        switch (params.next) {
            case "entry.sound.done":
                this.data.entry_video.start();
                //this.playVideo.bind(this);
                break;
            case "entry.video.done":
                this.log("Video Done");
                break;
        };
    },
    log : function(logValue) {
        console.log("****** " + logValue + " ******");
    }
});
