var Draggable = new Class({

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

            myClone.fireEvent('mousedown', event);

        }.bind(this));
    },
    _addDragEvents : function(target) {
        log(this.options.targets);
        Drag.Move.implement({
            getDroppableCoordinates : function(element) {
                var rect = element.getBBox();
                var position = new Object();
                position.left = rect.x;
                position.top = rect.y;
                position.bottom = rect.y + rect.height;
                position.right = rect.x + rect.width;

                if (element.getStyle('position') == 'fixed') {
                    var scroll = window.getScroll();
                    position.left += scroll.x;
                    position.right += scroll.x;
                    position.top += scroll.y;
                    position.bottom += scroll.y;
                }
                //log("-----");
                // log(position);
                return position;
            },
            checkDroppables : function() {
                var mainEl = document.getElementById('drivesmart');
                var elOffset = getPos(mainEl);
                var overed = this.droppables.filter(function(el, i) {
                    el = this.positions ? this.positions[i] : this.getDroppableCoordinates(el);
                    var now = this.mouse.now;
                    var now2 = new Object();
                    now2.x = now.x - elOffset.x;
                    now2.y = now.y - elOffset.y;
                    return (now2.x > el.left && now2.x < el.right && now2.y < el.bottom && now2.y > el.top);
                }, this).getLast();

                if (this.overed != overed) {
                    if (this.overed)
                        this.fireEvent('leave', [this.element, this.overed]);
                    if (overed)
                        this.fireEvent('enter', [this.element, overed]);
                    this.overed = overed;
                }
            }
        })

        var myDrag = new Drag.Move(target, {
            precalculate : false,
            container : "drivesmart",
            droppables : this.options.droppables,
            onStart : function() {
                log("onStart");
            },
            onEnter : function(element, droppable) {
                console.log(element, 'entered', droppable);
                element.setStyles({
                    '-moz-transform' : 'rotate(45deg)'
                });
            },
            onLeave : function(element, droppable) {
                console.log(element, 'left', droppable);
            },
            onSnap : function(el) {
                log('on snap');
            },
            onComplete : function(el) {
                log('Stopped dragging');
                target.set('class', '');
            },
            onBeforeStart : function() {
                log("beforeStart");
                target.set('class', 'draggable');
            },
            onDrag : function() {

            },
            onCancel : function() {

            }
        });

    }
})
