/**
 * @author Radek
 */

var Shape = new Class({

    Implements : [Options, Events],
    options : {
        data : "167:131:77:82,3:254:168:69,327:214:79:26,390:239:103:47",
        id : "shape",
        parent : null,
        next : "shape.clicked",
        polygonStyle : {
            'fill' : 'lime',
            'opacity' : '0'
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

        var arrayOfShapes = this.options.data.split(",");
        this.polygons = new Array();
        this.polygonsArray = new Array();
        this.container = null;
        this.containerID = 'shapeContainer';

        Array.each(arrayOfShapes, function(shape, index) {
            var temp = shape.split(":");
            var left = Number.from(temp[0]);
            var top = Number.from(temp[1]);
            var width = Number.from(temp[2]);
            var height = Number.from(temp[3]);

            var polygon = left + "," + top + " " + left + "," + (top - height) + " " + (left + width) + "," + (top - height) + " " + (left + width) + "," + top + " " + left + "," + top;
            this.polygons.push(polygon);
            console.log("Polygon " + polygon);
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
    },
    show : function() {

    },
    hide : function() {

    },
    draw : function() {

    },
    add : function(parentTagID) {

        var myParent = document.getElementById(parentTagID);
        console.log(myParent);
        var myDiv = myParent.getElement('div[id=' + this.containerID + ']');
        if (myDiv == null) {
            var myDiv = new Element("div", {
                id : this.containerID
            });
            this.container = myDiv;
            // Fix for svg, no ide how it works ....
            this._svgTags(['svg', 'polygon', 'polyline']);

            this.shapeWrapper = new Element("svg", {
                id : "holder" + this.options.id,
                xmlns : "http://www.w3.org/2000/svg",
                version : "1.1",
                width : '640px',
                height : '480px'
            });
            this.shapeWrapper.inject(this.container);
        }

        Array.each(this.polygons, function(item, index) {
            var shapeID = 'shape_' + index;
            var shapeElement = new Element("polyline", {
                'id' : shapeID,
                'points' : item
            });

            shapeElement.inject(this.shapeWrapper);
            // this.hide();
            shapeElement.setStyles(this.options.polygonStyle);

            shapeElement.addEvent('click', function(e) {
                //alert('clicked' + this.options.id);
                this.options.parent.fireEvent("TIMELINE", {
                    type : "shape.clicked",
                    id : shapeID,
                    next : this.options.next,
                    _x : e.page.x,
                    _y : e.page.y
                });
            }.bind(this))
        }.bind(this))

        myDiv.setStyles(this.options.shapeStyle);

        myDiv.inject($(parentTagID));
    },
    remove : function() {
        //TODO: use the container with other UI things, make suer null is handled
        this.container.dispose();
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

