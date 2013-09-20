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
   // $m(Main.DIV_ID).addClass("panel");
    $m(Main.DIV_ID).addClass(cssClassName);
};



UIHelpers.setMainPanel = function(cssClassName) {
    $m(Main.DIV_ID).removeAttribute('class');
    $m(Main.DIV_ID).addClass(cssClassName);
};

UIHelpers.setupButton2 = function(buttonType, parent, next) {
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
