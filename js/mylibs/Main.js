/**
 * @author Radek
 */

// -----------------------------
var Main = new Class({
    Implements : [Options, Events],
    // ----------------------------------------------------------
    initialize : function(isDev) {
        log("****** Version: " + Main.VERSION + " Build: " + Main.BUILD + " ******");

        if (isDev == true) {
            // load external js libraries so they are available to the project

            this.listOfLibraries = ["css/button.css", "css/commentary.css", "css/common.css", "css/dragndrop.css", "css/fonts.css", "css/loader.css", "css/main_menu.css", "css/progressbar.css", "css/questions.css", "css/radios.css", "css/sequence.css", "css/video-js.css", "js/mylibs/Base64/Base64.js", "js/mylibs/Lzw/Lzw.js", "js/mylibs/createjs/soundjs-0.5.0.min.js", "js/mylibs/video-js/video.js", "js/mylibs/com/studywiz/utils/consolelog.js", "js/mylibs/com/studywiz/ui/UIHelpers.js", "js/mylibs/com/studywiz/utils/Api.js", "js/mylibs/com/studywiz/utils/Utils.js", "js/mylibs/com/studywiz/utils/Array.sortOn.js", "js/mylibs/com/studywiz/loaders/MediaLoader.js", "js/mylibs/com/studywiz/loaders/DataLoader.js", "js/mylibs/com/studywiz/ui/dwProgressBar.js", "js/mylibs/com/studywiz/players/ImagePlayer.js", "js/mylibs/com/studywiz/players/VideoPlayer.js", "js/mylibs/com/studywiz/players/DragNDropPlayer.js", "js/mylibs/com/studywiz/players/AudioPlayer.js", "js/mylibs/com/studywiz/players/MenuPlayer.js", "js/mylibs/com/studywiz/ui/Button.js", "js/mylibs/com/studywiz/ui/CommentaryFeedback.js", "js/mylibs/createjs/preloadjs-0.4.0.min.js", "js/mylibs/com/studywiz/players/SequencePlayer.js", "js/mylibs/com/studywiz/players/ModulePlayer.js", "js/mylibs/com/studywiz/players/KeyRisksPlayer.js", "js/mylibs/com/studywiz/players/SwiffPlayer.js", "js/mylibs/com/studywiz/core/Modules.js", "js/mylibs/com/studywiz/core/User.js", "js/mylibs/com/studywiz/ui/Questions.js", "js/mylibs/com/studywiz/ui/MenuItem.js", "js/mylibs/com/studywiz/ui/Shape.js", "js/mylibs/com/studywiz/ui/Recorder.js", "js/mylibs/xml2json/xml2json.js", "js/mylibs/rightclick/rightClick.js", "js/mylibs/com/studywiz/players/Draggable.js"];

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
        UIHelpers.setMainPanel("panel_loader");
        //var style = {
        //     width : (Main.WIDTH + Main.WIDTH * 0.2) + 'px',
        //     height : (Main.HEIGHT + Main.HEIGHT * 0.2) + 'px'
        //  };
        // $m(Main.DIV_ID).setStyles(style);

        new Api(this).saveLog('info', "****** Version: " + Main.VERSION + " Build: " + Main.BUILD + " ******");

        Main.sequencePlayer = new SequencePlayer(this, {});
        this.modules = new Modules({});
        this.modules.start();
    },
    // ----------------------------------------------------------
    // PRIVATE - load external js libraries so they are available to the project
    // only used during development, the libs are otherwise minimised and merged
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

// ---------------------
// Add static variables
// ---------------------
Main.sequencePlayer = null;
Main.userTracker = null;

// Mootools safe mode
var $m = document.id;
//http://mootools.net/blog/2009/06/22/the-dollar-safe-mode/

// ---------------------
// Define CONSTANTS
// ---------------------

// the tag which will contain the app
Main.DIV_ID = 'drivesmart';

// the stage size
Main.WIDTH = 940;
Main.HEIGHT = 560;

// the main Video size
Main.VIDEO_WIDTH = 700;
Main.VIDEO_HEIGHT = 525;
Main.VIDEO_TOP = 20;
Main.VIDEO_LEFT = 20;

// Version stuff
Main.VERSION = '1.0.1';
Main.BUILD = '2013/11/19-js';

// When running on localhost (So I can use different paths when testing)
Main.IS_LOCAL = false;

// Show hide debug panel and ignore lock status
Main.DEBUG = true;

// Saves empty progress data on startup if true
Main.RESET_USER_DATA = false;

// maximum risk selectors
Main.MAX_KEY_RISK_TRIES = 5;

// Paths definitions
Main.PATHS = {
    audioFolder : 'media/sound/',
    videoFolder : 'media/video/',
    imageFolder : 'media/images/',
    flashFolder : 'media/flash/'
};

if (Main.IS_LOCAL == true) {
    Main.USER_PROGRESS_GET_URL = '/user_progress_data';
    Main.USER_PROGRESS_POST_URL = '/user_progress_data';
    Main.USER_MODULE_PROGRESS_POST_URL = '/user_progress/module_progress/';
    //Main.USER_MODULE_PROGRESS_GET_URL = '/user_progress/module_progress/';
    Main.LOG_POST_URL = '/logs';
} else {
    Main.USER_PROGRESS_GET_URL = '/user_progress';
    Main.USER_PROGRESS_POST_URL = '/user_progress';
    Main.USER_MODULE_PROGRESS_POST_URL = '/user_progress/module_progress/';
    //Main.USER_MODULE_PROGRESS_GET_URL = '/user_progress/module_progress/';
    Main.LOG_POST_URL = '/logs';
}

// Defines modules
Main.MODULES = new Hash({
    main_menu : {
        score : 0,
        title : "Dashboard",
        id : 'main_menu',
        sequenceID : '1'
    },
    intro : {
        score : 0,
        title : "Introduction",
        id : 'intro',
        sequenceID : '1'
    },
    concentration : {
        score : 0,
        title : "Concentration",
        id : 'concentration',
        sequenceID : '1'
    },
    kaps : {
        score : 0,
        title : "Keep ahead & play safe",
        id : 'kaps',
        sequenceID : '1'
    },
    scanning : {
        score : 0,
        title : "Scanning",
        id : 'scanning',
        sequenceID : '1'
    },
    country : {
        score : 0,
        title : "Country driving",
        id : 'country',
        sequenceID : '1'
    },
    urban : {
        score : 0,
        title : "Urban driving",
        id : 'urban',
        sequenceID : '1'
    }
});

Main.COLORS = ['blue', 'green', 'orange'];
