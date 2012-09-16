/**
 * @author Radek
 */

var Unit = new Class({

    Implements : [Options, Events],
    options : {
        unitTagId : 'drivesmart'
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

        this.mediaLoader = new MediaLoader(this, { });
        this.mediaLoader.add('drivesmart')

        this.addEvent("TIMELINE", this.handleNavigationEvent);

    },
    // ----------------------------------------------------------
    start : function() {
        // TODO handle mobile platforms: Browser.Platform.android

        this.buttonPosition = {
            x : 535,
            y : 415
        }

        this.panelPosition = {
            left : '5%',
            top : '25%'
        }
        // make sure there are no objects left
        this.buttons.empty();
        this.currentSequence.empty();
        this.interactions = null;
        this.videos.empty();
        //
        this.setupData();
    },
    // ----------------------------------------------------------
    setupData : function() {
        this.dataLoader = new DataLoader(this, {
            src : 'data/Country.xml',
            next : 'data.ready'
        });
        this.dataLoader.start();
    },
    // ----------------------------------------------------------
    setupMedia : function() {
        // we get a copy of the array so we can keep the original for repeat
        this.currentSequence = Array.clone(this.sequences.seq_4);
        // add players to media so they can be preloaded
        this._setupSequenceMedia(this.currentSequence);

        // Intial scene setup
        this.intro_image = new ImageMedia(this, {
            src : 'img/country_intro.png',
            next : "image.ready",
            title : 'Country Intro',
            id : 'introImage'
        });

        this.mediaLoader.options.next = 'media.ready';
        this.mediaLoader.show();

        this.mediaLoader.start();
    },
    nextStep : function() {
        // take a step and decide what to do with it
        if (this.currentSequence.length > 0) {
            var currentStep = this.currentSequence.shift();
            var stepType = currentStep.attributes.fmt;
            console.log("Step type: " + stepType);
            switch (stepType) {
                case "PlayVideo":
                    this._cleanUp();
                    currentStep.player.options.next = 'PlayVideo.done';
                    currentStep.player.show();
                    currentStep.player.start();
                    this._hideOtherVideos(currentStep.player.containerID);
                    break;
                case "Question":
                    currentStep.player.options.next = 'Question.done';
                    currentStep.player.start();
                    break;
                case "QuestionUser":
                    this.interactions = this._setupQuestions(currentStep.data);
                    var button = this._setupButton("Submit answer", "button_2", "QuestionUser.done", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);
                    break;
                case "QuestionFeedback":
                    this._removeButtons();
                    this.interactions.showCorrect();
                    currentStep.player.options.next = 'QuestionFeedback.done';
                    currentStep.player.start();
                    break;
                case "PlayAudio":
                    currentStep.player.options.next = 'PlayAudio.done';
                    currentStep.player.start();
                    break;
                case "Continue":
                    var button = this._setupButton("Continue", "button_3", "Continue.done", this.buttonPosition.x, this.buttonPosition.y);
                    this.buttons.push(button);
                    break;
            }

        } else {
            // seq finished
        }
    },
    // ----------------------------------------------------------
    // This handles all timeline events and emulates the timeline
    handleNavigationEvent : function(params) {

        switch (params.next) {
            case "data.ready":
                this.sequences = params.data;
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
                this.intro_image.hide();
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
            case "Continue.done":
                this._removeVideos();
                this._cleanUp();
                this.start();
                break;

            case "risk.selected":

                var el = document.getElementById('drivesmart');

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
                this.risk_image.add('drivesmart');
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
        params.source = [{
            type : "video/mp4",
            src : filename + ".mp4"
        }, {
            type : "video/webm",
            src : filename + ".webm"
        }, {
            type : "video/ogg",
            src : filename + ".ogg"
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
        Array.each(step.childNodes, function(item, index) {
            switch (item.name) {
                case "Video" :
                    if (item.value != '') {
                        var fileName = 'media/video/country/' + stripFileExtension(item.value);

                        step.player = new VideoPlayer(this, {
                            id : "video_" + index + "_" + stepOrder,
                            next : 'not.set'
                        });
                        // step.player.add(this.options.unitTagId);
                        this._setVideoSource(step.player, fileName);
                        this.mediaLoader.register(step.player.getLoaderInfo());
                        // we want to store this so all VideoJS player can be removed correctly (see remove() in VideoPlayer)
                        this.videos.push(step.player);
                    }
                    break;
                case "Audio" :
                    if (item.value != '') {
                        var fileName = stripFileExtension(item.value);
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
                        data : [],
                        correct : '',
                        style : this.panelPosition
                    }

                    Array.each(questionsRawData, function(question, index) {
                        questions.data.push(question.value);
                        if (question.attributes.correct == true) {
                            questions.correct = index;
                        }
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
        var imageDiv = document.getElementById('imageHolder');
        if (imageDiv != null) {
            imageDiv.dispose();
        }
        this._removeButtons();
        this._removeInteractions();
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
    _removeVideos : function() {
        Array.each(this.videos, function(item, index) {
            item.remove();
        })
        this.videos.empty();
    },
    _hideOtherVideos : function(excludedId) {
        var videos = $$('div.videoContainer');
        Array.each(videos, function(item, index) {
            var containerID = item.id;
            if (containerID == excludedId) {
                //item.show();
            } else {
                item.fade('out', 0);
            }
            //console.log("Container " + containerID + " to keep " + excludedId)
        })
    }
});

/*
// TEST:
// make sure the shapes are the child of the clickable area so they recieve the click events too
var videoDiv = document.getElementById('videoHolder');
this.shape = new Shape(this, {});
this.shape.add('videoHolder');

videoDiv.addEvent('click', function(e) {
this.fireEvent("TIMELINE", {
type : "risk.clicked",
id : this.options.id,
next : 'risk.selected',
_x : e.page.x,
_y : e.page.y
});
var shapeDiv = document.getElementById('shapeHolder');
// console.log(e.page.x + " " + e.page.y);

}.bind(this));
*/

//this.intro_image.flash('0', '1', 50, 'opacity', 250);
