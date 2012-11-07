/**
 * @author Radek
 */

var Shape = new Class({

    Implements : [Options, Events],
    options : {
        data : "legacy#167:131:77:82,3:254:168:69,327:214:79:26,390:239:103:47",
        type : "legacy",
        id : "shape",
        parent : null,
        next : "shape.clicked",
        svgStyle : {
            'fill' : 'lime',
            'opacity' : '1'
        },
        shapeStyle : {
            'left' : "0px",
            'top' : '0px',
            position : 'absolute'
            //,
            // 'z-index' : '99998',
            // '-webkit-transform-origin-z' : '99998'
        }
    },
    initialize : function(myParent, myOptions) {

        this.setOptions(myOptions);
        this.options.parent = myParent;

        var tempArray = this.options.data.split("#");
        this.options.type = tempArray[0];
        if (this.options.type == null) {
            log("ERROR: no type defined for svg data");
        }

        this.shapes = new Array();
        this.shapesArray = new Array();
        this.container = null;
        this.containerID = 'container_' + this.options.id;

        switch (this.options.type) {
            case "legacy":
                var arrayOfShapes = tempArray[1].split(",");
                log(arrayOfShapes);

                Array.each(arrayOfShapes, function(shape, index) {
                    var temp = shape.split(":");
                    var left = Number.from(temp[0]);
                    var top = Number.from(temp[1]);
                    var width = Number.from(temp[2]);
                    var height = Number.from(temp[3]);

                    var polygon = left + "," + top + " " + left + "," + (top - height) + " " + (left + width) + "," + (top - height) + " " + (left + width) + "," + top + " " + left + "," + top;
                    this.shapes.push(polygon);
                    log("Polygon " + polygon);
                    /*
                     x:y:w:h
                     points =
                     x,y
                     x,y-h
                     x+w,y-h
                     x+w,y
                     x,y
                     */

                }.bind(this))
                break;
            case "polyline":
                break;
            case "path":

                this.shapes.push(tempArray[1]);
                log(this.shapes);
                break;
        }

    },
    myParent : function() {
        return this.options.parent;
    },
    show : function() {

    },
    hide : function() {

    },
    draw : function() {

    },
    add : function(parentTagID) {

        var myParent = document.getElementById(parentTagID);
        log(myParent);
        var myDiv = myParent.getElement('div[id=' + this.containerID + ']');
        if (myDiv == null) {
            var myDiv = new Element("div", {
                id : this.containerID
            });
            this.container = myDiv;
            // Fix for svg, no ides how it works ....
            this._svgTags(['svg', 'polygon', 'polyline', 'rect', 'path']);

            this.shapeWrapper = new Element("svg", {
                id : this.options.id,
                xmlns : "http://www.w3.org/2000/svg",
                version : "1.1",
                width : '640px',
                height : '480px'
            });
            this.shapeWrapper.inject(this.container);
        } else {
            this.container = myDiv;
            this.shapeWrapper = this.container.getElement('svg[id=' + this.options.id + ']');
        }
        this.shape = null;

        Array.each(this.shapes, function(item, index) {
            var shapeID = 'shape_' + index;
            if (this.options.type == "legacy") {
                var shapeElement = new Element("polyline", {
                    'id' : shapeID,
                    'points' : item
                });
            } else {

                var shapeElement = new Element("path", {
                    'd' : item
                });

            }

            shapeElement.inject(this.shapeWrapper);
            // this.hide();

            shapeElement.setStyles(this.options.svgStyle);

            shapeElement.addEvent('click', function(e) {
                //alert('clicked' + this.options.id);
                this.myParent().fireEvent("TIMELINE", {
                    type : "shape.event",
                    id : shapeID,
                    next : this.options.next,
                    _x : e.page.x,
                    _y : e.page.y
                });
            }.bind(this))

            shapeElement.addEvent('mouseover', function(e) {
                log('mouseover' + this.options.id);
                this.myParent().fireEvent("TIMELINE", {
                    type : "shape.event",
                    id : shapeID,
                    next : this.options.next,
                    _x : e.page.x,
                    _y : e.page.y
                });
            }.bind(this))

            shapeElement.addEvent('onOver', function(e) {
                log('mouseover' + this.options.id);
                this.myParent().fireEvent("TIMELINE", {
                    type : "shape.event",
                    id : shapeID,
                    next : this.options.next,
                    _x : e.page.x,
                    _y : e.page.y
                });
            }.bind(this));
            this.shape = shapeElement;
        }.bind(this))

        myDiv.setStyles(this.options.shapeStyle);

        myDiv.inject($(parentTagID));
        var rect = this.shape.getBBox();
        this.shape.set('width', rect.width);
        this.shape.set('height', rect.height);
        this.shape.set('left', rect.x);
        this.shape.set('top', rect.y);
        log("RECT: ");
        log(rect);

    },
    remove : function() {
        //TODO: use the container with other UI things, make suer null is handled
        this.container.destroy();
        this.container = null;
    },
    _svgTags : function(svgtags) {
        var ns = 'http://www.w3.org/2000/svg', methods = (function(proto, cls) {
            var hash = {};
            for (var f in proto) {
                if (cls.hasOwnProperty(f)) {
                    hash[f] = proto[f];
                }
            }
            return hash;
        })(Element.prototype, Element);

        svgtags.each(function(tag) {
            Element.Constructors[tag] = function(props) {
                return (Object.append(document.createElementNS(ns, tag), methods).set(props));
            };
        });
    },
    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/math/is-point-in-poly [v1.0]
    isInside : function(poly, pt) {

        for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
            ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && ( c = !c);
        return c;
    }
})

