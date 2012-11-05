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
            //log("Container not found in " + parentTagID + " adding a new one");
            this.container = new Element("div", {
                id : this.containerID,
                styles : this.options.style
            });
            this.container.inject($(parentTagID), where);
            // log(this.options.style);

        }
        //  this.options.data.emptyBkg.add(this.containerID);
        // this.options.data.emptyBkg.show();

        log(this.options.data);
        this._prepareZones(this.options.data.dropZones, "drop");
        this._prepareZones(this.options.data.rotateZones, "rotate");
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

    _prepareZones : function(data, id) {
        log("Zones: " + id);
        log(data);
        Array.each(data, function(item, index) {
            //log(item.data);
            item.player = new Shape(this, item);
            log(item);
            item.player.add(this.containerID);
            item.player.show();
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
            var draggable = new DraggableImagePlayer(this, {
                src : file,
                next : "",
                title : 'item',
                id : 'item',
                style : {
                    'left' : (425 + (100 * collumn)) + 'px',
                    'top' : (50 * itemIndex) + 'px',
                    'width' : '120px',
                    'height' : '90px'

                }
            })
            this.draggables.push(draggable);
            log(draggable);
            draggable.preload();
            draggable.add(this.containerID);
            draggable.show();
        }.bind(this))
    }
})

