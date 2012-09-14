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
    initialize : function(myParent, myOptions) {
        // Intial scene setup
        this.setOptions(myOptions);
        this.options.parent = myParent;
        this.data = null;
    },
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
            this._setupSequences();
        }.bind(this));

        //  myRequest.send();
    },
    handleXMLLoaded : function(responseXML) {
        console.log("Loaded XML");
        this._setupSequences();
        // console.log(responseXML.selectNodes('Seq'));
        // console.log(responseXML.evaluate('Seq', responseXML, null, XPathResult.ANY_TYPE, null));
        //   console.log(responseXML.getElements('Seq'));
        //   var mySeq = responseXML.getElements('Seq')[0];
        //  var myStep = mySeq.getElements ('Step')[0];
        // console.log(myStep.get('fmt'));

    },
    getSteps : function(sequenceId) {
        var steps = Array.clone(this.sequences[sequenceId])
        return steps;
    },
    _setupSequences : function() {
        var sequencesData = this.data.childNodes;
        this.sequences = new Hash({});
        Array.each(sequencesData, function(item, index) {
            var seq = new Object();
            seq["seq_" + item.attributes.Ex] = item.childNodes;
            //  console.log(seq);
            this.sequences.extend(seq);
        }.bind(this))

        console.log(this.sequences);

        this.options.parent.fireEvent("TIMELINE", {
            type : "data.ready",
            id : this.options.id,
            next : this.options.next
        })

    }
})
