/**
 * @author Radek
 */
var Button = new Class({

    Implements : [Options, Events],

    options : {
        style : {
            position : 'absolute',
            top : '0px',
            left : '0px',
            width : '100px',
            height : '60px'
        },
        text : 'button text',
        id : 'element.id',
        next : 'next.action',
        parent : null
    },
    initialize : function(myOptions, myParent) {

        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.buttonElement = new Element("button", {
            id : this.options.id,
            text : this.options.text
        });

    }, // ---------------------------
    addButton : function() {
        var myDiv = new Element("div", {
            id : "buttonHolder"
        });
        myDiv.inject(document.body);
        this.buttonElement.inject(myDiv);
        this.hide();

        this.buttonElement.setStyles(this.options.style);

        this.buttonElement.addEvent("click", function() {
            this.options.parent.fireEvent("TIMELINE", {
                type : "button.clicked",
                id : this.options.id,
                next : this.options.nextAction
            });
        }.bind(this));

    },
    // ---------------------------
    show : function() {
        this.buttonElement.show();
    },
    // ---------------------------
    hide : function() {
        this.buttonElement.hide();
    }
});
