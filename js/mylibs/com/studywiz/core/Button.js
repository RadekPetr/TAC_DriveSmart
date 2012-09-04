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
    initialize : function(myParent, myOptions) {

        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.buttonElement = new Element("button", {
            id : this.options.id,
            text : this.options.text
        });

    }, // ---------------------------
    add : function() {
        var myDiv = document.getElementById('buttonHolder');

        if (myDiv == null) {
            var myDiv = new Element("div", {
                id : "buttonHolder"
            });
            myDiv.inject($("drivesmart"));
        }
        this.buttonElement.inject(myDiv);
        this.hide();

        this.buttonElement.setStyles(this.options.style);

        this.buttonElement.addEvent("click", function() {
            this.options.parent.fireEvent("TIMELINE", {
                type : "button.clicked",
                id : this.options.id,
                next : this.options.next
            });
        }.bind(this));

    },
    remove : function() {
        this.hide();
        var removedElement = this.buttonElement.dispose();
        var myDiv = document.getElementById('buttonHolder');
        myDiv.dispose();

    },
    // ---------------------------
    show : function() {
        // TODO : fade in
        // this.buttonElement.show();
        this.buttonElement.fade('hide');
        this.buttonElement.fade('in');
    },
    // ---------------------------
    hide : function() {
        this.buttonElement.fade('out');
        // this.buttonElement.hide();
    }
});
