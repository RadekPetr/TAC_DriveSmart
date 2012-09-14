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
    filename = filename.replace(/(.*)\.[^.]+$/, "$1");
    return filename;
}
