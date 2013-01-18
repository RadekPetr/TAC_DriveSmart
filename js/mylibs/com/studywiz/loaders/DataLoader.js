/**
 * @author Radek
 */

var DataLoader = new Class({

    Implements : [Options, Events],
    options : {
        src : '',
        id : 'data.loader',
        next : 'data.ready',
        parent : null
    },
    // ----------------------------------------------------------
    initialize : function(myParent, myOptions) {
        // Intial scene setup
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.data = null;
        this.sequences = null;
    },
    myParent : function() {
        return this.options.parent;
    },
    // ----------------------------------------------------------
    start : function() {

        var xml2json = new XML2Object();

        xml2json.convertFromURL(this.options.src, function(response) {
            this.data = response;
            this._setupSequences();
        }.bind(this));

    },
    // ----------------------------------------------------------
    getSteps : function(sequenceId) {
        var steps = Array.clone(this.sequences.get(sequenceId))
        return steps;
    },
    getSequenceIDs : function() {
        //TODO: handle version
        if (this.sequences != null) {
            var IDs = this.sequences.getKeys();
        } else {
            var IDs = new Array();
        }
        return IDs;
    },
    // ----------------------------------------------------------
    _setupSequences : function() {
        // TODO:  Version handling
        var sequencesData = this.data.childNodes;
        this.sequences = new Hash({});
        Array.each(sequencesData, function(item, index) {
            // add the option to delete sequences
            if (item.attributes.deleted == true) {
                // ignore as deleted
            } else {
                var seq = new Object();
                seq[item.attributes.Ex] = item.childNodes;
                seq[item.attributes.Ex].trackProgress = item.attributes.trackProgress;

                // used for skipping intros for score calculations: true unless false
                var trackScore = item.attributes.trackScore;
                if (trackScore != false) {
                    trackScore = true;
                }
                seq[item.attributes.Ex].trackScore = trackScore;
                this.sequences.extend(seq);
            }
        }.bind(this));

        log(this.sequences);

        this.myParent().fireEvent("DATA", {
            type : "data.ready",
            id : this.options.id,
            next : this.options.next,
            data : this.sequences,
            data_version : this.data.attributes.version + ""
        })

    }
})
