var swiffLoaded  = null;

var SwiffPlayer = new Class({

    Implements : [Options, Events],
    options : {
        swiff : {
            id : 'Swiff',
            width : '640px',
            height : '480px',
            params : {
                allowScriptAccess : 'always',
                wmode : 'transparent'
            },
            callBacks : {
                isReady : this.isReady
            },
            container : null
        },
        style : {
            position : 'absolute',
            top : '0px',
            left : '0px',
            opacity : '0',
            visibility : 'hidden'
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
            //log("Container not found in " + parentTagID + " adding a new one");
            this.container = new Element("div", {
                id : this.containerID,
                styles : this.options.style
            });
            this.container.inject($(parentTagID), where);
            // log(this.options.style);

        }
        if (isFlashSupported() == true) {
            this.options.swiff.container = this.container;
            this.swiff = new Swiff(this.options.src, this.options.swiff);
            RightClick.init(this.options.swiff.id, this.containerID);
        } else {
            log("********************* No FLASH loading image")
            this.options.swiff.container = this.container;
            this.swiff = new ImagePlayer(this, {
                src : main.paths.imageFolder + "commentary/noflash.png",
                next : "NoFlash.Ready",
                title : 'NoFlash',
                id : 'NoFlash',
                style : {
                    'left' : '15px',
                    'top' : '15px'
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
                log("ImageNo Flash loaded");
                this.swiff.add(this.container.id);
                this.swiff.show();
        }
    },
    show : function() {

        this.container.fade('in');

    },
    display : function() {

        this.container.fade('show');

    },
    start : function(params) {
        //TODO: add option to pass parameters
        log("***************************** Calling Start");

        Swiff.remote(this.swiff.toElement(), 'startSwiff', 1, 1, 1);
    },
    startConActivity : function(params) {
        //TODO: add option to pass parameters

        Swiff.remote(this.swiff.toElement(), 'startSwiff', params.Ex, params.level, params.format);
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
        //this.hide();
        //log("Swiff remove called");
        if (this.container != null && this.container != undefined) {
          //  log("this.container.destroy(); called");

            this.container.destroy();
            // this.swiff = null;
            // this.container = null;
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
         //  log("Loaded flash", this.getLoaderInfo());
            if (this.myParent().mediaLoader != null && this.myParent().mediaLoader != undefined) {
                this.myParent().mediaLoader.reportProgress(this.getLoaderInfo());
            }
            this.myParent().fireEvent("TIMELINE", {
                type : "swiff.ready",
                id : this.options.id,
                next : this.options.next
            })
            // loaded so we hide it again
            this.container.setStyles({
                'visibility' : 'hidden'
            })
        }.bind(this);

        this.add(main.divID);
        // This is necessary for  IE as the flash only starts loding whne visible ...
        this.container.setStyles({
            'visibility' : 'visible'
        })

    }
})
