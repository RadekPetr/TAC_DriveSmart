/**
 * @author Radek
 */

// TODO: rename to Menu and create class MeanuItem to populate it
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
        parent : null,
        text : function(element) {
            return element.get('rel');
        }
    },
    initialize : function(myParent, myOptions) {

        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.menuItems = new Array();

        this.container = new Element("div", {
            id : "navigation.container"
        });

        Array.each(this.options.data, function(menuItemData, index) {
            var menuItem = new MenuItem(this, {
                data : menuItemData
            });
            this.menuItems.push(menuItem);

            menuItem.container.addEvent("mouseenter", function() {
                this.module_description.set('html', menuItem.options.data.description);
                this.module_description.show();
                var preview = menuItem.options.preview;
                var imageDiv = this.container.getElementById('imageContainer');
                if (imageDiv != null) {
                    imageDiv.destroy();
                }
                preview.add(this.container.id);
                preview.container.set('class', 'module-preview');
                preview.display();

            }.bind(this));

            //TODO: replace with .add, .show calls
            this.container.adopt(menuItem.container);
            var isLocked = this._isItemLocked(menuItemData);
            if (isLocked) {
                menuItem.lock();
            }

            if (isLocked != true || Main.DEBUG == true) {
                menuItem.registerEvent(this.myParent());
            }

        }.bind(this));

        this.module_description = new Element("div", {
            id : "module.description",
            'class' : 'module-description no-select',
            styles : {
                left : '375px',
                top : '190px'
            }
        });

        this.container.adopt(this.module_description);
        this.module_description.hide();
    },
    myParent : function() {
        return this.options.parent;
    }, // ---------------------------
    add : function(parentTagID) {
        this.container.inject($m(parentTagID));
        this.container.setStyles(this.options.style);
    },
    remove : function() {
        this.hide();
        var removedElement = this.container.destroy();
    },
    // ---------------------------
    show : function() {
        if (this.container.style.opacity == 0) {
            // this.panel.fade('hide', 0);
            this.container.fade('in');
        }

    },
    // ---------------------------
    hide : function() {
        if (this.container.style.opacity > 0) {
            this.container.fade('out');
        }
    },
    _getCompleteStatusSymbol : function(left, top) {
        var file = Main.PATHS.imageFolder + 'menu/tick.png';

        var symbolImage = new ImagePlayer(this, {
            src : file,
            next : "",
            title : 'finished',
            id : 'finished'
        });
        symbolImage.preload();
        symbolImage.image.setStyles({
            'width' : '30px',
            'height' : '34px',
            'float' : 'right',
            'padding-left' : '15px'
        });

        return symbolImage.image;
    },
    _isItemLocked : function(menuItem) {
        var itemPreconditions = menuItem.preconditions;
        if (itemPreconditions.length == 0) {
            var isLocked = false;
        } else {
            var isLocked = true;
            Array.each(itemPreconditions, function(moduleID, index) {
                var moduleState = Main.userTracker.getModuleState(moduleID);
                var isModuleCompleted = moduleState.completed;
                if (isModuleCompleted == true) {
                    isLocked = false;
                }
            });
            return isLocked;
        }
    }
});
