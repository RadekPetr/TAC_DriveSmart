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
        /*
         var myRequest = new Request({
         url : 'data/Country.xml',
         method : 'get',
         onProgress : function(event, xhr) {
         var loaded = event.loaded, total = event.total;

         console.log(parseInt(loaded / total * 100, 10));
         },
         onSuccess : function(responseText, responseXML) {

         this.handleXMLLoaded(responseXML);
         }.bind(this)
         })
         */
        var xml2json = new XML2Object();

        xml2json.convertFromURL(this.options.src, function(response) {
            this.data = response;

            this.setupSequences();
        }.bind(this));

        //  myRequest.send();
    },
    // ----------------------------------------------------------
    getSteps : function(sequenceId) {
        var steps = Array.clone(this.sequences.get(sequenceId))
        return steps;
    },
    getSequenceIDs : function() {
        if (this.sequences != null) {
            var IDs = this.sequences.getKeys();
        } else {
            var IDs = new Array();
        }
        return IDs;
    },
    // ----------------------------------------------------------
    setupSequences : function() {
       
        var sequencesData = this.data.childNodes;
        this.sequences = new Hash({});
        Array.each(sequencesData, function(item, index) {
            var seq = new Object();
            seq["seq_" + item.attributes.Ex] = item.childNodes;
            //  console.log(seq);
            this.sequences.extend(seq);
        }.bind(this))

        this.myParent().fireEvent("DATA", {
            type : "data.ready",
            id : this.options.id,
            next : this.options.next,
            data : this.sequences
        })

    }
})
