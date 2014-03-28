/**
 * @author Radek
 */

// -----------------------------
var Environment = new Class({
    Implements : [Options],
    // ----------------------------------------------------------
    options : {
        browsers : {
            ie : {
                name : "Internet Explorer",
                minVersion : 9,
                link : '<a href="http://windows.microsoft.com/en-us/internet-explorer/download-ie">Microsoft website"</a>'
            },
            safari : {
                name : "Apple Safari",
                minVersion : 5,
                link : '<a href="https://www.apple.com/safari/">Apple website</a>'
            },
            chrome : {
                name : "Google Chrome",
                minVersion : 15,
                link : '<a href="http://www.google.com/chrome">Google website</a>'
            },
            firefox : {
                name : "Mozilla Firefox",
                minVersion : 18,
                link : '<a href="http://www.mozilla.org/firefox">Mozilla website</a>'
            },
            opera : {
                name : "Opera",
                minVersion : 15,
                link : '<a href="http://www.opera.com/download">Opera website</a>'
            },
            android : {
                name : "Android",
                minVersion : 3,
                link : ' support website for your device '
            },
            unsupported : {
                name : "unsupported",
                minVersion : 0,
                link : ''
            }
        }
    },
    initialize : function() {
        this.report = this._checkBrowser();
    },
    _checkBrowser : function() {
        var browser = "unknown";
        //navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        var detectedVersion = 0;
        var browserReport = {
            name : "unknown",
            version : 0,
            supported : false,
            message : 'You seem to be using an unsupported Internet browser.<br/>Drive Smart requires Internet Explorer, Chrome, Firefox, Safari or Opera.',
            flash : this.detectFlash(),
            supportsTouch : this.supportsTouch(),
            videoAutoPlay : !(Browser.Platform.ios == true || Browser.Platform.android == true),
            hasUserMedia : this.hasGetUserMedia()
        };

        if ((Browser.ie )) {
            // detect older IE versions
            requiredBrowser = this.options.browsers.ie;
            browserReport.name = Browser.name;
            browserReport.version = Browser.version;

        } else if ((this.detectIE().ie == true && Browser.name != "opera")) {
            // detect IE11
            requiredBrowser = this.options.browsers.ie;
            browserReport.name = "ie";
            browserReport.version = this.detectIE().version;

        } else if (this.isAndroid() || Browser.Platform.android) {
            // Detect Android
            requiredBrowser = this.options.browsers.android;
            browserReport.name = "android";
            browserReport.version = parseInt(this.getAndroidVersion(), 10);

        } else {
            switch (Browser.name) {
                case "chrome":
                case "opera":
                case "safari":
                case "firefox":
                    requiredBrowser = this.options.browsers[Browser.name];
                    browserReport.name = Browser.name;
                    browserReport.version = Browser.version;
                    break;
                default:
                    requiredBrowser = this.options.browsers.unsupported;
            }
        }
        if (requiredBrowser.name == "unsupported") {
            browserReport.supported = false;
        } else {
            if (browserReport.version < requiredBrowser.minVersion) {
                browserReport.message = 'You seem to be running an outdated version of ' + requiredBrowser.name + ' on your device (' + requiredBrowser.name + ' ' + browserReport.version + '). <br/>Drive Smart requires ' + requiredBrowser.name + ' ' + requiredBrowser.minVersion + ' or newer.<br/>   <br/> Please visit  ' + requiredBrowser.link + ' to get the latest version. ';
                browserReport.supported = false;
            } else {
                browserReport.supported = true;
            }
        }
        return browserReport;
    },
    getAndroidVersion : function(ua) {
        var ua = ua || navigator.userAgent;
        var match = ua.match(/Android\s([0-9\.]*)/);
        return match ? match[1] : false;
    },
    isAndroid : function(ua) {
        var navU = ua || navigator.userAgent;
        // Android Mobile
        var isAndroidMobile = navU.indexOf('Android') > -1 && navU.indexOf('Mozilla/5.0') > -1 && navU.indexOf('AppleWebKit') > -1;

        // Android Browser (not Chrome)
        var regExAppleWebKit = new RegExp(/AppleWebKit\/([\d.]+)/);
        var resultAppleWebKitRegEx = regExAppleWebKit.exec(navU);
        var appleWebKitVersion = (resultAppleWebKitRegEx === null ? null : parseFloat(regExAppleWebKit.exec(navU)[1]));
        // var isAndroidBrowser = (isAndroidMobile && appleWebKitVersion !== null && appleWebKitVersion < 537);
        var isAndroidBrowser = (isAndroidMobile && appleWebKitVersion !== null );
        return isAndroidBrowser;
    },
    detectIE : function() {
        var ua = window.navigator.userAgent;
        var versionSplit = /[\/\.]/i;
        var versionRe = /(Version)\/([\w.\/]+)/i;
        // match for browser version
        var operaRe = /(Opera|OPR)[\/ ]([\w.\/]+)/i;
        var ieRe = /(?:(MSIE) |(Trident)\/.+rv:)([\w.]+)/i;
        // must not contain 'Opera'
        var match = ua.match(operaRe) || ua.match(ieRe);
        if (!match) {
            return ( {
                ie : false,
                version : 0
            });
        }
        if (Array.prototype.filter) {
            match = match.filter(function(item) {
                return (item != null);
            });
        } else {
            // Hello, IE8!
            for (var j = 0; j < match.length; j++) {
                var matchGroup = match[j];
                if (matchGroup == null || matchGroup == '') {
                    match.splice(j, 1);
                    j--;
                }
            }
        }
        var name = match[1].replace('Trident', 'MSIE').replace('OPR', 'Opera');
        var versionMatch = ua.match(versionRe) || match;
        var version = versionMatch[2].split(versionSplit);

        return ( {
            'name' : name,
            ie : true,
            version : parseInt(version[0], 10)
        });
    },
    detectFlash : function() {
        var UNDEF = "undefined", OBJECT = "object", SHOCKWAVE_FLASH = "Shockwave Flash", SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash", FLASH_MIME_TYPE = "application/x-shockwave-flash", EXPRESS_INSTALL_ID = "SWFObjectExprInst", ON_READY_STATE_CHANGE = "onreadystatechange", win = window, doc = document, nav = navigator;

        var w3cdom = typeof doc.getElementById != UNDEF && typeof doc.getElementsByTagName != UNDEF && typeof doc.createElement != UNDEF, u = nav.userAgent.toLowerCase(), p = nav.platform.toLowerCase(), windows = p ? /win/.test(p) : /win/.test(u), mac = p ? /mac/.test(p) : /mac/.test(u), webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // returns either the webkit version or false if not webkit
        ie = !+"\v1", // feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
        playerVersion = [0, 0, 0], d = null;
        if ( typeof nav.plugins != UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] == OBJECT) {
            d = nav.plugins[SHOCKWAVE_FLASH].description;
            if (d && !( typeof nav.mimeTypes != UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && !nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) {// navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
                plugin = true;
                ie = false;
                // cascaded feature detection for Internet Explorer
                d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                playerVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
                playerVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                playerVersion[2] = /[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
            }
        } else if ( typeof win.ActiveXObject != UNDEF) {
            try {
                var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
                if (a) {// a will return null when ActiveX is disabled
                    d = a.GetVariable("$version");
                    if (d) {
                        ie = true;
                        // cascaded feature detection for Internet Explorer
                        d = d.split(" ")[1].split(",");
                        playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
                    }
                }
            } catch(e) {
            }
        }
       // console.log(playerVersion);
        return {
            w3 : w3cdom,
            pv : playerVersion,
            wk : webkit,
            ie : ie,
            win : windows,
            mac : mac
        };
    },
    supportsTouch : function() {
        return 'ontouchstart' in window || navigator.msMaxTouchPoints;
    },
    hasGetUserMedia : function() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    }
});

var Main = new Class({
    Implements : [Options, Events],
    // ----------------------------------------------------------
    initialize : function(isDev) {
        Main.environment = new Environment().report;
        log("****** TAC Drivesmart Version: " + Main.VERSION + " Build: " + Main.BUILD + " ******");

        if (isDev == true) {
            if (Main.environment.supported == true) {
                // load external js libraries so they are available to the project

                this.listOfLibraries = ['css/button.css', 'css/common.css', 'css/dragndrop.css', 'css/fonts.css', 'css/loader.css', 'css/main_menu.css', 'css/progressbar.css', 'css/questions.css', 'css/radios.css', 'css/sequence.css', 'css/video-js.min.css', 'js/mylibs/Base64/Base64.js', 'js/mylibs/Lzw/Lzw.js', 'js/mylibs/createjs/soundjs-0.5.2.min.js', 'js/mylibs/createjs/preloadjs-0.4.1.min.js', 'js/mylibs/createjs/flashplugin-0.5.2.min.js', 'js/mylibs/video-js/video.js', 'js/mylibs/com/studywiz/ui/UIHelpers.js', 'js/mylibs/com/studywiz/utils/Api.js', 'js/mylibs/com/studywiz/utils/Utils.js', 'js/mylibs/com/studywiz/utils/Array.sortOn.js', 'js/mylibs/com/studywiz/loaders/MediaLoader.js', 'js/mylibs/com/studywiz/loaders/DataLoader.js', 'js/mylibs/com/studywiz/ui/dwProgressBar.js', 'js/mylibs/com/studywiz/players/ImagePlayer.js', 'js/mylibs/com/studywiz/players/VideoPlayer.js', 'js/mylibs/com/studywiz/players/DragNDropPlayer.js', 'js/mylibs/com/studywiz/players/AudioPlayer.js', 'js/mylibs/com/studywiz/players/MenuPlayer.js', 'js/mylibs/com/studywiz/ui/Button.js', 'js/mylibs/com/studywiz/ui/CommentaryFeedback.js', 'js/mylibs/com/studywiz/players/SequencePlayer.js', 'js/mylibs/com/studywiz/players/ModulePlayer.js', 'js/mylibs/com/studywiz/players/KeyRisksPlayer.js', 'js/mylibs/com/studywiz/players/SwiffPlayer.js', 'js/mylibs/com/studywiz/core/Modules.js', 'js/mylibs/com/studywiz/core/User.js', 'js/mylibs/com/studywiz/ui/Questions.js', 'js/mylibs/com/studywiz/ui/MenuItem.js', 'js/mylibs/com/studywiz/ui/Shape.js', 'js/mylibs/com/studywiz/ui/Recorder.js', 'js/mylibs/com/studywiz/ui/NativeRecorder.js', 'js/mylibs/xml2json/xml2json.js', 'js/mylibs/rightclick/rightClick.js', 'js/mylibs/com/studywiz/players/Draggable.js', 'js/mylibs/recorderJS/JSRecorder.js', 'js/mylibs/recorderJS/RecorderWorker.js'];
                this.listOfLibrariesCounter = 0;

                Array.each(this.listOfLibraries, function(item, index) {
                    this._loadAsset(item, index);
                }.bind(this));
            } else {
                var text = new Element("div", {
                    html : Main.environment.message,
                    'class' : 'browser_warning_text no-select',
                    'id' : 'unsupported_text'
                });
                text.inject($m(Main.DIV_ID));
            }

        } else {
            //this.start();
        }
    },
    // ----------------------------------------------------------
    start : function() {
        if (Main.environment.supported == true) {
            new Api(this).saveLog('info', "****** Version: " + Main.VERSION + " Build: " + Main.BUILD + " ******");
            Main.sequencePlayer = new SequencePlayer(this, {});
            this.modules = new Modules({});
            this.modules.start();
        } else {
            var text = new Element("div", {
                html : browserTest.message,
                'class' : 'browser_warning_text no-select',
                'id' : 'unsupported_text'
            });

            text.inject($m(Main.DIV_ID));

        }
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
    },
    _loadedFinished : function() {
        // console.log("Loaded " + this.listOfLibrariesCounter);
        this.listOfLibrariesCounter--;
        if (this.listOfLibrariesCounter === 0) {
            // console.log("Fired event READY");
            this.fireEvent('READY');

        }
    }
});

function debug() {
    if (Main.DEBUG && Main.IS_LOCAL) {
        log.apply(null, arguments);
    }
}

// ==================================================================================================================================
// ---------------------
// Add static variables
// ---------------------
Main.sequencePlayer = null;
Main.userTracker = null;
//Main.environment = new Environment().report;

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
Main.VERSION = '100';
Main.BUILD = '2014/03/28 Production Build 1';

// When running on localhost (So I can use different paths when testing)
Main.IS_LOCAL = false;

// Show hide debug panel and ignore lock status
Main.DEBUG = false;

// Production server path
//Main.RECORDER_WORKER_PATH = "/dashboard/js/mylibs/recorderJS/RecorderWorker.js";

// Staging server path
 Main.RECORDER_WORKER_PATH = "tac/drivesmart/js/mylibs/recorderJS/RecorderWorker.js";


// Saves empty progress data on startup if true
Main.RESET_USER_DATA = false;

// maximum risk selectors
Main.MAX_KEY_RISK_TRIES = 5;

// Module group intro for modules listed bellow
Main.MODULE_GROUP = ['kaps', 'scanning'];

// Paths definitions
Main.PATHS = {
    audioFolder : 'media/sound/',
    videoFolder : 'media/video/',
    imageFolder : 'media/images/',
    flashFolder : 'media/flash/',
    captionsFolder : 'media/captions/'
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
        sequenceID : '0'
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
Main.audioContext = null;
Main.audioRecorder = null;

