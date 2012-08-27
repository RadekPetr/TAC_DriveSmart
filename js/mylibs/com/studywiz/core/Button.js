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
        text : 'button text'

    },
    initialize : function(myOptions) {
        this.setOptions(myOptions);
        this.data = new Object();
        this.data.text = this.options.text;
        this.buttonElement = new Element("button", {
            id : this.id,
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
