var Draggable = new Class({
    Extends : ImagePlayer,
    Implements : [Options, Events],
    initialize : function(myParent, myOptions) {
        // Intial scene setup
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.containerID = 'draggableImageContainer';
        this.container = null;
        this.drags = new Array();

        Drag.Move.implement({
            // Drag.Move methods override to handle SVG coordinates
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
                return position;
            },
            checkDroppables : function() {
                var overed = this.getOvered().getLast();
                if (this.overed != overed) {
                    if (this.overed)
                        this.fireEvent('leave', [this.element, this.overed]);
                    if (overed)
                        this.fireEvent('enter', [this.element, overed]);
                    this.overed = overed;
                }
            },
            getOvered : function() {
                var mainEl = document.getElementById(Main.DIV_ID);
                var elOffset = getPos(mainEl);
                var overed = this.droppables.filter(function(el, i) {
                    el = this.positions ? this.positions[i] : this.getDroppableCoordinates(el);
                    var now = getPos(this.element);
                    var now2 = new Object();
                    now2.x = now.x - elOffset.x + (this.element.get('width') / 2) - Main.VIDEO_LEFT;
                    now2.y = now.y - elOffset.y + (this.element.get('width') / 2) - Main.VIDEO_TOP;
                    return (now2.x > el.left && now2.x < el.right && now2.y < el.bottom && now2.y > el.top );
                }, this);
                return overed;
            },
            isCorrect : function(zone) {
                var mainEl = document.getElementById(Main.DIV_ID);
                var elOffset = getPos(mainEl);
                zoneCoords = this.getDroppableCoordinates(zone);
                var now = getPos(this.element);
                var now2 = new Object();
                now2.x = now.x - elOffset.x + (this.element.get('width') / 2) - Main.VIDEO_LEFT;
                now2.y = now.y - elOffset.y + (this.element.get('width') / 2) - Main.VIDEO_TOP;
               // log("zone:", zone, this.element, zone.retrieve('correct'));
                var isOver = now2.x > zoneCoords.left && now2.x < zoneCoords.right && now2.y < zoneCoords.bottom && now2.y > zoneCoords.top;
                var isCorrect = (this.element.id == zone.retrieve('correct'));
                // each zone can only have one correct answer
                var result = (isCorrect == true && isOver == true && zone.retrieve('marked') != true);
                if (result) {
                    zone.store('marked', true);
                }
                return result;
            },
            // private to rotate by css
            _rotate : function(element, rotation) {
                element.setStyles({
                    'transform' : 'rotate(' + rotation + 'deg)',
                    'msTransform' : 'rotate(' + rotation + 'deg)', /* IE 9 */
                    '-webkit-transform' : 'rotate(' + rotation + 'deg)', /* Safari and Chrome */
                    '-moz-transform' : 'rotate(' + rotation + 'deg)', /* Firefox */
                    '-o-transform' : 'rotate(' + rotation + 'deg)' /* Opera */
                });
            },
            // override to add class changes
            detach : function() {
                this.handles.removeEvent('mousedown', this.bound.start);
                this.element.set('class', 'non-draggable');
                this.element.set('onselectstart', 'return false;');
                return this;
            }
        });
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
                    };
                    var myClone = this.topViewImage.clone();
                    myClone.set('id', this.options.id);
                    myClone.setStyles(styles);
                    this._addDragEvents(myClone);
                    myClone.inject(this.container);
                    myClone.fireEvent('mousedown', event);
                }.bind(this));
            }.bind(this)
        });
    },
    stop : function() {
        Array.each(this.drags, function(item, index) {
            item.detach();
        });
        this.image.removeEvents();
        this.image.set('class', 'non-draggable');
    },
    _addDragEvents : function(target) {
        // we want  to restrict the center of the dragged images to the stage size, so it does not matter how rotated they are
        var leftCorrection = target.get('width') / 2, topCorrection = target.get('height') / 2;

        var myDrag = new Drag.Move(target, {
            precalculate : false,

            limit : {
                x : [0 - leftCorrection, Main.WIDTH - leftCorrection],
                y : [0 - topCorrection, Main.HEIGHT - topCorrection]
            },
            includeMargins : false,
            droppables : this.options.droppables,
            onStart : function() {
                // nothing
            },
            onEnter : function(element, droppable) {
                var rotation = droppable.retrieve('angle');
                this._rotate(element, rotation);
            },
            onLeave : function(element, droppable) {
               // console.log(element, 'left', droppable);
                this._rotate(element, 0);
            },
            onSnap : function(el) {
                // log('on snap');
            },
            onComplete : function(el, droppable) {
               // log('Stopped dragging', el, droppable);
                target.set('class', 'draggable');
            },
            onBeforeStart : function() {
                //log("beforeStart");
                target.set('class', 'dragging');
            },
            onDrag : function() {

            },
            onCancel : function() {

            },
            onDrop : function(element, droppedOn) {
                if (droppedOn != null && droppedOn != undefined) {
                    if (droppedOn.get('id') == 'trash') {
                        element.destroy();
                    }
                }
            }
        });
        this.drags.push(myDrag);
    }
});
