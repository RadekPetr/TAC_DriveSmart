/**
 * @author Radek
 */
var Questions = new Class({

    Implements : [Options, Events],

    options : {
        style : {
            position : 'absolute',
            top : '0px',
            left : '0px'
        },
        value : 'radio text',
        id : 'element.id',
        next : 'next.action',
        parent : null
    },
    initialize : function(myOptions, myParent) {

        this.setOptions(myOptions);
        this.options.parent = myParent;
        //  this.panelElement = new Element("input", {
        //       type : 'radio',
        //        id : 'q1',
        //       name : 'question1',
        //        value : "Question1"
        //   });


// make a panel div
// loop and inject add radio  + lable 

        this.panelElement = new Element('label', {
            'for' : 'chk1',
            html : "Some text",
            align : 'right'
        });
        var newCheckbox = new Element('input', {
            'type' : 'radio',
            'id' : 'chk1',
            'name' : 'aChk'
        });
        this.panelElement.adopt(newCheckbox);

    }, // ---------------------------
    add : function() {
        var myDiv = new Element("div", {
            id : "panelHolder"
        });
        myDiv.inject(document.body);
        this.panelElement.inject(myDiv);
        this.hide();

        this.panelElement.setStyles(this.options.style);

        this.panelElement.addEvent("click", function() {
            this.options.parent.fireEvent("TIMELINE", {
                type : "button.clicked",
                id : this.options.id,
                next : this.options.next
            });
        }.bind(this));

    },
    remove : function() {
        this.hide();
        //var removedElement = this.buttonElement.dispose();
    },
    // ---------------------------
    show : function() {
        // TODO : fade in
        // this.buttonElement.show();
        this.panelElement.fade('hide');
        this.panelElement.fade('in');
    },
    // ---------------------------
    hide : function() {
        this.panelElement.fade('out');
        // this.buttonElement.hide();
    }
});
