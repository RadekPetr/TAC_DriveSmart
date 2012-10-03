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
    // ----------------------------------------------------------
    initialize : function(myParent, myOptions) {
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.loadQueue = new Hash({});
        this.progressBar = null;
    },
    // ----------------------------------------------------------
    register : function(loaderInfo) {
        if (this.loadQueue.has(loaderInfo.id)) {
            // nothing - already exists
        } else {
            this.loadQueue.extend(loaderInfo);
           // console.log('Registered ');
            //console.log(loaderInfo);
        }
    },
    // ----------------------------------------------------------
    reportProgress : function(loaderInfo) {
        //console.log(loaderInfo);

        if (this.options.next == null) {
            // if next action is not set do not allow reporting progress, not sure ???
            // ignore
        } else {
            Object.each(loaderInfo, function(value, key) {
                if (this.loadQueue.has(key)) {
                    this.loadQueue.set(key, value);
                } else {
                    // don't have to add this now as we do not start the preload automatically
                    // this.register(loaderInfo)
                }
            }.bind(this))
            var overAllProgress = this._calculateProgress();
            this._updateProgressBar(overAllProgress);
            this._handleFinished(overAllProgress);
        }
    },
    // ----------------------------------------------------------
    add : function(myContainer) {
        this.progressBar = new dwProgressBar({
            container : $(myContainer),
            startPercentage : 0,
            speed : 10,
            boxID : 'box',
            percentageID : 'perc',
            displayID : 'disp',
            displayText : true,
            style : {
                'left' : '220px',
                'top' : '240px',
                'position' : 'absolute',
                'z-index' : '99999'
            }
        });
    },
    // ----------------------------------------------------------
    show : function() {
        this.progressBar.show();
    },
    // ----------------------------------------------------------
    hide : function() {
        this.progressBar.hide();
    },
    // ----------------------------------------------------------
    remove : function() {
        this.progressBar.remove();
        this.progressBar = null;
    },
    // ----------------------------------------------------------
    start : function() {
        //console.log("Prerload: ");
        //console.log(this.loadQueue);
        // loop the list and start preloading all of the items there
        this.loadQueue.each(function(value, key) {
          // console.log('Starting preload >');
           //console.log(value.ref);
            value.ref.preload();
        })
    },
    // ----------------------------------------------------------
    _calculateProgress : function() {
        var overAllProgress = 0;
        var sum = 0;
        var sum2 = 0;
        this.loadQueue.each( function(value, key) {
            if (value.progress == undefined) {
                value.progress = 0
            }
            sum += (value.progress * value.weight);
            sum2 += value.weight;
        }.bind(this))

        overAllProgress = (sum / sum2) * 100.00;
        return overAllProgress;
    }.protect(),
    // ----------------------------------------------------------
    _updateProgressBar : function(progress) {
        if (this.progressBar != null) {
            this.progressBar.set(progress);
        }
    }.protect(),
    // ----------------------------------------------------------
    _handleFinished : function(progress) {
        if (progress > 80) {
            //console.log("Preload Finished");
            this.loadQueue.empty();
            this.options.parent.fireEvent("TIMELINE", {
                type : "preload.finished",
                id : this.options.id,
                next : this.options.next
            })
        }
    }
})