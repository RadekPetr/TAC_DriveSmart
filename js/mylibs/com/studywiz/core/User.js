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
        // save progress to server
        // ajax request ?
        log("Saving: ", this.userData);
        var data = JSON.encode(this.userData);
        // alert("Data :" +  data);
        var output = lzw_encode(data)
        var myCookie = Cookie.write('userProgress', output, {
            duration : 7
        });
        //TODO: save the User data version too
        var jsonUserRequest = new Request.JSON({
            url : Main.userDataStoreURL,
            link : 'chain',
            onSuccess : function(xhr) {
                log("jsonUserRequest Success", xhr);
            },
            onFailure : function(xhr) {
                log("jsonUserRequest Failed", xhr);
            }
        }).post({
            data : output
        });

        //  alert("Data :" +  output);
        // var output2 = lzw_decode(output)
        //TODO: make an AJAX request and handle errors
        // TODO: exclude main menu
        //  alert("Data :" +  output2);
        var moduleID = Main.sequencePlayer.sequenceState.moduleID;
        var moduleScore = this.getModuleScore(moduleID);
        var moduleProgress = this.getModuleProgress(moduleID);

        var progressData = new Object()
        progressData[moduleID] = {
            score : moduleScore,
            completed_exercises : moduleProgress.finishedCount,
            total_exercises : moduleProgress.total
        };
        log("SaveProgress: ", progressData);

        var jsonRequest = new Request.JSON({
            url : Main.userDataProgressURL,
            link : 'chain',
            onSuccess : function(xhr) {
                log("JSON request Success", xhr);
            },
            onFailure : function(xhr) {
                log("JSON request Failed", xhr);
            }
        }).post(progressData);

        // TODO: on each execise completion if you can send me module:{score: _, completed_exercises: _, total_exercises: _}
    },
    setDefaultUserData : function(modules) {
        modules.each( function(moduleObject, key, hash) {
            var moduleInfo = moduleObject.getModuleInfo();
            var sequenceIds = moduleObject.sequences.getKeys();
            var sequences = new Array();

            Array.each(sequenceIds, function(sequenceID, index) {
                var sequenceData = moduleObject.sequences.get(sequenceID);

                log("sequenceID", sequenceID);
                var seqObject = new Object({
                    id : parseInt(sequenceID),
                    completed : false,
                    score : [],
                    trackProgress : sequenceData.trackProgress,
                    trackScore : sequenceData.trackScore
                })

                //    log("seqObject", seqObject);

                sequences.push(seqObject);

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
        // log(currentSequenceData);
        var sequencesInModule = this.userData.get(moduleID);
        var userSequence = sequencesInModule.filter(function(item, index) {
            return item.id == sequenceState.id;
        });
        // log(userSequence);
        if (userSequence.length > 1) {
            log("ERROR");
        }
        Object.append(userSequence[0], currentSequenceData);

        log("userSequence[0]: ", userSequence[0], currentSequenceData);
        log("*** User data :", this.userData);
        log("Total score: ", this.getTotalScore());

        // and store the progress
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
            if (sequenceState.id != 0) {
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
    }
})