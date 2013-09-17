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
        id : "Progress_" + id,
        html : "Progress: ",
        'class' : 'progress_title no-select'
    });

    var progressBar = new dwProgressBar({
        container : progressBarComponent,
        startPercentage : progress,
        speed : 1000,
        boxID : 'progress_box_' + id,
        boxClass : 'progress_box',
        percentageID : 'progress_perc_' + id,
        percentageClass : 'progress_perc',
        displayText : true,
        displayID : 'text_' + id,
        displayClass : 'progress_title no-select',
        
    });
    return progressBarComponent;
};



UIHelpers.setMainPanel = function(cssClassName) {
    $m(Main.DIV_ID).removeAttribute('class');
    $m(Main.DIV_ID).addClass(cssClassName);
};
