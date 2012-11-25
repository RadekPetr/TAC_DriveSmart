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

    Implements : [Options, Events],
    options : {
        unitTagId : 'drivesmart',
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
            parentElementID : this.options.unitTagId
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
            // TODO: if this.currentStep is not empty, get it;s score and add it to the sequence score
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
                    myDiv.inject($(this.options.unitTagId));
                    step.image.add(myContainerID);
                    step.image.show();
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

                    break;
                case "SequenceIntro":
                    var myContainerID = 'SequenceIntro.container';
                    var myDiv = new Element("div", {
                        id : myContainerID
                    });
                    myDiv.inject($(this.options.unitTagId));

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
                    moduleTitle.inject($(myContainerID));

                    var moduleProgress = userTracker.getModuleProgress(this.moduleInfo.moduleID);
                    var sequenceTitleText = "Exercise " + moduleProgress.finishedCount + " of " + moduleProgress.total + " completed";
                    var sequenceTitle = new Element("h1", {
                        html : sequenceTitleText,
                        styles : {
                            left : '0px',
                            top : '10%'
                        },
                        'class' : 'sequence-title'
                    })
                    sequenceTitle.inject($(myContainerID));

                    var button = this._setupButton("Continue", "button next", "SequenceIntro.done", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);
                    button = this._setupButton("Main Menu", "button star", "MainMenuIntro.clicked", this.buttonPosition.x, this.buttonPosition.y - 45);
                    this.buttons.push(button);
                    step.player.options.next = '';
                    step.player.start();
                    break;
                case "CommentaryIntro":
                    var myContainerID = 'CommentaryIntro.container';
                    var myDiv = new Element("div", {
                        id : myContainerID
                    });
                    myDiv.inject($(this.options.unitTagId));

                    step.image.add(myContainerID);
                    step.image.show();

                    var button = this._setupButton("Record", "button record", "CommentaryIntro.done", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);
                    // does the next step have expert audio ? Show button if yes
                    var nextStep = this.currentSequence[0];
                    if (nextStep.expertAudio != undefined) {
                        button = this._setupButton("Expert", "button play", "CommentaryIntro.expert.clicked", 20, this.buttonPosition.y);
                        this.buttons.push(button);
                    }

                    this.recorder = new Recorder(this, {
                        swiff : {
                            id : 'Commentary'
                        },
                        src : this.options.flashFolder + "commentary.swf"
                    });

                    this.recorder.add(this.options.unitTagId);
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
                        //TODO: cmd="hidescreen" - show the mudscreen
                        log(this.activeVideo);
                        this.activeVideo.obscure();
                    }
                    // this.nextStep();

                    break;
                case "QuestionUser":
                    this._removeInteractions();
                    if (step.attributes.resp != null &&  step.attributes.resp != undefined) {
                        step.data.responses = step.attributes.resp;
                    }
                    this.interactions = this._setupQuestions(step.data);
                    var button = this._setupButton("Done", "button save", "QuestionUser.done", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);

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
                        //TODO: show="MudScreen" - show mudscreen during feedback
                        this.activeVideo.obscure();
                    }
                    //TODO: get score and set it.
                    //TODO:  KeepUserSelection="1"
                    break;
                case "PlayAudio":
                    step.player.options.next = 'PlayAudio.done';
                    step.player.start();
                    //TODO: hide="box" not used ?
                    break;
                case "Continue":
                    // NOTE IMPORTANT - this only can be at the end of the sequence !!!!
                    var button = this._setupButton("Continue", "button next", "Continue.clicked", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);
                    button = this._setupButton("Main Menu", "button star", "MainMenu.clicked", this.buttonPosition.x, this.buttonPosition.y - 45);
                    this.buttons.push(button);
                    button = this._setupButton("Repeat", "button back", "Repeat.clicked", this.buttonPosition.x, this.buttonPosition.y - 90);
                    this.buttons.push(button);

                    this._updateUserProgress();

                    break;
                case "End.Module.Continue":
                    step.player.start();
                    var button = this._setupButton("Continue", "button next", "End.Module.Continue.clicked", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);
                    button = this._setupButton("Repeat", "button back", "Repeat.clicked", this.buttonPosition.x, this.buttonPosition.y - 90);
                    this.buttons.push(button);

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

                    //TODO: get score: step.score = ...
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

                    var button = this._setupButton("Done", "button next", "DragNDrop.done", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);
                    break;
                case "DragNDropFeedback":
                    // Show correct bkg
                    // TODO: get height from drivesmart height ?

                    step.image.add(this.activeVideo.containerID);
                    step.image.show();

                    // Play audio
                    step.player.start();
                    // setup buttons
                    // TODO: extract the end buttons to separate method - replace in continue and here
                    var button = this._setupButton("Continue", "button next", "Continue.clicked", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);
                    button = this._setupButton("Main Menu", "button star", "MainMenu.clicked", this.buttonPosition.x, this.buttonPosition.y - 45);
                    this.buttons.push(button);
                    button = this._setupButton("Repeat", "button back", "Repeat.clicked", this.buttonPosition.x, this.buttonPosition.y - 90);
                    this.buttons.push(button);
                    // save progress
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
                this._removeButtons();
                this.nextStep();
                break;
            case "Risks.ready":
                var button = this._setupButton("Done", "button save", "Risks.done", this.buttonPosition.x, this.buttonPosition.y);
                this.buttons.push(button);
                break;
            case "Risks.done" :
                this.activeVideo.container.removeEvents('click');
                this.currentStep.score = this.shapes.getScore();
                this.nextStep();
                break;
            case 'KRFeedback.done':
                // add continue button
                var button = this._setupButton("Continue", "button next", "KRFeedback.continue.done", this.buttonPosition.x, this.buttonPosition.y);
                this.buttons.push(button);
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
                    this.currentStep.feedbackPanel.add(this.options.unitTagId);
                    this.currentStep.feedbackPanel.show();
                }

                var button = this._setupButton("Replay ", "button play", "Commentary.replay.clicked", 20, this.buttonPosition.y);
                this.buttons.push(button);

                var ExpertAudio = this.currentStep.expertAudio;
                if (ExpertAudio != undefined) {
                    // show play expert commentary button
                    button = this._setupButton("Expert", "button play", "Commentary.expert.clicked", 20, this.buttonPosition.y - 45);
                    this.buttons.push(button);
                }
                // TODO: offer sequence repeat as well - may need to show continue screen after all ?
                button = this._setupButton("Continue", "button next", "Continue.clicked", this.buttonPosition.x, this.buttonPosition.y);
                this.buttons.push(button);

                button = this._setupButton("Repeat", "button record", "Commentary.repeat.clicked", this.buttonPosition.x, this.buttonPosition.y - 90);
                this.buttons.push(button);

                button = this._setupButton("Main Menu", "button star", "MainMenu.clicked", this.buttonPosition.x, this.buttonPosition.y - 45);
                this.buttons.push(button);
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

                log(params.id);
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
    _setupButton : function(text, button_class, nextAction, x, y) {
        var button = new Button(this, {
            style : {
                left : x + 'px',
                top : y + 'px'
            },
            'class' : button_class,
            text : text,
            next : nextAction,
            id : "button_" + this.buttons.length
        });

        button.add(this.options.unitTagId);
        button.show();
        return button;
    }.protect(),
    //------------------------------------------------------------------------
    _setupQuestions : function(options) {
        var questions = new Questions(this, options);
        questions.add(this.options.unitTagId, "bottom");
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
                            preview : menuItemData.attributes.preview
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
    _updateUserProgress : function() {
        // Update state to completed = true;
        this.sequenceState.completed = true;
        // TODO: give each step maxPoints value and then sum those to get max score per sequence and calculate each sequence score as % of this, give each step a getScore method
        // TODO: remove this whne scoring is implemented
        //this.sequenceState.score = 100;

        this.myParent().fireEvent("SEQUENCE", {
            type : "module.event",
            next : 'sequence.completed'
        });
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

