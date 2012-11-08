/**
 * @author Radek
 */

var DragNDropPlayer = new Class({

    Implements : [Options, Events],
    options : {
        data : null,

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
        this._prepareIcons();
    },
    remove : function() {
        //TODO: use the container with other UI things, make suer null is handled
        this.hide();
        this.container.destroy();
        this.container = null;
        this.containerID = null;
    },
    // ----------------------------------------------------------
    // This handles all timeline events and emulates the timeline
    handleNavigationEvent : function(params) {
        switch (params.next) {
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
        }.bind(this))

    },
    _prepareIcons : function() {
        this.draggables = new Array();
        var images = new Array("4wd", "bike", "van", "car", "cyclist", "pedestrian", "pole", "bin");
        var file;
        Array.each(images, function(item, itemIndex) {
            var file = this.myParent().options.imageFolder + 'dragdrop/' + item + '.png';
            log(file);
            var collumn = 0;
            if (isEven(itemIndex)) {
                var collumn = 1;
            }
            var draggable = new Draggable(this, {
                src : file,
                next : "",
                title : 'item',
                id : 'item',
                style : {
                    'left' : (425 + (100 * collumn)) + 'px',
                    'top' : (50 * itemIndex) + 'px',
                    'width' : '120px',
                    'height' : '90px'

                },
                droppables : this.targets
            })
            this.draggables.push(draggable);
            log(draggable);
            draggable.preload();
            draggable.add(this.containerID);
            draggable.show();
        }.bind(this))
    }
})

