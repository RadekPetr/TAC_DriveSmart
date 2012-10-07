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
        this.sequenceState = null;

        this.mediaLoader = null;
        this.buttons = new Array();
        this.interactions = null;
        this.videos = new Array();
        this.activeVideo = null;
        this.shape = null;

        this.currentStep = null;
        this.cameo_image = null;

        this.mediaLoader = new MediaLoader(this, {
            parentElementID : this.options.unitTagId
        });
        // this.mediaLoader.add('drivesmart')

        this.addEvent("TIMELINE", this.handleNavigationEvent);

    },
    myParent : function() {
        return this.options.parent;
    },
    // ----------------------------------------------------------
    start : function(sequenceData) {

        this.currentSequence.empty();
        this.currentSequence = Array.clone(sequenceData);
        this.moduleInfo = this.myParent().getModuleInfo();

        this.sequenceState = {
            moduleID : this.moduleInfo.moduleID,
            id : this.moduleInfo.currentSequenceID,
            completed : false,
            score : 0
        }

        // TODO handle mobile platforms: Browser.Platform.android, handle incompatible old browsers
        log("Starting SEQUENCE: " + this.moduleInfo.currentSequenceID);
        //log(this.currentSequence);
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
        this._setupSequenceMedia(this.currentSequence);
        this.mediaLoader.options.next = 'media.ready';
        this.mediaLoader.start(true);
    },
    nextStep : function() {
        // take a step and decide what to do with it
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
                        styles : {
                            'color' : '#ff9900',
                            'font-style' : 'italic',
                            'font-size' : '2.5em',
                            'font-weight' : 'bold',
                            'text-align' : 'center'
                        }
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
                            position : 'absolute',
                            left : '0px',
                            top : '20%',
                            'color' : '#ff9900',
                            'font-style' : 'italic',
                            'font-size' : '3em',
                            'font-weight' : 'bold'
                        }
                    })
                    moduleTitle.inject($(myContainerID));

                    var moduleProgress = userTracker.getModuleProgress(this.moduleInfo.moduleID);
                    var sequenceTitleText = "Exercise " + moduleProgress.finishedCount + " of " + moduleProgress.total + " completed";
                    var sequenceTitle = new Element("h1", {
                        html : sequenceTitleText,
                        styles : {
                            position : 'absolute',
                            left : '0px',
                            top : '10%',
                            'color' : '#EAC749',
                            'font-size' : '1em',
                            'font-weight' : 'bold'
                        }

                    })
                    sequenceTitle.inject($(myContainerID));

                    var button = this._setupButton("Continue", "continue_button", "SequenceIntro.done", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);
                    var button = this._setupButton("Main Menu", "main_menu_button", "MainMenuIntro.clicked", this.buttonPosition.x, this.buttonPosition.y - 80);
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
                    // NOTE - this only can be at the end of the sequence !!!!
                    var button = this._setupButton("Continue", "continue_button", "Continue.clicked", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);
                    var button = this._setupButton("Main Menu", "main_menu_button", "MainMenu.clicked", this.buttonPosition.x, this.buttonPosition.y - 80);
                    this.buttons.push(button);
                    var button = this._setupButton("Repeat", "repeat_button", "Repeat.clicked", this.buttonPosition.x, this.buttonPosition.y - 160);
                    this.buttons.push(button);

                    this._updateUserProgress();

                    break;
                case "End.Module.Continue":
                    step.player.start();
                    var button = this._setupButton("Continue", "continue_button", "End.Module.Continue.clicked", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);
                    var button = this._setupButton("Repeat", "repeat_button", "Repeat.clicked", this.buttonPosition.x, this.buttonPosition.y - 160);
                    this.buttons.push(button);

                    this._updateUserProgress();

                    break;
                case "Commentary":
                    log("##### Commentary ######");
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
                    this._removeButtons();
                    step.image.add(this.shape.container.id);
                    step.image.show();                   
                    this.currentStep.player.options.next = 'KRFeedback.done';
                    this.currentStep.player.start();               

                    break;
                case "Cameo":
                    var file = this.options.imageFolder + 'cameos/visor.png';
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
                    this.cameo_image.preload();

                    break;
                case "DragNDrop":
                    log("##### DragNDrop ######");
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
                //this.mediaLoader.options.next = null;
                //this.mediaLoader.hide();

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
                this.myParent().fireEvent("SEQUENCE", {
                    type : "sequence.event",
                    next : 'sequence.next'
                });
                break;

            case "Repeat.clicked":
                this._removeVideos();
                this._cleanUp();
                this._removeInteractions();
                // this.start();

                this.myParent().fireEvent("SEQUENCE", {
                    type : "sequence.event",
                    next : 'sequence.repeat'
                });
                break;
            case "End.Module.Continue.clicked":
            case "MainMenu.clicked":
            case "MainMenuIntro.clicked":
                this._removeVideos();
                this._cleanUp();
                this._removeInteractions();
                this.myParent().fireEvent("SEQUENCE", {
                    type : "sequence.event",
                    next : 'sequence.exit'
                });
                break;

            case "Cameo.visor.image.ready":
                log(this.currentStep.player);
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
                this.cameo_image.tween('0px', '203px', 1, 'height', 300, 'ignore', '')
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
                var file = this.options.imageFolder + 'keyrisks/selected_risk.png';
                this.risk_image = new ImagePlayer(this, {
                    src : file,
                    next : "",
                    title : 'Risk',
                    id : 'Risk',
                    style : {
                        left : params._x - elOffset.x - 30,
                        top : params._y - elOffset.y - 30
                    }
                });
                this.risk_image.preload();

                this.risk_image.add(this.options.unitTagId);
                this.risk_image.show();
                // TODO: warp all risks to a div and get rid of them whne no needed
                // TODO: limit to 5
                // TODO: blink nicely few times
                break;
            case "shape.clicked":
                log("Shape clicked ID: " + params.id)
                //TODO: scoring
                break;

            case "Menu.item.clicked":

                log(params.id);
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
        log("---------------------------- Finished setting up media from xml");
        log(seq);
    },
    // ----------------------------------------------------------
    _setupStepMedia : function(step, stepOrder) {
        var stepType = step.attributes.fmt;
        Array.each(step.childNodes, function(item, index) {
            if (step.player != undefined) {
                log("!!!!!!!!!!!!!!!!!!!!! ERROR - Two players in this step !!!!!!!!!!!!!!!!!!!!!!!!!" + stepType);
            }
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
                        // Intial scene setup
                        step.image = new ImagePlayer(this, {
                            src : file,
                            title : 'Image',
                            id : 'image' + index + "_" + stepOrder,
                        });
                        this.mediaLoader.register(step.image.getLoaderInfo());
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
                            moduleID : menuItemData.attributes.moduleID

                        }
                        menuItems.data.push(menuItem);
                    })
                    step.data = menuItems;
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
        log("---------------------------- Step");
        log(step)
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

        var menuTag = $('Menu.container');
        if (menuTag != null) {
            menuTag.dispose();
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
            //log("Player " + playerID + " to keep " + excludedId)
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
    },
    _updateUserProgress : function() {
        // Update state to completed = true;
        this.sequenceState.completed = true;

        // TODO: remove this whne scoring is implemnted
        this.sequenceState.score = 100;

        this.myParent().fireEvent("SEQUENCE", {
            type : "module.event",
            next : 'sequence.completed'
        });
    }
});

/*
// TEST:

*/

//this.intro_image.tween('0', '1', 50, 'opacity', 250);
