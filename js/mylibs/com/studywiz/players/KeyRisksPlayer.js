/**
 * @author Radek
 */

var KeyRiskPlayer = new Class({

    Implements : [Options, Events],
    options : {
        data : null,
        id : "KeyRiskPlayer",
        parent : null,
        next : ""

    },
    initialize : function(myParent, myOptions) {
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.container = null;
        this.containerID = 'container_' + this.options.id;
        this.targets = new Array();
        this.addEvent("TIMELINE", this.handleNavigationEvent);
        this.score = 0;
    },
    myParent : function() {
        return this.options.parent;
    },
    show : function() {

    },
    hide : function() {

    },
    add : function(parentTagID, where) {

        if (this.container == null) {
            this.container = new Element("div", {
                id : this.containerID,
                styles : this.options.style
            });
            this.container.inject($(parentTagID), where);
        }
        this._prepareAreas();

        this.myParent().activeVideo.container.addEvent('click', function(e) {
            this.fireEvent("TIMELINE", {
                type : "risk.clicked",
                id : this.options.id,
                next : 'risk.selected',
                _x : e.page.x,
                _y : e.page.y
            });

        }.bind(this));
    },
    remove : function() {
        //TODO: use the container with other UI things, make suer null is handled
        this.hide();
        this.container.destroy();
        this.container = null;
        this.containerID = null;
    },
    stop : function() {

    },
    getScore : function() {

        var totalScore = this.score / this.options.data.areas.length;       
        return totalScore;

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
            case "shape.clicked":
                log("Shape clicked ID: " + params.id, params);
                
                if (params.element.retrieve("selected") == false) {
                    this.score++;
                    params.element.store("selected", true);
                }
                //TODO: scoring
                break;

            case "risk.selected":
                /// the risks need to be inside some div which could be deleted later
                var el = document.getElementById(main.divID);

                var elOffset = getPos(el);
                var file = main.paths.imageFolder + 'keyrisks/selected_risk.png';
                this.risk_image = new ImagePlayer(this, {
                    src : file,
                    next : "",
                    title : 'Risk',
                    id : 'Risk',
                    style : {
                        left : params._x - elOffset.x - 30,
                        top : params._y - elOffset.y - 30
                    }
                });
                this.risk_image.preload();

                this.risk_image.add(this.myParent().activeVideo.containerID);
                this.risk_image.display();
                // TODO: wrap all risks to a div and get rid of them whne no needed
                // TODO: limit to 5

                this.risk_image.tween('0', '1', 4, 'opacity', 100);
                break;

        }
    },
    _prepareAreas : function() {
        var data = this.options.data.areas;
        log("Areas:", data);
        Array.each(data, function(area, index) {
            area.player = new Shape(this, area);
            area.player.add(this.containerID);
            area.player.show();
            this.targets.push(area.player.shape);
            area.player.shape.store ("selected", false);
        }.bind(this))
    }
})

