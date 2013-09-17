/**
 * @author Radek
 */
var UIHelpers = new Class({
    Implements : [Options, Events],
    options : {
        parent : null
    },
    myParent : function() {
        return this.options.parent;
    },
    // ----------------------------------------------------------
    initialize : function(myParent, myOptions) {
        this.setOptions(myOptions);
        this.options.parent = myParent;
    }
});

// Static methods
UIHelpers.moduleProgressSetup = function(moduleID) {
    // Module progress bar

    var moduleProgress = Main.userTracker.getModuleProgress(moduleID);

    /* var score = new Element('div', {
     id : "Module_Score_" + menuItem.id,
     html : "Module score: " + (100 * Main.userTracker.getModuleScore(menuItem.retrieve('moduleID')) ).toInt() + "/100",
     'class' :'module_score_title'
     });
     menuItem.adopt (score);
     */

    var progress = new Element('div', {
        id : "Module_progress_" + moduleID,
        html : "Progress: ",
        'class' : 'module_progress_title no-select'
    });

    var moduleProgressbar = new dwProgressBar({
        container : progress,
        startPercentage : moduleProgress.progress,
        speed : 1000,
        boxID : 'module_progress_box_' + moduleID,
        boxClass : 'module_progress_box',
        percentageID : 'module_progress_perc_' + moduleID,
        percentageClass : 'module_progress_perc',
        displayText : true,
        displayID : 'text_' + moduleID,
        displayClass : 'module_progress_title no-select',
        styles : {
            'width' : '300px',
            'height' : '5px'
        }
    });
    return progress;
};

UIHelpers.setMainPanel = function(cssClassName) {
    $m(Main.DIV_ID).removeAttribute('class');
    $m(Main.DIV_ID).addClass(cssClassName);
};
