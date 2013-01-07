/**
 * @author Radek
 */
var ModulePlayer = new Class({
    Implements : [Options, Events],
    options : {
        parent : null,
        id : "",
        title : "",
        score : 0,
        currentSequenceID : "1"
    },
    initialize : function(myParent, myOptions) {
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.sequences = null;
        this.addEvent("DATA", this.handleDataEvent);
        this.addEvent("SEQUENCE", this.handleSequenceEvent);
        this._setupData();
    },
    myParent : function() {
        return this.options.parent;
    },
    // ----------------------------------------------------------
    _setupData : function() {
        this.dataLoader = new DataLoader(this, {
            src : 'media/xml/' + this.options.id + '.xml',
            next : 'data.ready'
        });
        this.dataLoader.start();
    },
    handleDataEvent : function(params) {
        switch (params.next) {
            case "data.ready":
                //log("Loaded module XML");
                this.sequences = params.data;
                this.myParent().fireEvent("MODULE", {
                    next : "module.ready"
                })
        }
    },
    handleSequenceEvent : function(params) {

        switch (params.next) {

            case "sequence.repeat":
                this.playSequence(this.options.currentSequenceID);
                break;
            case "sequence.next":
                var moduleSequences = this.getModuleSequenceIDs();
                var unfinishedSequences = userTracker.getUnfinishedSequences(this.options.id);
                log("******** unfinished:", unfinishedSequences);
                if (unfinishedSequences.length == 0) {
                    // is last
                    //TODO: handle module end
                    this.myParent().fireEvent("MODULE", {
                        next : "module.finished"
                    });
                } else {
                    if (main.sequencePlayer.fromMenu == true) {
                        this.options.currentSequenceID = 0;
                    } else {
                        // get the next one
                        this.options.currentSequenceID = unfinishedSequences[0].id;
                    }
                    log("Next unfinished ID:", this.options.currentSequenceID);
                    this.playSequence(this.options.currentSequenceID);
                }
                break;
            case "sequence.exit":
                this.myParent().fireEvent("MODULE", {
                    next : "module.exit"
                });
                break;
            case "module.selected":
                this.myParent().fireEvent("MODULE", {
                    next : "module.start"
                });
                break;
        }
    },
    getModuleSequenceIDs : function() {
        if (this.sequences != null) {
            var IDs = this.sequences.getKeys();
        } else {
            var IDs = new Array();
        }
        return IDs;
    },
    playSequence : function(sequenceID) {
        this.options.currentSequenceID = sequenceID;
        if (main.sequencePlayer == null) {
            log ("ERROR - Sequence player does not exist")
        } else {
            main.sequencePlayer.reset();
            main.sequencePlayer.options.parent = this;            
        }
        
        var currentSequence = this.sequences[this.options.currentSequenceID];
       

        if (this.options.id == "concentration") {
            var level = userTracker.getConcentrationLevel(parseInt(sequenceID));
            if (main.sequencePlayer.conLevel < level) {
                main.sequencePlayer.playConLevelAudio = true;
            }
            main.sequencePlayer.conLevel = level;
        }
        
        main.sequencePlayer.start(currentSequence);
    },
    getModuleInfo : function() {
        return {
            moduleID : this.options.id,
            moduleTitle : this.options.title,
            currentSequenceID : this.options.currentSequenceID,
            sequences : this.sequences
        }
    }
})