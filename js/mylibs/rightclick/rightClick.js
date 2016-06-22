/**
 *
 *
 * --
 * RightClick for Flash Player.
 * Version 1
 */

var RightClick = {

    /**
     *  Constructor
     */
    init: function (object, container) {
        this.FlashObjectID = object;
        this.FlashContainerID = container;

        document.oncontextmenu = function (ev) {
            RightClick.killEvents(ev);
        };
        window.addEventListener("mousedown", this.onGeckoMouse, true);
        window.addEventListener("mouseup", this.onGeckoMouseUp, true);
    },

    /**
     * GECKO / WEBKIT event overkill
     * @param {Object} eventObject
     */
    killEvents: function (eventObject) {
        if (eventObject) {
            if (eventObject.stopPropagation)
                eventObject.stopPropagation();
            if (eventObject.preventDefault)
                eventObject.preventDefault();
            if (eventObject.preventCapture)
                eventObject.preventCapture();
            if (eventObject.preventBubble)
                eventObject.preventBubble();
        }
    },

    /**
     * GECKO / WEBKIT call right click
     * @param {Object} ev
     */
    onGeckoMouse: function (ev) {
        if (ev.button != 0) {
            RightClick.killEvents(ev);
            RightClick.rightCall();

        } else {
            RightClick.leftCall();
        }
    },
    /**
     * GECKO / WEBKIT call right click up on release
     * @param {Object} ev
     */
    onGeckoMouseUp: function (ev) {
        if (ev.button != 0) {
            RightClick.killEvents(ev);
            RightClick.rightCallUp();
        } else {
            RightClick.leftCallUp();
        }
    },

    /**
     * Main call to Flash External Interface
     */
    rightCall: function () {
        if (document.getElementById(this.FlashObjectID).rightClick)
            document.getElementById(this.FlashObjectID).rightClick();
    },
    /**
     * Main call to Flash External Interface
     */
    rightCallUp: function () {
        if (document.getElementById(this.FlashObjectID).rightClickUp)
            document.getElementById(this.FlashObjectID).rightClickUp();
    },
    leftCall: function () {
        if (document.getElementById(this.FlashObjectID).leftClick)
            document.getElementById(this.FlashObjectID).leftClick();
    },
    /**
     * Main call to Flash External Interface
     */
    leftCallUp: function () {
        if (document.getElementById(this.FlashObjectID).leftClickUp)
            document.getElementById(this.FlashObjectID).leftClickUp();
    }
};
