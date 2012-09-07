/**
 * @author Radek
 */
var MediaLoader = new Class({
    // TODO: handle preloading completely to the Media Loader and remove it from Unit

    Implements : [Options, Events],
    options : {
        parent : null,
        next : "data.loaded"
    },
    initialize : function(myParent, myOptions) {
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.loadQueue = new Hash({});
        this.progressBar = null;
    },
    register : function(loaderInfo) {
        if (this.loadQueue.has(loaderInfo.id)) {
            // notning already exists
        } else {
            this.loadQueue.extend(loaderInfo);
        }
    },
    reportProgress : function(loaderInfo) {

        if (this.loadQueue.has(loaderInfo.id)) {
            this.loadQueue.set(loaderInfo.id, loaderInfo.progress)
        } else {
            this.register(loaderInfo)
        }
        var overAllProgress = 0;
        var sum = 0;
        this.loadQueue.each(function(value, key) {
            sum = sum + value;
        })
        overAllProgress = (sum / this.loadQueue.getLength()) * 100.00;

        if (this.progressBar != null) {
            this.progressBar.set(overAllProgress);
        }

        console.log("Overall progress " + overAllProgress);
        // console.log(this.loadQueue);
        if (overAllProgress > 80) {
            console.log("Preload Finished");
            this.options.parent.handleMediaReady(this.options.next);
            this.loadQueue.empty();

            this.options.parent.fireEvent("TIMELINE", {
                type : "preload.finished",
                id : this.options.id,
                next : this.options.next
            })

        }
    },
    add : function(myContainer) {
        this.progressBar = new dwProgressBar({
            container : $(myContainer),
            startPercentage : 0,
            speed : 2000,
            boxID : 'box',
            percentageID : 'perc',
            displayID : 'disp',
            displayText : true,
            style : {
                'left' : '220px',
                'top' : '240px',
                'position' : 'absolute'
            }
        });
    },
    show : function() {

    },
    hide : function() {
        //this.progressBar.hide();
    }
})