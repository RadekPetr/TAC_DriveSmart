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
    },
    loadProgress : function() {
        // try loading userdata from server
        // if fails, clone defaults
        this.userData = Object.clone(this.defaultData);

    },
    saveProgress : function() {
        // save progress to server
        // ajax request ?
        //console.log (this.userData);
        var data = JSON.encode(this.userData);
        var output = lzw_encode(data)
        //  alert("Data :" +  output);
        // var output2 = lzw_decode(output)
        //TODO: make an AJAX request and handle errors
        //  alert("Data :" +  output2);
    },
    setDefaultUserData : function(data) {
        data.each( function(moduleObject, key, hash) {
            var moduleInfo = moduleObject.getModuleInfo();

            var sequenceIds = moduleObject.sequences.getKeys();

            var sequences = new Array();
            Array.each(sequenceIds, function(value, index) {
                var seqObject = new Object({
                    id : value,
                    completed : false,
                    score : 0
                })
                sequences.push(seqObject);
            })
            var moduleData = new Object();
            sequences.sortOn("id", Array.NUMERIC);
            moduleData[key] = sequences;
            this.defaultData.extend(moduleData);

        }.bind(this))

        log(this.defaultData);
    },
    updateSequenceProgress : function(sequenceState) {
        /// get the sequence Object and update it
        var moduleID = sequenceState.moduleID;
        var currentSequenceData = Object.subset(sequenceState, ['id', 'completed', 'score']);
        log(currentSequenceData);
        var sequencesInModule = this.userData[moduleID];
        var userSequence = sequencesInModule.filter(function(item, index) {
            return item.id == sequenceState.id;
        });
        log(userSequence);
        if (userSequence.length > 1) {
            log("ERROR");
        }
        Object.append(userSequence[0], currentSequenceData);
        log("*** User data :")
        log(this.userData);
    },
    getUnfinishedSequences : function(moduleID) {

        var sequencesInModule = this.userData[moduleID];
        var unfinishedSequences = sequencesInModule.filter(function(item, index) {
            return item.completed == false;
        });
        if (unfinishedSequences.length == 0) {
            log("Module is Finished");
        }

        return unfinishedSequences;
    }
})