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
        //this.saveCompleteUserData_Empty();
    },
    loadProgress : function() {

        Api.loadUserProgress();
    },
    testLoadedUserProgress : function(userProgressData) {

        // TODO: handle "no data" for just created user and error whne no data is loaded

        log("_testLoadedUserProgress", userProgressData);
        if (userProgressData == null || userProgressData == undefined || userProgressData == {}) {
            this.userData = new Hash(this.defaultData);
            log("No User Data saved - Default user progress");
        } else {
            this.userData = new Hash(userProgressData);
            log("Loaded user progress");
            //TODO: Load the user data version too and if different from defaults handle that - merging ?
        }
        log('starting now');
        this.myParent().fireEvent("MODULE", {
            next : "main.menu.start"
        });
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

        Api.saveUserProgress(this, requestPayload);
    },
    saveCompleteUserData_Empty : function() {
        
        var requestPayload = {
            data : "no data"
        };

        Api.saveUserProgress(this, requestPayload);
    },
    _saveModuleProgress : function() {
        var moduleID = Main.sequencePlayer.sequenceState.moduleID;
        var moduleScore = this.getModuleScore(moduleID);
        var moduleProgress = this.getModuleProgress(moduleID);

        var requestPayload = new Object();
        requestPayload = {
            score : (moduleScore * 100).toInt(),
            completed_exercises : moduleProgress.finishedCount
        };

        Api.saveModuleProgress(this, requestPayload);
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
        // TODO: Handle repeats ??? Overwrite the scores ?

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
                totalScore.push(moduleScore);
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

    }.protect(),
    myParent : function() {
        return this.options.parent;
    }
})