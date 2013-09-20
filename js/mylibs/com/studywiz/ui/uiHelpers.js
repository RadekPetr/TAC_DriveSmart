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

UIHelpers.setupButton = function(buttonType, parent, next) {
    // TODO: position by class - predefine positions in css and give the buttons ids according to the position
    var buttonPosition = {
        x : 480,
        y : 415
    };
    var presets = new Hash({
        "Main Menu" : {
            id : "button_" + parent.buttons.length,
            text : "Main Menu",
            next : "MainMenu.clicked",
            style : {
                left : buttonPosition.x,
                top : buttonPosition.y - 45
            }
        },
        "Continue" : {
            id : "button_" + parent.buttons.length,
            text : "Continue",
            next : "Continue.clicked",
            style : {
                left : buttonPosition.x,
                top : buttonPosition.y
            }
        },
        "Repeat" : {
            id : "button_" + parent.buttons.length,
            text : "Repeat",
            next : "Repeat.clicked",
            style : {
                left : buttonPosition.x,
                top : buttonPosition.y - 90
            }
        },
        "Done" : {
            id : "button_" + parent.buttons.length,
            text : "Done",
            next : "Risks.done",
            style : {
                left : buttonPosition.x,
                top : buttonPosition.y
            }
        },
        "Cancel" : {
            id : "button_" + parent.buttons.length,
            text : "Cancel",
            next : "ConActivity.cancel.clicked",
            style : {
                left : buttonPosition.x,
                top : buttonPosition.y
            }
        },
        "Record" : {
            id : "button_" + parent.buttons.length,
            text : "Record",
            next : "CommentaryIntro.done",
            style : {
                left : buttonPosition.x,
                top : buttonPosition.y
            }
        },
        "Expert commentary" : {
            id : "button_" + parent.buttons.length,
            text : "Expert commentary",
            next : "CommentaryIntro.expert.clicked",
            style : {
                left : 20,
                top : buttonPosition.y,
                width : '195px'
            }
        },
        "Expert commentary 2" : {
            id : "button_" + parent.buttons.length,
            text : "Expert commentary",
            next : "Commentary.expert.clicked",
            style : {
                left : 20,
                top : buttonPosition.y - 45,
                width : '195px'
            }
        },
        "Skip" : {
            id : "button_" + parent.buttons.length,
            text : "Skip",
            next : "ConIntro.done.clicked",
            style : {
                left : buttonPosition.x,
                top : buttonPosition.y
            }
        },
        "Start" : {
            id : "button_" + parent.buttons.length,
            text : "Start",
            next : "ConIntro.done.clicked",
            style : {
                left : buttonPosition.x,
                top : buttonPosition.y
            }
        },
        "Your commentary" : {
            id : "button_" + parent.buttons.length,
            text : "Your commentary",
            next : "Commentary.replay.clicked",
            style : {
                left : 20,
                top : buttonPosition.y,
                width : '195px'
            }

        }

    });

    var options = presets.get(buttonType);
    // TODO: Disabled symbol on buttons, to finalize with new style when available
    options['class'] = 'button';
    if (next) {
        options['next'] = next;
    }
    //
    var button = new Button(parent, options);
    button.add(Main.DIV_ID);
    button.show();
    parent.buttons.push(button);
};
