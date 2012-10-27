/**
 * @author Radek
 */
var CommentaryFeedback = new Class({

    Implements : [Options, Events],

    options : {
        style : {
            position : 'absolute',
            top : '100px',
            left : '150px',
            'background-color' : '#464646',
            'float' : 'left',
            'border-radius' : '1em 1em 1em 1em',
            'text-align' : 'left',
            'padding' : '8px 8px 8px 8px',
            'font-family' : 'Arial',
            '-moz-border-radius' : '0.5em 0.5em 0.5em 0.5em',
            'background' : 'rgba(0, 0, 0, 0.6)',
            'width' : '300px',
            'height' : '200px',
            'opacity' : '0',
            'visibility' : 'hidden'
        },

        data : ["Q1", "Q2", "Q3"],
        id : 'feedbackPanel',
        next : 'next.action',       
        parent : null
    },
    initialize : function(myParent, myOptions) {

        this.setOptions(myOptions);
        this.options.parent = myParent;

        this.container = new Element("div", {
            id : this.options.id
        });

        var ul = new Element('ul', {
            id : 'feedbackList'
        });
        log ("Data:");
        log (this.options.data);
        
        
        Array.each(this.options.data, function(feedbackItem, index) {
            log (feedbackItem);
            var elemID = "feedbackItem_" + index;
            var item = new Element('li', {
                'html' : feedbackItem.text,
                'onselectstart' : 'return false;'
            });

            ul.adopt(item);

        }.bind(this))
        this.container.adopt(ul);
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

        this.container.inject(myDiv);
        // this.panel.fade('hide', 0);

        this.container.setStyles(this.options.style);

    },
    remove : function() {

        var removedElement = this.container.destroy();

    },
    // ---------------------------
    show : function() {
        if (this.container.style.opacity == 0) {
            //this.panel.fade('hide', 0);
            this.container.fade('in');
        }

    },
    // ---------------------------
    hide : function() {
        if (this.container.style.opacity > 0) {
            this.container.fade('out');
        }
    }
});
