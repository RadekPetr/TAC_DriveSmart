/**
 * @author Radek
 */

var SequencePlayer = new Class({

    Implements : [Options, Events],
    options : {
        unitTagId : 'drivesmart',
        audioFolder : 'media/sound/',
        videoFolder : 'media/video/',
        imageFolder : 'media/images/',
        parent : null

    },
    initialize : function(myParent, module, myOptions) {

        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.currentSequence = new Array();

        this.mediaLoader = null;
        this.buttons = new Array();
        this.interactions = null;
        this.videos = new Array();
        this.activeVideo = null;
        this.shape = null;

        this.currentStep = null;
        this.cameo_image = null;

        this.mediaLoader = new MediaLoader(this, { });
        this.mediaLoader.add('drivesmart')

        this.addEvent("TIMELINE", this.handleNavigationEvent);

    },
    // ----------------------------------------------------------
    start : function(sequenceData) {

        this.currentSequence.empty();
        this.currentSequence = Array.clone(sequenceData);
        this.moduleInfo = this.options.parent.getModuleInfo();

        // TODO handle mobile platforms: Browser.Platform.android, handle incompatible old browsers
        console.log("Starting SEQUENCE: " + this.moduleInfo.sequenceID);
        //console.log(this.currentSequence);
        this.buttonPosition = {
            x : 535,
            y : 415
        }

        this.panelPosition = {
            left : '5%',
            top : '25%'
        }

        this._removeVideos();
        this._cleanUp();
        this._removeInteractions();

        // make sure there are no objects left
        this.buttons.empty();

        this.interactions = null;
        this.videos.empty();
        this.activeVideo = null;
        this.shape = null;

        this.currentStep = null;
        this.cameo_image = null;
        //
        this.setupMedia();
    },
    // ----------------------------------------------------------
    setupMedia : function() {
        // we get a copy of the array so we can keep the original for repeat
        //this.currentSequence = Array.clone(this.options.moduleSequences[this.options.sequenceID]);
        // add players to media so they can be preloaded
        this._setupSequenceMedia(this.currentSequence);

        // Intial scene setup
        this.intro_image = new ImageMedia(this, {
            src : 'img/sequence_intro.png',
            next : "",
            title : 'Intro',
            id : 'introImage'
        });

        this.mediaLoader.options.next = 'media.ready';
        this.mediaLoader.show();

        this.mediaLoader.start();
    },
    nextStep : function() {
        // take a step and decide what to do with it
        if (this.currentSequence.length > 0) {
            var step = this.currentSequence.shift();
            this.currentStep = step;
            var stepType = step.attributes.fmt;
            //console.log("Step type: " + stepType);
            switch (stepType) {
                case "SequenceIntro":

                    var myDiv = new Element("div", {
                        id : 'SequenceIntro.container'
                    });
                    myDiv.inject($(this.options.unitTagId));

                    this.intro_image.add('SequenceIntro.container');
                    this.intro_image.show();

                    step.previewImage.add('SequenceIntro.container');
                    step.previewImage.show();

                    var textDiv = new Element("h1", {
                        html : this.moduleInfo.moduleTitle,
                        styles : {
                            position : 'absolute',
                            left : '0px',
                            top : '20%',
                            'color' : '#EAC749',
                            'font-style' : 'italic',
                            'font-size' : '3em',
                            'font-weight' : 'bold'
                        }
                    })
                    textDiv.inject($('SequenceIntro.container'));

                    var button = this._setupButton("Continue", "continue_button", "SequenceIntro.done", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);
                    var button = this._setupButton("Main Menu", "main_menu_button", "MainMenu.clicked", this.buttonPosition.x, this.buttonPosition.y - 80);
                    this.buttons.push(button);
                    step.player.options.next = '';
                    step.player.start();

                    break;
                case "PlayVideo":
                    this._cleanUp();
                    this._hideInteractions();
                    step.player.options.next = 'PlayVideo.done';
                    step.player.show();
                    step.player.start();
                    this._hideOtherVideos(step.player.playerID);
                    //TODO: noBg1="1"
                    break;
                case "Question":
                    step.player.options.next = 'Question.done';
                    step.player.start();
                    //TODO: cmd="hidescreen" - show the mudscreen
                    break;
                case "QuestionUser":
                    this._removeInteractions();
                    this.interactions = this._setupQuestions(step.data);
                    var button = this._setupButton("Submit answer", "submit_button", "QuestionUser.done", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);
                    //TODO: resp="3" - allow multiple choices
                    //TODO: notrack="true"
                    //TODO: image="country_cla01_next_first.jpg" - override background image ...
                    break;
                case "QuestionFeedback":
                    this._removeButtons();
                    this._showInteractions();
                    this.interactions.showCorrect();
                    step.player.options.next = 'QuestionFeedback.done';
                    step.player.start();
                    //TODO: show="MudScreen" - show mudscreen during feedback
                    //TODO:  KeepUserSelection="1"
                    break;
                case "PlayAudio":
                    step.player.options.next = 'PlayAudio.done';
                    step.player.start();
                    //TODO: hide="box" not used ?
                    break;
                case "Continue":
                    var button = this._setupButton("Continue", "continue_button", "Continue.clicked", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);
                    var button = this._setupButton("Main Menu", "main_menu_button", "MainMenu.clicked", this.buttonPosition.x, this.buttonPosition.y - 80);
                    this.buttons.push(button);
                    var button = this._setupButton("Repeat", "repeat_button", "Repeat.clicked", this.buttonPosition.x, this.buttonPosition.y - 160);
                    this.buttons.push(button);
                    break;
                case "Commentary":
                    console.log("##### Commentary ######");
                    alert("Commentary - Not implemented");
                    var button = this._setupButton("Skip", "skip_button", "Skip.done", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);
                    break;
                case "KeyRisk" :
                    this._setupRisks();
                    step.player.options.next = 'Risks.ready';
                    step.player.start();
                    //TODO: <Audio waitfor="true">sound/scanning/mp3/scan_vsbkr1b.mp3</Audio>
                    break;
                case "KRFeedback":
                    this.KRFeedbackImage = new ImageMedia(this, {
                        src : this.options.imageFolder + step.attributes.image,
                        next : "KRFeedback.ready",
                        title : 'Feedback',
                        id : 'KRFeedback'
                    });
                    this._removeButtons();
                    break;
                case "Cameo":

                    this.cameo_image = new ImageMedia(this, {
                        src : 'img/visor.png',
                        next : "Cameo.visor.image.ready",
                        title : 'Visor',
                        id : 'visor',
                        style : {
                            'left' : '170px',
                            height : '0px'
                        }
                    });

                    break;
                case "DragNDrop":
                    console.log("##### DragNDrop ######");
                    alert("DragNDrop - Not implemented");
                    var button = this._setupButton("Skip", "skip_button", "Skip.done", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);

                    break;

            }

        } else {
            // seq finished
            alert("Sequence finished, select another one");
        }
    },
    // ----------------------------------------------------------
    // This handles all timeline events and emulates the timeline
    handleNavigationEvent : function(params) {

        switch (params.next) {
            case "media.ready":
                this.mediaLoader.options.next = null;
                this.mediaLoader.hide();
                this.nextStep();
                break;
            case "SequenceIntro.done":
                //  $('SequenceIntro.container').dispose();
                this._cleanUp();
                this.currentStep.previewImage.remove();
                this.currentStep.player.stop();
                this.nextStep();
                break;
            case "PlayVideo.done":
                this.nextStep();
                break;
            case "Question.done":
                this.nextStep();
                break;
            case "QuestionUser.done":
                this.nextStep();
                break;
            case "QuestionFeedback.done":
                this.nextStep();
                break;
            case "PlayAudio.done":
                this.nextStep();
                break;
            case "Risks.ready":
                var button = this._setupButton("Done", "don_button", "Risks.done", this.buttonPosition.x, this.buttonPosition.y);
                this.buttons.push(button);
                break;
            case "Risks.done" :
                this.activeVideo.container.removeEvents('click');
                this.nextStep();
                break;
            case "KRFeedback.ready":

                this.KRFeedbackImage.add(this.shape.container.id);
                this.KRFeedbackImage.show();
                this.currentStep.player.options.next = 'KRFeedback.done';
                this.currentStep.player.start();
                break;
            case 'KRFeedback.done':
                // add continue button
                var button = this._setupButton("Continue", "krFeedback_done_button", "KRFeedback.continue.done", this.buttonPosition.x, this.buttonPosition.y);
                this.buttons.push(button);

                break;
            case 'KRFeedback.continue.done':
                this._removeButtons();
                this.shape.remove();

                this._cleanUp();
                // TODO: remove image if I'll use it
                this.nextStep();
                break;

            case "Continue.clicked":
                this._removeVideos();
                this._cleanUp();
                this._removeInteractions();
                this.options.parent.fireEvent("SEQUENCE", {
                    type : "sequence.event",
                    next : 'sequence.next'
                });
                break;

            case "Repeat.clicked":
                this._removeVideos();
                this._cleanUp();
                this._removeInteractions();
                // this.start();

                this.options.parent.fireEvent("SEQUENCE", {
                    type : "sequence.event",
                    next : 'sequence.repeat'
                });
                break;

            case "MainMenu.clicked":
                this._removeVideos();
                this._cleanUp();
                this._removeInteractions();
                this.options.parent.fireEvent("SEQUENCE", {
                    type : "sequence.event",
                    next : 'sequence.exit'
                });
                break;

            case "Cameo.visor.image.ready":
                this.cameo_image.add(this.currentStep.player.containerID, 'before');
                this.cameo_image.show();
                this.cameo_image.tween('203px', '0px', 1, 'height', 300, 'ignore', 'Cameo.visor.tween.done')
                break;
            case "Cameo.visor.tween.done":
                this.currentStep.player.options.next = 'Cameo.done';
                this.currentStep.player.show();
                this.currentStep.player.start();
                break;
            case "Cameo.done":
                this.currentStep.player.hide(0);
                this.cameo_image.tween('0px', '203px', 1, 'height', 200, 'ignore', '')
                this.nextStep();
                break;
            case "Skip.done":
                this._removeButtons();
                this._cleanUp();
                this.nextStep();
                break;

            case "risk.selected":
                /// the risks need to be inside some div which could be deleted later
                var el = document.getElementById(this.options.unitTagId);

                var elOffset = getPos(el);

                this.risk_image = new ImageMedia(this, {
                    src : 'img/selected_risk.png',
                    next : "none",
                    title : 'Risk',
                    id : 'Risk',
                    style : {
                        left : params._x - elOffset.x - 30,
                        top : params._y - elOffset.y - 30
                    }
                });
                this.risk_image.add(this.options.unitTagId);
                this.risk_image.show();
                // TODO: warp all risks to a div and get rid of them whne no needed
                // TODO: limit to 5
                // TODO: blink nicely few times
                break;
            case "shape.clicked":
                console.log("Shape clicked ID: " + params.id)
                //TODO: scoring
                break;
        };
    },
    // ----------------------------------------------------------
    log : function(logValue) {
        console.log("****** " + logValue + " ******");
    },
    //------------------------------------------------------------------------
    _setupButton : function(text, id, nextAction, x, y) {
        var button = new Button(this, {
            style : {
                left : x + 'px',
                top : y + 'px'
            },
            text : text,
            id : id,
            next : nextAction
        });

        button.add(this.options.unitTagId);
        button.show();
        return button;
    }.protect(),

    //------------------------------------------------------------------------
    _setupQuestions : function(options) {
        var questions = new Questions(this, options);
        questions.add(this.options.unitTagId);
        questions.show();
        return questions;
    },
    // ----------------------------------------------------------
    _setupSequenceMedia : function(seq) {
        // get array of media for each step so it can be preloaded
        var media = new Hash({});
        Array.each(seq, function(step, stepOrder) {
            //var stepItems = step.childNodes;
            this._setupStepMedia(step, stepOrder);
        }.bind(this))
        console.log("---------------------------- Finished setting up media from xml");
        //console.log(seq);
    },
    // ----------------------------------------------------------
    _setupStepMedia : function(step, stepOrder) {
        var stepType = step.attributes.fmt;
        Array.each(step.childNodes, function(item, index) {
            switch (item.name) {
                case "Video" :

                    if (item.value != '') {
                        var filename = this.options.videoFolder + stripFileExtension(item.value);

                        if (stepType == 'Cameo') {
                            var style = {
                                'left' : '315px',
                                'top' : '20px',
                                'width' : '240',
                                'height' : '175'
                            }
                        } else {
                            style = {
                                width : '640',
                                height : '480',
                                left : '0px',
                                top : '0px'
                            }

                        }
                        step.player = new VideoPlayer(this, {
                            id : "video_" + index + "_" + stepOrder,
                            next : 'not.set',
                            'style' : style,
                            filename : filename
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
                case "Preview" :
                    if (item.value != '') {
                        var file = this.options.videoFolder + item.value;
                        // Intial scene setup
                        step.previewImage = new ImageMedia(this, {
                            src : file,
                            title : 'Preview',
                            id : 'PreviewImage',
                            style : {
                                width : '40%',
                                height : '40%',
                                top : '148px'
                            }
                        });
                        this.mediaLoader.register(step.previewImage.getLoaderInfo());
                    }
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

                default:
                // nothing
            }
        }.bind(this))
        // now start the preloading for each of the items
        //console.log("---------------------------- Step");
        //console.log(step)
    },
    _cleanUp : function() {
        if (this.currentStep != null) {
            if (this.currentStep.player != null) {
                this.currentStep.player.stop();
            }
        }
        var imageDiv = document.getElementById('imageContainer');
        if (imageDiv != null) {
            imageDiv.dispose();
        }
        this._removeButtons();
        //this._removeInteractions();

        var debugPanel = $('debugContainer');

        if (debugPanel != null) {
            debugPanel.dispose();
        }
        var sequenceIntroTag = $('SequenceIntro.container');
        if (sequenceIntroTag != null) {
            sequenceIntroTag.dispose();
        }

    },
    _removeButtons : function() {
        Array.each(this.buttons, function(item, index) {
            item.remove();
        })
        this.buttons.empty();
    },
    _removeInteractions : function() {
        if (this.interactions != null) {
            this.interactions.remove();
            this.interactions = null;
        }
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
        })
        this.videos.empty();
    },
    _hideOtherVideos : function(excludedId) {
        //var videos = $$('div.videoContainer');
        Array.each(this.videos, function(item, index) {
            var playerID = item.playerID;
            if (playerID == excludedId) {
                //item.show();
                this.activeVideo = item;
            } else {
                // item.fade('out', 0);
                item.hide();
            }
            //console.log("Player " + playerID + " to keep " + excludedId)
        }.bind(this))
    },
    _setupRisks : function() {
        this.shape = new Shape(this, {});
        this.shape.add(this.activeVideo.containerID);
        this.activeVideo.container.addEvent('click', function(e) {
            this.fireEvent("TIMELINE", {
                type : "risk.clicked",
                id : this.options.id,
                next : 'risk.selected',
                _x : e.page.x,
                _y : e.page.y
            });

        }.bind(this));
    }
});

/*
// TEST:

*/

//this.intro_image.tween('0', '1', 50, 'opacity', 250);
