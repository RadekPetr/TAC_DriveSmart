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
        this.drags = new Array();

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
            },
            checkDropped : function() {
                var mainEl = document.getElementById('drivesmart');
                var elOffset = getPos(mainEl);
                var overed = this.droppables.filter(function(el, i) {
                    el = this.positions ? this.positions[i] : this.getDroppableCoordinates(el);
                    var now = getPos(this.element);
                    var now2 = new Object();
                    now2.x = now.x - elOffset.x + this.element.width / 2;
                    now2.y = now.y - elOffset.y + this.element.width / 2;

                    return (now2.x > el.left && now2.x < el.right && now2.y < el.bottom && now2.y > el.top);
                }, this).getLast();

                if (overed) {
                    log(overed.retrieve('correct'));
                    log(this.element.id);

                    //this.fireEvent('dropped', [this.element, overed]);
                    if (this.element.id == overed.retrieve('correct')) {
                        log("1 Correct");
                        return true;
                    } else {
                        log("1 False");
                        return false;
                    }
                }

            },
            _rotate : function(element, rotation) {
                element.setStyles({
                    'transform' : 'rotate(' + rotation + 'deg)',
                    'msTransform' : 'rotate(' + rotation + 'deg)', /* IE 9 */
                    '-webkit-transform' : 'rotate(' + rotation + 'deg)', /* Safari and Chrome */
                    '-moz-transform' : 'rotate(' + rotation + 'deg)', /* Firefox */
                    '-o-transform' : 'rotate(' + rotation + 'deg)' /* Opera */
                });
            },
            detach : function() {
                this.handles.removeEvent('mousedown', this.bound.start);
                this.element.set('class', 'non-draggable');
                this.element.set('onselectstart', 'return false;');
                return this;
            }
        })
    },
    _addEvents : function() {
        this.topViewImage = new Asset.image(this.options.src_top, {
            id : this.options.id,
            onLoad : function() {
                this.image.addEvent('mousedown', function(event) {
                    var styles = {
                        left : this.options.style.left,
                        top : this.options.style.top,
                        position : 'absolute'
                    }

                    //   var myClone = new Asset.image(this.options.src_top, {
                    //     style : styles,
                    //      id : this.options.id
                    //  });

                    var myClone = this.topViewImage.clone();
                    myClone.set('id', this.options.id);

                    myClone.setStyles(styles);
                    this.clones.push(myClone);

                    //TODO: handle preloading of the assets

                    this._addDragEvents(myClone);
                    myClone.inject(this.container);
                    myClone.fireEvent('mousedown', event);
                }.bind(this));
            }.bind(this)
        });

        //var myClone = new Asset.image(this.options.src_top, {
        //   style : styles,
        //    id : this.options.id
        //  });

    },
    stop : function() {
        Array.each(this.drags, function(item, index) {
            item.detach();
        })

        this.image.removeEvents();
        this.image.set('class', 'non-draggable');
    },
    _addDragEvents : function(target) {
        var myDrag = new Drag.Move(target, {
            precalculate : false,
            container : "drivesmart",
            droppables : this.options.droppables,
            onStart : function() {
                // nothing
            },
            onEnter : function(element, droppable) {
                var rotation = droppable.retrieve('angle');
                log(element, 'entered', droppable, rotation);
                this._rotate(element, rotation);
            },
            onLeave : function(element, droppable) {
                console.log(element, 'left', droppable);
                this._rotate(element, 0);
            },
            onSnap : function(el) {
                log('on snap');
            },
            onComplete : function(el, droppable) {
                log('Stopped dragging', el, droppable);
                target.set('class', 'draggable');
                // this.checkDropped();
            },
            onBeforeStart : function() {
                log("beforeStart");
                target.set('class', 'dragging');
            },
            onDrag : function() {

            },
            onCancel : function() {

            },
            onDropped : function(element, droppedOn) {
                log(element, 'dropped', droppedOn);
            }
        });
        this.drags.push(myDrag);

    },
    getHits : function() {
        var correct = false;
        Array.each(this.drags, function(item, index) {
            if (item.checkDropped() == true) {
                log("Correct");
                correct = true;
            }
        })

        return correct;
    }
})
