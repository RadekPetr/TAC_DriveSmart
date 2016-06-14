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
    return false;
         
    var flash = detectFlash();    
    if (flash.pv[0] >= 9) {
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



