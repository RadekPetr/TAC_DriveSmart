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

        this.defaultData = new Hash({
            info : new Hash(),
            modules : new Hash()
        });

        this.userData = null;
        this.api = new Api(this);
        this.concentrationLevel = 1;
        // DEBUG: To Empty on start
        if (Main.RESET_USER_DATA == true) {
            this.saveCompleteUserData_Empty();
        }
    },
    loadProgress : function() {
        this.api.loadUserProgress();
    },
    testLoadedUserProgress : function(userProgressData) {
        // TODO: handle version conversions - copy data from old structure to a new one if necessary
        var defaultDataHash = new Hash(this.defaultData);
        if (userProgressData == null || userProgressData == undefined || userProgressData == "no data") {
            this.userData = defaultDataHash;
            this.getModuleUserData("concentration").info.extend({
                level : this.concentrationLevel
            });
            debug("No User Data saved - will create new user data from Default");
            var userSavedVersion = this.userData.info["app_version"];
            debug("The user app_version (using default): ", userSavedVersion);
        } else {
            // TODO : convert all objects to hashes so I can get keys using the getKeys methods

            this.userData = new Hash(userProgressData);
            debug("Loaded user progress from server", this.userData);
            this.concentrationLevel = this.getModuleUserData("concentration").info["level"];
            var userSavedVersion = this.userData.info["app_version"];
            debug("The user saved app_version: ", userSavedVersion);


            var defaultVersion = defaultDataHash.info["app_version"];
            if (defaultVersion != userSavedVersion) {
                debug("Saved user progress is different version from default");
                // in version 100 Urban 10 and Scanning 1 were deleted.
                if (parseInt(userSavedVersion) < 100) {                   
                    alert("Pre-release version: Some exercises were deleted, the user progress data will be reset.");
                    Main.userTracker.saveCompleteUserData_Empty();
                    // use defaults
                    this.userData = defaultDataHash;
                    this.getModuleUserData("concentration").info.extend({
                        level : this.concentrationLevel
                    });
                }
                //this.userData.info.app_version = Main.VERSION;
            }

        }
        debug("Progress data of current user: ", this.userData);
        debug('All done .... starting now');
        this.myParent().fireEvent("MODULE", {
            next : "main.menu.start"
        });
    },
    saveProgress : function() {
        // save complete progress to server
        this._saveCompleteUserData();
        // Save module progress
        this._saveModuleProgressData();
    },
    _saveCompleteUserData : function() {
        // test
        //this.userData.modules.intro = {};//( 'intro' );

        var json_data = JSON.encode(this.userData);
        //var compressedData = lzw_encode(json_data);
        var compressedData = this.api.encode(json_data);
        var requestPayload = {
            data : compressedData
        };

        this.api.saveUserProgress(requestPayload);
        // Generate testing data
        /*
        var x = '{"info":{"app_version":"106"},"modules":{"main_menu":{"info":{"data_version":"5"},"data":[{"id":1,"desc":1,"completed":false,"score":[],"trackProgress":false,"trackScore":false}]},"intro":{"info":{"data_version":"1","disabled":false},"data":[{"id":0,"completed":true,"score":[],"trackProgress":true,"trackScore":false}]},"concentration":{"info":{"data_version":"1","level":1,"disabled":true},"data":[{"id":0,"completed":false,"score":[],"trackProgress":false,"trackScore":false},{"id":1,"desc":1,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":2,"desc":2,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":3,"desc":3,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":4,"desc":4,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":5,"desc":5,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":6,"desc":6,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":7,"desc":7,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":8,"desc":8,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":9,"desc":9,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":10,"desc":10,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":11,"desc":11,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":12,"desc":12,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":13,"desc":13,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":14,"desc":14,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":15,"desc":15,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":16,"desc":16,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":17,"desc":17,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":18,"desc":18,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":19,"desc":19,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":20,"desc":20,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":21,"desc":21,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":22,"desc":22,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":23,"desc":23,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":24,"desc":24,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":25,"desc":25,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":26,"desc":26,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":27,"desc":27,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":28,"desc":28,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":29,"desc":29,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":30,"desc":30,"completed":false,"score":[],"trackProgress":true,"trackScore":true}]},"kaps":{"info":{"data_version":"1","disabled":false},"data":[{"id":-1,"completed":true,"score":[],"trackProgress":false,"trackScore":false},{"id":0,"completed":true,"score":[],"trackProgress":false,"trackScore":false},{"id":1,"desc":1,"completed":true,"score":[],"trackProgress":true,"trackScore":true},{"id":2,"desc":2,"completed":true,"score":[],"trackProgress":true,"trackScore":true},{"id":3,"desc":3,"completed":true,"score":[],"trackProgress":true,"trackScore":true},{"id":4,"desc":4,"completed":true,"score":[],"trackProgress":true,"trackScore":true},{"id":5,"desc":5,"completed":true,"score":[],"trackProgress":true,"trackScore":true},{"id":6,"desc":6,"completed":false,"score":[],"trackProgress":true,"trackScore":true}]},"scanning":{"info":{"data_version":"1.1","disabled":false},"data":[{"id":-1,"completed":false,"score":[],"trackProgress":false,"trackScore":false},{"id":0,"completed":false,"score":[],"trackProgress":false,"trackScore":false},{"id":2,"desc":1,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":3,"desc":2,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":4,"desc":3,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":5,"desc":4,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":6,"desc":5,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":7,"desc":6,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":8,"desc":7,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":9,"desc":8,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":10,"desc":9,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":11,"desc":10,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":12,"desc":11,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":13,"desc":12,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":14,"desc":13,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":15,"desc":14,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":16,"desc":15,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":17,"desc":16,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":18,"desc":17,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":19,"desc":18,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":20,"desc":19,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":21,"desc":20,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":22,"desc":21,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":23,"desc":22,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":24,"desc":23,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":25,"desc":24,"completed":false,"score":[],"trackProgress":true,"trackScore":true}]},"country":{"info":{"data_version":"1","disabled":false},"data":[{"id":0,"completed":true,"score":[1],"trackProgress":false,"trackScore":false},{"id":1,"desc":1,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":2,"desc":2,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":3,"desc":3,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":4,"desc":4,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":5,"desc":5,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":6,"desc":6,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":7,"desc":7,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":8,"desc":8,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":9,"desc":9,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":10,"desc":10,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":11,"desc":11,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":12,"desc":12,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":13,"desc":13,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":14,"desc":14,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":15,"desc":15,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":16,"desc":16,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":17,"desc":17,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":18,"desc":18,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":19,"desc":19,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":20,"desc":20,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":21,"desc":21,"completed":true,"score":[1],"trackProgress":true,"trackScore":true},{"id":22,"desc":22,"completed":true,"score":[1],"trackProgress":true,"trackScore":true}]},"urban":{"info":{"data_version":"1.1","disabled":false},"data":[{"id":0,"completed":false,"score":[],"trackProgress":false,"trackScore":false},{"id":1,"desc":1,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":2,"desc":2,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":3,"desc":3,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":4,"desc":4,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":5,"desc":5,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":6,"desc":6,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":7,"desc":7,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":8,"desc":8,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":9,"desc":9,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":11,"desc":10,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":12,"desc":11,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":13,"desc":12,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":14,"desc":13,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":15,"desc":14,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":16,"desc":15,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":17,"desc":16,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":18,"desc":17,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":19,"desc":18,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":20,"desc":19,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":21,"desc":20,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":22,"desc":21,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":23,"desc":22,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":24,"desc":23,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":25,"desc":24,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":26,"desc":25,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":27,"desc":26,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":28,"desc":27,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":29,"desc":28,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":30,"desc":29,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":31,"desc":30,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":32,"desc":31,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":33,"desc":32,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":34,"desc":33,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":35,"desc":34,"completed":false,"score":[],"trackProgress":true,"trackScore":true},{"id":36,"desc":35,"completed":false,"score":[],"trackProgress":true,"trackScore":true}]}}}'

        var compressedData = this.api.encode(x);
        debug("DATA", compressedData);
        */

    },
    saveCompleteUserData_Empty : function() {

        var requestPayload = {
            data : "no data"
        };

        this.api.saveUserProgress(requestPayload);
    },
    _saveModuleProgressData : function() {
        var moduleID = Main.sequencePlayer.sequenceState.moduleID;
        var moduleScore = this.getModuleScore(moduleID);
        var moduleState = this.getModuleState(moduleID);

        var requestPayload = new Object();
        requestPayload = {
            score : (moduleScore * 100).toInt(),
            completed_exercises : moduleState.finishedCount
        };

        this.api.saveModuleProgress(requestPayload, moduleID);
    },
    // Flash not enabled, save concentration module
    saveConcentrationModuleFullProgressData: function () {
        var moduleID = "concentration";
        // If flash not found make score 1
        var moduleScore = 1;
        var moduleState = this.getModuleState(moduleID);

        var requestPayload = new Object();
        requestPayload = {
            score: (moduleScore * 100).toInt(),
            completed_exercises: moduleState.finishedCount
        };
        this.api.saveModuleProgress(requestPayload, moduleID);
    },
    setDefaultUserData : function(modules) {
        // storing the version of the data structure at the time of creation as data_version for each module and
        // also the app_version for the whole data structure
        // {
        //    modules :
        //     {<module id>:
        //       {
        //          data:[],
        //          info:
        //               {
        //                 data_version:x,
        //                 disabled:x
        //               }
        //        }
        //     },
        //    info: {app_version:x}
        // }
        //
        modules.each( function(moduleObject, key, hash) {
            var moduleInfo = moduleObject.getModuleInfo();
            var sequenceIds = Object.keys(moduleObject.sequences);
           
            var sequences = new Array();

            Array.each(sequenceIds, function(sequenceID, index) {
                var sequenceData = moduleObject.sequences.get(sequenceID);
                var sequenceState = new Object({
                    id : parseInt(sequenceID),
                    desc : sequenceData.desc,
                    completed : false,
                    score : [],
                    trackProgress : sequenceData.trackProgress,
                    trackScore : sequenceData.trackScore
                });
                sequences.push(sequenceState);
            });
            var moduleData = new Hash();

           // sequences.sortOn("id", Array.NUMERIC);
            
            sequences.sort(
                function (b, a) {
                    return b.id - a.id;
                }
            );
            
            moduleData.set(key, new Hash({
                info : new Hash({
                    data_version : moduleObject.options.module_structure_version,
                    disabled: false
                }),
                data : sequences
            }));
            this.defaultData.modules.extend(moduleData);
        }.bind(this));

        this.defaultData.info.extend({
            app_version : Main.VERSION
        });

        debug("** Finished generating default user data", this.defaultData);
    },
    updateSequenceProgress : function(sequenceState) {
        /// get the sequence Object and update it
        var moduleID = sequenceState.moduleID;
        var currentSequenceData = Object.subset(sequenceState, ['id', 'completed', 'score']);

        var userSequence = this.getUserSequenceData(sequenceState.id, moduleID);

        if (userSequence.length > 1 || userSequence.length == 0) {
            debug("ERROR");
        }

        Object.append(userSequence[0], currentSequenceData);

        // and store the progress on server
        this.saveProgress();
    },
    getUnfinishedSequences : function(moduleID) {
        var sequencesInModule = this.getModuleUserData(moduleID).data;
        if (moduleID == "intro" && Main.sequencePlayer.fromMenu == true) {
            var unfinishedSequences = sequencesInModule.filter(function(item, index) {
                return (item.completed == false || item.completed == true);
            });
        } else {
            var unfinishedSequences = sequencesInModule.filter(function(item, index) {
                return item.completed == false;
            });
        }

        if (unfinishedSequences.length == 0) {
            debug("Module is Finished");
        }
        return unfinishedSequences;
    },
    getModuleStarted : function(moduleID) {
        var sequencesInModule = this.getModuleUserData(moduleID).data;
        var started = true;
        var unfinishedSequences = sequencesInModule.filter(function(item, index) {
            return item.completed == false;
        });
        if (unfinishedSequences.length == sequencesInModule.length) {
            started = false;
        }
        return started;
    },
    getModuleState: function (moduleID) {

        // var moduleIDs = new Hash(this.userData.modules).getKeys();
        //debug(moduleID, "Module IDs", moduleIDs);
        var userData = this.getModuleUserData(moduleID);
        var sequencesInModule = userData.data;

        var unfinishedSequences = new Array();
        var introSequences = new Array();

        if (sequencesInModule == undefined) {
            var sequencesInModule = new Array();
        } else {
            unfinishedSequences = sequencesInModule.filter(function (item, index) {
                return item.completed == false && item.trackProgress == true;
            });
            introSequences = sequencesInModule.filter(function (item, index) {
                return item.trackProgress == false;
            });
        }

        var progressObj = {};
        progressObj.completed = false;

        if (userData.info.disabled == true) {
            // For disabled modules pretend they are finished
            // Minus the ModuleIntro
            progressObj.total = sequencesInModule.length - introSequences.length;
            progressObj.finishedCount = progressObj.total;
            progressObj.progress = 100;
            progressObj.completed = true;
        } else {
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
        }     
        return progressObj;
    },
    getTotalScore : function() {
        // Currently the score is calculated from the list of modules in the actual user data
        // exclude "version"
        var moduleIDs = new Hash(this.userData.modules).getKeys();

        var totalScore = [];
        Array.each(moduleIDs, function(moduleID, index) {
            // do not add empty array
            var moduleScore = this.getModuleScore(moduleID);
            if (moduleScore != []) {
                totalScore.push(moduleScore);
            }
        }.bind(this));
        return totalScore.average();
    },
    getTotalProgress : function() {
        var moduleIDs = new Hash(this.userData.modules).getKeys();
        //log ("Module IDs",moduleIDs );
        var totalFinishedCount = 0;
        var totalCount = 0;
        Array.each(moduleIDs, function(moduleID, index) {
            var progressObj = this.getModuleState(moduleID);
            totalCount += progressObj.total;
            totalFinishedCount += progressObj.finishedCount;
        }.bind(this));
        debug("Overall progress: ", totalFinishedCount / totalCount);
        return (totalFinishedCount / totalCount);
    },
    getModuleScore: function (moduleID) {
        // 100 score for disabled concentration
        var userData = this.getModuleUserData(moduleID);
        if (userData.info.disabled == true) {
            // 100% score for disabled modules (aka concentration)
            var totalScore = 1;
        } else {
            // debug(moduleID, userData);
            var allScores = new Array();
            Array.each(userData.data, function (sequenceState, index) {
                // don't count Module Intros
                if (sequenceState.trackScore != "false") {
                    allScores = allScores.concat(sequenceState.score);
                }
            });
            var totalScore = allScores.average();
        }
        debug("Module " + moduleID + " score: ", totalScore);
        return totalScore;
    },
    getConcentrationLevel : function(seq) {

        var userData = this.getModuleUserData("concentration").data;
        debug("From:", (seq - 6), " To:", (seq + 1));
        var lastSix = userData.filter(function(item, index) {
            return (parseInt(item.id) < (seq + 1) && parseInt(item.id) > (seq - 6));
        });

        //   debug("DEBUG: ", seq, lastSix);
        var allScores = new Array();
        Array.each(lastSix, function(sequenceState, index) {
            allScores = allScores.concat(sequenceState.score);
        });
        var scoreAverage = allScores.average();

        if (scoreAverage >= 85) {
            // LEVEL INCREASE
            debug("*********** LEVEL INCREASE ***********:" + scoreAverage);

            /*  if (scoreAverage >= 85) {
            // LEVEL INCREASE
            debug("*********** LEVEL INCREASE ***********:" + scoreAverage);
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
                debug("Increasing the concentration level to: ", this.concentrationLevel);
                // Store the current level
                this.getModuleUserData("concentration").info.extend({
                    level : this.concentrationLevel
                });
            }
            //Go up a level
        }
        return this.concentrationLevel;
    },
    getUserSequenceState : function(sequenceID, moduleID) {
        var userSequence = this.getUserSequenceData(sequenceID, moduleID)[0];
        var sequenceState = {
            moduleID : moduleID,
            id : sequenceID,
            desc : userSequence.desc,
            completed : userSequence.completed,
            score : userSequence.score
        };
        return sequenceState;

    },
    getUserSequenceData : function(sequenceID, moduleID) {
        var moduleSequences = this.getModuleUserData(moduleID).data;
        var result = moduleSequences.filter(function(item, index) {
            return item.id == sequenceID;
        });

        return result;

    }.protect(),
    myParent : function() {
        return this.options.parent;
    },
    getModuleUserData : function(moduleID) {
        try {
            return this.userData.modules[moduleID];
        } catch (err) {
            debug("NULL");
            return null;
        }

    },

    // unused
    _mergeOldData : function(oldData, newData) {
        var newModuleIDs = newData.modules.getKeys();
        newModuleIDs.each(function(item, index) {
            // TODO crawl and copy values or items
        });

    }
});
