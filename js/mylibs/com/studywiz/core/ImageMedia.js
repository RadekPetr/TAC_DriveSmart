var ImageMedia = new Class({

    Implements : [Options, Events],
    options : {
        style : {
            position : 'absolute',
            top : '0px',
            left : '0px'
        },
        src : '',
        id : 'element.id',
        next : 'next.action',
        parent : null
    },
    initialize : function(myParent, myOptions) {
        // Intial scene setup
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.image = new Asset.image(this.options.src, {
            style : this.options.style,
            id : this.options.id,
            onLoad : function() {
                this.options.parent.fireEvent("TIMELINE", {
                    type : "image.ready",
                    id : this.options.id,
                    next : this.options.next
                })
            }.bind(this)
        });
    },
    flash : function(to, from, reps, prop, dur) {

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

        //create effect
        var effect = new Fx.Tween(this.image, {
            duration : dur,
            link : 'chain'
        })
        //do it!
        for ( x = 1; x <= reps; x++) {
            effect.start(prop, from, to).start(prop, to, from);
        }
    },
    add : function(parentTagID) {
        console.log("parentTagID  " + parentTagID);
        var myParent = document.getElementById(parentTagID);
        var myDiv = myParent.getElement('div[id=imageContainer]');
        if (myDiv == null) {
            console.log("Container not found in " + parentTagID + " adding a new one");
            var myDiv = new Element("div", {
                id : "imageContainer"
            });
            myDiv.inject($(parentTagID));
        }
        this.image.inject(myDiv);

        this.image.setStyles(this.options.style);
    },
    show : function() {
        if (this.image.isVisible() == false) {
            this.image.fade('hide', 0);
            this.image.fade('in');
        }

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
    }
})
