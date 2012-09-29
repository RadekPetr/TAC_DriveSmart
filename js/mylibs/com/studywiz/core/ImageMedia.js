var ImageMedia = new Class({

    Implements : [Options, Events],
    options : {
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
        parentTag : 'drivesmart'
    },
    initialize : function(myParent, myOptions) {
        // Intial scene setup
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.image = new Asset.image(this.options.src, {
            style : this.options.style,
            id : this.options.id,
            onLoad : function() {
                this.options.loaded = true;
                this.options.parent.fireEvent("TIMELINE", {
                    type : "image.ready",
                    id : this.options.id,
                    next : this.options.next
                })
            }.bind(this)
        });
        this.containerID = 'imageContainer';
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
            this.options.parent.fireEvent("TIMELINE", {
                type : "tween.done",
                id : this.options.id,
                next : next
            })
        }.bind(this))
    },
    add : function(parentTagID, where) {
        console.log("parentTagID  " + parentTagID);
        var myParent = document.getElementById(parentTagID);
        var myDiv = myParent.getElement('div[id=' + this.containerID + ']');
        if (myDiv == null) {
            console.log("Container not found in " + parentTagID + " adding a new one");
            var myDiv = new Element("div", {
                id : this.containerID
            });
            myDiv.inject($(parentTagID), where);
        }
        this.image.inject(myDiv);

        this.image.setStyles(this.options.style);
    },
    show : function() {
        

            this.image.fade('in');
       

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
        this.image.dispose();
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
            ref : this
        };
        return loaderInfo
    },
    preload : function() {
        // do nothing
    }
})
