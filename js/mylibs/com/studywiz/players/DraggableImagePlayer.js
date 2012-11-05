var DraggableImagePlayer = new Class({

    Implements : [Options, Events],
    Extends : ImagePlayer,
    initialize : function(myParent, myOptions) {
        // Intial scene setup
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.containerID = 'draggableImageContainer';
        this.container = null;
        this.clones = new Array();
    },
    _addEvents : function() {
        this.image.addEvent('mousedown', function(event) {
            var myClone = this.image.clone();
            this.clones.push(myClone);
            //TODO: use top version of the image
            //TODO: handle preloading of the assets
            this._addDragEvents(myClone);
            myClone.inject(this.container);
            myClone.set('class', 'draggable')
            myClone.fireEvent('mousedown', event);

        }.bind(this));
    },
    _addDragEvents : function(target) {
        // TODO: TESINTG
        var myDrag = new Drag(target, {
            snap : 0,
            onStart : function() {
                log("onStart");
            },
            onSnap : function(el) {
                log('on snap');
            },
            onComplete : function(el) {
                log('Stopped dragging');
            },
            onBeforeStart : function() {
                log("beforeStart");
            },
            onDrag : function() {

            },
            onCancel : function() {

            }
        });

    }
})
