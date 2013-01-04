/**
 * @author Radek
 */
var MenuItems = new Class({

    Implements : [Options, Events, Tips],

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
           // log(menuItem);
            var elemID = "menu_item_" + index;
            var item = new Element('div', {
                'html' : menuItem.text,
                'id' : elemID,
                'onselectstart' : 'return false;',
                'rel' : menuItem.description,
                'class' : 'dashboard_modules'
            });
            this.menuItems.push(item);
            var preview = new ImagePlayer(myParent, {
                src : myParent.options.imageFolder + menuItem.preview,
                title : 'Image',
                id : 'preview_' + index,
                style : {
                    'width' : '140px',
                    'height' : '107px',
                    top : '60px',
                    left : '380px'

                }
            })
            preview.preload();

            item.store('preview', preview);

            var selectedModuleID = menuItem.moduleID;

            item.addEvent("click", function() {
                this.myParent().fireEvent("TIMELINE", {
                    type : "item.clicked",
                    id : selectedModuleID,
                    next : "Menu.item.clicked"
                });
            }.bind(this));

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
                var moduleProgress = userTracker.getModuleProgress(menuItem.moduleID);
                if (moduleProgress.completed == true) {
                    var tick = this.showCompleteStatus();
                    item.adopt(tick);
                    tick.show();
                    tick.setStyles({
                        'width' : '30px',
                        'float' : 'right',
                        'padding-left': '15px'
                    })
                }
                item.adopt(moduleProgressSetup(menuItem.moduleID));
            }
            this.container.adopt(item);

        }.bind(this));

        this.module_description = new Element("div", {
            id : "module.description",
            'class' : 'module-description',
            styles : {
                left : '375px',
                top : '190px'
            }
        });

        this.container.adopt(this.module_description);
        this.module_description.hide();

        // TODO: implement access module logic here - disabling menu items and
        // indicating finished modules
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
    showCompleteStatus : function(left, top) {
        var file = this.myParent().options.imageFolder + 'menu/tick.png';

        var tickImage = new ImagePlayer(this, {
            src : file,
            next : "",
            title : 'finished',
            id : 'finished'
        });
        tickImage.preload();

        return tickImage.image;
    }
});
