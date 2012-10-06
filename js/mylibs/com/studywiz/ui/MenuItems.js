/**
 * @author Radek
 */
var MenuItems = new Class({

    Implements : [Options, Events],

    options : {
        style : {
            position : 'absolute',
            top : '0px',
            left : '0px',
            'opacity' : '0',
            'visibility' : 'hidden'
        },

        data : null,
        id : 'element.id',
        next : 'next.action',
        correct : null,
        parent : null
    },
    initialize : function(myParent, myOptions) {

        this.setOptions(myOptions);
        this.options.parent = myParent;

        this.container = new Element("div", {
            id : "navigation.container"
        });
        var ul = new Element('ul', {
            id : 'navigation'
        });
        Array.each(this.options.data, function(menuItem, index) {
            var elemID = "menu_item_" + index;
            var item = new Element('li', {
                'html' : menuItem.text,
                'id' : elemID,
                'onselectstart' : 'return false;'
            });

            this.setupTips(item, menuItem.description);
         
            var selectedModuleID = menuItem.moduleID;
           // log("Sel menu itemid: " + selectedModuleID);
            item.addEvent("click", function() {
                this.myParent().fireEvent("TIMELINE", {
                    type : "item.clicked",
                    id : selectedModuleID,
                    next : "Menu.item.clicked"
                });
            }.bind(this));

            ul.adopt(item);

        }.bind(this))
        this.container.adopt(ul);
    },
    myParent : function() {
        return this.options.parent;
    }, // ---------------------------
    add : function(parentTagID) {

        this.container.inject($(parentTagID));

        this.container.setStyles(this.options.style);

    },
    remove : function() {
        this.hide();
        var removedElement = this.container.dispose();

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
    },
    setupTips : function(attachToElemId, content) {
        // TODO - show the description on rollover

    }
});
