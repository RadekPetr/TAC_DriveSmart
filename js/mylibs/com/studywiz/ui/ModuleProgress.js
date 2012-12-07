var ModuleProgress = new Class({

    Implements : [Options, Events],
    options : {
        parent : null,
        id: 'progressbar',
        
    },
    initialize : function(myParent, module, myOptions) {
        var moduleProgress = userTracker.getModuleProgress(moduleID);

              

               

    },
    getProgressBar : function (){
         this.container = new Element('div', {
                    id : "Module_progress_" + menuItem.id,
                    html : "Progress: ",
                    'class' : 'module_progress_title'
                });
             
        this.progressbar  = new dwProgressBar({
                    container : menuItem,
                    startPercentage : moduleProgress.progress,
                    speed : 1000,
                    boxID : 'module_progress_box_' + menuItem.id,
                    boxClass : 'module_progress_box',
                    percentageID : 'module_progress_perc_' + menuItem.id,
                    percentageClass : 'module_progress_perc',
                    displayText : true,
                    displayID : 'text_' + menuItem.id,
                    displayClass : 'module_progress_title'
                });
    }
})

