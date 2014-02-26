/**
 * @author Radek
 */
function getPos(el) {
    // yay readability
    for (var lx = 0, ly = 0; el != null; lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return {
        x : lx,
        y : ly
    };
}

function stripFileExtension(filename) {
    if (filename != undefined && filename != null) {
        filename = filename.replace(/(.*)\.[^.]+$/, "$1");
    }
    return filename;
}

function isFlashSupported() {

    var flash = Browser.Plugins.Flash;
    if (flash.version >= 9) {
        return true;
    } else {
        return false;
    }
}

function isEven(n) {
    n = Number(n);
    return n === 0 || !!(n && !(n % 2));
}

function my_getDroppableCoordinates(element) {
    var rect = element.getBBox();
    var position = new Object();
    position.left = rect.x;
    position.top = rect.y;
    position.bottom = rect.y + rect.height;
    position.right = rect.x + rect.width;

    if (element.getStyle('position') == 'fixed') {
        var scroll = window.getScroll();
        position.left += scroll.x;
        position.right += scroll.x;
        position.top += scroll.y;
        position.bottom += scroll.y;
    }
    return position;
}

function detectFlash() {
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
    console.log(playerVersion);
    return {
        w3 : w3cdom,
        pv : playerVersion,
        wk : webkit,
        ie : ie,
        win : windows,
        mac : mac
    };
};

function getFeatures() {
    var featureSet = new Hash({
        supportsTouch : false,
        clickToPlay : false
    });

    featureSet.supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
    featureSet.clickToPlay = (Browser.Platform.ios == true );

    // Test as iPad
    featureSet.clickToPlay = true;
    featureSet.supportsTouch = true;

    return featureSet;
};

