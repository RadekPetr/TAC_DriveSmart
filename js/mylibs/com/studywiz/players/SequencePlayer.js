/**
 * @author Radek 2013-2014
 */

var flashLoaded = false;
var swiffFinished = null;
var introFinished = null;

function flashLoaded() {
    flashLoaded = true;
}

function jsIsReady() {
    return true;
}

var SequencePlayer = new Class({
    Implements : [Options, Events],
    options : {
        parent : null
    },
    initialize : function(myParent, module, myOptions) {

        this.setOptions(myOptions);
        this.options.parent = myParent;

        this._resetVariables();

        this.repeating = false;
        this.fromMenu = false;

        this.mediaLoader = new MediaLoader(this, {
            parentElementID : Main.DIV_ID
        });

        this.addEvent("TIMELINE", this.handleNavigationEvent);
    },
    myParent : function() {
        return this.options.parent;
    },
    // ----------------------------------------------------------
    start : function(sequenceData) {
        this.currentSequence = Array.clone(sequenceData);
        this.moduleInfo = this.myParent().getModuleInfo();
        this.sequenceState = Main.userTracker.getUserSequenceState(this.moduleInfo.currentSequenceID, this.moduleInfo.moduleID);
        // reset scoring, so when it repeats the scores are replaced not appended (Unless this will be requested ?)
        this.sequenceState.score = new Array();
        debug("Starting SEQUENCE: " + this.moduleInfo.currentSequenceID);
        this._setupSequenceMedia();
    },
    // ----------------------------------------------------------
    _setupSequenceMedia : function() {
        this._prepareSequenceMedia(this.currentSequence);
        this.mediaLoader.options.next = 'Media.ready';

        if (this.mediaLoader.getQueueLength() > 0) {
            this.mediaLoader.start(true);
        } else {
            // no media to preload so we can continue

            this.fireEvent("TIMELINE", {
                type : "preload.finished",
                id : "no_media",
                next : this.mediaLoader.options.next
            });

        }
    },
    _nextStep : function() {
        this._saveScoreForPreviousStep();

        // take a step and decide what to do with it
        if (this.currentSequence.length > 0) {

            this.currentStep = this.currentSequence.shift();
            var step = this.currentStep;
            var stepType = step.attributes.fmt;

            switch (stepType) {
                case "Menu":
                    var myContainerID = 'Menu.container';
                    var myDiv = new Element("div", {
                        id : myContainerID
                    });
                    myDiv.inject($m(Main.DIV_ID));

                    var moduleTitle = UIHelpers.setMainPanel(this.moduleInfo.moduleTitle);
                    UIHelpers.setClasses(moduleTitle, 'module-title-dashboard no-select');

                    step.data.style = {
                        left : '10px',
                        top : '0px'
                    };
                    var menu = new MenuPlayer(this, step.data);
                    menu.add(myContainerID);
                    menu.show();

                    var score = new Element("h2", {
                        html : "Overall score: " + (100 * Main.userTracker.getTotalScore()).toInt() + "/100",
                        'id' : 'overall_score',
                        'class' : 'no-select overall_score'
                    });
                    score.inject(myDiv);

                    var overallProgressBar = UIHelpers.progressBarSetup(Main.userTracker.getTotalProgress() * 100.0, "overall");
                    UIHelpers.setClasses(overallProgressBar['holder'], "no-select overall_progress");
                    overallProgressBar['holder'].inject(myDiv);

                    break;
                case "SequenceIntro":
                    this.fromMenu = false;

                    var myContainerID = 'SequenceIntro.container';
                    var myDiv = new Element("div", {
                        id : myContainerID,
                        styles : {
                            position : 'absolute',
                            'left' : Main.VIDEO_LEFT + 'px',
                            'top' : Main.VIDEO_TOP + 'px',
                            'width' : Main.VIDEO_WIDTH + 'px',
                            'height' : Main.VIDEO_HEIGHT + 'px'
                        }
                    });
                    myDiv.inject($m(Main.DIV_ID));

                    step.media.audio.options.next = '';
                    step.media.audio.start();

                    var moduleTitle = UIHelpers.setMainPanel(this.moduleInfo.moduleTitle);
                    UIHelpers.setClasses(moduleTitle, 'module-title no-select rotate90');

                    step.media.previewImage.options.style.width = '100%';
                    step.media.previewImage.options.style.height = '100%';
                    step.media.previewImage.options.style.left = 0;
                    step.media.previewImage.options.style.top = 0;

                    step.media.previewImage.add(myContainerID);
                    step.media.previewImage.show();

                    var titleDiv = new Element("div", {
                        id : 'titles',
                        styles : {
                            position : 'absolute',
                            'left' : '10px',
                            'top' : '370px',
                            'width' : '660px',
                            'height' : '100px'
                        },
                        'class' : 'pane gray'
                    });
                    titleDiv.inject(myDiv);

                    var moduleState = Main.userTracker.getModuleState(this.moduleInfo.moduleID);
                    var sequenceTitleText = "Exercise " + this.sequenceState.id + " of " + moduleState.total;
                    var sequenceTitle = new Element("h1", {
                        html : sequenceTitleText,
                        'class' : 'sequence-title no-select'
                    });
                    sequenceTitle.inject(titleDiv);

                    var moduleState = Main.userTracker.getModuleState(this.moduleInfo.moduleID);
                    var moduleProgressBar = UIHelpers.progressBarSetup(moduleState.progress, this.moduleInfo.moduleID);

                    UIHelpers.setClasses(moduleProgressBar['holder'], "no-select module_progress_intro");
                    moduleProgressBar['holder'].inject(titleDiv);

                    this._addButton({
                        type : "Continue",
                        next : "SequenceIntro.done"
                    });
                    this._addButton({
                        type : "Main Menu",
                        next : "MainMenuFromIntro.clicked"
                    });

                    // TODO: play level chnage audio if  this.playConLevelAudio = false;

                    break;
                case "ModuleIntro":
                    this._moduleIntroSetup(step);
                    break;
                case "ModuleGroupIntro":
                    this._moduleGroupIntroSetup(step);
                    break;
                case "CommentaryIntro":
                    var myContainerID = 'CommentaryIntro.container';
                    var myDiv = new Element("div", {
                        id : myContainerID
                    });
                    myDiv.inject($m(Main.DIV_ID));

                    step.media.image.options.style.width = Main.VIDEO_WIDTH + "px";
                    step.media.image.options.style.height = Main.VIDEO_HEIGHT + "px";
                    step.media.image.options.style.left = Main.VIDEO_LEFT + "px";
                    step.media.image.options.style.top = Main.VIDEO_TOP + "px";

                    step.media.image.add(myContainerID);
                    step.media.image.show();
                    // TODO: hide the record button until the flash recorder is ready
                    this._addButton({
                        type : "Record",
                        next : "CommentaryIntro.done"
                    });

                    // does the next step have expert audio ? Show button if yes
                    var nextStep = this.currentSequence[0];

                    if (nextStep.media.expertAudio != undefined) {
                        this._addButton({
                            type : "Expert commentary",
                            next : "CommentaryIntro.expert.clicked"
                        });
                    };
                    this.recorder = new Recorder(this, {
                        swiff : {
                            id : 'Commentary'
                        },
                        src : Main.PATHS.flashFolder + "commentary.swf"
                    });
                    this.recorder.add(Main.DIV_ID);
                    // -----
                    step.media.audio.options.next = '';
                    step.media.audio.start();
                    break;
                case "PlayVideo":
                    this._stopPlayers();
                    this._removeImages();
                    this._removeButtons();
                    this._removeIntroContainers();
                    this._hideInteractions();
                    step.media.video.options.next = 'PlayVideo.done';
                    this._hideOtherVideos(step.media.video.playerID);
                    step.media.video.show();
                    step.media.video.start();
                    //TODO: noBg1="1"
                    break;
                case "PlayVideo_cue":
                    this._introductionSetup(step);
                    step.media.video.start();
                    break;

                case "CueImage":
                    this._removeImages();
                    step.media.image.options.style.left = 0;
                    step.media.image.options.style.top = 0;
                    step.media.image.add(this.activeVideo.containerID);
                    step.media.image.show();
                    break;

                case "ConIntro":
                    this._stopPlayers();
                    this._removeImages();
                    this._removeButtons();
                    this._removeIntroContainers();
                    this._hideInteractions();

                    step.media.swiff.options.next = 'ConIntro.done';
                    introFinished = function() {

                        this.fireEvent("TIMELINE", {
                            type : "swiff.done",
                            id : "intro",
                            next : step.media.swiff.options.next
                        });
                    }.bind(this);

                    this.activeSwiff = step.media.swiff;
                    step.media.swiff.show();
                    step.media.swiff.start();
                    // Allow skip intro if repeating this sequence
                    if (this.repeating == true) {
                        this._addButton({
                            type : "Skip",
                            next : "ConIntro.done.clicked"
                        });
                    }
                    break;
                case "ConActivity":
                    this._stopPlayers();
                    this._removeImages();
                    this._removeButtons();
                    this._removeIntroContainers();
                    this._hideInteractions();
                    swiffFinished = function(score) {
                        this.fireEvent("TIMELINE", {
                            type : "swiff.done",
                            id : "ConActivity",
                            next : 'ConActivity.done',
                            'score' : score
                        });
                    }.bind(this);
                    this.activeSwiff = step.media.swiff;
                    step.media.swiff.show();
                    step.media.swiff.attributes.level = this.conLevel;
                    step.media.swiff.startConActivity(step.media.swiff.attributes);
                    this._addButton({
                        type : "Cancel",
                        next : "ConActivity.cancel.clicked"
                    });

                    break;
                case "ConContinue":
                    this._addButton({
                        type : "Continue",
                        next : "ConContinue.clicked"
                    });
                    break;
                case "Question":
                    // TODO: maybe add attribute to wait or not
                    step.media.audio.options.next = 'Question.done';
                    step.media.audio.start();
                    if (step.attributes.cmd == "hidescreen") {
                        this.activeVideo.obscure();
                    };
                    break;
                case "QuestionUser":
                    this._removeInteractions();
                    // check if we allow multiple responses
                    if (step.attributes.resp != null && step.attributes.resp != undefined) {
                        step.data.responses = step.attributes.resp;
                    }
                    this.interactions = this._setupQuestions(step.data);
                    this._addButton({
                        type : "Done",
                        next : "QuestionUser.done"
                    });
                    //TODO: notrack="true"
                    //TODO: image="country_cla01_next_first.jpg" - override background image ...
                    break;
                case "QuestionFeedback":
                    this._removeButtons();
                    this._showInteractions();
                    this.interactions.lockAnswer();
                    step.score = this.interactions.showCorrect();
                    step.media.audio.options.next = 'QuestionFeedback.done';
                    step.media.audio.start();
                    if (step.attributes.show == "MudScreen") {
                        this.activeVideo.obscure();
                    }
                    //TODO:  KeepUserSelection="1" ?
                    break;
                case "PlayAudio":
                    step.media.audio.options.next = 'PlayAudio.done';
                    step.media.audio.start();
                    //TODO: hide="box" not used ?
                    break;
                case "Continue":
                    // NOTE IMPORTANT - this only can be at the end of the sequence !!!!
                    this._addButton({
                        type : "Continue",
                        next : "Continue.clicked"
                    });
                    this._addButton({
                        type : "Main Menu",
                        next : "MainMenu.clicked"
                    });
                    this._addButton({
                        type : "Repeat",
                        next : "Repeat.clicked"
                    });

                    this._updateUserProgress();
                    break;
                case "End.Module.Continue":
                    step.media.audio.start();
                    this._addButton({
                        type : "Continue",
                        next : "End.Module.Continue.clicked"
                    });
                    this._addButton({
                        type : "Repeat",
                        next : "Repeat.clicked"
                    });
                    this._updateUserProgress();
                    break;
                case "Commentary":
                    this._removeButtons();
                    if (step.playExpert == true) {
                        var expertAudio = this.currentStep.media.expertAudio;
                        if (expertAudio != undefined) {
                            expertAudio.options.next = '';
                            expertAudio.start();
                        }
                        step.playExpert = false;
                    } else {
                        this.recorder.startRecording();
                    }
                    step.media.video.options.next = 'Commentary.recording.done';
                    step.media.video.show();
                    step.media.video.volume(0.2);
                    this._hideOtherVideos(step.media.video.playerID);
                    step.media.video.start();
                    break;
                case "KeyRisk":
                    this._removeInteractions();

                    step.media.audio.options.next = 'Risks.ready';

                    //TODO: <Audio waitfor="true">sound/scanning/mp3/scan_vsbkr1b.mp3</Audio>

                    this.shapes = new KeyRiskPlayer(this, {});

                    // don't want to clone the step data by passing it as option
                    this.shapes.options.data = {
                        areas : step.areas
                    };
                    // TODO: move adding the areas until after the audio is done ?
                    this.shapes.add(this.activeVideo.containerID);
                    // play Audio - Intro
                    step.media.audio.start();
                    break;
                case "KRFeedback":
                    this._removeButtons();
                    step.media.image.options.style.width = Main.VIDEO_WIDTH + "px";
                    step.media.image.options.style.height = Main.VIDEO_HEIGHT + "px";
                    step.media.image.options.style.left = 0;
                    step.media.image.options.style.top = 0;

                    step.media.image.add(this.shapes.container.id);

                    step.media.image.show();
                    step.media.audio.options.next = 'KRFeedback.done';
                    step.media.audio.start();
                    break;
                case "Cameo":
                    var file = Main.PATHS.imageFolder + 'cameo/visor_bkg.png';
                    this.cameo_image = new ImagePlayer(this, {
                        src : file,
                        next : "Cameo.visor.image.ready",
                        title : 'Visor',
                        id : 'visor',
                        style : {
                            'left' : '170px',
                            'height' : '0px',
                            'top' : (Main.VIDEO_TOP) + 'px'
                        }
                    });

                    var file = Main.PATHS.imageFolder + 'cameo/visor_mask.png';
                    this.cameo_image_mask = new ImagePlayer(this, {
                        src : file,
                        next : "Cameo.visor.image.ready",
                        title : 'Visor',
                        id : 'visor',
                        style : {
                            'left' : '170px',
                            'height' : '0px',
                            'top' : (Main.VIDEO_TOP) + 'px'
                        }
                    });
                    this.cameo_image.preload();
                    this.cameo_image_mask.preload();
                    break;
                case "DragNDrop":
                    // show empty bkg

                    step.dragNDrop = new DragNDropPlayer(this, {});

                    var panel = new ImagePlayer(this, {
                        src : Main.PATHS.imageFolder + 'dragdrop/panel_bkg.png',
                        style : {
                            'left' : '427px',
                            'top' : '0px',
                            'position' : 'absolute'
                        }
                    });

                    // don't want to clone the step data by passing it as option
                    step.dragNDrop.options.data = {
                        areas : step.areas
                    };
                    step.dragNDrop.add(this.activeVideo.containerID);

                    step.emptyBkg.add(step.dragNDrop.containerID);
                    step.emptyBkg.show();

                    panel.preload();
                    panel.add(step.dragNDrop.containerID);
                    panel.show();

                    // play Audio - Intro
                    step.media.audio.start();
                    this._addButton({
                        type : "Done",
                        next : "DragNDrop.done"
                    });
                    break;
                case "DragNDropFeedback":
                    if (this.currentSequence.length > 0) {
                        debug("ERROR - DragNDropFeedback must be last in the sequence");
                    }
                    step.media.image.options.style.left = 0;
                    step.media.image.options.style.top = 0;

                    // step.media.image.options.style.width = Main.VIDEO_WIDTH + "px";
                    // step.media.image.options.style.height = Main.VIDEO_HEIGHT + "px";
                    // Show correct bkg
                    step.media.image.add(this.activeVideo.containerID);
                    step.media.image.show();
                    // Play audio
                    step.media.audio.start();
                    // setup buttons
                    this._addButton({
                        type : "Continue",
                        next : "Continue.clicked"
                    });
                    this._addButton({
                        type : "Main Menu",
                        next : "MainMenu.clicked"
                    });
                    this._addButton({
                        type : "Repeat",
                        next : "Repeat.clicked"
                    });
                    // save progress
                    // this is always the last in the sequence ...
                    this._updateUserProgress();
                    break;
            }
        } else {
            // seq finished
            debug('******** ERROR - Missing Continue STEP in this sequence');
        }
    },
    // ----------------------------------------------------------
    _saveScoreForPreviousStep : function() {
        if (this.currentStep != null) {
            var previousStepScore = this.currentStep.score;
            if (previousStepScore != null && previousStepScore != undefined) {
                this.sequenceState.score.push(previousStepScore);
            }
        }
    },

    // ----------------------------------------------------------
    // This handles all timeline events and emulates the timeline
    handleNavigationEvent : function(params) {

        switch (params.next) {

            case "PlayVideo_cue.done":
                this._updateUserProgress();
                this._removeImages();
                this._removeButtons();

                this._addButton({
                    type : "Continue",
                    next : "Continue.clicked"
                });
                this._addButton({
                    type : "Repeat video",
                    next : "Repeat.video.clicked"
                });

                break;
            case "Module.Intro.Video.done":
                this._updateUserProgress();
                var text = new Element("div", {
                    html : "Click continue to start exercises",
                    'class' : 'module_intro_text no-select',
                    'id' : 'continue_text'
                });
                text.inject(this.activeVideo.container);

                this._addButton({
                    type : "Continue",
                    next : "Continue.clicked"
                });
                this._addButton({
                    type : "Main Menu",
                    next : "MainMenuFromIntro.clicked"
                });
                this._addButton({
                    type : "Repeat video",
                    next : "Repeat.video.clicked"
                });
                // add the event in case the user wants to play again via the controller or via repeat
                this.activeVideo.registerPlaybackEndEvent();
                this.activeVideo.registerPlaybackStartEvent();
                break;
            case "Module.Group.Intro.Video.done":
                // Already played the intro video so this time just play welcome sound
                this._addButton({
                    type : "Continue",
                    next : "Continue.clicked"
                });
                this._addButton({
                    type : "Main Menu",
                    next : "MainMenuFromIntro.clicked"
                });

                this._addButton({
                    type : "Repeat video",
                    next : "Repeat.video.clicked"
                });

                if (this.fromMenu == true) {
                    this.fromMenu = false;
                    this._updateUserProgress();
                }

                break;
            case "video.started":
                if (this.currentStep.media.audio != undefined) {
                    this.currentStep.media.audio.stop();
                }
                var textDiv = document.getElementById('continue_text');
                if (textDiv != null) {
                    textDiv.destroy();
                }
                break;
            case  "Repeat.video.clicked":

                this._stopPlayers();
                this._removeImages();

                //this._removeButtons();
                this.activeVideo.start();
                break;
            case "Media.ready":
            case "PlayVideo.done":
            case "Question.done":
            case "Continue_Video.clicked":
                this._nextStep();
                break;

            case "PlayAudio.done":
                if (Main.features.clickToPlay == true) {
                    var nextStep = this.currentSequence[0];
                    debug("Next step is ", nextStep);
                    if (nextStep.attributes.fmt != "Continue" && nextStep.attributes.fmt == "PlayVideo") {
                        // to start video with user interaction in iOS
                        this._addButton({
                            type : "Continue",
                            next : "Continue_Video.clicked"
                        });
                        
                    } else {
                        this._nextStep();
                    }

                } else {
                    this._nextStep();
                }
                break;
            case "QuestionFeedback.done":
                // if click is required to play show continue button
                if (Main.features.clickToPlay == true) {
                    var nextStep = this.currentSequence[0];
                    debug("Next step is ", nextStep);
                    if (nextStep.attributes.fmt != "Continue" && nextStep.attributes.fmt != "PlayAudio") {
                        // to start video with user interaction in iOS
                        this._addButton({
                            type : "Continue",
                            next : "Continue_Video.clicked"
                        });
                    } else {
                        this._nextStep();
                    }

                } else {
                    this._nextStep();
                }
                break;
            case "Video.cue":
                this._checkCuePoints(this.currentStep);
                break;
            case 'KRFeedback.continue.done':
                this._removeRisks();
            case "SequenceIntro.done":
            case "Skip.done":
                this._stopPlayers();
                this._removeImages();
                this._removeButtons();
                this._removeIntroContainers();
                this._nextStep();
                break;
            case "QuestionUser.done":
                this.interactions.lockAnswer();
                this._removeButtons();
                this._nextStep();
                break;
            case "Risks.ready":
                this._addButton({
                    type : "Done",
                    next : "Risks.done"
                });
                break;
            case "Risks.done" :
                this.activeVideo.container.removeEvents('click');
                this.currentStep.score = this.shapes.getScore();
                this._nextStep();
                break;
            case "ConActivity.done":
                this.currentStep.score = (params.score) / 100;
                this._nextStep();
                break;
            case 'KRFeedback.done':
                // add continue button
                this._addButton({
                    type : "Continue",
                    next : "KRFeedback.continue.done"
                });
                break;
            case "Continue.clicked":

                this.reset();
                this.repeating = false;
                this.myParent().fireEvent("SEQUENCE", {
                    type : "sequence.event",
                    next : 'sequence.next'
                });
                break;
            case "ConActivity.cancel.clicked":
                this.currentStep.score = undefined;
            case "Repeat.clicked":
                this._stopPlayers();
                this._removeVideos();
                this._removeImages();
                this._removeButtons();
                this._removeIntroContainers();
                this._removeInteractions();
                this.repeating = true;
                this.myParent().fireEvent("SEQUENCE", {
                    type : "sequence.event",
                    next : 'sequence.repeat'
                });
                break;
            case "End.Module.Continue.clicked":
            case "MainMenu.clicked":
            case "MainMenuFromIntro.clicked":

                this.reset();
                this.repeating = false;
                this.myParent().fireEvent("SEQUENCE", {
                    type : "sequence.event",
                    next : 'sequence.exit'
                });
                break;
            case "Cameo.visor.image.ready":
                if (this.cameo_image.options.loaded && this.cameo_image_mask.options.loaded) {

                    this.cameo_image.add(this.currentStep.media.video.containerID, 'before');
                    this.cameo_image.show();
                    this.cameo_image.tween('203px', '0px', 1, 'height', 300, 'ignore', 'Cameo.visor.tween.done');

                    this.cameo_image_mask.add(this.currentStep.media.video.containerID, 'after');
                    this.cameo_image_mask.show();
                    this.cameo_image_mask.tween('203px', '0px', 1, 'height', 300, 'ignore', '');
                };
                break;
            case "Cameo.visor.tween.done":
                this.currentStep.media.video.options.next = 'Cameo.done';
                this.currentStep.media.video.show();
                if (Main.features.clickToPlay) {
                    this._addButton({
                        type : "Play Cameo",
                        next : "PlayCameo.clicked"
                    });
                } else {
                    this.currentStep.media.video.start();
                }
                break;
            case "PlayCameo.clicked":
                this._removeButtons();
                this.currentStep.media.video.start();
                break;
            case "Cameo.done":
                this.currentStep.media.video.hide(0);
                this.cameo_image.tween('0px', '203px', 1, 'height', 300, 'ignore', '');
                this.cameo_image_mask.remove();
                this._nextStep();
                break;
            case "CommentaryIntro.expert.clicked":
                // set next Commentary to play expert
                var nextStep = this.currentSequence[0];
                if (nextStep.attributes.fmt == "Commentary") {
                    nextStep.playExpert = true;
                } else {
                    debug("ERROR - next step must be Commentary after CommentaryIntro");
                }
            case "CommentaryIntro.done":
                this._stopPlayers();
                this._removeInteractions();
                this._removeButtons();
                this._removeIntroContainers();
                this._nextStep();
                break;
            case "Commentary.recording.done":
                this._updateUserProgress();
                this.recorder.stopRecording();

                var feedbackAudio = this.currentStep.media.feedbackAudio;
                if (feedbackAudio != undefined) {
                    feedbackAudio.options.next = '';
                    feedbackAudio.start();
                    // play the feedback and show text if present
                }
                var feedbackText = this.currentStep.data;

                if (feedbackText != undefined) {
                    this.currentStep.feedbackPanel = new CommentaryFeedback(this, this.currentStep.data);
                    this.currentStep.feedbackPanel.add(Main.DIV_ID);
                    this.currentStep.feedbackPanel.show();
                }
                this._addButton({
                    type : "Your commentary",
                    next : "Commentary.replay.clicked"
                });

                var expertAudio = this.currentStep.media.expertAudio;
                if (expertAudio != undefined) {
                    // show play expert commentary button
                    this._addButton({
                        type : "Expert commentary 2",
                        next : "Commentary.expert.clicked"
                    });
                }
                // TODO: offer sequence repeat as well - may need to show continue screen after all ? Maybe use the module Intro ?

                this._addButton({
                    type : "Continue",
                    next : "Continue.clicked"
                });
                this._addButton({
                    type : "Repeat",
                    next : "Commentary.repeat.clicked"
                });
                this._addButton({
                    type : "Main Menu",
                    next : "MainMenu.clicked"
                });
                break;
            case "Commentary.replay.clicked":
                this._stopPlayers();
                this._removeFeedbackPanel();
                this._removeButtons();
                this._removeIntroContainers();
                this.recorder.startPlayback();
                this.currentStep.media.video.show();
                this.currentStep.media.video.options.next = 'Commentary.recording.done';
                this.currentStep.media.video.volume(0.2);
                this.currentStep.media.video.start();
                break;
            case "Commentary.expert.clicked":
                this._stopPlayers();
                this._removeFeedbackPanel();
                this._removeButtons();
                this._removeIntroContainers();
                var expertAudio = this.currentStep.media.expertAudio;
                if (expertAudio != undefined) {
                    expertAudio.options.next = '';
                    expertAudio.start();
                }
                this.currentStep.media.video.show();
                this.currentStep.media.video.options.next = 'Commentary.recording.done';
                this.currentStep.media.video.volume(0.2);
                this.currentStep.media.video.start();
                break;
            case "Commentary.repeat.clicked":
                this._stopPlayers();
                this._removeFeedbackPanel();
                this._removeButtons();
                this._removeIntroContainers();
                this.currentSequence.unshift(this.currentStep);
                this._nextStep();
                break;
            case "DragNDrop.done":
                this._stopPlayers();
                this._removeButtons();
                this._removeIntroContainers();
                // disable dragging now
                this.currentStep.dragNDrop.stop();

                this.currentStep.score = this.currentStep.dragNDrop.getScore();

                var nextStep = this.currentSequence[0];
                if (nextStep.attributes.fmt == "DragNDropFeedback") {
                    this._nextStep();
                } else {
                    debug("ERROR - next step must be DragNDropFeedback after DragNDrop");
                    this._nextStep();
                }
                break;
            case "Menu.item.clicked":
                this._stopPlayers();
                this._removeImages();
                this._removeButtons();
                this._removeIntroContainers();

                this.myParent().myParent().setOptions({
                    moduleID : params.id
                });
                this.myParent().fireEvent("SEQUENCE", {
                    type : "sequence.event",
                    next : 'module.selected'
                });
                break;
            case "ConIntro.done":
                this._removeButtons();
                introFinished = null;
                this.currentStep.media.audio.start();
                this._addButton({
                    type : "Start",
                    next : "ConIntro.done.clicked"
                });
                break;
            case "ConIntro.done.clicked":
            case "ConContinue.clicked":
                this._stopPlayers();
                this._removeButtons();
                this._removeCurrentSwiff();
                this._removeIntroContainers();
                this._nextStep();
                break;
        };
    },
    getSequenceState : function() {
        return this.sequenceState;
    },
    //------------------------------------------------------------------------
    _setupQuestions : function(options) {
        var padding = 20;

        options.style = {
            'top' : '60%',
            'left' : (Main.VIDEO_LEFT + padding) + 'px',
            'width' : (Main.VIDEO_WIDTH - 4 * padding) + 'px',
            'padding' : padding + 'px ' + padding + 'px ' + padding + 'px ' + padding + 'px'
        };
        var questions = new Questions(this, options);
        questions.add(Main.DIV_ID, "bottom");
        questions.show();
        return questions;
    }.protect(),
    // ----------------------------------------------------------
    _prepareSequenceMedia : function(seq) {
        // get array of media for each step so it can be preloaded
        var media = new Hash({});
        Array.each(seq, function(step, stepOrder) {

            step.media = new Hash({
                audio : null,
                feedbackAudio : null,
                expertAudio : null,
                doneAudio : null,
                video : null,
                cameoVideo : null,
                moduleIntroVideo : null,
                image : null,
                previewImage : null
            });
            this._prepareStepMedia(step, stepOrder);
        }.bind(this));
        debug("---------------------------- Finished setting up media from xml");
    }.protect(),
    // ----------------------------------------------------------
    _prepareStepMedia : function(step, stepOrder) {
        var stepType = step.attributes.fmt;
        Array.each(step.childNodes, function(item, index) {

            switch (item.name) {
                case "Video" :

                    if (item.value != '') {
                        var filename = item.value;
                        var style = null;

                        if (stepType == 'Cameo') {
                            style = {
                                'left' : (Main.VIDEO_WIDTH - 240 - 148) + 'px',
                                'top' : (Main.VIDEO_TOP + 20) + 'px',
                                'width' : '240',
                                'height' : '175'
                            };
                            var width = '240';
                            var height = '175';
                        } else {
                            style = {
                            };
                            var width = '100%';
                            var height = '100%';
                        };
                        var caption = item.attributes.caption;
                        step.media.video = new VideoPlayer(this, {
                            id : "video_" + index + "_" + stepOrder,
                            next : 'not.set',
                            'style' : style,
                            filename : filename,
                            width : width,
                            height : height,
                            captionFile : caption,
                            parentTag : Main.DIV_ID
                        });

                        this.mediaLoader.register(step.media.video.getLoaderInfo());
                        // we want to store this so all VideoJS player can be removed correctly (see remove() in VideoPlayer)
                        this.videos.push(step.media.video);

                        this._preloadPosterFrame(filename);

                    }
                    break;
                case "ModuleIntroVideo" :
                    // only setup the video in case it was not played yet .... currently no way to replay it anyway

                    if (item.value != '') {
                        var filename = item.value;

                        var style = null;
                        var width = '100%';
                        var height = '100%';
                        var caption = item.attributes.caption;
                        step.media.moduleIntroVideo = new VideoPlayer(this, {
                            id : "video_" + index + "_" + stepOrder,
                            next : 'not.set',
                            filename : filename,
                            width : width,
                            height : height,
                            parentTag : Main.DIV_ID,
                            captionFile : caption,
                            controls : true
                        });
                        //  if (this.sequenceState.completed != true) {
                        this.mediaLoader.register(step.media.moduleIntroVideo.getLoaderInfo());
                        // }
                        // we want to store this so all VideoJS player can be removed correctly (see remove() in VideoPlayer)
                        this.videos.push(step.media.moduleIntroVideo);

                        this._preloadPosterFrame(filename);
                    }
                    break;

                case "VideoCues" :

                    if (item.value != '') {
                        var filename = item.value;
                        var style = null;
                        var width = '100%';
                        var height = '100%';
                        var caption = item.attributes.caption;

                        step.media.video = new VideoPlayer(this, {
                            id : "video_" + index + "_" + stepOrder,
                            next : 'not.set',
                            filename : filename,
                            width : width,
                            height : height,
                            parentTag : Main.DIV_ID,
                            captionFile : caption,
                            controls : true
                        });

                        this.mediaLoader.register(step.media.video.getLoaderInfo());
                        // we want to store this so all VideoJS player can be removed correctly (see remove() in VideoPlayer)
                        this.videos.push(step.media.video);
                        this._preloadPosterFrame(filename);
                    }
                    break;
                case "Audio" :
                    if (item.value != '') {
                        var file = Main.PATHS.audioFolder + stripFileExtension(item.value);
                        step.media.audio = new AudioPlayer(this, {
                            next : 'not.set',
                            id : "audio_" + index + "_" + stepOrder,
                            src : file + ".mp3",
                            preload : 'false'
                        });
                        this.mediaLoader.register(step.media.audio.getLoaderInfo());
                    }
                    break;
                case "FeedbackAudio" :
                    if (item.value != '') {
                        var file = Main.PATHS.audioFolder + stripFileExtension(item.value);
                        step.media.feedbackAudio = new AudioPlayer(this, {
                            next : 'not.set',
                            id : "audio_" + index + "_" + stepOrder,
                            src : file + ".mp3",
                            preload : 'false'
                        });
                        this.mediaLoader.register(step.media.feedbackAudio.getLoaderInfo());
                    }
                    break;
                case "ExpertAudio" :
                    if (item.value != '') {
                        var file = Main.PATHS.audioFolder + stripFileExtension(item.value);
                        step.media.expertAudio = new AudioPlayer(this, {
                            next : 'not.set',
                            id : "audio_" + index + "_" + stepOrder,
                            src : file + ".mp3",
                            preload : 'false'
                        });
                        this.mediaLoader.register(step.media.expertAudio.getLoaderInfo());
                    }

                    break;
                case "DoneAudio" :
                    if (item.value != '') {
                        var file = Main.PATHS.audioFolder + stripFileExtension(item.value);
                        step.media.doneAudio = new AudioPlayer(this, {
                            next : 'not.set',
                            id : "audio_" + index + "_" + stepOrder,
                            src : file + ".mp3",
                            preload : 'false'
                        });
                        this.mediaLoader.register(step.media.doneAudio.getLoaderInfo());
                    }
                    break;
                case "Preview" :
                    if (item.value != '') {
                        var file = Main.PATHS.imageFolder + item.value;

                        step.media.previewImage = new ImagePlayer(this, {
                            src : file,
                            title : 'Preview',
                            id : 'preview_image',
                            style : {
                                width : '40%',
                                height : '40%',
                                top : '148px'
                            }
                        });
                        this.mediaLoader.register(step.media.previewImage.getLoaderInfo());
                    }
                    break;
                case "Image" :
                    if (item.value != '') {
                        var file = Main.PATHS.imageFolder + item.value;
                        step.media.image = new ImagePlayer(this, {
                            src : file,
                            title : 'Image',
                            id : 'image' + index + "_" + stepOrder
                        });
                        this.mediaLoader.register(step.media.image.getLoaderInfo());
                    }

                    break;
                case "EmptyBkg" :
                    if (item.value != '') {
                        var file = Main.PATHS.imageFolder + item.value;

                        step.emptyBkg = new ImagePlayer(this, {
                            src : file,
                            title : 'BkgImage',
                            id : 'image' + index + "_" + stepOrder,

                            style : {
                                top : '0',
                                'position' : 'absolute'
                            }
                        });
                        this.mediaLoader.register(step.emptyBkg.getLoaderInfo());
                    }
                    break;
                case "Items":
                    var menuItemsRawData = item.childNodes;
                    var menuItems = {
                        data : new Array()
                    };
                    Array.each(menuItemsRawData, function(menuItemData, index) {
                        var preconditionsArr = new Array();

                        if (menuItemData.attributes.preconditions != undefined) {
                            preconditionsArr = menuItemData.attributes.preconditions.split(',');
                        }

                        var menuItem = {
                            text : menuItemData.value,
                            description : menuItemData.attributes.description,
                            moduleID : menuItemData.attributes.moduleID,
                            preview : menuItemData.attributes.preview,
                            showProgress : menuItemData.attributes.showProgress,
                            preconditions : preconditionsArr,
                            flashOnly : menuItemData.attributes.flashOnly
                        };
                        menuItems.data.push(menuItem);
                    });
                    step.data = menuItems;
                    break;
                case "FeedbackText":
                    var feedbackItemsRawData = item.childNodes;
                    var feedbackItems = {
                        data : new Array()
                    };

                    Array.each(feedbackItemsRawData, function(feedbackItemData, index) {
                        var feedbackItem = {
                            text : feedbackItemData.value

                        };
                        feedbackItems.data.push(feedbackItem);
                    });
                    step.data = feedbackItems;
                    break;
                case "Inter":
                    var questionsRawData = item.childNodes;
                    var questions = {
                        data : new Array(),
                        style : this.panelPosition
                    };

                    Array.each(questionsRawData, function(questionData, index) {
                        var question = {
                            text : questionData.value,
                            correct : questionData.attributes.correct
                        };
                        questions.data.push(question);
                    });
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
                        };
                        step.areas.push(area);
                    });
                    break;

                case "RotateAreas" :
                    var rawData = item.childNodes;
                    step.rotateZones = new Array();
                    Array.each(rawData, function(item, index) {
                        var area = {
                            id : item.attributes.id,
                            data : item.attributes.data,
                            angle : item.attributes.angle
                        };
                        step.rotateZones.push(area);
                    });
                    break;
                case "Zones":
                    step.zones = item.attributes.data;
                    break;
                case "Swiff":
                    step.media.swiff = new SwiffPlayer(this, {
                        swiff : {
                            id : 'swiff.id.' + index + "_" + stepOrder
                        },
                        src : Main.PATHS.flashFolder + item.value + "?" + Math.random(),
                        id : 'swiff' + index + "_" + stepOrder
                    });

                    step.media.swiff.attributes = item.attributes;
                    this.swiffs.push(step.media.swiff);
                    this.mediaLoader.register(step.media.swiff.getLoaderInfo());
                    break;
                case "CuePoints":
                    step.data = this._getCuePoints(item);
                    break;
                default:
                // nothing
            }
        }.bind(this));
    }.protect(),
    _removeIntroContainers : function() {

        var sequenceIntroTag = $m('SequenceIntro.container');
        if (sequenceIntroTag != null) {
            sequenceIntroTag.destroy();
        }
        var sequenceIntroTag = $m('CommentaryIntro.container');
        if (sequenceIntroTag != null) {
            sequenceIntroTag.destroy();
        }

        var menuTag = $m('Menu.container');
        if (menuTag != null) {
            menuTag.destroy();
        }
    }.protect(),
    _stopPlayers : function() {
        if (this.currentStep != null) {
            this.currentStep.media.each(function(player, mediaKey) {
                if (player != null) {
                    player.stop();
                }
            });
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
        });
        this.buttons.empty();
    }.protect(),
    _removeInteractions : function() {
        if (this.interactions != null) {
            this.interactions.remove();
        };
        var interactions = $m('panelContainer');
        if (interactions != null) {
            interactions.destroy();
        };
        this.interactions = null;
    }.protect(),
    _hideInteractions : function() {
        if (this.interactions != null) {
            this.interactions.hide();
        }
    }.protect(),
    _showInteractions : function() {
        if (this.interactions != null) {
            this.interactions.show();
        }
    }.protect(),
    _removeVideos : function() {
        this.activeVideo = null;
        Array.each(this.videos, function(item, index) {
            item.remove();
            item = null;
            delete item;
        });
        this.videos.empty();
    }.protect(),
    _hideOtherVideos : function(excludedId) {
        Array.each(this.videos, function(item, index) {
            var playerID = item.playerID;
            if (playerID == excludedId) {
                this.activeVideo = item;
            } else {
                item.hide();
            }
        }.bind(this));
    }.protect(),
    _removeSwiffs : function() {
        if (this.recorder != null) {
            this.recorder.remove();
        }
        this.recorder = null;

        Array.each(this.swiffs, function(item, index) {
            item.remove();
            item = null;
            delete item;
        });
        this.swiffs.empty();
        this.activeSwiff = null;

    }.protect(),
    _removeCurrentSwiff : function() {
        if (this.recorder != null) {
            this.recorder.remove();
        }
        this.recorder = null;

        this.activeSwiff.remove();
        this.activeSwiff = null;
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
        Main.userTracker.updateSequenceProgress(this.sequenceState);
    }.protect(),
    onLoad : function() {
        debug("Called Loaded");
    },
    isReady : function() {
        debug("Is ready ?");
        return true;
    },
    reset : function() {
        this.mediaLoader.remove();
        this.mediaLoader.reset();
        this._stopPlayers();
        this.currentSequence.empty();
        this._removeFeedbackPanel();
        this._removeImages();
        this._removeRisks();
        this._removeButtons();
        this._removeSwiffs();
        this._removeInteractions();
        this._removeIntroContainers();
        this._removeVideos();
        this._resetVariables();
    },
    _resetVariables : function() {
        this.currentSequence = new Array();
        this.sequenceState = null;
        this.currentStep = null;
        this.cameo_image_mask = null;
        this.cameo_image = null;
        this.buttons = new Array();
        this.interactions = null;
        this.videos = new Array();
        this.emptyBkg = null;
        this.correctBkg = null;

        this.swiffs = new Array();
        this.activeSwiff = null;
        this.activeVideo = null;
        this.shapes = null;
        this.cameo_image = null;
        this.recorder = null;
        this.conLevel = 1;
        this.playConLevelAudio = false;
        //this.repeating = false;

        swiffFinished = null;
        introFinished = null;

        this.buttonPosition = {
            x : 480,
            y : 415
        };

        this.panelPosition = {
            left : '5%',
            top : '25%'
        };
    }.protect(),
    _moduleIntroSetup : function(step) {
        var myContainerID = 'SequenceIntro.container';
        var myDiv = new Element("div", {
            id : myContainerID,
            styles : {
                position : 'absolute',
                'left' : Main.VIDEO_LEFT + 'px',
                'top' : Main.VIDEO_TOP + 'px',
                'width' : Main.VIDEO_WIDTH + 'px',
                'height' : Main.VIDEO_HEIGHT + 'px'
            }
        });
        myDiv.inject($m(Main.DIV_ID));

        var moduleTitle = UIHelpers.setMainPanel(this.moduleInfo.moduleTitle);
        UIHelpers.setClasses(moduleTitle, 'module-title no-select rotate90');

        if (step.media.moduleIntroVideo == undefined) {
            step.media.previewImage.options.style.width = '100%';
            step.media.previewImage.options.style.height = '100%';
            step.media.previewImage.options.style.left = 0;
            step.media.previewImage.options.style.top = 0;

            step.media.previewImage.add(myContainerID);
            step.media.previewImage.show();

            var titleDiv = new Element("div", {
                id : 'titles',
                styles : {
                    position : 'absolute',
                    'left' : '10px',
                    'top' : '370px',
                    'width' : '660px',
                    'height' : '100px'
                },
                'class' : 'pane gray'
            });
            titleDiv.inject(myDiv);

            var moduleProgress = new Element("h1", {
                html : 'Module Progress:',
                styles : {
                    left : '0',
                    top : '0',
                    'position' : 'relative',
                },
                'class' : 'sequence-title no-select'
            });
            moduleProgress.inject(titleDiv);

            var moduleState = Main.userTracker.getModuleState(this.moduleInfo.moduleID);
            var moduleProgressBar = UIHelpers.progressBarSetup(moduleState.progress, this.moduleInfo.moduleID);
            UIHelpers.setClasses(moduleProgressBar['holder'], "no-select module_progress_intro");
            moduleProgressBar['holder'].inject(titleDiv);

            this._addButton({
                type : "Continue",
                next : "Continue.clicked"
            });
            this._addButton({
                type : "Main Menu",
                next : "MainMenuFromIntro.clicked"
            });
            this._updateUserProgress();

            //if (this.fromMenu == true) {
            this.fromMenu = false;
            step.media.audio.options.next = '';
            step.media.audio.start();
            // }
        } else {
            this._stopPlayers();

            this._removeButtons();
            this._removeIntroContainers();

            this._hideInteractions();

            step.media.moduleIntroVideo.options.next = 'Module.Intro.Video.done';
            step.media.moduleIntroVideo.show();

            this._hideOtherVideos(step.media.moduleIntroVideo.playerID);
            this.activeVideo.registerPlaybackStartEvent();

            if (this.sequenceState.completed == true) {
                // Already played the intro video so this time show continue buttons
                this._addButton({
                    type : "Continue",
                    next : "Continue.clicked"
                });
                this._addButton({
                    type : "Main Menu",
                    next : "MainMenuFromIntro.clicked"
                });
            }
            this.fromMenu = false;
            step.media.moduleIntroVideo.start();
        }
    }.protect(),
    _preloadPosterFrame : function(filename) {
        var file = Main.PATHS.imageFolder + stripFileExtension(filename) + "_first.jpg";
        var posterImage = new ImagePlayer(this, {
            src : file,
            title : 'Image',
            id : 'poster_image_' + filename
        });
        this.mediaLoader.register(posterImage.getLoaderInfo());
    },
    _moduleGroupIntroSetup : function(step) {
        var moduleTitle = UIHelpers.setMainPanel(this.moduleInfo.moduleTitle);
        UIHelpers.setClasses(moduleTitle, 'module-title no-select rotate90');

        this._stopPlayers();
        this._removeButtons();
        this._removeIntroContainers();
        this._hideInteractions();
        step.media.moduleIntroVideo.options.next = 'Module.Group.Intro.Video.done';
        step.media.moduleIntroVideo.show();

        this._hideOtherVideos(step.media.moduleIntroVideo.playerID);
        step.media.moduleIntroVideo.start();

    }.protect(),
    _introductionSetup : function(step) {
        var moduleTitle = UIHelpers.setMainPanel(this.moduleInfo.moduleTitle);
        UIHelpers.setClasses(moduleTitle, 'module-title no-select rotate90');

        // Play the Intro video
        this._stopPlayers();
        this._removeButtons();
        this._removeIntroContainers();
        this._hideInteractions();

        if (this.sequenceState.completed == true) {
            // Show button to skip
            this._addButton({
                type : "Continue",
                next : "Continue.clicked"
            });
        }

        step.media.video.options.next = 'PlayVideo_cue.done';
        step.media.video.registerCueEvents();
        step.media.video.show();
        this._hideOtherVideos(step.media.video.playerID);

        if (this.fromMenu == true) {
            this.fromMenu = false;
            // Only update the progress when the video is complete
            //this._updateUserProgress();
        }

    }.protect(),
    _getCuePoints : function(item) {
        var cuePointsRawData = item.childNodes;
        var cuePointsData = {
            cuePoints : new Array()
        };
        Array.each(cuePointsRawData, function(cuePointData, index) {
            if (cuePointData.value != '') {
                var file = Main.PATHS.imageFolder + cuePointData.value;
                var imagePlayer = new ImagePlayer(this, {
                    src : file,
                    title : 'Introduction Image',
                    id : 'cue image' + index
                });
                imagePlayer.options.style.left = cuePointData.attributes.left;
                imagePlayer.options.style.top = cuePointData.attributes.top;
                imagePlayer.options.style.width = cuePointData.attributes.width;
                imagePlayer.options.style.height = cuePointData.attributes.height;
                this.mediaLoader.register(imagePlayer.getLoaderInfo());
            }
            var cuePoint = {
                image : imagePlayer,
                start : cuePointData.attributes.start,
                end : cuePointData.attributes.end,
                active : false
            };
            cuePointsData.cuePoints.push(cuePoint);
        }.bind(this));
        return cuePointsData;
    },
    _checkCuePoints : function(step) {
        var currentTime = this.activeVideo.player.currentTime();
        Array.each(step.data.cuePoints, function(cuePoint, cupePointIndex) {
            if (currentTime >= cuePoint.start && currentTime < cuePoint.end) {
                if (cuePoint.active == false) {
                    cuePoint.active = true;
                    cuePoint.image.add(this.activeVideo.containerID);
                    cuePoint.image.show();
                }
            };

            if (currentTime >= cuePoint.end) {
                if (cuePoint.active == true) {
                    cuePoint.active = false;
                    cuePoint.image.remove();
                }
            };
        }.bind(this));
    },
    _addButton : function(buttonData) {
        var buttonOptions = UIHelpers.getButtonOptions(buttonData['type']);
        if (buttonData['next']) {
            buttonOptions['next'] = buttonData['next'];
        }
        var button = new Button(null, buttonOptions);
        button.registerEvent(this);
        button.add(Main.DIV_ID);
        button.show();
        this.buttons.push(button);
    }.protect()
});
