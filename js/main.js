/**
 * @author Radek
 */

var Main = new Class({
    Implements : Events,
    // ----------------------------------------------------------
    initialize : function() {

        // load external js libraries so they are available to the project
        var _self = this;
        this.listOfLibraries = new Array("js/mylibs/video-js/video-js.css", "js/mylibs/createjs/easeljs-0.4.2.min.js", "js/libs/jquery-1.6.2.min.js", "js/mylibs/createjs/soundjs-0.2.0.min.js", "js/mylibs/video-js/video.js", "js/mylibs/com/studywiz/core/VideoPlayer.js", "js/mylibs/com/studywiz/core/AudioPlayer.js", "js/mylibs/com/studywiz/core/Button.js", "js/mylibs/createjs/preloadjs-0.1.0.min.js", "js/mylibs/com/studywiz/units/Unit.js", "js/mylibs/com/studywiz/ui/Questions.js")
        this.listOfLibrariesCounter = 0;
        this.listOfLibraries.each( function(item, index) {
            this._loadAsset(item, index)
        }.bind(this))

    },
    // ----------------------------------------------------------
    start : function() {
        var myUnit = new Unit();

        myUnit.start();
        // this.vp.start();
        // this.vp.addEvent("TIMELINE", this._handleTimelineEvents);

        // var sound = new AudioPlayer("Sound_1");
        // sound.addEvent("TIMELINE", this._handleTimelineEvents);
        // sound.nextAction = "entry.sound.done";
        // sound.setSource("media/sound/country/mp3/country_accident.mp3|media/sound/country/mp3/country_accident.ogg", "Sound_1")
        // sound.play();

        // vp.hide();
        //   alert("will pause");
        //      this.vp.pause();
        //   alert("will resume");
        // this.vp.start();

        //    console.log ("Video "  + this.vp.nextAction);
        // console.log ("Audio "  + sound.nextAction);
    },
    // ----------------------------------------------------------
    // PRIVATE - load external js libraries so they are available to the project
    _loadAsset : function(item, index) {
        var fileType = item.split('.').pop();
        switch (fileType) {
            case "js" :
                var newAsset = new Asset.javascript(item, {
                    id : index,
                    onLoad : function() {

                        this._loadedFinished();
                    }.bind(this)
                });
                break;
            case  "css" :
                var newAsset = new Asset.css(item, {
                    id : index,
                    onLoad : function() {

                        this._loadedFinished();
                    }.bind(this)
                });
                break;
        }
    }.protect(),

    _loadedFinished : function() {
        this.listOfLibrariesCounter++;
        if (this.listOfLibrariesCounter == this.listOfLibraries.length) {
            this.fireEvent('READY');
            console.log("Fired event READY");
        }
    },
    // ----------------------------------------------------------
    // PRIVATE - handle events for timeline
    _handleTimelineEvents : function(params) {
        console.log(params);
        console.log("Got  event TIMELINE");

        switch (params.next) {
            case "entry.sound.done":

                break;
            case "entry.video.done":
                console.log("Finished");
                break;

        }
    }.protect()
})

