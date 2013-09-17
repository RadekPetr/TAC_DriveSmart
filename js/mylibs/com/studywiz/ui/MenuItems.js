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

        Array.each(this.options.data, function(menuItem, index) {

            var selectedModuleID = menuItem.moduleID;
            var lockedItem = this._isItemLocked(menuItem);
            log("Menu Item locked: ", menuItem.moduleID, this._isItemLocked(menuItem));

            if (lockedItem == true) {
                var menuItemCSS = 'dashboard_modules_locked no-select';
            } else {
                var menuItemCSS = 'dashboard_modules no-select';
            }

            // log(menuItem);
            var elemID = "menu_item_" + index;
            var item = new Element('div', {
                'html' : menuItem.text,
                'id' : elemID,
                'onselectstart' : 'return false;',
                'rel' : menuItem.description,
                'class' : menuItemCSS
            });
            this.menuItems.push(item);
            var preview = new ImagePlayer(myParent, {
                src : Main.PATHS.imageFolder + menuItem.preview,
                title : 'Image',
                id : 'preview_' + index,
                style : {
                    'width' : '140px',
                    'height' : '107px',
                    top : '60px',
                    left : '380px'
                }
            });

            preview.preload();
            item.store('preview', preview);

            if (lockedItem == true) {
                var symbol = this._getLockedStatusSymbol();
                item.adopt(symbol);
                symbol.show();
            }

            if (lockedItem != true || Main.DEBUG == true) {
                item.addEvent("click", function() {
                    this.myParent().fireEvent("TIMELINE", {
                        type : "item.clicked",
                        id : selectedModuleID,
                        next : "Menu.item.clicked"
                    });
                }.bind(this));
            }

            item.addEvent("mouseenter", function() {
                this.module_description.set('html', this.options.text(item));
                this.module_description.show();
                var preview = item.retrieve('preview');
                var imageDiv = this.container.getElementById('imageContainer');
                if (imageDiv != null) {
                    imageDiv.destroy();
                }
                preview.add(this.container.id);
                preview.container.set('class', 'module-preview');
                preview.display();

            }.bind(this));

            item.addEvent("mouseleave", function() {
                var preview = item.retrieve('preview');
            }.bind(this));

            if (menuItem.showProgress == true) {
                var moduleState = Main.userTracker.getModuleState(menuItem.moduleID);
                if (moduleState.completed == true) {
                    var symbol = this._getCompleteStatusSymbol();
                    item.adopt(symbol);
                    symbol.show();
                }
                item.adopt(UIHelpers.progressBarSetup(moduleState.progress, menuItem.moduleID));
            }
            this.container.adopt(item);

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
    _getLockedStatusSymbol : function(left, top) {
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
