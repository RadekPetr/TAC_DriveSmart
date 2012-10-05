/**
 * @author Radek
 */
var Module = new Class({
    Implements : [Options, Events],
    options : {
        parent : null,
        id : "",
        title : "",
        score : 0,
        sequenceID : "seq_1"
    },
    initialize : function(myParent, myOptions) {     
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.sequences = null;
        this.addEvent("DATA", this.handleDataEvent);
        this.addEvent("SEQUENCE", this.handleSequenceEvent);
        this.setupData();
        this.sequencePlayer = null;
    },
    myParent : function (){
       return this.options.parent;
    },
    // ----------------------------------------------------------
    setupData : function() {
        this.dataLoader = new DataLoader(this, {
            src : 'data/' + this.options.id + '.xml',
            next : 'data.ready'
        });
        this.dataLoader.start();
    },
    handleDataEvent : function(params) {
        switch (params.next) {
            case "data.ready":
                //console.log("Loaded module XML");
                this.sequences = params.data;
                this.myParent().fireEvent("MODULE", {
                    next : "module.ready"
                })
        }
    },
    handleSequenceEvent : function(params) {
        switch (params.next) {
            case "sequence.repeat":
                this.playSequence(this.options.sequenceID);
                break;
            case "sequence.next":
                // TODO marking sequence as complete and making sure next one is incomplete
                var moduleSequences = this.getModuleSequenceIDs()
                var index = moduleSequences.indexOf(this.options.sequenceID);
                if (index == moduleSequences.length) {
                    // is last
                    //TODO: handle module end
                    this.myParent().fireEvent("MODULE", {
                        next : "module.finished"
                    })
                } else {
                    // get the next one
                    this.options.sequenceID = moduleSequences[index + 1];
                }
                this.playSequence(this.options.sequenceID);
                break;
            case "sequence.exit":

                //TODO: handle cleanup of the player - like removing assets, loader etc.
                this.myParent().fireEvent("MODULE", {
                    next : "module.exit"
                })
                break;
            case "module.selected":

                //TODO: handle cleanup of the player - like removing assets, loader etc.
                this.myParent().fireEvent("MODULE", {
                    next : "module.start"
                })
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
        this.options.sequenceID = sequenceID;

        if (this.sequencePlayer == null) {
            this.sequencePlayer = new SequencePlayer(this, {});
        }
        var currentSequence = this.sequences[sequenceID];
        this.sequencePlayer.start(currentSequence);
    },
    getModuleInfo : function() {
        return {
            moduleID : this.options.id,
            moduleTitle : this.options.title,
            sequenceID : this.options.sequenceID
        }
    }
})