/**
 * @author Radek
 */
var MediaLoader = new Class({
    Implements : [Options, Events],
    options : {
        parent : null,
        next : "data.loaded",
        progress : false,
        parentElementID : null
    },
    myParent : function() {
        return this.options.parent;
    },
    // ----------------------------------------------------------
    initialize : function(myParent, myOptions) {
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.loadQueue = new Hash({});
        this.progressBar = null;
        this.preloadTimer = null;
        this.videoQueue = new Array();
    },
    // ----------------------------------------------------------
    register : function(loaderInfo) {
        if (this.loadQueue.has(loaderInfo.id)) {
            // nothing - already exists
        } else {
            var type = '';
            Object.each(loaderInfo, function(value, key) {
                type = value.type;
            });
            if (type == 'VIDEO' || type == 'FLASH') {
                this.videoQueue.push(loaderInfo);
            } else {
                this.loadQueue.extend(loaderInfo);
            }

        }
    },
    // ----------------------------------------------------------
    start : function(showProgressBar) {
        
        // show the progress bar if requested
        if (showProgressBar == true) {
            this._addProgressBar();
            this._show();
        }
        // add one video to the queue
        this._addOneVideoToQueue();

        // start the preload for each object
        this.loadQueue.each(function(value, key) {
            value.ref.preload();
        });
        // if the queue is not empty start the time to poll the progress
        if (this.loadQueue.getLength() > 0) {
            var timerFunction = function() {
                this.updateProgress();
            }.bind(this);
            this.preloadTimer = timerFunction.periodical(1000);
        } else {
            // kill the timer, not needed anymore
            clearInterval(this.preloadTimer);
        }

        //TODO: handle timeout and error events

    },
    // ----------------------------------------------------------
    reportProgress : function(loaderInfo) {
        log("this.loadQueue", this.loadQueue);

        if (this.options.next == null) {
            // if next action is not set do not allow reporting progress, not sure ???
            // ignore
        } else {
            Object.each(loaderInfo, function(value, key) {
                if (this.loadQueue.has(key)) {
                    // so video can keep loading but won't change the overall score as we have already reported 100% by the canplaythrough event'
                    if (this.loadQueue[key].progress < value.progress) {
                        this.loadQueue.set(key, value);
                    }
                } else {
                    // don't have to add this now as we do not start the preload automatically
                    // this.register(loaderInfo)
                }
            }.bind(this));
            var overAllProgress = this._calculateProgress();
            this._updateProgressBar(overAllProgress);
            this._handleFinished(overAllProgress);
        }

    },
    updateProgress : function() {
        this.loadQueue.each( function(value, key) {
            this.reportProgress(value.ref.getLoaderInfo());
        }.bind(this));
    },
    // ----------------------------------------------------------
    _addProgressBar : function() {
        var loaderProgressBar = UIHelpers.progressBarSetup(0, "media_loader_disp");
        UIHelpers.setClasses(loaderProgressBar['holder'], "no-select load_progress");
        loaderProgressBar['holder'].inject($m(this.options.parentElementID));
        this.progressBar = loaderProgressBar['object'];
    },
    // ----------------------------------------------------------
    _show : function() {
        this.progressBar.show();
        var moduleTitle = UIHelpers.setMainPanel('Loading');
        UIHelpers.setClasses(moduleTitle, 'module-title-loader no-select');
    },
    // ----------------------------------------------------------
    hide : function() {
        this.progressBar.hide();
    },
    // ----------------------------------------------------------
    remove : function() {
        if (this.progressBar != null) {
            this.progressBar.remove();
            this.progressBar = null;
        }
    },
    // ----------------------------------------------------------
    _handleFinished : function(progress) {
        if (progress > 99) {
            log("Preload Finished");
            clearInterval(this.preloadTimer);
            this._removeCompletedFromQueue();
            // remove the progress bar, will continue silently
            this.remove();
            this.myParent().fireEvent("TIMELINE", {
                type : "preload.finished",
                id : this.options.id,
                next : this.options.next
            });
            this.options.next = "next.video.preloaded";
            // continue preloading remaining videos if any or some other non mandatory items
            this.start(false);
        }
        if (progress > 30) {

            // this.myParent().fireEvent("TIMELINE", {
            //    type : "preload.finished",
            //   id : this.options.id,
            //    next : this.options.next
            // })
            // this.options.next = "almost ready";

        }

    },
    _removeCompletedFromQueue : function() {
        this.loadQueue.each( function(value, key) {
            if (value.progress == 1) {
                this.loadQueue.erase(key);
            }
        }.bind(this));
    },
    _addOneVideoToQueue : function() {
        if (this.videoQueue.length > 0) {
            var currentVideo = this.videoQueue.shift();
            this.loadQueue.extend(currentVideo);
        } else {
            // nothing, all loaded
        }
    },
    // ----------------------------------------------------------
    _calculateProgress : function() {
        var overAllProgress = 0;
        var sum = 0;
        var sum2 = 0;
        this.loadQueue.each( function(value, key) {
            if (value.progress == undefined) {
                value.progress = 0;
            }
            sum += (value.progress * value.weight);
            sum2 += value.weight;
        }.bind(this));

        overAllProgress = (sum / sum2) * 100.00;
        return overAllProgress;
    }.protect(),
    // ----------------------------------------------------------
    _updateProgressBar : function(progress) {
        if (this.progressBar != null) {
            this.progressBar.set(progress);
        }
    }.protect(),
    getQueueLength : function() {
        return this.loadQueue.getLength() + this.videoQueue.length;
        ;
    },
    reset : function() {
        clearInterval(this.preloadTimer);
        this.videoQueue = new Array();
        this.loadQueue = new Hash({});
    }
});
