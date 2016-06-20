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
    var progressBarComponent = new Element('div', {
        id : "Progress_" + id,
        html : "",
        'class' : 'no-select'
    });

    var progressBar = new dwProgressBar({
        container : progressBarComponent,
        startPercentage : progress,
        speed : 10,
        boxID : 'progress_box_' + id,
        boxClass : 'progress_box',
        percentageID : 'progress_perc_' + id,
        percentageClass : 'progress_perc',
        displayText : true,
        displayID : 'text_' + id,
        displayClass : 'progress_title'
    });
    return {
        holder : progressBarComponent,
        object : progressBar
    };
};

UIHelpers.setMainPanel = function(titleText) {
    var moduleTitle = $m(Main.DIV_ID).getElementById('module.title');

    if (moduleTitle == null) {
        moduleTitle = new Element("div", {
            html : titleText,
            'class' : 'module-title no-select rotate90',
            'id' : 'module.title'
        });
        moduleTitle.inject($m(Main.DIV_ID), 'top');
    } else {
        moduleTitle.set('html', titleText);
    }
    return moduleTitle;
};

UIHelpers.setClasses = function(el, cssClasses) {
    el.removeAttribute('class');
    el.addClass(cssClasses);
};

UIHelpers.getButtonOptions = function(buttonType) {

    var buttonPosition = {
        x : 70 + Main.WIDTH - (Main.WIDTH - Main.VIDEO_WIDTH + Main.VIDEO_LEFT) / 2,
        y : 415
    };
    var presets = new Hash({
        "Main Menu" : {
            id : "button_" + buttonType,
            text : "Main Menu",
            next : "MainMenu.clicked",
            'class' : "button position_2 pane orange"
        },
        "Continue" : {
            id : "button_" + buttonType,
            text : "Continue",
            next : "Continue.clicked",
            'class' : "button position_1 pane green"
        },
        "Repeat Exercize" : {
            id : "button_" + buttonType,
            text : "Continue (Repeat)",
            next : "Continue.clicked",
            'class' : "button position_1 pane green"
        },
        "Repeat" : {
            id : "button_" + buttonType,
            text : "Repeat",
            next : "Repeat.clicked",
            'class' : "button position_3 pane blue"
        },
        "Repeat video" : {
            id : "button_" + buttonType,
            text : "Repeat video",
            next : "Repeat.video.clicked",
            'class' : "button position_3 pane blue"
        },
        "Done" : {
            id : "button_" + buttonType,
            text : "Done",
            next : "Risks.done",
            'class' : "button position_1 pane green"
        },
        "Cancel" : {
            id : "button_" + buttonType,
            text : "Cancel",
            next : "ConActivity.cancel.clicked",
            'class' : "button position_1 pane orange"
        },
        "Record" : {
            id : "button_" + buttonType,
            text : "Record",
            next : "CommentaryIntro.done",
            'class' : "button position_1 pane orange"
        },
        "Expert commentary" : {
            id : "button_" + buttonType,
            text : "Expert commentary",
            next : "CommentaryIntro.expert.clicked",
            'class' : "button position_4 pane orange",
            style : {
                width : '195px'
            }
        },
        "Expert commentary 2" : {
            id : "button_" + buttonType,
            text : "Expert commentary",
            next : "Commentary.expert.clicked",
            'class' : "button position_4 pane green",
            style : {
                top : '395px',
                width : '195px'
            }
        },
        "Skip" : {
            id : "button_" + buttonType,
            text : "Skip",
            next : "ConIntro.done.clicked ",
            'class' : "button position_1 pane orange"
        },
        "Start" : {
            id : "button_" + buttonType,
            text : "Start",
            next : "ConIntro.done.clicked",
            'class' : "button position_1 pane green"
        },
        "Your commentary" : {
            id : "button_" + buttonType,
            text : "Your commentary",
            next : "Commentary.replay.clicked",
            'class' : "button position_4 pane green",
            style : {
                width : '195px'
            }
        },
        "Record 2" : {
            id : "button_" + buttonType,
            text : "Record",
            next : "Commentary.repeat.clicked",
            'class' : "button position_4 pane orange",
            style : {
                width : '195px'
            }
        },
        "Play Cameo" : {
            id : "button_" + buttonType,
            text : "Play driver video",
            next : "",
            'class' : "button position_4 pane orange",
            style : {
                width : '195px'
            }
        },
        "Previous_Sequence" : {
            id : "button_" + buttonType,
            text : "< Previous",
            next : "Previous_Sequence.clicked",
            'class' : "button position_6 pane blue"
        },
        "Next_Sequence" : {
            id : "button_" + buttonType,
            text : "Next >",
            next : "Next_Sequence.clicked",
            'class' : "button position_5 pane blue"
        }
    });
    var options = presets.get(buttonType);
    return options;
};
