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
            width : '550px',
            'opacity' : '0',
            'visibility' : 'hidden'
        },

        data : ["Q1", "Q2", "Q3"],
        id : 'element.id',
        next : 'next.action',
        responses : 1,
        correct : null,
        parent : null
    },
    initialize : function(myParent, myOptions) {

        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.checkBoxes = new Array();
        this.selectedCheckBoxes = new Array();

        this.panel = new Element("div", {
            id : "questionPanel",
            'class' : 'questions_panel'
        });

        //this.options.data.each( function(item, index) {

        Array.each(this.options.data, function(question, index) {

            var checkbox = new Element('input', {
                'type' : 'checkbox',
                'id' : "item_" + index,
                'group' : 'questionPanel',
                'name' : 'question_item'
            })

            checkbox.addEvent('click', function() {
                this._checkMaxSelects(checkbox);
            }.bind(this))

            this.checkBoxes.push(checkbox);

            var label = new Element('label', {
                'for' : "item_" + index,
                'html' : question.text,
                'id' : "item_label_" + index,
                'class' : 'questions_label_unlocked'
            });

            var paragraph = new Element('p', {});
            paragraph.adopt(checkbox);
            paragraph.adopt(label);

            this.panel.adopt(paragraph);

        }.bind(this))
    },
    myParent : function() {
        return this.options.parent;
    }, // ---------------------------
    add : function(parentTagID, where) {
        var myParent = document.getElementById(parentTagID);
        var myDiv = myParent.getElement('div[id=panelContainer]');
        if (myDiv == null) {
            var myDiv = new Element("div", {
                id : "panelContainer"
            });

            myDiv.inject($(parentTagID), where);
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
        var removedElement = this.panel.destroy();
        $('panelContainer').destroy();

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
    lockAnswer : function() {
        Array.each(this.options.data, function(question, index) {
            var label = document.getElementById("item_label_" + index);
            var radio = document.getElementById("item_" + index);

            radio.set('disabled', true);

            label.setStyles({
                'cursor' : 'default'
            })
            radio.setStyles({
                'cursor' : 'default'
            })
        })
    },
    showCorrect : function() {
        var score = 0;
        var maxScore = 0;

        Array.each(this.options.data, function(question, index) {
            var label = document.getElementById("item_label_" + index);
            var radio = document.getElementById("item_" + index);
            if (question.correct == false) {
                label.set('class', 'questions_label_locked_incorrect');

            } else {
                label.set('class', 'questions_label_locked_correct');
            }
            if (question.correct == true) {
                maxScore++;
                if (radio.checked == true) {
                    score++;
                }
            }
        }.bind(this));

        return score / maxScore;
    },
    _checkMaxSelects : function(checkBox) {
        if (checkBox.checked) {
            this.selectedCheckBoxes.unshift(checkBox);
            if (this.selectedCheckBoxes.length > this.options.responses) {
                var toDeselect = this.selectedCheckBoxes.pop();
                toDeselect.checked = false;
            }
        } else {
            this.selectedCheckBoxes.erase(checkBox);
        }
    }
});
