/**
 * @author Radek
 */
var Button = new Class({

    Implements : [Options, Events],

    options : {
        style : {
            'position' : 'absolute',
            'top' : '0px',
            'left' : '0px',
            'width' : '140px'

        },
        'class' : 'button',
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
            text : this.options.text,
            'class' : this.options['class']
        });

    },
    myParent : function() {
        return this.options.parent;
    }, // ---------------------------
    add : function(parentTagID) {
        this.containerID = 'container_' + this.options.id;
        this.container = null;

        this.container = new Element("div", {
            id : this.containerID
        });

        this.container.inject($m(parentTagID));
        this.buttonElement.inject(this.container);
        this.hide();

        this.buttonElement.setStyles(this.options.style);

        this.buttonElement.addEvent("click", function() {
            this.myParent().fireEvent("TIMELINE", {
                type : "button.clicked",
                id : this.options.id,
                next : this.options.next
            });
        }.bind(this));
    },
    remove : function() {
        this.hide();
        var removedElement = this.buttonElement.destroy();
        this.container.destroy();
    },
    // ---------------------------
    show : function() {
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
