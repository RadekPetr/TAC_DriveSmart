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
UIHelpers.progressBarSetup = function(progress, id) {
   
    /* var score = new Element('div', {
     id : "Module_Score_" + menuItem.id,
     html : "Module score: " + (100 * Main.userTracker.getModuleScore(menuItem.retrieve('moduleID')) ).toInt() + "/100",
     'class' :'module_score_title'
     });
     menuItem.adopt (score);
     */

    var progressBarComponent = new Element('div', {
        id : "Module_progress_" + id,
        html : "Progress: ",
        'class' : 'module_progress_title no-select'
    });

    var progressBar = new dwProgressBar({
        container : progressBarComponent,
        startPercentage : progress,
        speed : 1000,
        boxID : 'module_progress_box_' + id,
        boxClass : 'module_progress_box',
        percentageID : 'module_progress_perc_' + id,
        percentageClass : 'module_progress_perc',
        displayText : true,
        displayID : 'text_' + id,
        displayClass : 'module_progress_title no-select',
        styles : {
            'width' : '300px',
            'height' : '5px'
        }
    });
    return progressBarComponent;
};



UIHelpers.setMainPanel = function(cssClassName) {
    $m(Main.DIV_ID).removeAttribute('class');
    $m(Main.DIV_ID).addClass(cssClassName);
};
