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

// LZW-compress a string

function lzw_encode(s) {
    var dict = {};
    var data = (s + "").split("");
    var out = [];
    var currChar;
    var phrase = data[0];
    var code = 256;
    for (var i = 1; i < data.length; i++) {
        currChar = data[i];
        if (dict[phrase + currChar] != null) {
            phrase += currChar;
        } else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase = currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var i = 0; i < out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }
    return out.join("");
}

// Decompress an LZW-encoded string
function lzw_decode(s) {
    var dict = {};
    var data = (s + "").split("");
    var currChar = data[0];
    var oldPhrase = currChar;
    var out = [currChar];
    var code = 256;
    var phrase;
    for (var i = 1; i < data.length; i++) {
        var currCode = data[i].charCodeAt(0);
        if (currCode < 256) {
            phrase = data[i];
        } else {
            phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
        }
        out.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
    }
    return out.join("");
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
    // log("-----");
    // log(position);
    return position;
}

