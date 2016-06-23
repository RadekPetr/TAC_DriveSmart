var swiffLoaded = null;

var SwiffPlayer = new Class({

    Implements : [Options, Events],
    options : {
        swiff : {
            id : 'Swiff',
            width : Main.VIDEO_WIDTH + 'px',
            height : Main.VIDEO_HEIGHT + 'px',
            params : {
                allowScriptAccess : 'always',
                wmode : 'transparent',
                autoplay : 'true'
            },
            callBacks : {
                isReady : this.isReady
            },
            container : null
        },
        style : {
            position : 'absolute',
            opacity : '0',
            visibility : 'hidden',
            left : Main.VIDEO_LEFT + 'px',
            top : Main.VIDEO_TOP + 'px'
        },
        src : '',
        id : 'element.id',
        next : 'next.action',
        loaded : false,
        parent : null,
        parentTag : null

    },
    initialize : function(myParent, myOptions) {
        // Intial scene setup
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.containerID = 'swiff_container';
        //_' + this.options.id;
        this.container = null;
        this.swiff = null;
        swiffLoaded = null;
    },
    myParent : function() {
        return this.options.parent;
    },
    add : function(parentTagID, where) {

        var myParent = document.getElementById(parentTagID);

        if (this.container == null) {
            this.container = new Element("div", {
                id : this.containerID,
                styles : this.options.style
            });
            this.container.inject($m(parentTagID), where);

        }

        if (isFlashSupported() == true) {
            
            this.options.swiff.container = this.container;
            this.swiff = new Swiff(this.options.src, this.options.swiff);
        } else {
            debug("********************* No FLASH loading image");
            this.options.swiff.container = this.container;
            this.swiff = new ImagePlayer(this, {
                src : Main.PATHS.imageFolder + "commentary/noflash.png",
                next : "NoFlash.Ready",
                title : 'NoFlash',
                id : 'NoFlash',
                style : {
                    'left' : '530px',
                    'top' : '15px',
                    'width' : '100%'
                }
            });
            this.addEvent("TIMELINE", this.handleNavigationEvent);
            this.swiff.preload();

        }

    },
    handleNavigationEvent : function(params) {
        switch (params.next) {
            case "NoFlash.Ready":
                this.removeEvents("TIMELINE");
                this.swiff.add(this.container.id);
                this.swiff.show();
        }
    },
    show: function () {
        this.container.fade('in');
        var myMask = new Mask(this.options.swiff.id, {
            style: {
                'background': 'rgba(00,00,00,0.001)'
            },
            id: "Mask_" + this.options.swiff.id
        });
        myMask.show();
        RightClick.init(this.options.swiff.id, this.containerID);
    },
    display: function () {
        this.container.fade('show');               
        var myMask = new Mask(this.options.swiff.id, {
            style: {
                'background': 'rgba(00,00,00,0.001)'
            },
            id: "Mask_" + this.options.swiff.id
        });
        myMask.show();
        RightClick.init(this.options.swiff.id, this.containerID);
    },
    start : function(params) {

        Swiff.remote(this.swiff.toElement(), 'startSwiff', 1, 1, 1);
        this.swiff.toElement().focus();
    },
    stop : function() {

    },
    startConActivity : function(params) {
        Swiff.remote(this.swiff.toElement(), 'startSwiff', params.Ex, params.level, params.format);
         this.swiff.toElement().focus();
         // we need to focus on the flash element to capture keypresses, the movie calls this in the timer update every second in case the users changed the focus elsewhere
         focusOnMe = function() {            
            this.swiff.toElement().focus();
        }.bind(this);
    },
    // ---------------------------
    hide : function() {
        if (this.container != null) {
            if (this.container.isVisible() == true) {
                this.container.fade('out');
            }
        }
    },
    // ---------------------------
    remove : function() {
        if (this.container != null && this.container != undefined) {
            RightClick.remove();
            this.container.destroy();
        }
    },
    // ----------------------------------------------------------
    getLoaderInfo : function() {
        var loaderInfo = new Object();
        var progress = 0;
        if (this.options.loaded == true) {
            progress = 1;
        }
        loaderInfo[this.options.id] = {
            'progress' : progress,
            'weight' : 1,
            ref : this,
            type : 'FLASH'
        };
        return loaderInfo;
    },
    preload : function() {
        swiffLoaded = function() {
            this.options.loaded = true;
            this.myParent().fireEvent("TIMELINE", {
                type : "swiff.ready",
                id : this.options.id,
                next : this.options.next
            });
            // loaded so we hide it again
            this.container.setStyles({
                'visibility' : 'hidden'
            });
        }.bind(this);

        this.add(Main.DIV_ID);
        // This is necessary for  IE as the flash only starts loading when visible ...
        this.container.setStyles({
            'visibility' : 'visible',
            'opacity' : '1'
        });

    }
});
