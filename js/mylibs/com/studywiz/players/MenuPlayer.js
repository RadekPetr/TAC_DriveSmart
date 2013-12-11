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
        this._addModuleDescription();
        this._addMenuItems();
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
            log(menuItemData, isLocked);
            if (isLocked) {
                menuItem.lock();
            }

            if (isLocked != true || Main.DEBUG == true) {
                menuItem.registerClickEvent(this.myParent());
            }

            menuItem.registerMouseLeaveEvent(this);

        }.bind(this));

        this.addEvent("MODULE_INFO", this.showModuleInformation);

        // Show the description for the introduction - emulate mouseover :)
        this.menuItems[0].container.fireEvent("mouseenter");
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
    _addModuleDescription : function() {
        this.module_description = new Element("div", {
            id : "module.description",
            'class' : 'module-description no-select pane blue',
            styles : {
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
    }
});
