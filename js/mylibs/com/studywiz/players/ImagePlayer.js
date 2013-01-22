var ImagePlayer = new Class({

    Implements : [Options, Events],
    options : {
        style : {
            position : 'absolute',
            top : '0px',
            left : '0px',
            opacity : '0',
            visibility : 'hidden'
        },
        'class' : '',
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
        this.containerID = 'imageContainer';
        this.container = null;
    },
    myParent : function() {
        return this.options.parent;
    },
    tween : function(to, from, reps, prop, dur, link, next) {
        //defaults
        if (!reps) {
            reps = 1;
        }
        if (!prop) {
            prop = 'opacity';
        }
        if (!dur) {
            dur = 250;
        }
        if (!link) {
            link = 'chain';
        }

        //create effect
        var effect = new Fx.Tween(this.image, {
            duration : dur,
            link : link
        })
        //do it!
        for ( x = 1; x <= reps; x++) {
            effect.start(prop, from, to).start(prop, to, from);
        }
        effect.addEvent("complete", function() {
            this.myParent().fireEvent("TIMELINE", {
                type : "tween.done",
                id : this.options.id,
                next : next
            })
        }.bind(this))
    },
    obscure : function() {
        this.image.set('class', 'blur');
    },
    add : function(parentTagID, where) {
        var myParent = document.getElementById(parentTagID);
        this.container = myParent.getElement('div[id=' + this.containerID + ']');
        if (this.container == null) {
            this.container = new Element("div", {
                id : this.containerID
            });
            this.container.inject($(parentTagID), where);
        }
        this.image.inject(this.container);
        this.image.setStyles(this.options.style);
        this._addEvents();
    },
    show : function() {
        this.image.fade('in');

    },
    stop : function() {
        
    },
    display : function() {
        this.image.fade('show');
    },
    // ---------------------------
    hide : function() {
        if (this.image.isVisible() == true) {
            this.image.fade('out');
        }
    },
    // ---------------------------
    remove : function() {
        this.hide();
        this.image.destroy();
        this.container.destroy();
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
            type : 'IMAGE'
        };
        return loaderInfo;
    },
    preload : function() {        
        this.image = new Asset.image(this.options.src, {
            style : this.options.style,
            id : this.options.id,
            'class' : this.options['class'],
            onLoad : function() {                
                this.options.loaded = true;
                if (this.myParent().mediaLoader != null && this.myParent().mediaLoader != undefined) {
                    this.myParent().mediaLoader.reportProgress(this.getLoaderInfo());
                }
                this.myParent().fireEvent("TIMELINE", {
                    type : "image.ready",
                    id : this.options.id,
                    next : this.options.next
                })
            }.bind(this)
        });
    },
    _addEvents : function() {
        //nothing here
    }
})
