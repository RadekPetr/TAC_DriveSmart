/**
 * @author Radek
 */

var Main = new Class({
    Implements : Events,
    // ----------------------------------------------------------
    initialize : function(isDev) {
        if (isDev == true) {
            // load external js libraries so they are available to the project
            var _self = this;
            this.listOfLibraries = new Array("css/radios.css","js/mylibs/video-js/video-js.css", "js/mylibs/createjs/soundjs-0.3.0.min.js", "js/mylibs/video-js/video.js", "js/mylibs/com/studywiz/core/VideoPlayer.js", "js/mylibs/com/studywiz/core/AudioPlayer.js", "js/mylibs/com/studywiz/core/Button.js", "js/mylibs/createjs/preloadjs-0.2.0.min.js", "js/mylibs/com/studywiz/units/Unit.js", "js/mylibs/com/studywiz/ui/Questions.js")
            this.listOfLibrariesCounter = 0;
            this.listOfLibraries.each( function(item, index) {
                this._loadAsset(item, index)
            }.bind(this))

        }

    },
    // ----------------------------------------------------------
    start : function() {
        var myUnit = new Unit();
        myUnit.start();
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
                this.listOfLibrariesCounter++;
                break;
            case  "css" :
                var newAsset = new Asset.css(item, {
                    id : index
                });
                break;
        }
    }.protect(),

    _loadedFinished : function() {
        console.log("Loaded " + this.listOfLibrariesCounter)
        this.listOfLibrariesCounter--;
        if (this.listOfLibrariesCounter == 0) {
            this.fireEvent('READY');
            console.log("Fired event READY");
        }
    }
})

