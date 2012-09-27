/**
 * @author Radek
 */

var Unit = new Class({

    Implements : [Options, Events],
    options : {
        unitTagId : 'drivesmart',
        audioFolder : 'media/sound/',
        videoFolder : 'media/video/',
        imageFolder : 'media/images/',
        sequenceID : 'seq_1',
        module : 'country'
    },
    initialize : function(myOptions) {
        this.setOptions(myOptions);

        this.sequences = new Array();
        this.currentSequence = new Array();
        this.dataLoader = null;
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
    start : function() {
        // TODO handle mobile platforms: Browser.Platform.android, handle incompatible old browsers
        console.log("Starting SEQUENCE: " + this.options.sequenceID);
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
        this.currentSequence.empty();
        this.interactions = null;
        this.videos.empty();
        this.activeVideo = null;
        this.shape = null;
        this.currentStep = null;
        this.cameo_image = null;
        //
        this.setupData();
    },
    // ----------------------------------------------------------
    setupData : function() {
        this.dataLoader = new DataLoader(this, {
            src : 'data/' + this.options.module + '.xml',
            next : 'data.ready'
        });
        this.dataLoader.start();
    },
    // ----------------------------------------------------------
    setupMedia : function() {
        // we get a copy of the array so we can keep the original for repeat
        this.currentSequence = Array.clone(this.sequences[this.options.sequenceID]);
        // add players to media so they can be preloaded
        this._setupSequenceMedia(this.currentSequence);

        // Intial scene setup
        this.intro_image = new ImageMedia(this, {
            src : 'img/country_intro.png',
            next : "image.ready",
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
            console.log("Step type: " + stepType);
            switch (stepType) {
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
                    var button = this._setupButton("Submit answer", "button_2", "QuestionUser.done", this.buttonPosition.x, this.buttonPosition.y);
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
                    var button = this._setupButton("Continue", "button_3", "Continue.done", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);
                    break;
                case "Commentary":
                    console.log("##### Commentary ######");
                    alert("Commentary - Not implemented");
                    var button = this._setupButton("Skip", "Skip", "Skip.done", this.buttonPosition.x, this.buttonPosition.y);
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
                            'left' : '170px'
                        }
                    });

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
            case "data.ready":
                this.sequences = params.data;
                this.setupDebug();
                this.setupMedia();
                break;
            case "media.ready":
                this.mediaLoader.options.next = null;
                this.mediaLoader.hide();

                this.intro_image.add(this.options.unitTagId);
                this.intro_image.show();
                var button = this._setupButton("Start", "button_1", "start.clicked", this.buttonPosition.x, this.buttonPosition.y);
                this.buttons.push(button);
                break;
            case "start.clicked":
                this.intro_image.remove();
                this._cleanUp();
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
                var button = this._setupButton("Done", "button_Done", "Risks.done", this.buttonPosition.x, this.buttonPosition.y);
                this.buttons.push(button);
                break;
            case "Risks.done" :
                this.activeVideo.videoContainer.removeEvents('click');
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
                var button = this._setupButton("Continue", "button_Done", "KRFeedback.continue.done", this.buttonPosition.x, this.buttonPosition.y);
                this.buttons.push(button);

                break;
            case 'KRFeedback.continue.done':
                this._removeButtons();
                this.shape.remove();

                this._cleanUp();
                // TODO: remove image if I'll use it
                this.nextStep();
                break;

            case "Continue.done":
                this._removeVideos();

                this._cleanUp();
                this._removeInteractions();
                this.start();
                break;

            case "Cameo.visor.image.ready":
                this.cameo_image.add(this.currentStep.player.containerID, 'before');
                this.cameo_image.show();
                this.cameo_image.tween('203px', '0px', 1, 'height', 400, 'ignore', 'Cameo.visor.tween.done')
                break;
            case "Cameo.visor.tween.done":
                this.currentStep.player.options.next = 'Cameo.done';
                this.currentStep.player.show();
                this.currentStep.player.start();
                break;
            case "Cameo.done":
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
                break;
            case "shape.clicked":
                console.log("Shape clicked ID: " + params.id)
                break;
        };
    },
    // ----------------------------------------------------------
    log : function(logValue) {
        console.log("****** " + logValue + " ******");
    },
    //------------------------------------------------------------------------
    _setVideoSource : function(player, filename) {
        var params = new Object();
        var rand = "?" + Math.random();
        params.source = [{
            type : "video/mp4",
            src : filename + ".mp4"
        }, {
            type : "video/webm",
            src : filename + ".webm"
        }, {
            type : "video/ogg",
            src : filename + ".ogv"
        }];
        params.poster = {
            src : filename + "_first.jpg"
        };
        //console.log(params)
        player.setParams(params);
    }.protect(),
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
                        var fileName = this.options.videoFolder + stripFileExtension(item.value);

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
                            'style' : style
                        });

                        this._setVideoSource(step.player, fileName);
                        this.mediaLoader.register(step.player.getLoaderInfo());
                        // we want to store this so all VideoJS player can be removed correctly (see remove() in VideoPlayer)
                        this.videos.push(step.player);

                    }
                    break;
                case "Audio" :
                    if (item.value != '') {
                        var fileName = this.options.audioFolder + stripFileExtension(item.value);
                        step.player = new AudioPlayer(this, {
                            next : 'not.set',
                            id : "audio_" + index + "_" + stepOrder,
                            src : fileName + ".mp3|" + fileName + ".ogg",
                            preload : 'false'
                        });
                        this.mediaLoader.register(step.player.getLoaderInfo());
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
    setupDebug : function() {
        // add dropdown
        var myDiv = $('debugContainer');
        if (myDiv == null) {
            var myDiv = new Element("div", {
                id : "debugContainer"
            });
            myDiv.inject(this.options.unitTagId, 'before');
            var sequenceSelector = new Element('select', {});
            var moduleSelector = new Element('select', {
                events : {
                    change : function() {

                        this.options.module = moduleSelector.options[moduleSelector.selectedIndex].value;

                        this.start();
                    }.bind(this)
                }
            });

            var option = new Element('option', {
                value : 'country',
                html : 'country'
            })
            option.inject(moduleSelector);
            var option = new Element('option', {
                value : 'urban',
                html : 'urban'
            })
            option.inject(moduleSelector);
            var option = new Element('option', {
                value : 'scanning',
                html : 'scanning'
            })
            option.inject(moduleSelector);
             var option = new Element('option', {
                value : 'kaps',
                html : 'kaps'
            })
            option.inject(moduleSelector);

            var sequenceSelectorButton = new Element('button', {
                html : 'Start',
                id : 'debug',
                styles : {
                },
                events : {
                    click : function() {
                        this.options.sequenceID = sequenceSelector.options[sequenceSelector.selectedIndex].value;
                        this.options.module = moduleSelector.options[moduleSelector.selectedIndex].value;
                        this.start();
                    }.bind(this)
                }
            });
            var sequenceList = this.dataLoader.getSequenceIDs();
            Array.each(sequenceList, function(item, index) {
                var option = new Element('option', {
                    value : item,
                    html : item
                })
                option.inject(sequenceSelector);

            })
            moduleSelector.inject(myDiv);
            moduleSelector.value = this.options.module;
            sequenceSelector.inject(myDiv);
            sequenceSelector.value = this.options.sequenceID;
            sequenceSelectorButton.inject(myDiv);

        }
    },
    _cleanUp : function() {
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
            console.log("Player " + playerID + " to keep " + excludedId)
        }.bind(this))
    },
    _setupRisks : function() {
        this.shape = new Shape(this, {});
        this.shape.add(this.activeVideo.containerID);
        this.activeVideo.videoContainer.addEvent('click', function(e) {
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
