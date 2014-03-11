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

        var data = this.options.data;
        var tempArray = data.split("#");
        this.options.type = tempArray[0];
        if (this.options.type == null) {
            debug("ERROR: no type defined for svg data");
        }

        this.shapes = new Array();
        this.shapesArray = new Array();
        this.container = null;
        this.shapes.push(tempArray[1]);

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
        var divID = 'container_shape';
        var svgID = 'svg_wrapper';
        var myDiv = myParent.getElement('div[id=' + divID + ']');

        if (myDiv == null) {
            var myDiv = new Element("div", {
                id : divID
            });
            this.container = myDiv;
            // Fix for svg, no idea how it works ....
            this._svgTags(['svg', 'polygon', 'polyline', 'rect', 'path']);

            this.shapeWrapper = new Element("svg", {
                id : svgID,
                xmlns : "http://www.w3.org/2000/svg",
                version : "1.1",
                width : Main.VIDEO_WIDTH + 'px',
                height : Main.VIDEO_HEIGHT + 'px'
            });

            this.shapeWrapper.inject(this.container);
        } else {
            this.container = myDiv;
            tempID = 'container_shape';
            this.shapeWrapper = this.container.getElement('svg[id=' + svgID + ']');
        }
        this.shape = null;

        Array.each(this.shapes, function(item, index) {
            var shapeID = 'shape_' + index;
            var shapeElement = new Element("path", {
                'd' : item,
                id : this.options.id
            });

            shapeElement.inject(this.shapeWrapper);
            // this.hide();
            shapeElement.setStyles(this.options.svgStyle);
            shapeElement.addEvent('click', function(e) {
                this.myParent().fireEvent("TIMELINE", {
                    type : "shape.event",
                    id : shapeID,
                    next : this.options.next,
                    element : shapeElement,
                    _x : e.page.x,
                    _y : e.page.y
                });
            }.bind(this));

            this.shape = shapeElement;
        }.bind(this));

        myDiv.setStyles(this.options.shapeStyle);
        myDiv.inject($m(parentTagID));
    },
    remove : function() {
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

    //TODO: delete ?
    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/math/is-point-in-poly [v1.0]
    isInside : function(poly, pt) {

        for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
            ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && ( c = !c);
        return c;
    }
}); 