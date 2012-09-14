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
        var myDiv = document.getElementById('imageHolder');

        if (myDiv == null) {
            var myDiv = new Element("div", {
                id : "imageHolder"
            });
            myDiv.inject($(parentTagID));
        }
        this.image.inject(myDiv);

        this.image.setStyles(this.options.style);
    },
    show : function() {
        this.image.fade('hide', 0);
        this.image.fade('in');
    },
    // ---------------------------
    hide : function() {
        this.image.fade('out');
        this.image.dispose();
    }
})
