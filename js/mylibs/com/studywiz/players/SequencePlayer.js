/**
 * @author Radek
 */

var flashLoaded = false;

function flashLoaded() {
    flashLoaded = true;
    console.log("Flash Is ready");
}

function jsIsReady() {
    return true;
}

var SequencePlayer = new Class({
    // TODO: move folders to global var  - maybe a global settings object which is global ?
    Implements : [Options, Events],
    options : {
        audioFolder : 'media/sound/',
        videoFolder : 'media/video/',
        imageFolder : 'media/images/',
        flashFolder : 'media/flash/',
        parent : null
    },
    initialize : function(myParent, module, myOptions) {

        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.currentSequence = new Array();
        this.sequenceState = null;
        this.currentStep = null;
        this.mediaLoader = null;
        this.buttons = new Array();
        this.interactions = null;
        this.videos = new Array();
        this.activeVideo = null;
        this.shapes = null;
        this.cameo_image = null;

        this.buttonPosition = {
            x : 480,
            y : 415
        }

        this.panelPosition = {
            left : '5%',
            top : '25%'
        }

        this.mediaLoader = new MediaLoader(this, {
            parentElementID : driveSmartDivID
        });

        this.addEvent("TIMELINE", this.handleNavigationEvent);
    },
    myParent : function() {
        return this.options.parent;
    },
    // ----------------------------------------------------------
    start : function(sequenceData) {
        // Get rid of any elements possibly left in
        this.reset();

        this.currentSequence = Array.clone(sequenceData);
        this.moduleInfo = this.myParent().getModuleInfo();

        this.sequenceState = {
            moduleID : this.moduleInfo.moduleID,
            id : this.moduleInfo.currentSequenceID,
            completed : false,
            score : new Array()
        }

        // TODO handle mobile platforms: Browser.Platform.android, handle incompatible old browsers
        log("Starting SEQUENCE: " + this.moduleInfo.currentSequenceID);
        //log(this.currentSequence);

        //
        this.setupMedia();
    },
    // ----------------------------------------------------------
    setupMedia : function() {
        this._setupSequence(this.currentSequence);
        this.mediaLoader.options.next = 'Media.ready';
        this.mediaLoader.start(true);
    },
    nextStep : function() {
        // take a step and decide what to do with it
        if (this.currentStep != null) {
            var lastStepScore = this.currentStep.score;
            log("Score:", lastStepScore);
            if (lastStepScore != null && lastStepScore != undefined) {
                this.sequenceState.score.push(lastStepScore);
            }
        }
        if (this.currentSequence.length > 0) {

            var step = this.currentSequence.shift();
            this.currentStep = step;

            var stepType = step.attributes.fmt;
            //log("Step type: " + stepType);
            switch (stepType) {
                case "Menu":
                    var myContainerID = 'Menu.container';
                    var myDiv = new Element("div", {
                        id : myContainerID
                    });
                    myDiv.inject($(driveSmartDivID));
                    step.image.add(myContainerID);
                    // TODO: adjust style based on TAC
                    //step.image.show();
                    var moduleTitle = new Element("h1", {
                        html : this.moduleInfo.moduleTitle,
                        'class' : 'main-title'
                    })
                    moduleTitle.inject(myDiv);
                    step.data.style = {
                        left : '10px',
                        top : '40px'
                    }
                    var menu = new MenuItems(this, step.data);
                    menu.add(myContainerID);
                    menu.show();

                    var score = new Element("h2", {
                        html : "Overall score: " + (100 * userTracker.getTotalScore()).toInt() + "/100",
                        styles : {
                            'position' : 'absolute',
                            left : '390px',
                            top : '30px'
                        }
                    })

                    score.inject(myDiv);

                    break;
                case "SequenceIntro":
                    var myContainerID = 'SequenceIntro.container';
                    var myDiv = new Element("div", {
                        id : myContainerID
                    });
                    myDiv.inject($(driveSmartDivID));

                    step.image.add(myContainerID);
                    step.image.show();

                    step.previewImage.add(myContainerID);
                    step.previewImage.show();

                    var moduleTitle = new Element("h1", {
                        html : this.moduleInfo.moduleTitle,
                        styles : {
                            left : '0px',
                            top : '20%'
                        },
                        'class' : 'module-title'
                    })
                    moduleTitle.inject(myDiv);

                    var moduleProgress = userTracker.getModuleProgress(this.moduleInfo.moduleID);
                    var sequenceTitleText = "Exercise " + this.sequenceState.id + " of " + moduleProgress.total;
                    var sequenceTitle = new Element("h1", {
                        html : sequenceTitleText,
                        styles : {
                            left : '0',
                            top : '350px'
                        },
                        'class' : 'sequence-title'
                    })
                    sequenceTitle.inject(myDiv);
                    var moduleProgressBar = moduleProgressSetup(this.moduleInfo.moduleID);
                    moduleProgressBar.setStyles({
                        left : 0,
                        top : '380px'
                    });
                    moduleProgressBar.inject(myDiv);

                    this._setupButton({
                        text : "Continue",
                        'class' : "button next",
                        next : "SequenceIntro.done",
                        style : {
                            left : this.buttonPosition.x,
                            top : this.buttonPosition.y
                        }
                    });
                    this._setupButton({
                        text : "Main Menu",
                        'class' : "button star",
                        next : "MainMenuIntro.clicked",
                        style : {
                            left : this.buttonPosition.x,
                            top : this.buttonPosition.y - 45
                        }
                    });

                    step.player.options.next = '';
                    step.player.start();
                    break;
                case "CommentaryIntro":
                    var myContainerID = 'CommentaryIntro.container';
                    var myDiv = new Element("div", {
                        id : myContainerID
                    });
                    myDiv.inject($(driveSmartDivID));

                    step.image.add(myContainerID);
                    step.image.show();

                    this._setupButton({
                        text : "Record",
                        'class' : "button record",
                        next : "CommentaryIntro.done",
                        style : {
                            left : this.buttonPosition.x,
                            top : this.buttonPosition.y
                        }
                    });
                    // does the next step have expert audio ? Show button if yes
                    var nextStep = this.currentSequence[0];
                    if (nextStep.expertAudio != undefined) {
                        this._setupButton({
                            text : "Expert commentary",
                            'class' : "button play",
                            next : "CommentaryIntro.expert.clicked",
                            style : {
                                left : 20,
                                top : this.buttonPosition.y,
                                width : '195px'
                            }
                        });
                    }

                    this.recorder = new Recorder(this, {
                        swiff : {
                            id : 'Commentary'
                        },
                        src : this.options.flashFolder + "commentary.swf"
                    });

                    this.recorder.add(driveSmartDivID);
                    // -----
                    step.player.options.next = '';
                    step.player.start();
                    break;
                case "PlayVideo":
                    this._removeImages();
                    this._removeButtons();
                    this._cleanUp();
                    this._hideInteractions();
                    step.player.options.next = 'PlayVideo.done';
                    step.player.show();
                    step.player.start();
                    this._hideOtherVideos(step.player.playerID);
                    //TODO: noBg1="1"
                    break;
                case "Question":
                    // TODO: maybe add attribute to wait or not
                    step.player.options.next = 'Question.done';
                    step.player.start();
                    if (step.attributes.cmd == "hidescreen") {                       
                        log(this.activeVideo);
                        this.activeVideo.obscure();
                    }
                    // this.nextStep();

                    break;
                case "QuestionUser":
                    this._removeInteractions();
                    if (step.attributes.resp != null && step.attributes.resp != undefined) {
                        step.data.responses = step.attributes.resp;
                    }
                    this.interactions = this._setupQuestions(step.data);
                    this._setupButton({
                        text : "Done",
                        'class' : "button save",
                        next : "QuestionUser.done",
                        style : {
                            left : this.buttonPosition.x,
                            top : this.buttonPosition.y
                        }
                    });
                    // resp="3" - allow multiple choices
                    //TODO: notrack="true"
                    //TODO: image="country_cla01_next_first.jpg" - override background image ...
                    break;
                case "QuestionFeedback":
                    this._removeButtons();
                    this._showInteractions();
                    step.score = this.interactions.showCorrect();
                    step.player.options.next = 'QuestionFeedback.done';
                    step.player.start();
                    if (step.attributes.show == "MudScreen") {
                        this.activeVideo.obscure();
                    }
                    //TODO:  KeepUserSelection="1" ?
                    break;
                case "PlayAudio":
                    step.player.options.next = 'PlayAudio.done';
                    step.player.start();
                    //TODO: hide="box" not used ?
                    break;
                case "Continue":
                    // NOTE IMPORTANT - this only can be at the end of the sequence !!!!
                    this._setupButton({
                        text : "Continue",
                        'class' : "button next",
                        next : "Continue.clicked",
                        style : {
                            left : this.buttonPosition.x,
                            top : this.buttonPosition.y
                        }
                    });
                    this._setupButton({
                        text : "Main Menu",
                        'class' : "button star",
                        next : "MainMenu.clicked",
                        style : {
                            left : this.buttonPosition.x,
                            top : this.buttonPosition.y - 45
                        }
                    });
                    this._setupButton({
                        text : "Repeat",
                        'class' : "button back",
                        next : "Repeat.clicked",
                        style : {
                            left : this.buttonPosition.x,
                            top : this.buttonPosition.y - 90
                        }
                    });

                    this._updateUserProgress();
                    break;
                case "End.Module.Continue":
                    step.player.start();
                    this._setupButton({
                        text : "Continue",
                        'class' : "button next",
                        next : "End.Module.Continue.clicked",
                        style : {
                            left : this.buttonPosition.x,
                            top : this.buttonPosition.y
                        }
                    });
                    this._setupButton({
                        text : "Repeat",
                        'class' : "button back",
                        next : "Repeat.clicked",
                        style : {
                            left : this.buttonPosition.x,
                            top : this.buttonPosition.y - 90
                        }
                    });

                    this._updateUserProgress();

                    break;
                case "Commentary":
                    this._removeButtons();
                    if (step.playExpert == true) {
                        var expertAudio = this.currentStep.expertAudio;
                        if (expertAudio != undefined) {
                            expertAudio.options.next = '';
                            expertAudio.start();
                        }
                        step.playExpert = false;
                    } else {
                        this.recorder.startRecording();
                    }
                    step.player.options.next = 'Commentary.recording.done';
                    step.player.show();
                    step.player.volume(0.2);
                    this._hideOtherVideos(step.player.playerID);
                    step.player.start();
                    break;
                case "KeyRisk" :
                    log("KR");
                    this._removeInteractions();

                    step.player.options.next = 'Risks.ready';

                    //TODO: <Audio waitfor="true">sound/scanning/mp3/scan_vsbkr1b.mp3</Audio>

                    this.shapes = new KeyRiskPlayer(this, {});

                    // don't want to clone the step data by passing it as option
                    this.shapes.options.data = {
                        areas : step.areas
                    };
                    // TODO: move adding the aqreas until afte rthe audio is done ?
                    this.shapes.add(this.activeVideo.containerID);
                    // play Audio - Intro
                    step.player.start();

                    break;
                case "KRFeedback":
                    this._removeButtons();
                    step.image.add(this.shapes.container.id);
                    step.image.show();
                    step.player.options.next = 'KRFeedback.done';
                    step.player.start();
                    break;
                case "Cameo":
                    var file = this.options.imageFolder + 'cameo/visor_bkg.png';
                    this.cameo_image = new ImagePlayer(this, {
                        src : file,
                        next : "Cameo.visor.image.ready",
                        title : 'Visor',
                        id : 'visor',
                        style : {
                            'left' : '170px',
                            'height' : '0px'
                        }
                    });

                    var file = this.options.imageFolder + 'cameo/visor_mask.png';
                    this.cameo_image_mask = new ImagePlayer(this, {
                        src : file,
                        next : "Cameo.visor.image.ready",
                        title : 'Visor',
                        id : 'visor',
                        style : {
                            'left' : '170px',
                            'height' : '0px'
                        }
                    });
                    this.cameo_image.preload();
                    this.cameo_image_mask.preload();
                    break;
                case "DragNDrop":
                    // show empty bkg
                    step.emptyBkg.add(this.activeVideo.containerID);
                    step.emptyBkg.show();
                    step.dragNDrop = new DragNDropPlayer(this, {});

                    var panel = new ImagePlayer(this, {
                        src : this.options.imageFolder + 'dragdrop/panel_bkg.png',
                        style : {
                            'left' : '427px',
                            'top' : '0px',
                            'position' : 'absolute'
                        }
                    });

                    panel.preload();
                    panel.add(this.activeVideo.containerID);
                    panel.show();

                    // don't want to clone the step data by passing it as option
                    step.dragNDrop.options.data = {
                        areas : step.areas
                    };
                    step.dragNDrop.add(this.activeVideo.containerID);
                    // play Audio - Intro
                    step.player.start();

                    this._setupButton({
                        text : "Done",
                        'class' : "button next",
                        next : "DragNDrop.done",
                        style : {
                            left : this.buttonPosition.x,
                            top : this.buttonPosition.y
                        }
                    });
                    break;
                case "DragNDropFeedback":

                    if (this.currentSequence.length > 0) {
                        log("ERROR - DragNDropFeedback must be last in the sequence");
                    }

                    // Show correct bkg
                    step.image.add(this.activeVideo.containerID);
                    step.image.show();

                    // Play audio
                    step.player.start();
                    // setup buttons
                    // TODO: extract the end buttons to separate method - replace in continue and here

                    this._setupButton({
                        text : "Continue",
                        'class' : "button next",
                        next : "Continue.clicked",
                        style : {
                            left : this.buttonPosition.x,
                            top : this.buttonPosition.y
                        }
                    });
                    this._setupButton({
                        text : "Main Menu",
                        'class' : "button star",
                        next : "MainMenu.clicked",
                        style : {
                            left : this.buttonPosition.x,
                            top : this.buttonPosition.y - 45
                        }
                    });
                    this._setupButton({
                        text : "Repeat",
                        'class' : "button back",
                        next : "Repeat.clicked",
                        style : {
                            left : this.buttonPosition.x,
                            top : this.buttonPosition.y - 90
                        }
                    });
                    // save progress
                    // this is always the last in the sequence ...
                    this._updateUserProgress();
                    break;
            }

        } else {
            // seq finished
            log('******** ERROR - Missing Continue STEP in this sequence');
        }
    },
    // ----------------------------------------------------------
    // This handles all timeline events and emulates the timeline
    handleNavigationEvent : function(params) {

        switch (params.next) {
            case "Media.ready":
            case "PlayVideo.done":
            case "Question.done":
            case "QuestionFeedback.done":
            case "PlayAudio.done":
                this.nextStep();
                break;
            case "SequenceIntro.done":
                this._removeImages();
                this._removeButtons();
                this._cleanUp();
                this.nextStep();
                break;
            case 'KRFeedback.continue.done':
                this._removeRisks();
                this._removeImages();
                this._removeButtons();
                this._cleanUp();
                this.nextStep();
                break;
            case "Skip.done":
                this._removeImages();
                this._removeButtons();
                this._cleanUp();
                this.nextStep();
                break;
            case "QuestionUser.done":
                this.interactions.lockAnswer();
                this._removeButtons();
                this.nextStep();
                break;
            case "Risks.ready":
                this._setupButton({
                    text : "Done",
                    'class' : "button save",
                    next : "Risks.done",
                    style : {
                        left : this.buttonPosition.x,
                        top : this.buttonPosition.y
                    }
                });
                break;
            case "Risks.done" :
                this.activeVideo.container.removeEvents('click');
                this.currentStep.score = this.shapes.getScore();
                this.nextStep();
                break;
            case 'KRFeedback.done':
                // add continue button
                this._setupButton({
                    text : "Continue",
                    'class' : "button next",
                    next : "KRFeedback.continue.done",
                    style : {
                        left : this.buttonPosition.x,
                        top : this.buttonPosition.y
                    }
                });
                break;
            case "Continue.clicked":
                this.reset();
                this.myParent().fireEvent("SEQUENCE", {
                    type : "sequence.event",
                    next : 'sequence.next'
                });
                break;
            case "Repeat.clicked":
                this._removeVideos();
                this._removeImages();
                this._removeButtons();
                this._cleanUp();
                this._removeInteractions();

                this.myParent().fireEvent("SEQUENCE", {
                    type : "sequence.event",
                    next : 'sequence.repeat'
                });
                break;
            case "End.Module.Continue.clicked":
            case "MainMenu.clicked":
            case "MainMenuIntro.clicked":
                this._removeVideos();
                this._removeImages();
                this._removeButtons();
                this._cleanUp();
                this._removeInteractions();
                this.myParent().fireEvent("SEQUENCE", {
                    type : "sequence.event",
                    next : 'sequence.exit'
                });
                break;
            case "Cameo.visor.image.ready":
                if (this.cameo_image.options.loaded && this.cameo_image_mask.options.loaded) {

                    this.cameo_image.add(this.currentStep.player.containerID, 'before');
                    this.cameo_image.show();
                    this.cameo_image.tween('203px', '0px', 1, 'height', 300, 'ignore', 'Cameo.visor.tween.done');

                    this.cameo_image_mask.add(this.currentStep.player.containerID, 'after');
                    this.cameo_image_mask.show();
                    this.cameo_image_mask.tween('203px', '0px', 1, 'height', 300, 'ignore', '')
                }
                break;
            case "Cameo.visor.tween.done":
                this.currentStep.player.options.next = 'Cameo.done';
                this.currentStep.player.show();
                this.currentStep.player.start();
                break;
            case "Cameo.done":
                this.currentStep.player.hide(0);
                this.cameo_image.tween('0px', '203px', 1, 'height', 300, 'ignore', '');
                this.cameo_image_mask.remove();
                this.nextStep();

                break;
            case "CommentaryIntro.expert.clicked":
                // set next Commentary to play expert
                var nextStep = this.currentSequence[0];
                if (nextStep.attributes.fmt == "Commentary") {
                    nextStep.playExpert = true;
                } else {
                    log("ERROR - next step must be Commentary after CommentaryIntro");
                }
            case "CommentaryIntro.done":
                this._removeInteractions();
                this._removeButtons();
                this._cleanUp();
                this.nextStep();
                break;
            case "Commentary.recording.done":
                log("Ok recorder stopped");
                this._updateUserProgress();
                this.recorder.stopRecording();

                var feedbackAudio = this.currentStep.feedbackAudio;
                if (feedbackAudio != undefined) {
                    feedbackAudio.options.next = '';
                    feedbackAudio.start();
                    // play the feedback and show text if present
                }
                var feedbackText = this.currentStep.data;

                if (feedbackText != undefined) {
                    this.currentStep.feedbackPanel = new CommentaryFeedback(this, this.currentStep.data);
                    this.currentStep.feedbackPanel.add(driveSmartDivID);
                    this.currentStep.feedbackPanel.show();
                }
                this._setupButton({
                    text : "Your commentary",
                    'class' : "button play",
                    next : "Commentary.replay.clicked",
                    style : {
                        left : 20,
                        top : this.buttonPosition.y,
                        width : '195px'
                    }
                });

                var ExpertAudio = this.currentStep.expertAudio;
                if (ExpertAudio != undefined) {
                    // show play expert commentary button
                    this._setupButton({
                        text : "Expert commentary",
                        'class' : "button play",
                        next : "Commentary.expert.clicked",
                        style : {
                            left : 20,
                            top : this.buttonPosition.y - 45,
                            width : '195px'
                        }
                    });
                }
                // TODO: offer sequence repeat as well - may need to show continue screen after all ?
                this._setupButton({
                    text : "Continue",
                    'class' : "button next",
                    next : "Continue.clicked",
                    style : {
                        left : this.buttonPosition.x,
                        top : this.buttonPosition.y
                    }
                });
                this._setupButton({
                    text : "Repeat",
                    'class' : "button record",
                    next : "Commentary.repeat.clicked",
                    style : {
                        left : this.buttonPosition.x,
                        top : this.buttonPosition.y - 90
                    }
                });
                this._setupButton({
                    text : "Main Menu",
                    'class' : "button star",
                    next : "MainMenu.clicked",
                    style : {
                        left : this.buttonPosition.x,
                        top : this.buttonPosition.y - 45
                    }
                });
                break;
            case "Commentary.replay.clicked":
                this._removeFeedbackPanel();
                this._removeButtons();
                this._cleanUp();
                this.recorder.startPlayback();
                this.currentStep.player.show();
                this.currentStep.player.options.next = 'Commentary.recording.done';
                this.currentStep.player.volume(0.2);
                this.currentStep.player.start();
                break;
            case "Commentary.expert.clicked":
                this._removeFeedbackPanel();
                this._removeButtons();
                this._cleanUp();
                var expertAudio = this.currentStep.expertAudio;
                if (expertAudio != undefined) {
                    expertAudio.options.next = '';
                    expertAudio.start();
                }
                this.currentStep.player.show();
                this.currentStep.player.options.next = 'Commentary.recording.done';
                this.currentStep.player.volume(0.2);
                this.currentStep.player.start();
                break;
            case "Commentary.repeat.clicked":
                this._removeFeedbackPanel();
                this._removeButtons();
                this._cleanUp();
                this.currentSequence.unshift(this.currentStep);
                this.nextStep();
                break;
            case "DragNDrop.done":
                this._removeButtons();
                this._cleanUp();
                // disable dragging now
                this.currentStep.dragNDrop.stop();

                this.currentStep.score = this.currentStep.dragNDrop.getScore();

                var nextStep = this.currentSequence[0];
                if (nextStep.attributes.fmt == "DragNDropFeedback") {
                    this.nextStep();
                } else {
                    log("ERROR - next step must be DragNDropFeedback after DragNDrop");
                    this.nextStep();
                }
                break;
            case "Menu.item.clicked":
                this._removeImages();
                this._removeButtons();
                this._cleanUp();

                this.myParent().myParent().setOptions({
                    moduleID : params.id
                });
                this.myParent().fireEvent("SEQUENCE", {
                    type : "sequence.event",
                    next : 'module.selected'
                });
                break;
        };
    },
    getSequenceState : function() {
        return this.sequenceState;
    },
    //------------------------------------------------------------------------
    _setupButton : function(options) {
        options.id = "button_" + this.buttons.length;
        // TODO: Disabled symbol on buttons, to finalize with new style when available
        options['class'] = 'button';
        //
        var button = new Button(this, options);
        button.add(driveSmartDivID);
        button.show();
        this.buttons.push(button);
    }.protect(),
    //------------------------------------------------------------------------
    _setupQuestions : function(options) {
        var questions = new Questions(this, options);
        questions.add(driveSmartDivID, "bottom");
        questions.show();
        return questions;
    }.protect(),
    // ----------------------------------------------------------
    _setupSequence : function(seq) {
        // get array of media for each step so it can be preloaded
        var media = new Hash({});
        Array.each(seq, function(step, stepOrder) {
            //var stepItems = step.childNodes;
            this._setupStepMedia(step, stepOrder);
        }.bind(this))
        log("---------------------------- Finished setting up media from xml");
        //log(seq);
    }.protect(),
    // ----------------------------------------------------------
    _setupStepScoring : function(step, stepOrder) {
        //log( JSON.encode(step));
        var stepType = step.attributes.fmt;
    },
    _setupStepMedia : function(step, stepOrder) {
        //log( JSON.encode(step));
        var stepType = step.attributes.fmt;
        // log("Step: ", step, stepOrder, stepType);
        Array.each(step.childNodes, function(item, index) {
            if (step.player != undefined) {
                log("!!!!!!!!!!!!!!!!!!!!! ERROR - Two players in this step !!!!!!!!!!!!!!!!!!!!!!!!!" + stepType);
            }
            switch (item.name) {
                case "Video" :

                    if (item.value != '') {
                        var filename = item.value;
                        var style = null;

                        if (stepType == 'Cameo') {
                            style = {
                                'left' : '315px',
                                'top' : '20px',
                                'width' : '240',
                                'height' : '175'
                            }
                            var width = '240px';
                            var height = '175px';
                        } else {
                            style = {
                                'width' : '640',
                                'height' : '480',
                                'left' : '0',
                                'top' : '0'
                            }
                            var width = '240px';
                            var height = '175px';

                        }
                        step.player = new VideoPlayer(this, {
                            id : "video_" + index + "_" + stepOrder,
                            next : 'not.set',
                            'style' : style,
                            filename : filename,
                            width : width,
                            height : height
                        });

                        this.mediaLoader.register(step.player.getLoaderInfo());
                        // we want to store this so all VideoJS player can be removed correctly (see remove() in VideoPlayer)
                        this.videos.push(step.player);
                    }
                    break;
                case "Audio" :
                    if (item.value != '') {
                        var file = this.options.audioFolder + stripFileExtension(item.value);
                        step.player = new AudioPlayer(this, {
                            next : 'not.set',
                            id : "audio_" + index + "_" + stepOrder,
                            src : file + ".mp3|" + file + ".ogg",
                            preload : 'false'
                        });
                        this.mediaLoader.register(step.player.getLoaderInfo());
                    }
                    break;
                case "FeedbackAudio" :
                    if (item.value != '') {
                        var file = this.options.audioFolder + stripFileExtension(item.value);
                        step.feedbackAudio = new AudioPlayer(this, {
                            next : 'not.set',
                            id : "audio_" + index + "_" + stepOrder,
                            src : file + ".mp3|" + file + ".ogg",
                            preload : 'false'
                        });
                        this.mediaLoader.register(step.feedbackAudio.getLoaderInfo());
                    }
                    break;
                case "ExpertAudio" :
                    if (item.value != '') {
                        var file = this.options.audioFolder + stripFileExtension(item.value);
                        step.expertAudio = new AudioPlayer(this, {
                            next : 'not.set',
                            id : "audio_" + index + "_" + stepOrder,
                            src : file + ".mp3|" + file + ".ogg",
                            preload : 'false'
                        });
                        this.mediaLoader.register(step.expertAudio.getLoaderInfo());
                    }
                    break;
                case "DoneAudio" :
                    if (item.value != '') {
                        var file = this.options.audioFolder + stripFileExtension(item.value);
                        step.doneAudio = new AudioPlayer(this, {
                            next : 'not.set',
                            id : "audio_" + index + "_" + stepOrder,
                            src : file + ".mp3|" + file + ".ogg",
                            preload : 'false'
                        });
                        this.mediaLoader.register(step.doneAudio.getLoaderInfo());
                    }
                    break;
                case "Preview" :
                    if (item.value != '') {
                        var file = this.options.imageFolder + item.value;

                        step.previewImage = new ImagePlayer(this, {
                            src : file,
                            title : 'Preview',
                            id : 'preview_image',
                            style : {
                                width : '40%',
                                height : '40%',
                                top : '148px'
                            }
                        });
                        this.mediaLoader.register(step.previewImage.getLoaderInfo());
                    }
                    break;
                case "Image" :
                    if (item.value != '') {
                        var file = this.options.imageFolder + item.value;
                        step.image = new ImagePlayer(this, {
                            src : file,
                            title : 'Image',
                            id : 'image' + index + "_" + stepOrder
                        });
                        this.mediaLoader.register(step.image.getLoaderInfo());
                    }
                    break;
                case "EmptyBkg" :
                    if (item.value != '') {
                        var file = this.options.imageFolder + item.value;

                        step.emptyBkg = new ImagePlayer(this, {
                            src : file,
                            title : 'BkgImage',
                            id : 'image' + index + "_" + stepOrder
                        });
                        this.mediaLoader.register(step.emptyBkg.getLoaderInfo());
                    }
                    break;

                case "Items":
                    var menuItemsRawData = item.childNodes;
                    var menuItems = {
                        data : new Array()
                    }
                    Array.each(menuItemsRawData, function(menuItemData, index) {

                        var menuItem = {
                            text : menuItemData.value,
                            description : menuItemData.attributes.description,
                            moduleID : menuItemData.attributes.moduleID,
                            preview : menuItemData.attributes.preview,
                            showProgress : menuItemData.attributes.showProgress
                        }
                        menuItems.data.push(menuItem);
                    })
                    step.data = menuItems;
                    break;
                case "FeedbackText":
                    var feedbackItemsRawData = item.childNodes;
                    var feedbackItems = {
                        data : new Array()
                    }

                    Array.each(feedbackItemsRawData, function(feedbackItemData, index) {
                        var feedbackItem = {
                            text : feedbackItemData.value

                        }
                        feedbackItems.data.push(feedbackItem);
                    })
                    step.data = feedbackItems;
                    break;
                case "Inter":
                    var questionsRawData = item.childNodes;
                    var questions = {
                        data : new Array(),
                        style : this.panelPosition
                    }

                    Array.each(questionsRawData, function(questionData, index) {
                        var question = {
                            text : questionData.value,
                            correct : questionData.attributes.correct
                        }
                        questions.data.push(question);
                    })
                    step.data = questions;
                    break;
                case "DropAreas" :
                case "Areas" :
                    var rawData = item.childNodes;
                    step.areas = new Array();
                    Array.each(rawData, function(item, index) {
                        var area = {
                            id : item.attributes.id,
                            data : item.attributes.data,
                            angle : item.attributes.angle,
                            correct : item.attributes.correct
                        }
                        step.areas.push(area);
                    })
                    break;

                case "RotateAreas" :
                    // TODO: remove if no needed
                    var rawData = item.childNodes;
                    step.rotateZones = new Array();
                    Array.each(rawData, function(item, index) {
                        var area = {
                            id : item.attributes.id,
                            data : item.attributes.data,
                            angle : item.attributes.angle
                        }
                        step.rotateZones.push(area);
                    })
                    break;
                case "Zones":

                    //TODO: trim white spaces
                    step.zones = item.attributes.data;
                    break;

                default:
                // nothing
            }
        }.bind(this))

    }.protect(),
    _cleanUp : function() {
        if (this.currentStep != null) {
            if (this.currentStep.player != null) {
                //log(this.currentStep.player);
                this.currentStep.player.stop();
            }
            if (this.currentStep.feedbackAudio != undefined) {
                //log(this.currentStep.player);
                this.currentStep.feedbackAudio.stop();
            }
            if (this.currentStep.expertAudio != undefined) {
                //log(this.currentStep.player);
                this.currentStep.expertAudio.stop();
            }
        }

        var debugPanel = $('debugContainer');

        if (debugPanel != null) {
            //debugPanel.dispose();
        }
        var sequenceIntroTag = $('SequenceIntro.container');
        if (sequenceIntroTag != null) {
            sequenceIntroTag.destroy();
        }
        var sequenceIntroTag = $('CommentaryIntro.container');
        if (sequenceIntroTag != null) {
            sequenceIntroTag.destroy();
        }

        var menuTag = $('Menu.container');
        if (menuTag != null) {
            menuTag.destroy();
        }

    }.protect(),
    _removeImages : function() {
        var imageDiv = document.getElementById('imageContainer');
        if (imageDiv != null) {
            imageDiv.destroy();
        }
        //this.currentStep.previewImage.remove();
    }.protect(),
    _removeButtons : function() {
        Array.each(this.buttons, function(item, index) {
            item.remove();
        })
        this.buttons.empty();
    }.protect(),
    _removeInteractions : function() {
        if (this.interactions != null) {
            this.interactions.remove();
        }
        var interactions = $('panelContainer');
        if (interactions != null) {
            interactions.destroy();
        }
        this.interactions = null;
    },
    _hideInteractions : function() {
        if (this.interactions != null) {
            this.interactions.hide();
        }
    },
    _showInteractions : function() {
        if (this.interactions != null) {
            this.interactions.show();
        }
    },
    _removeVideos : function() {
        this.activeVideo = null;
        Array.each(this.videos, function(item, index) {
            item.remove();
            item = null;
            delete item;
        })
        this.videos.empty();
    },
    _hideOtherVideos : function(excludedId) {

        Array.each(this.videos, function(item, index) {
            var playerID = item.playerID;
            if (playerID == excludedId) {
                this.activeVideo = item;
            } else {
                item.hide();
            }
            //log("Player " + playerID + " to keep " + excludedId)
        }.bind(this))
    },
    _removeSwiff : function() {
        if (this.recorder != null) {
            this.recorder.remove();
        }
        this.recorder = null;
    }.protect(),
    _removeFeedbackPanel : function() {
        if (this.currentStep != undefined) {
            if (this.currentStep.feedbackPanel != undefined) {
                this.currentStep.feedbackPanel.remove();
            }
        }

    }.protect(),
    _removeRisks : function() {
        if (this.shapes != undefined && this.shapes != null) {
            this.shapes.remove();
        }
        this.shapes = null;
    }.protect(),
    // TODO maybe allow partial progress update ?
    _updateUserProgress : function() {
        // Update state to completed = true;
        this.sequenceState.completed = true;
        userTracker.updateSequenceProgress(this.sequenceState);

    }.protect(),

    onLoad : function() {
        log("Called Loaded");
    },
    isReady : function() {
        log("Is ready ?");
        return true;
    },
    reset : function() {
        this.currentSequence.empty();
        this._removeFeedbackPanel();
        this.mediaLoader.remove();
        this._removeImages();
        this._removeRisks();
        this._removeButtons();
        this._removeSwiff();
        this._removeInteractions();
        this._cleanUp();
        this._removeVideos();

        this.currentStep = null;
        this.cameo_image_mask = null;
        this.cameo_image = null;
        this.emptyBkg = null;
        this.correctBkg = null;

    }
});

