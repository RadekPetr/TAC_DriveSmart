/**
 * @author Radek
 */

// -----------------------------

var Main = new Class({
    Implements : [Options, Events],
    // ----------------------------------------------------------
    initialize : function(isDev) {
        log("****** Version: " + Main.version + " Build: " + Main.build + " ******");

        if (isDev == true) {
            // load external js libraries so they are available to the project

            this.listOfLibraries = ["css/various.css", "css/dragndrop.css", "css/radios.css", "css/button.css", "js/mylibs/video-js/video-js.css", "css/progressBar.css", "css/questions.css", "css/main_menu.css", "js/mylibs/Base64/Base64.js", "js/mylibs/Lzw/Lzw.js", "js/mylibs/createjs/soundjs-0.3.0.min.js", "js/mylibs/video-js/video.js", "js/mylibs/com/studywiz/utils/consolelog.js", "js/mylibs/com/studywiz/ui/UIHelpers.js", "js/mylibs/com/studywiz/utils/Api.js", "js/mylibs/com/studywiz/utils/Utils.js", "js/mylibs/com/studywiz/utils/Array.sortOn.js", "js/mylibs/com/studywiz/loaders/MediaLoader.js", "js/mylibs/com/studywiz/loaders/DataLoader.js", "js/mylibs/com/studywiz/ui/dwProgressBar.js", "js/mylibs/com/studywiz/players/ImagePlayer.js", "js/mylibs/com/studywiz/players/VideoPlayer.js", "js/mylibs/com/studywiz/players/DragNDropPlayer.js", "js/mylibs/com/studywiz/players/AudioPlayer.js", "js/mylibs/com/studywiz/ui/Button.js", "js/mylibs/com/studywiz/ui/CommentaryFeedback.js", "js/mylibs/createjs/preloadjs-0.2.0.min.js", "js/mylibs/com/studywiz/players/SequencePlayer.js", "js/mylibs/com/studywiz/players/ModulePlayer.js", "js/mylibs/com/studywiz/players/KeyRisksPlayer.js", "js/mylibs/com/studywiz/players/SwiffPlayer.js", "js/mylibs/com/studywiz/core/Modules.js", "js/mylibs/com/studywiz/core/User.js", "js/mylibs/com/studywiz/ui/Questions.js", "js/mylibs/com/studywiz/ui/MenuItems.js", "js/mylibs/com/studywiz/ui/Shape.js", "js/mylibs/com/studywiz/ui/Recorder.js", "js/mylibs/xml2json/xml2json.js", "js/mylibs/rightclick/rightClick.js", "js/mylibs/com/studywiz/players/Draggable.js"];

            this.listOfLibrariesCounter = 0;
            Array.each(this.listOfLibraries, function(item, index) {
                this._loadAsset(item, index);
            }.bind(this));
        } else {
            //this.start();
        }
    },
    // ----------------------------------------------------------
    start : function() {
        Main.sequencePlayer = new SequencePlayer(this, {});
        this.modules = new Modules({});
        this.modules.start();
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
    },
});

// Add static variables
var $m = document.id;
//http://mootools.net/blog/2009/06/22/the-dollar-safe-mode/

Main.paths = {
    audioFolder : 'media/sound/',
    videoFolder : 'media/video/',
    imageFolder : 'media/images/',
    flashFolder : 'media/flash/'
}

Main.divID = 'drivesmart';
Main.version = '1.0';
Main.build = '2013/03/07';

// Whne  running on localhost
Main.isLocal = false;

Main.sequencePlayer = null;
Main.userTracker = null;

if (Main.isLocal == true) {
    Main.userDataStoreURL = '/user_progress_data';
} else {
    Main.userDataStoreURL = '/user_progress';
}

Main.userDataProgressURL = '/user_progress/module_progress/';
Main.logStoreURL = '/logs';

