/**
 * @author Radek
 */

var Main = new Class({
    Implements : [Options, Events],
    // ----------------------------------------------------------
    initialize : function(isDev) {
    	 
        if (isDev) {
            // load external js libraries so they are available to the project

            this.listOfLibraries = ["css/style.css", "css/radios.css", "css/button.css", "js/mylibs/video-js/video-js.css", "css/progressBar.css", "css/main_menu.css", "js/mylibs/createjs/soundjs-0.3.0.min.js", "js/mylibs/video-js/video.js", "js/mylibs/com/studywiz/utils/consolelog.js", "js/mylibs/com/studywiz/utils/Utils.js", "js/mylibs/com/studywiz/utils/Array.sortOn.js", "js/mylibs/com/studywiz/loaders/MediaLoader.js", "js/mylibs/com/studywiz/loaders/DataLoader.js", "js/mylibs/com/studywiz/ui/dwProgressBar.js", "js/mylibs/com/studywiz/players/ImagePlayer.js", "js/mylibs/com/studywiz/players/VideoPlayer.js", "js/mylibs/com/studywiz/players/AudioPlayer.js", "js/mylibs/com/studywiz/ui/Button.js", "js/mylibs/com/studywiz/ui/CommentaryFeedback.js", "js/mylibs/createjs/preloadjs-0.2.0.min.js", "js/mylibs/com/studywiz/players/SequencePlayer.js", "js/mylibs/com/studywiz/players/ModulePlayer.js", "js/mylibs/com/studywiz/core/Modules.js", "js/mylibs/com/studywiz/core/User.js", "js/mylibs/com/studywiz/ui/Questions.js", "js/mylibs/com/studywiz/ui/MenuItems.js", "js/mylibs/com/studywiz/ui/Shape.js", "js/mylibs/com/studywiz/ui/Recorder.js", "js/mylibs/xml2json/xml2json.js"];

            this.listOfLibrariesCounter = 0;
            Array.each(this.listOfLibraries, function(item, index) {
                this._loadAsset(item, index);
            }.bind(this));
        }

    },
    // ----------------------------------------------------------
    start : function() {
        // var myUnit = new Unit({});
        //   myUnit.start();

        var modules = new Modules({});
        modules.start();
       

        //  myUnit.setupDebug();
    },
    // ----------------------------------------------------------
    // PRIVATE - load external js libraries so they are available to the project
    _loadAsset : function(item, index) {
        var newAsset = null;
        var fileType = item.split('.').pop();
        switch (fileType) {
            case "js" :
                newAsset = new Asset.javascript(item, {
                    id : index,
                    onLoad : function() {
                        this._loadedFinished();
                    }.bind(this)
                });
                this.listOfLibrariesCounter++;
                break;
            case  "css" :
                newAsset = new Asset.css(item, {
                    id : index
                });
                break;
        }
    }.protect(),
    _loadedFinished : function() {
        console.log("Loaded " + this.listOfLibrariesCounter);
        this.listOfLibrariesCounter--;
        if (this.listOfLibrariesCounter === 0) {
            this.fireEvent('READY');
            //console.log("Fired event READY");
        }
    }
});
