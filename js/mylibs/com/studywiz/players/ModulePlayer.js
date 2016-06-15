/**
 * @author Radek
 */
var ModulePlayer = new Class({
    Implements: [Options, Events],
    options: {
        parent: null,
        id: "",
        title: "",
        score: 0,
        currentSequenceID: "1",
        module_structure_version: "1.0"
    },
    initialize: function (myParent, myOptions) {
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.sequences = null;
        this.addEvent("DATA", this.handleDataEvent);
        this.addEvent("SEQUENCE", this.handleSequenceEvent);

        this._setupData();
    },
    myParent: function () {
        return this.options.parent;
    },
    // ----------------------------------------------------------
    _setupData: function () {
        this.dataLoader = new DataLoader(this, {
            src: 'media/xml/' + this.options.id + '.xml',
            next: 'data.ready'
        });
        this.dataLoader.start();
    },
    handleDataEvent: function (params) {
        switch (params.next) {
            case "data.ready":
                //debug("Loaded module XML");
                this.sequences = params.data;
                this.options.module_structure_version = params.loaded_module_structure_version;
                this.myParent().fireEvent("MODULE", {
                    next: "module.data.ready"
                });
        }
    },
    handleSequenceEvent: function (params) {

        switch (params.next) {

            case "sequence.repeat":
                this.playSequence(this.options.currentSequenceID);
                break;

            case "sequence.previous":
                var sequenceID = this.getPreviousSequenceID();
                if (sequenceID != null) {
                    this.options.currentSequenceID = sequenceID;
                    this.playSequence(sequenceID);
                }
                break;
            case "sequence.next":
                var moduleSequences = this.getModuleSequenceIDs();
                var unfinishedSequences = Main.userTracker.getUnfinishedSequences(this.options.id);
                if (unfinishedSequences.length == 0) {
                    // is last
                    this.myParent().fireEvent("MODULE", {
                        next: "module.finished"
                    });
                } else {
                    if (Main.sequencePlayer.fromMenu == true) {
                        this.options.currentSequenceID = 0;
                        if (Main.MODULE_GROUP.indexOf(this.options.id) != -1) {
                            // belongs to the group
                            this.options.currentSequenceID = -1;
                            var moduleGroupStarted = false;
                            Array.each(Main.MODULE_GROUP, function (moduleID, index) {
                                if (Main.userTracker.getModuleStarted(moduleID) == true) {
                                    this.options.currentSequenceID = 0;
                                    moduleGroupStarted = true;
                                }
                            }.bind(this));

                            if (moduleGroupStarted == true) {
                                if (unfinishedSequences[0].id == -1) {
                                    unfinishedSequences[0].completed = true;

                                }
                            };
                            unfinishedSequences = Main.userTracker.getUnfinishedSequences(this.options.id);
                        }

                    } else {
                        // get the next one

                        this.options.currentSequenceID = unfinishedSequences[0].id;
                    }
                    this.playSequence(this.options.currentSequenceID);
                }
                break;

            // TODO:
            // if module is not finished
            // if from menu - go to next unfinished lesson
            // show (Blue) Repeat and Go to Previous for completed lessons
            // Show (Green) Continue - goes to next unfinished and Go to Previous for incompleted lessons or if next lesson is incomplete

            // If module is complete
            // if from menu go to start


            case "sequence.exit":
                this.myParent().fireEvent("MODULE", {
                    next: "module.exit"
                });
                break;
            case "module.selected":
                this.myParent().fireEvent("MODULE", {
                    next: "module.start"
                });
                break;
        }
    },
    getModuleSequenceIDs: function () {
        if (this.sequences != null) {
            var IDs = this.sequences.getKeys();
        } else {
            var IDs = new Array();
        }
        return IDs;
    },
    playSequence: function (sequenceID) {
        this._prepareSequencePlayer();
        this._updateConcentrationLevel(sequenceID);
        this.options.currentSequenceID = sequenceID;
        Main.sequencePlayer.start(this.sequences[sequenceID]);
    },
    getModuleInfo: function () {
        return {
            moduleID: this.options.id,
            moduleTitle: this.options.title,
            currentSequenceID: this.options.currentSequenceID,
            sequences: this.sequences
        };
    },
    getPreviousSequenceID: function () {
        var sequenceIDs = this.getModuleSequenceIDs();
        // filter out intros
        var IDsWithoutIntros = sequenceIDs.filter(function (item, index) {
            return item != 0 && item != -1;
        });
        var indexOfCurrentSequence = IDsWithoutIntros.indexOf(this.options.currentSequenceID);
        if (indexOfCurrentSequence > 0) {
            var previousSequenceID = IDsWithoutIntros[indexOfCurrentSequence - 1]
            debug(IDsWithoutIntros, this.options.currentSequenceID, "previousSequenceID", previousSequenceID);
           return previousSequenceID;
           // this.options.currentSequenceID = previousSequenceID;

           /// this.playSequence(this.options.currentSequenceID);
            //var current =this.options.currentSequenceID;
        } else {
            return null;
            // theere is no previous sequence, should not get here
        }


    },
     getNextSequenceID: function () {
        var sequenceIDs = this.getModuleSequenceIDs();
        // filter out intros
        var IDsWithoutIntros = sequenceIDs.filter(function (item, index) {
            return item != 0 && item != -1;
        });
        var indexOfCurrentSequence = IDsWithoutIntros.indexOf(this.options.currentSequenceID);
        if (indexOfCurrentSequence < IDsWithoutIntros.length) {
            var nextSequenceID = IDsWithoutIntros[indexOfCurrentSequence + 1]
            debug(IDsWithoutIntros, this.options.currentSequenceID, "previousSequenceID", nextSequenceID);
           return nextSequenceID;
           // this.options.currentSequenceID = previousSequenceID;

           /// this.playSequence(this.options.currentSequenceID);
            //var current =this.options.currentSequenceID;
        } else {
            return null;
            // theere is no previous sequence, should not get here
        }
    },
    _updateConcentrationLevel: function (sequenceID) {
        if (this.options.id == "concentration") {
            var level = Main.userTracker.getConcentrationLevel(parseInt(sequenceID));
            if (Main.sequencePlayer.conLevel < level) {
                Main.sequencePlayer.playConLevelAudio = true;
            }
            Main.sequencePlayer.conLevel = level;
        }
    },
    _prepareSequencePlayer: function () {
        if (Main.sequencePlayer == null) {
            debug("ERROR - Sequence player does not exist");
        } else {
            Main.sequencePlayer.reset();
            Main.sequencePlayer.options.parent = this;
        }
    }
});
