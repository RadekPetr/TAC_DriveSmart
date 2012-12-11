function moduleProgressSetup(moduleID) {

    // / Module progress bar

    var moduleProgress = userTracker.getModuleProgress(moduleID);

    /* var score = new Element('div', {
     id : "Module_Score_" + menuItem.id,
     html : "Module score: " + (100 * userTracker.getModuleScore(menuItem.retrieve('moduleID')) ).toInt() + "/100",
     'class' :'module_score_title'
     });
     menuItem.adopt (score);
     */

    var progress = new Element('div', {
        id : "Module_progress_" + moduleID,
        html : "Progress: ",
        'class' : 'module_progress_title'
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
        displayClass : 'module_progress_title',
        styles : {
            'width' : '300px',
            'height' : '5px'
        }
    });
    return progress;

}