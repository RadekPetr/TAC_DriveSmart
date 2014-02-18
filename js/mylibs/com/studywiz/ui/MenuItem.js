/**
 * @author Radek
 */

var MenuItem = new Class({
    Implements : [Options, Events],
    options : {
        style : {
            'opacity' : '0',
            'visibility' : 'hidden'
        },
        'class' : 'menu_item no-select',
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
        this.isDisabled = false;

        // log(menuItem);
        var elemID = "menu_item_" + this.selectedModuleID;
        this.container = new Element('div', {            
            'id' : elemID,
            'onselectstart' : 'return false;'
        });
        
         this.buttonGroup = new Element('div', {
            'html' : this.options.data.text,
            'id' : elemID,
            'onselectstart' : 'return false;',
            'class' : this.options['class']
        });
         this.buttonGroup.inject(this.container );

        this.options.preview = new ImagePlayer(myParent, {
            src : Main.PATHS.imageFolder + this.options.data.preview,
            title : 'Image',
            id : 'preview_' + this.selectedModuleID,
            style : {

            }
        });
        this.options.preview.preload();
    },
    lock : function() {
        this.isLocked = true;
        // TODO: locked pane css
        //var lockedCSS = 'menu_item locked no-select pane blue';
        //  this.container.removeAttribute('class');
        // this.container.addClass(lockedCSS);
        this.buttonGroup.fade("0.6");
    },
    disable : function() {
        this.isLocked = true;
        this.isDisabled = true;
        // TODO: locked pane css
        this._getFlashRequiredSymbol().inject(this.container) ;
        //var lockedCSS = 'menu_item locked no-select pane blue';
        //  this.container.removeAttribute('class');
        // this.container.addClass(lockedCSS);
         this.buttonGroup.fade("0.2");
    },
    showProgress : function() {
        if (this.options.data.showProgress == true) {
            var moduleState = Main.userTracker.getModuleState(this.selectedModuleID);
            if (moduleState.completed == true) {
                //   var symbol = this._getCompleteStatusSymbol();
                //  this.container.adopt(symbol);
                //  symbol.show();
            }
             this.buttonGroup.adopt(UIHelpers.progressBarSetup(moduleState.progress, this.selectedModuleID)['holder']);
        }
    },
    myParent : function() {
        return this.options.parent;
    }, // ---------------------------
    add : function(parentTagID) {
        this.container.inject($m(parentTagID));
        this.container.setStyles(this.options.style);
        this.showProgress();
    },
    remove : function() {
        this.hide();
        var removedElement = this.container.destroy();
    },
    // ---------------------------
    show : function() {
        if (this.container.style.opacity == 0) {
            this.container.fade('show');
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
    registerClickEvent : function(sendEventTo) {
        this.container.addEvent("click", function() {
            sendEventTo.fireEvent("TIMELINE", {
                type : "item.clicked",
                id : this.selectedModuleID,
                next : "Menu.item.clicked"
            });
        }.bind(this));

    },

    registerMouseEnterEvent : function(sendEventTo) {
        this.container.addEvent("mouseenter", function() {
            sendEventTo.fireEvent("MODULE_INFO", {
                type : "item.over",
                id : this.selectedModuleID,
                data : {
                    description : this.options.data.description,
                    preview : this.options.preview
                }
            });
            
        }.bind(this));

    },
    getSelectedModuleID : function() {
        return this.selectedModuleID;
    },
    _getFlashRequiredSymbol : function(left, top) {
        var file = Main.PATHS.imageFolder + 'menu/flash_required.png';

        var symbolImage = new ImagePlayer(this, {
            src : file,
            next : "",
            id : 'flash required ' + this.options.data.moduleID,
            title: 'flash required for module ' + this.options.data.text,
            'class' : 'menu_item no-select'
        });
        symbolImage.preload();
        symbolImage.image.setStyles({
           
            'height' : '34px',
            'float' : 'right',
            'position': 'relative',
            'top' : '-80px'
           
        });

        return symbolImage.image;
    }
});
