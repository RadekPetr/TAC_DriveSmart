var Recorder = new Class({

    Implements : [Options, Events],
    options : {
        swiff : {
            id : 'Recorder',
            width : 640,
            height : 200,
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
            position : 'absolute'

        },
        src : 'media/flash/commentary.swf',
        id : 'element.id',
        next : 'next.action',
        loaded : false,
        parent : null,
        parentTag : 'drivesmart'

    },
    initialize : function(myParent, myOptions) {
        // Intial scene setup
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.containerID = 'recorderContainer';
        this.container = null;
        this.swiff = null;
    },
    myParent : function() {
        return this.options.parent;
    },
    add : function(parentTagID, where) {
        log("###### parentTagID  " + parentTagID);
        var myParent = document.getElementById(parentTagID);

        if (this.container == null) {
            //log("Container not found in " + parentTagID + " adding a new one");
            this.container = new Element("div", {
                id : this.containerID,
                styles : this.options.style
            });
            this.container.inject($(parentTagID), where);
            log(this.options.style);

        }
        this.options.swiff.container = this.container;
        this.swiff = new Swiff(this.options.src, this.options.swiff);

    },
    show : function() {

        this.container.fade('in');

    },
    display : function() {

        this.container.fade('show');

    },
    // ---------------------------
    hide : function() {
        if (this.container.isVisible() == true) {
            this.container.fade('out');
        }
    },
    // ---------------------------
    remove : function() {
        this.hide();

        this.container.dispose();
        this.swiff = null;
        this.container = null;
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
        return loaderInfo
    },
    preload : function() {

        //addEvent('readystatechange', function(){
        // if (['loaded', 'complete'].contains(this.readyState)) load.call(this);
        //  });
        this.image = new Asset.flash(this.options.src, {
            style : this.options.style,
            id : this.options.id,
            onLoad : function() {
                this.options.loaded = true;
                this.myParent().mediaLoader.reportProgress(this.getLoaderInfo());
                this.myParent().fireEvent("TIMELINE", {
                    type : "image.ready",
                    id : this.options.id,
                    next : this.options.next
                })
            }.bind(this)
        });
    },
    stopRecording : function() {
        Swiff.remote(this.swiff.toElement(), 'recordStop');
    },
    startRecording : function() {
        Swiff.remote(this.swiff.toElement(), 'recordStart');
    },
    startPlayback : function() {
        Swiff.remote(this.swiff.toElement(), 'playBack');
    }
})
