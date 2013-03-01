/**
 * @author Radek
 */

var DragNDropPlayer = new Class({

    Implements : [Options, Events],
    options : {
        data : null,
        draggable_IDs : new Array("4wd", "bike", "van", "car", "cyclist", "pedestrian", "pole", "bin"),
        id : "DragNDropPlayer",
        parent : null,
        next : ""

    },
    initialize : function(myParent, myOptions) {
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.container = null;
        this.containerID = 'container_' + this.options.id;
        this.targets = new Array();
        this.correctAreas = new Array();
        this.addEvent("TIMELINE", this.handleNavigationEvent);
    },
    myParent : function() {
        return this.options.parent;
    },
    show : function() {

    },
    hide : function() {

    },
    add : function(parentTagID, where) {
        var myParent = document.getElementById(parentTagID);
        if (this.container == null) {
            this.container = new Element("div", {
                id : this.containerID,
                styles : this.options.style
            });
            this.container.inject($m(parentTagID), where);
        }
        this._prepareAreas();
        this._prepareDraggables();
    },
    remove : function() {
        //TODO: use the container with other UI things, make suer null is handled
        this.hide();
        this.container.destroy();
        this.container = null;
        this.containerID = null;
    },
    stop : function() {
        Array.each(this.draggables, function(item, index) {
            item.stop();          
        });
       // this.getScore();
    },
    getScore : function() {

        // check if all this.targets have some draggable with correct id
        //
        var pointsPerItem = 100 / this.correctAreas.length;
        var score = 0;

        var allDraggables = new Array();
        Array.each(this.draggables, function(item, index) {
            allDraggables.append(item.drags);
        })
        // all drop areas with correct
        Array.each(this.correctAreas, function(zone, index) {
            Array.each(allDraggables, function(draggableItem) {
                if (draggableItem.isCorrect(zone) == true) {
                    score++;
                }
            })
        })
        log("Score: " + score, "%", score * pointsPerItem);
        return (score * pointsPerItem)/100;

    },
    // ----------------------------------------------------------
    // This handles all timeline events and emulates the timeline
    handleNavigationEvent : function(params) {
        switch (params.next) {
            case "Image.Ready":
                var allLoaded = this.draggables.every(function(item, index) {
                    return item.options.loaded == true;
                });
                log("Ready: ", allLoaded);
                if (allLoaded == true) {
                    this._showDraggables();
                }
                break;
        }
    },
    _prepareAreas : function() {
        var data = this.options.data.areas;
        log ("DropZones:",data );
        Array.each(data, function(dropZone, index) {
            dropZone.player = new Shape(this, dropZone);
            dropZone.player.add(this.containerID);
            dropZone.player.show();
            this.targets.push(dropZone.player.shape);
            dropZone.player.shape.store('angle', dropZone.angle);
            if (dropZone.correct != null && dropZone.correct != undefined) {
                dropZone.player.shape.store('correct', dropZone.correct);
                this.correctAreas.push(dropZone.player.shape);
            }
        }.bind(this))
    },
    _prepareDraggables : function() {
        this.draggables = new Array();
        Array.each(this.options.draggable_IDs, function(item, itemIndex) {
            var file = Main.paths.imageFolder + 'dragdrop/' + item + '.png';
            var file_top = Main.paths.imageFolder + 'dragdrop/' + item + '_top.png';
            var collumn = 0;
            if (isEven(itemIndex)) {
                var collumn = 1;
            }
            var draggable = new Draggable(this, {
                src : file,
                src_top : file_top,
                next : "Image.Ready",
                title : item,
                id : item,
                'class' : 'draggable',
                style : {
                    'left' : (425 + (100 * collumn)) + 'px',
                    'top' : (50 * itemIndex) + 'px'
                },
                droppables : this.targets
            })
            this.draggables.push(draggable);
            draggable.preload();
        }.bind(this))
    },
    _showDraggables : function() {
        Array.each(this.draggables, function(draggable, itemIndex) {
            draggable.add(this.containerID);
            draggable.show();
        }.bind(this))
    }
})

