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
            // log ( this.data);
            // var myJSON = JSON.encode(this.data);
            // log (myJSON);
            this._setupSequences();
        }.bind(this));

    },
    // ----------------------------------------------------------
    _setupSequences : function() {
        // TODO:  Version handling
        var sequencesData = this.data.childNodes;
        this.sequences = new Hash({});
        var desc = 1;
        Array.each(sequencesData, function(item, index) {
            // add the option to delete sequences
            if (item.attributes.deleted == true) {
                // ignore as deleted
            } else {
                var seq = new Object();
                seq[item.attributes.Ex] = item.childNodes;
                seq[item.attributes.Ex].trackProgress = item.attributes.trackProgress;

                // this is the externally visible ex id - in case sequence is deleted the unique id is sam, but visible id gets updated, so we don't have to re-number whole xml file
                if (item.attributes.Ex > 0) {
                    seq[item.attributes.Ex].desc = desc;
                    desc++;
                };
                // used for skipping intros for score calculations: true unless false
                var trackScore = item.attributes.trackScore;
                if (trackScore != false) {
                    trackScore = true;
                }
                seq[item.attributes.Ex].trackScore = trackScore;
                this.sequences.extend(seq);
            }
        }.bind(this));

        debug("_setupSequences:", this.sequences);

        this.myParent().fireEvent("DATA", {
            type : "data.ready",
            id : this.options.id,
            next : this.options.next,
            data : this.sequences,
            loaded_module_structure_version : this.data.attributes.version + ""
        });

    }
});
