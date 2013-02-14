/**
 * @author Radek
 */
var User = new Class({

    Implements : [Options, Events],

    options : {
        ready : false,
        parent : null
    },
    initialize : function(myParent, myOptions) {
        this.setOptions(myOptions);
        this.options.parent = myParent;

        this.defaultData = new Hash({});
        this.userData = null;
        log("defaultData 1 ", this.defaultData);
        this.concentrationLevel = 1;
    },
    loadProgress : function() {
        // try loading userdata from server
        // if fails, clone defaults

        var myCookie = Cookie.read('userProgress');
        //TODO: finish loading from server
        // var jsonUserRequest = new Request({
        //   url : Main.userDataStoreURL,
        //    link : 'chain',
        //    method : 'get',
        //   onSuccess : function(responseText) {
        //       log("jsonUserRequest Success");
        //   },
        //   onFailure : function(xhr) {
        //      log("jsonUserRequest Failed", xhr);
        //   }
        // }).send();

        var decompressedData = lzw_decode(myCookie);
        var myProgress = JSON.decode(decompressedData);
        log("Read Cookie: ", myCookie, decompressedData, myProgress);
        if (myProgress == null) {
            this.userData = new Hash(this.defaultData);
            log("No User Data saved - Default user progress");
        } else {

            this.userData = new Hash(myProgress);
            log("Loaded user progress");
            //TODO: Load the user data version too and if different from defaults handle that - merging ?

        }

        log(" this.userData", this.userData);

    },
    saveProgress : function() {
        // save complete progress to server
        // log("Saving: ", this.userData);
        this._saveCompleteUserData();
        // Save module progress
        this._saveModuleProgress();
    },
    _saveCompleteUserData : function() {
        var json_data = JSON.encode(this.userData);
        var compressedData = lzw_encode(json_data);
        var requestPayload = {
            data : compressedData
        };

        //TODO: save the User data version too
        var jsonRequest = new Request.JSON({
            url : Main.userDataStoreURL,
            link : 'chain',
            method : 'post',
            onSuccess : function(xhr) {
                log("jsonUserRequest Success", xhr);
                //TODO: check the response if not 'OK' handle issues
            },
            onFailure : function(xhr) {
                log("jsonUserRequest Failed", xhr);
                // TODO: handle the failed
            },
            onRequest : function() {
                log("Save the User data version too  .... posting");
            },
            onLoadstart : function(event, xhr) {
                log('onLoadstart Progress data saving');
            },
            onComplete : function(event, xhr) {
                log('onComplete Progress data saving');
            },
            onCancel : function(event, xhr) {
                log('onCancel Progress data saving');
            },
            onException : function(event, xhr) {
                log('onException Progress data saving');
            },
            onTimeout : function(event, xhr) {
                log('onTimeout Progress data saving');
            },
            onError : function(text, error) {
                log('onError SaveProgress', text, error);
            }
        })

        jsonRequest.send(requestPayload);
    },
    _saveModuleProgress : function() {
        var moduleID = Main.sequencePlayer.sequenceState.moduleID;
        var moduleScore = this.getModuleScore(moduleID);
        var moduleProgress = this.getModuleProgress(moduleID);

        var requestPayload = {
            score : (moduleScore * 100).toInt(),
            completed_exercises : moduleProgress.finishedCount
        };

        var externalModuleID = this._moduleIdMapping(moduleID);
        var jsonRequest = new Request.JSON({
            url : Main.userDataProgressURL + externalModuleID,
            link : 'chain',
            method : 'post',
            onSuccess : function(xhr) {
                log("_saveModuleProgress request Success", xhr);
                //TODO: check the response if not 'OK' handle issues
            },
            onFailure : function(xhr) {
                log("_saveModuleProgress request Failed", xhr);
                // TODO: handle the failed
            },
            onRequest : function() {
                log("_saveModuleProgress  .... posting");
            },
            onLoadstart : function(event, xhr) {
                log('onLoadstart _saveModuleProgress');
            },
            onComplete : function(event, xhr) {
                log('onComplete _saveModuleProgress');
            },
            onCancel : function(event, xhr) {
                log('onCancel _saveModuleProgress');
            },
            onException : function(event, xhr) {
                log('onException _saveModuleProgress');
            },
            onTimeout : function(event, xhr) {
                log('onTimeout _saveModuleProgress');
            },
            onError : function(text, error) {
                log('onError _saveModuleProgress', text, error);
            }
        });

        jsonRequest.send(requestPayload);

        // On completion of each exercise you would need to POST to /user_progress/module_progress/<module_code>
        // payload need to contain two parameters - "score" and "completed_exercises". Both integers.
        // There are two possible responses - OK (200) and "Can't find module" (422). Latter case means that module is not defined in admin section.
    },
    _moduleIdMapping : function(key) {
        var map = new Hash({
            'main_menu' : 'mm',
            'concentration' : 'cc',
            'country' : 'co',
            'urban' : 'ur',
            'kaps' : 'ka',
            'scanning' : 'sc'
        })
        return map.get(key);
    },
    setDefaultUserData : function(modules) {
        modules.each( function(moduleObject, key, hash) {
            var moduleInfo = moduleObject.getModuleInfo();
            var sequenceIds = moduleObject.sequences.getKeys();
            var sequences = new Array();

            Array.each(sequenceIds, function(sequenceID, index) {
                var sequenceData = moduleObject.sequences.get(sequenceID);

                log("sequenceID", sequenceID);
                var sequenceState = new Object({
                    id : parseInt(sequenceID),
                    completed : false,
                    score : [],
                    trackProgress : sequenceData.trackProgress,
                    trackScore : sequenceData.trackScore
                })
                sequences.push(sequenceState);
            })
            var moduleData = new Hash();
            sequences.sortOn("id", Array.NUMERIC);
            moduleData.set(key, sequences);
            this.defaultData.extend(moduleData);
        }.bind(this))
        // log("default Data", this.defaultData);
    },
    updateSequenceProgress : function(sequenceState) {
        /// get the sequence Object and update it
        var moduleID = sequenceState.moduleID;
        var currentSequenceData = Object.subset(sequenceState, ['id', 'completed', 'score']);

        var userSequence = this.getUserSequenceData(sequenceState.id, moduleID);

        if (userSequence.length > 1 || userSequence.length == 0) {
            log("ERROR");
        }
        Object.append(userSequence[0], currentSequenceData);

        log("userSequence[0]: ", userSequence[0], currentSequenceData);
        log("*** User data :", this.userData);
        log("Total score: ", this.getTotalScore());

        // and store the progress on server
        this.saveProgress();
    },
    getUnfinishedSequences : function(moduleID) {
        var sequencesInModule = this.userData.get(moduleID);
        var unfinishedSequences = sequencesInModule.filter(function(item, index) {
            return item.completed == false;
        });
        if (unfinishedSequences.length == 0) {
            log("Module is Finished");
        }
        return unfinishedSequences;
    },
    getModuleProgress : function(moduleID) {

        var sequencesInModule = this.userData.get(moduleID);
        var unfinishedSequences = sequencesInModule.filter(function(item, index) {
            return item.completed == false && item.trackProgress == true;
        });

        // log("unfinishedSequences", unfinishedSequences);

        var introSequences = sequencesInModule.filter(function(item, index) {
            return item.trackProgress == false;
        });

        // log("introSequences", introSequences, introSequences.length);
        var progressObj = {};
        // Minus the ModuleIntro
        progressObj.total = sequencesInModule.length - introSequences.length;
        progressObj.finishedCount = progressObj.total - unfinishedSequences.length;
        if (progressObj.finishedCount == 0) {
            progressObj.progress = 0;
        } else {
            progressObj.progress = (progressObj.finishedCount / progressObj.total) * 100;
        }
        if (progressObj.total == progressObj.finishedCount) {
            progressObj.completed = true;
        }
        return progressObj;
    },
    getTotalScore : function() {
        var moduleIDs = this.userData.getKeys();

        var totalScore = [];
        Array.each(moduleIDs, function(moduleID, index) {
            // do not add empty array
            var moduleScore = this.getModuleScore(moduleID);
            if (moduleScore != []) {
                totalScore.push(this.getModuleScore(moduleID));
            }
        }.bind(this))
        return totalScore.average();
    },
    getModuleScore : function(moduleID) {
        var userData = this.userData.get(moduleID);
        // log(moduleID, userData);
        var allScores = new Array();
        Array.each(userData, function(sequenceState, index) {
            // don't count Module Intros
            if (sequenceState.trackScore != "false") {
                allScores = allScores.concat(sequenceState.score);
            }
        })
        var totalScore = allScores.average();
        log("Module " + moduleID + " score: ", totalScore);
        return totalScore;
    },
    getConcentrationLevel : function(seq) {
        // TODO: store level with user data
        var userData = this.userData.get("concentration");

        log("From:", (seq - 6), " To:", (seq + 1));
        var lastSix = userData.filter(function(item, index) {
            return (parseInt(item.id) < (seq + 1) && parseInt(item.id) > (seq - 6));
        });
        log(userData);
        //   log("DEBUG: ", seq, lastSix);
        var allScores = new Array();
        Array.each(lastSix, function(sequenceState, index) {
            allScores = allScores.concat(sequenceState.score);
        })
        var scoreAverage = allScores.average();
        log("Sequence " + seq + " score: ", scoreAverage);

        if (scoreAverage >= 85) {
            // LEVEL INCREASE
            log("*********** LEVEL INCREASE ***********:" + scoreAverage);
            //TODO:  PlayLevelAudio()                //Play audio

            /*  if (scoreAverage >= 85) {
            // LEVEL INCREASE
            log("*********** LEVEL INCREASE ***********:" + scoreAverage);
            //TODO:  PlayLevelAudio()                //Play audio

            function PlayLevelAudio(){
            if(eTracker.level=="1"){
            mySound3 = new Sound();
            mySound3.loadSound("sound/concentration/mp3/con_overs1.mp3");
            mySound3.start();
            drace("PLAY AUDIO: Jump Level 1")
            }
            if(eTracker.level=="2"){
            mySound3 = new Sound();
            mySound3.loadSound("sound/concentration/mp3/con_overs2.mp3");
            mySound3.start();
            drace("PLAY AUDIO: Jump Level 2");
            }
            if(eTracker.level=="3"){
            mySound3 = new Sound();
            mySound3.loadSound("sound/concentration/mp3/con_overs3.mp3");
            mySound3.start();
            drace("PLAY AUDIO: Jump Level 3");
            }
            }
            */
            // There are max 0-4 levels allowed in flash
            if (this.concentrationLevel < 4) {
                this.concentrationLevel++;
            }
            //Go up a level

        }

        return this.concentrationLevel;
    },
    getUserSequenceState : function(sequenceID, moduleID) {
        var userSequence = this.getUserSequenceData(sequenceID, moduleID)[0];
        //log("userSequenceState ", this.getUserSequenceData("1", "kaps"));
        var sequenceState = {
            moduleID : moduleID,
            id : sequenceID,
            completed : userSequence.completed,
            score : userSequence.score
        }
        return sequenceState;

    },
    getUserSequenceData : function(sequenceID, moduleID) {

        var moduleSequences = this.userData.get(moduleID);
        log(sequenceID, moduleID, moduleSequences);
        var result = moduleSequences.filter(function(item, index) {
            return item.id == sequenceID;
        });

        return result;

    }.protect()
})