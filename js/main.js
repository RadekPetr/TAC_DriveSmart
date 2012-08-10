/**
 * @author Radek
 */

var Main = new Class({
    Implements : Events,
    // ----------------------------------------------------------
    initialize : function() {
        // load external js libraries so they are available to the project
        var _self = this;
        this.listOfLibraries = new Array("js/mylibs/createjs/easeljs-0.4.2.min.js", "js/libs/jquery-1.6.2.min.js", "js/mylibs/createjs/soundjs-0.2.0.min.js", "js/mylibs/video-js/video.js", "js/mylibs/com/studywiz/core/VideoPlayer.js", "js/mylibs/com/studywiz/core/AudioPlayer.js", "js/mylibs/createjs/preloadjs-0.1.0.min.js")
        this.listOfLibrariesCounter = 0;
        this.listOfLibraries.each( function(item, index) {
            this._loadLibrary(item, index)
        }.bind(this))
    },
    // ----------------------------------------------------------
    start : function() {
        this.vp = new VideoPlayer("video_1");
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
        this.vp.setParams(params);
        this.vp.addVideoPlayer();
        this.vp.show();

        this.vp.play();
        this.vp.addEvent("TIMELINE", this._handleTimelineEvents);

        var sound = new AudioPlayer();
        sound.setSource("media/sound/country/mp3/country_accident.mp3|media/sound/country/mp3/country_accident.ogg", "Sound_1")
        sound.play();
        // vp.hide();
    },
    // ----------------------------------------------------------
    // PRIVATE - load external js libraries so they are available to the project
    _loadLibrary : function(item, index) {
        var newAsset = new Asset.javascript(item, {
            id : index,
            onLoad : function() {
                this.listOfLibrariesCounter++;
                if (this.listOfLibrariesCounter == this.listOfLibraries.length) {
                  this.fireEvent('READY');
                    console.log ("Fired event READY");
                }
            }.bind(this)
        });
    }.protect(),
    // ----------------------------------------------------------
    // PRIVATE - 
    _handleTimelineEvents : function(params) {
        console.log (params);
        console.log ("Got  event TIMELINE");
    }.protect()
})

