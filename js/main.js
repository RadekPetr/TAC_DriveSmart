/**
 * @author Radek
 */

var Main = new Class({
    Implements : Events,
    initialize : function() {
        // load external js libraries so they are available to the project
        var _self = this;
        this.listOfLibraries = new Array(
            "js/mylibs/createjs/soundjs-0.2.0.min.js",
            "js/mylibs/video-js/video.js",
            "js/mylibs/com/studywiz/core/VideoPlayer.js",
            "js/mylibs/com/studywiz/core/AudioPlayer.js",
            "js/mylibs/createjs/preloadjs-0.1.0.min.js"
            )
        this.listOfLibrariesCounter = 0;
        this.listOfLibraries.each( function(item, index) {
            this._loadLibrary(item, index)
        }.bind(this))
    },

    start : function() {
        var vp = new VideoPlayer();
        vp.addVideoPlayer("myPlayer");
        vp.setSource("bbb");
       vp.play();
        
        var sound = new AudioPlayer();
        sound.setSource ("media/sound/country/mp3/country_accident.mp3|media/sound/country/mp3/country_accident.ogg","Sound_1")
        sound.play();
    },

    // PRIVATE - load external js libraries so they are available to the project
    _loadLibrary : function(item, index) {
        var newAsset = new Asset.javascript(item, {
            id : index,
            onLoad : function() {
                // alert(item);
                this.listOfLibrariesCounter++;
                if (this.listOfLibrariesCounter == this.listOfLibraries.length) {
                    this.fireEvent('READY');
                }
            }.bind(this)
        });
    }.protect()
})

