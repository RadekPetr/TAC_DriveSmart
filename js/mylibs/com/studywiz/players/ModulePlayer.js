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
		this.setupData();
		this.sequencePlayer = null;
	},
	myParent : function() {
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
				//log("Loaded module XML");
				this.sequences = params.data;
				this.myParent().fireEvent("MODULE", {
					next : "module.ready"
				})
		}
	},
	handleSequenceEvent : function(params) {

		switch (params.next) {
			case "sequence.completed":
				// save the state of the current Sequence
				this.myParent().fireEvent("MODULE", {
					next : "update.user",
					data : sequencePlayer.getSequenceState()
				});
				break;
			case "sequence.repeat":
				this.playSequence(this.options.currentSequenceID);
				break;
			case "sequence.next":
				// TODO marking sequence as complete and making sure next one is incomplete
				var moduleSequences = this.getModuleSequenceIDs();
				var unfinishedSequences = userTracker.getUnfinishedSequences(this.options.id);
				log("unfinished:", unfinishedSequences);
				if (unfinishedSequences.length == 0) {
					// is last
					//TODO: handle module end
					this.myParent().fireEvent("MODULE", {
						next : "module.finished"
					});
				} else {
					// get the next one
					this.options.currentSequenceID = unfinishedSequences[0].id;
				}

				log("Next unfinished ID:", this.options.currentSequenceID);
				this.playSequence(this.options.currentSequenceID);
				break;
			case "sequence.exit":

				//TODO: handle cleanup of the player - like removing assets, loader etc.
				this.myParent().fireEvent("MODULE", {
					next : "module.exit"
				});
				break;

			case "module.selected":

				// For debugging only - whne the debug switches the module wityhout going to the main menu
				//TODO: handle cleanup of the player - like removing assets, loader etc.

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

		/* if (this.sequencePlayer == null) {
		 this.sequencePlayer = new SequencePlayer(this, {});
		 }
		 var currentSequence = this.sequences[this.options.currentSequenceID];
		 this.sequencePlayer.start(currentSequence);

		 */
		if (sequencePlayer == null) {
			sequencePlayer = new SequencePlayer(this, {});
		} else {
			sequencePlayer.reset();
			sequencePlayer.options.parent = this;
		}
		var currentSequence = this.sequences[this.options.currentSequenceID];

		sequencePlayer.start(currentSequence);

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