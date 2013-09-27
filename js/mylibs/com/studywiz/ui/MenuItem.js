/**
 * @author Radek
 */

var MenuItem = new Class({

    Implements : [Options, Events],

    options : {
        style : {
            position : 'absolute',
            top : '0px',
            left : '0px',
            'opacity' : '0',
            'visibility' : 'hidden'
        },
        'class' : 'dashboard_modules no-select',
        data : null,
        id : 'element.id',
        next : 'next.action',
        parent : null,
        preview : null
    },
    initialize : function(myParent, myOptions) {
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.selectedModuleID = this.options.data.moduleID;
        this.isLocked = false;

        // log(menuItem);
        var elemID = "menu_item_" + this.selectedModuleID;
        var item = new Element('div', {
            'html' : this.options.data.text,
            'id' : elemID,
            'onselectstart' : 'return false;',
            'class' : this.options['class']
        });
        this.container = item;

        var preview = new ImagePlayer(myParent, {
            src : Main.PATHS.imageFolder + this.options.data.preview,
            title : 'Image',
            id : 'preview_' + this.selectedModuleID,
            style : {
                'width' : '140px',
                'height' : '107px',
                top : '60px',
                left : '380px'
            }
        });

        preview.preload();
        this.options.preview = preview;

        if (this.options.data.showProgress == true) {
            var moduleState = Main.userTracker.getModuleState(this.selectedModuleID);
            if (moduleState.completed == true) {
                var symbol = this._getCompleteStatusSymbol();
                item.adopt(symbol);
                symbol.show();
            }
            item.adopt(UIHelpers.progressBarSetup(moduleState.progress, this.selectedModuleID));
        }
    },
    lock : function() {
        this.isLocked = true;

        var lockedCSS = 'dashboard_modules_locked no-select';
        this.container.removeAttribute('class');
        this.container.addClass(lockedCSS);

        var symbol = this._getLockedStatusSymbol();
        // TODO: will probably just chnage the calss instead ?
        this.container.grab(symbol, 'top');
        // this.container.adopt(symbol);
        symbol.show();
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
            id : 'finished.' + this.selectedModuleID
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
            id : 'lock.' + this.selectedModuleID
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
    registerEvent : function(sendEventTo) {
        this.container.addEvent("click", function() {
            sendEventTo.fireEvent("TIMELINE", {
                type : "item.clicked",
                id : this.selectedModuleID,
                next : "Menu.item.clicked"
            });
        }.bind(this));

    },
    getSelectedModuleID : function() {
        return this.selectedModuleID;
    }
});
