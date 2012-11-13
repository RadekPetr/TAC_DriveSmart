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
        this.correctZones = 0;
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
            this.container.inject($(parentTagID), where);
        }
        this._prepareZones(this.options.data.dropZones);
        this._prepareDraggables();
    },
    remove : function() {
        //TODO: use the container with other UI things, make suer null is handled
        this.hide();
        this.container.destroy();
        this.container = null;
        this.containerID = null;
    },
    stopDrag : function() {
        Array.each(this.draggables, function(item, index) {
            item.stop();
            log(item);
        });
        this.getScore();
    },
    getScore : function() {
        //
        var pointsPerItem = 100 / this.correctZones;
        var score = 0;
        Array.each(this.draggables, function(item, index) {
            if (item.getHits() == true) {
                score += pointsPerItem;
            }
        })
        log("Score: " + score);
        return score;
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
    _prepareZones : function(data) {
        log(data);
        Array.each(data, function(item, index) {
            item.player = new Shape(this, item);
            item.player.add(this.containerID);
            item.player.show();
            this.targets.push(item.player.shape);
            item.player.shape.store('angle', item.angle);
            if (item.correct != null && item.correct != undefined) {
                item.player.shape.store('correct', item.correct);
                this.correctZones++;
            }
        }.bind(this))
    },
    _prepareDraggables : function() {
        this.draggables = new Array();
        Array.each(this.options.draggable_IDs, function(item, itemIndex) {
            var file = this.myParent().options.imageFolder + 'dragdrop/' + item + '.png';
            var file_top = this.myParent().options.imageFolder + 'dragdrop/' + item + '_top.png';
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

