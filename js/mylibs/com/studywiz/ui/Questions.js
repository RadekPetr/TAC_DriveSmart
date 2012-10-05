/**
 * @author Radek
 */
var Questions = new Class({

    Implements : [Options, Events],

    options : {
        style : {
            position : 'absolute',
            top : '0px',
            left : '0px',
            'background-color' : '#464646',
            'float' : 'left',
            'border-radius' : '1em 1em 1em 1em',
            'text-align' : 'left',
            'padding' : '8px 8px 8px 8px',
            'font-family' : 'Arial',
            '-moz-border-radius' : '0.5em 0.5em 0.5em 0.5em',
            'background' : 'rgba(0, 0, 0, 0.6)',
            'width' : '550px',
            'opacity' : '0',
            'visibility' : 'hidden'
        },

        data : ["Q1", "Q2", "Q3"],
        id : 'element.id',
        next : 'next.action',
        correct : null,
        parent : null
    },
    initialize : function(myParent, myOptions) {

        this.setOptions(myOptions);
        this.options.parent = myParent;

        this.panel = new Element("div", {
            id : "questionPanel"
        });

        //this.options.data.each( function(item, index) {

        Array.each(this.options.data, function(question, index) {

            var radio = new Element('input', {
                'type' : 'radio',
                'id' : "item_" + index,
                'group' : 'questionPanel',
                'name' : 'question_item'
            })

            var label = new Element('label', {
                'for' : "item_" + index,
                'html' : question.text,
                'id' : "item_label_" + index
            });
            label.setStyles({
                'color' : '#FFFFFF',
                'display' : 'block',
                'margin-left' : '18px'
            })

            var paragraph = new Element('p', {});
            paragraph.adopt(radio);
            paragraph.adopt(label);

            this.panel.adopt(paragraph);

        }.bind(this))
    },
    myParent : function() {
        return this.options.parent;
    }, // ---------------------------
    add : function(parentTagID) {
        var myParent = document.getElementById(parentTagID);
        var myDiv = myParent.getElement('div[id=panelContainer]');
        if (myDiv == null) {
            var myDiv = new Element("div", {
                id : "panelContainer"
            });
            myDiv.inject($(parentTagID));
        }

        myDiv.adopt(this.panel);

        this.panel.inject(myDiv);
        // this.panel.fade('hide', 0);

        this.panel.setStyles(this.options.style);

        this.panel.addEvent("click", function() {
            this.myParent().fireEvent("TIMELINE", {
                type : "panel.clicked",
                id : this.options.id,
                next : this.options.next
            });
        }.bind(this));

    },
    remove : function() {
        this.hide();
        var removedElement = this.panel.dispose();
        document.getElementById('panelContainer').dispose();
    },
    // ---------------------------
    show : function() {
        if (this.panel.style.opacity == 0) {
            //this.panel.fade('hide', 0);
            this.panel.fade('in');
        }

    },
    // ---------------------------
    hide : function() {
        if (this.panel.style.opacity > 0) {
            this.panel.fade('out');
        }
    },
    showCorrect : function() {

        Array.each(this.options.data, function(question, index) {

            var label = document.getElementById("item_label_" + index);
            var radio = document.getElementById("item_" + index);

            console.log("Disabling");
            console.log(radio);
            radio.set('disabled', true);

            if (question.correct == false) {
                label.setStyles({
                    'color' : '#CCCCCC'
                })
            } else {
                label.setStyles({
                    'color' : '#00FF00',
                    'font-weight' : 'bold'
                })
            }

        }.bind(this));
    }
});
