/**
 * @author Radek
 */

var Shape = new Class({

    Implements : [Options, Events],
    options : {
        data : "167:131:77:82,3:254:168:69,327:214:79:26,390:239:103:47",
        id : "shape_1",
        parent : null,
        next : "next.action",
        polygonStyle : {
            'fill' : 'lime',
            'opacity' : '0.5'
        },
        shapeStyle : {
            'left' : "0px",
            'top' : '0px',
            position : 'absolute',
            'z-index' : '99998',
            '-webkit-transform-origin-z' : '99998'
        }
    },
    initialize : function(myParent, myOptions) {

        this.setOptions(myOptions);
        this.options.parent = myParent;

        var arrayOfShapes = this.options.data.split(",");
        this.polygons = new Array();
        this.polygonsArray = new Array();

        Array.each(arrayOfShapes, function(shape, index) {
            var temp = shape.split(":");
            var left = Number.from(temp[0]);
            var top = Number.from(temp[1]);
            var width = Number.from(temp[2]);
            var height = Number.from(temp[3]);

            // var test = (left + width) + "," + (top - height);
            // console.log (test);

            var polygon = left + "," + top + " " + left + "," + (top - height) + " " + (left + width) + "," + (top - height) + " " + (left + width) + "," + top + " " + left + "," + top;

            var polygonArray = [{
                x : left,
                y : top
            }, {
                x : left,
                y : (top - height)
            }, {
                x : (left + width),
                y : (top - height)
            }, {
                x : (left + width),
                y : top
            }, {
                x : left,
                y : top
            }]

            this.polygons.push(polygon);
            this.polygonsArray.push(polygonArray);

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
        console.log("Polygons " + this.polygons);
    },
    show : function() {

    },
    hide : function() {

    },
    draw : function() {

    },
    add : function() {
        var myDiv = document.getElementById('shapeHolder');

        if (myDiv == null) {
            var myDiv = new Element("div", {
                id : "shapeHolder"
            });

            // Fix for svg, no ide how it works ....
            this.svgTags(['svg', 'polygon', 'polyline']);
            this.shapeWrapper = new Element("svg", {
                id : "holder_" + this.options.id,
                xmlns : "http://www.w3.org/2000/svg",
                version : "1.1",
                width : '640px',
                height : '480px'
            });
            this.shapeWrapper.inject(myDiv);

        }

        Array.each(this.polygons, function(item, index) {
            // Fix for svg, no ide how it works ....
            this.svgTags(['svg', 'polygon', 'polyline']);
            var shapeElement = new Element("polyline", {
                'id' : 'shape_' + index,
                'points' : item

            });
            myDiv.inject($("drivesmart"));
          
            
            var elem = document.createElementNS('http://www.w3.org/2000/svg','polygon');
            elem.setStyles(this.options.polygonStyle);
            elem.setAttribute ('points', item);
          
            
           document.getElementById("holder_shape_1").appendChild(elem);

         //  elem.appendChild("<polyline points='167,131 167,49 244,49 244,131 167,131' opacity='0.5'/>")

           // shapeElement.inject(this.shapeWrapper);
            // this.hide();
          //  shapeElement.setStyles(this.options.polygonStyle);

           // shapeElement.addEvent('click', function(e) {
            //    alert('clicked' + this.id);

           // })
        }.bind(this))

        myDiv.setStyles(this.options.shapeStyle);

        

        /*ParamArray = ZoneArray[z].split(":")                    //Get Params
         setProperty(oElem,_x,82+Number(ParamArray[0]));         //Offset a bit for our backgroudns creens
         setProperty(oElem,_y,64+Number(ParamArray[1]));
         setProperty(oElem,_width,ParamArray[2]);
         setProperty(oElem,_height,ParamArray[3]);

         x:y:w:h
         points = x,y x,y-h x+w,y-h x+w,y x,y

         */

    },
    svgTags : function(svgtags) {
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

