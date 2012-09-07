/**
 * @author Radek
 */

var Shape = new Class({

    Implements : [Options, Events],
    options : {
        data : "200,10 250,190 160,210",
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
            position : 'absolute'
        }
    },
    initialize : function(myParent, myOptions) {

        this.setOptions(myOptions);
        this.options.parent = myParent;

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
            this.svgTags(['svg', 'polygon']);
            this.shapeWrapper = new Element("svg", {
                id : this.options.id,
                xmlns : "http://www.w3.org/2000/svg",
                version : "1.1"
            });
            this.shapeWrapper.inject(myDiv);
            myDiv.inject($("drivesmart"));
        }
        this.shapeElement = new Element("polygon", {
            'id' : this.options.id,
            'points' : this.options.data

        });

        this.shapeElement.inject(this.shapeWrapper);
        // this.hide();
        this.shapeElement.setStyles(this.options.polygonStyle);
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

    }
})

