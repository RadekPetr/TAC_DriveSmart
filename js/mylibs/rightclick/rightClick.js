/**
 *
 * Copyright 2007-2012
 *
 * Paulius Uza
 * http://www.uza.lt
 *
 * Dan Florio
 * http://www.polygeek.com
 *
 * Jaroslav Danilov
 * http://jds-transparency.com
 *
 * Project website:
 * http://code.google.com/p/custom-context-menu/
 *
 * --
 * RightClick for Flash Player.
 * Version 0.7.0 MOD
 */

var RightClick = {

    /**
     *  Constructor
     */
    init : function(object, container) {
        this.FlashObjectID = object;
        this.FlashContainerID = container;
        this.Cache = this.FlashObjectID;
        if (window.addEventListener) {
            document.oncontextmenu = function(ev) {
                RightClick.killEvents(ev);
            };
            window.addEventListener("mousedown", this.onGeckoMouse, true);
            window.addEventListener("mouseup", this.onGeckoMouseUp, true);
        } else {
            document.oncontextmenu = function() {
                if (window.event.srcElement.id == RightClick.FlashObjectID)
                    return false;
                RightClick.Cache = "nan";
            };
            document.getElementById(this.FlashContainerID).onmouseup = function() {
                document.getElementById(RightClick.FlashContainerID).rightClickUp();
            };
            document.getElementById(this.FlashContainerID).onmousedown = RightClick.onIEMouse;
        }
    },

    /**
     * GECKO / WEBKIT event overkill
     * @param {Object} eventObject
     */
    killEvents : function(eventObject) {
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
    onGeckoMouse : function(ev) {
        if (ev.button != 0) {
            RightClick.killEvents(ev);

            if (ev.target.id == RightClick.FlashObjectID && RightClick.Cache == RightClick.FlashObjectID) {
                RightClick.call();
            }
            RightClick.Cache = ev.target.id;
        }
    },
    /**
     * GECKO / WEBKIT call right click up on release
     * @param {Object} ev
     */
    onGeckoMouseUp : function(ev) {
        if (ev.button != 0) {

            RightClick.killEvents(ev);

            if (ev.target.id == RightClick.FlashObjectID && RightClick.Cache == RightClick.FlashObjectID) {

                RightClick.callUp();
            }
            RightClick.Cache = ev.target.id;
        }
    },

    /**
     * IE call right click
     */
    onIEMouse : function() {
        if (event.button > 1) {
            if (window.event.srcElement.id == RightClick.FlashObjectID && RightClick.Cache == RightClick.FlashObjectID) {
                RightClick.call();
            }
            document.getElementById(RightClick.FlashContainerID).setCapture();
            if (window.event.srcElement.id)
                RightClick.Cache = window.event.srcElement.id;
        }
    },

    /**
     * Main call to Flash External Interface
     */
    call : function() {
        if (document.getElementById(this.FlashObjectID).rightClick)
            document.getElementById(this.FlashObjectID).rightClick();
    },
    /**
     * Main call to Flash External Interface
     */
    callUp : function() {
        if (document.getElementById(this.FlashObjectID).rightClickUp)
            document.getElementById(this.FlashObjectID).rightClickUp();
    }
}