/**
 * @author Radek
 */
var Module = new Class({
    Implements : [Options, Events],
    options : {
        moduleID : '',
        parent : null,
    },
     initialize : function(myParent, myOptions) {
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.sequences = null;
        this.addEvent("DATA", this.handleNavigationEvent);
        this.setupData();
    },
    // ----------------------------------------------------------
    setupData : function() {
        this.dataLoader = new DataLoader(this, {
            src : 'data/' + this.options.moduleID + '.xml',
            next : 'data.ready'
        });
        this.dataLoader.start();
    }, 
    handleNavigationEvent : function(params) {
        switch (params.next) {
            case "data.ready":
                console.log("Loaded module XML");
                this.sequences = params.data;
                this.options.parent.fireEvent("MODULE", {
                    next : "module.ready"
                })
        }
    }
})