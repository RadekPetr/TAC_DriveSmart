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

UIHelpers.getButtonOptions = function(buttonType) {

    var buttonPosition = {
        x : 480,
        y : 415
    };
    var presets = new Hash({
        "Main Menu" : {
            id : "button_" + buttonType,
            text : "Main Menu",
            next : "MainMenu.clicked",
            'class' : "button position_2"
        },
        "Continue" : {
            id : "button_" + buttonType,
            text : "Continue",
            next : "Continue.clicked",
            'class' : "button position_1"
        },
        "Repeat" : {
            id : "button_" + buttonType,
            text : "Repeat",
            next : "Repeat.clicked",
            'class' : "button position_3"
        },
        "Done" : {
            id : "button_" + buttonType,
            text : "Done",
            next : "Risks.done",
            'class' : "button position_1"
        },
        "Cancel" : {
            id : "button_" + buttonType,
            text : "Cancel",
            next : "ConActivity.cancel.clicked",
            'class' : "button position_1"
        },
        "Record" : {
            id : "button_" + buttonType,
            text : "Record",
            next : "CommentaryIntro.done",
            'class' : "button position_1"
        },
        "Expert commentary" : {
            id : "button_" + buttonType,
            text : "Expert commentary",
            next : "CommentaryIntro.expert.clicked",
            'class' : "button position_4",
            style : {
                width : '195px'
            }
        },
        "Expert commentary 2" : {
            id : "button_" + buttonType,
            text : "Expert commentary",
            next : "Commentary.expert.clicked",
            style : {
                left : 20,
                top : buttonPosition.y - 45,
                width : '195px'
            }
        },
        "Skip" : {
            id : "button_" + buttonType,
            text : "Skip",
            next : "ConIntro.done.clicked",
            'class' : "button position_1"
        },
        "Start" : {
            id : "button_" + buttonType,
            text : "Start",
            next : "ConIntro.done.clicked",
            'class' : "button position_1"
        },
        "Your commentary" : {
            id : "button_" + buttonType,
            text : "Your commentary",
            next : "Commentary.replay.clicked",
            'class' : "button position_4",
            style : {
                width : '195px'
            }
        }
    });
    var options = presets.get(buttonType);
    return options;
};
