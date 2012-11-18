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
                'onselectstart' : 'return false;',
                'rel' : menuItem.description
            });

            var preview = new ImagePlayer(myParent, {
                src : myParent.options.imageFolder + menuItem.preview,
                title : 'Image',
                id : 'preview_' + index,
                style : {
                    'width' : '140px',
                    'height' : '107px',
                    top : '20px',
                    left : '380px'

                }
            })
            preview.preload();

            item.store('preview', preview);

            //   new Tips(item, {
            //      fixed : true,
            //      offset: {x: 350, y: 0}
            // });
            // this.setupTips(item, menuItem.description);

            var selectedModuleID = menuItem.moduleID;
            // log("Sel menu itemid: " + selectedModuleID);
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

                // TODO: try using http://mootools.net/forge/p/fx_tween_css3 for CSS3 rotation

                //   preview.tween('107px', '240px', 1, 'height', 600, 'ignore', '');
                // preview.tween('140px', '320px', 1, 'width', 600, 'ignore', '');

                //transform: rotate(-25deg);
                preview.container.set('class', 'module-preview');
                preview.display();

            }.bind(this));
            item.addEvent("mouseleave", function() {
                var preview = item.retrieve('preview')
                // preview.remove();
                //this.module_description.set('html', '');
                // this.module_description.hide();

            }.bind(this));

            ul.adopt(item);

        }.bind(this));

        this.container.adopt(ul);

        this.module_description = new Element("div", {
            id : "module.description",
            'class' : 'module-description'
        });
        this.container.adopt(this.module_description);
        this.module_description.hide();

        // TODO: implement access module logic here - disabling menu items and indicating finished modules
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
