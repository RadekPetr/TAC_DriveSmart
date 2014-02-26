/**
 * @author Radek
 */

var MenuPlayer = new Class({
    Implements : [Options, Events],
    options : {
        style : {
            position : 'absolute',
            top : '0px',
            left : '0px',
            'opacity' : '0',
            'visibility' : 'hidden',
            'width' : '360px'
        },
        data : null,
        id : 'MenuPlayer',
        next : 'next.action',
        parent : null
    },
    initialize : function(myParent, myOptions) {
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.menuItems = new Array();
        this.container = new Element("div", {
            id : "navigation.container"
        });
    },
    myParent : function() {
        return this.options.parent;
    }, // ---------------------------
    add : function(parentTagID) {
        this.container.inject($m(parentTagID));
        this.container.setStyles(this.options.style);
        this._renderMenu();
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
    _renderMenu : function() {
        this._addLines();
        this._addModuleDescription();
        this._addMenuItems();

    },

    _addLines : function() {
        var div1 = new Element("div", {
            id : "line 1",
            'class' : 'horizontal_dotted_line',
            styles : {
                left : '390px',
                top : '90px',
                width : '535px'
            }
        });
        this.container.adopt(div1);
        var div2 = new Element("div", {
            id : "line 2",
            'class' : 'horizontal_dotted_line',
            styles : {
                left : '390px',
                top : '450px',
                width : '535px'
            }
        });
        this.container.adopt(div2);
        var div3 = new Element("div", {
            id : "line 3",
            'class' : 'vertical_dotted_line',
            styles : {
                left : '380px',
                top : '10px',
                height : '540px'
            }
        });
        this.container.adopt(div3);
    },
    _addMenuItems : function() {
        Array.each(this.options.data, function(menuItemData, index) {
            if (index <= Main.COLORS.length - 1) {
                var itemColor = Main.COLORS[index];
            } else {
                var itemColor = Main.COLORS[index - Main.COLORS.length];
            }

            var menuItem = new MenuItem(this, {
                data : menuItemData,
                'class' : 'menu_item no-select pane menu ' + itemColor
            });
            this.menuItems.push(menuItem);

            menuItem.add(this.container.id);
            menuItem.show();

            var isLocked = this._isItemLocked(menuItemData);
            var isDisabled = this._isItemDisabled(menuItem);

            if (isLocked) {
                menuItem.lock();
            }

            if (isDisabled) {
                menuItem.disable();
            }

            if (Main.DEBUG == true) {
                menuItem.registerClickEvent(this.myParent());
                menuItem.registerMouseEnterEvent(this);
            } else {
                if (isLocked != true && isDisabled != true) {
                    menuItem.registerClickEvent(this.myParent());
                    menuItem.registerMouseEnterEvent(this);
                }
                if (isLocked == true || isDisabled == true) {
                    menuItem.registerMouseEnterEvent(this);
                }
            }

        }.bind(this));

        this.showModuleInformation(this.menuItems[0].getItemOverData());
        this.addEvent("MODULE_INFO", this.menuItemOverAction);
    },
    menuItemOverAction : function(params) {
        this.showModuleInformation(params);
        // for touch devices show start button
        if (Main.features.supportsTouch == true && ((params.itemRef.isLocked != true && params.itemRef.isDisabled != true) || Main.DEBUG == true)) {
            this._showStartButton(params);
        }
    },
    showModuleInformation : function(params) {
        var moduleInfoData = params.data;
        this.module_description.set('html', moduleInfoData.description);
        this.module_description.show();

        var previewImage = moduleInfoData.preview;
        var imageDiv = this.container.getElementById('imageContainer');
        if (imageDiv != null) {
            imageDiv.destroy();
        }
        previewImage.add(this.container.id);
        previewImage.container.set('class', 'module-preview');
        previewImage.display();
    },
    _showStartButton : function(params) {
        Array.each(this.menuItems, function(menuItem, index) {
            if (menuItem.selectedModuleID != params.id) {
                menuItem.button.hide();
            } else {
                menuItem.button.show();
                // hide the butten after 2 secons
                var timerFunction = function() {
                    menuItem.button.hide();
                }.bind(this);
                var timer = timerFunction.delay(1800);
            }
        });
    },
    _addModuleDescription : function() {
        this.module_description = new Element("div", {
            id : "module.description",
            'class' : 'module-description no-select pane blue',
            'styles' : {
            }
        });
        this.container.adopt(this.module_description);
        this.module_description.hide();
    },
    _isItemLocked : function(menuItem) {
        var isLocked = true;
        var itemPreconditions = menuItem.preconditions;
        if (itemPreconditions.length == 0) {
            isLocked = false;
        } else {
            var completedConditionsCount = 0;
            Array.each(itemPreconditions, function(moduleID, index) {
                var moduleState = Main.userTracker.getModuleState(moduleID);
                if (moduleState.completed == true) {
                    completedConditionsCount++;
                }
            });

            if (completedConditionsCount == itemPreconditions.length) {
                isLocked = false;
            }
            return isLocked;
        }
    },
    _isItemDisabled : function(menuItem) {
        // Disable if flash is required but not available
        var isDisabled = false;
        if (isFlashSupported() == false && menuItem.options.data.flashOnly == true) {
            isDisabled = true;
        }
        return isDisabled;
    }
});
