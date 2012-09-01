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
            'background' : 'rgba(0, 0, 0, 0.6)'            
        },

        data : ["Q1", "Q2", "Q3"],
        id : 'element.id',
        next : 'next.action',
        correct : null,
        parent : null
    },
    initialize : function(myOptions, myParent) {

        this.setOptions(myOptions);
        this.options.parent = myParent;

        this.panel = new Element("div", {
            id : "questionPanel"
        });

        this.options.data.each( function(item, index) {

            var radio = new Element('input', {
                'type' : 'radio',
                'id' : "item_" + index,
                'group' : 'questionPanel',
                'name' : 'question_item'
            })

            var label = new Element('label', {
                'for' : "item_" + index,
                'html' : item,
                'id' : "item_label_" + index
            });
            label.setStyles({
                'color' : '#FFFFFF'
            })

            var paragraph = new Element('p', {});
            paragraph.adopt(radio);
            paragraph.adopt(label);

            this.panel.adopt(paragraph);

        }.bind(this))
    }, // ---------------------------
    add : function() {
        var myDiv = document.getElementById('panelHolder');
        if (myDiv == null) {
            var myDiv = new Element("div", {
                id : "panelHolder"
            });
            myDiv.inject($("drivesmart"));
        }

        myDiv.adopt(this.panel);

        this.panel.inject(myDiv);
        this.hide();

        this.panel.setStyles(this.options.style);

        this.panel.addEvent("click", function() {
            this.options.parent.fireEvent("TIMELINE", {
                type : "panel.clicked",
                id : this.options.id,
                next : this.options.next
            });
        }.bind(this));

    },
    remove : function() {
        this.hide();
        var removedElement = this.panel.dispose();
    },
    // ---------------------------
    show : function() {
        // TODO : fade in
        // this.buttonElement.show();
        this.panel.fade('hide');
        this.panel.fade('in');
    },
    // ---------------------------
    hide : function() {
        this.panel.fade('out');
        // this.buttonElement.hide();
    },
    showCorrect : function() {

        this.options.data.each( function(item, index) {

            var label = document.getElementById("item_label_" + index);
            var radio = document.getElementById("item_" + index);
            console.log("Disabling");
            console.log(radio);
            radio.set('disabled', true);

            if (this.options.correct != null) {
                if (this.options.correct != index + 1) {
                    label.setStyles({
                        'color' : '#CCCCCC'
                    })
                } else {
                    label.setStyles({
                        'color' : '#00FF00',
                        'font-weight' : 'bold'
                    })
                }
            }

        }.bind(this));
    }
});
