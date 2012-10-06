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
        //TODO: make an AJAX request
      //  alert("Data :" +  output2);
    },
    setDefaultUserData : function(data) {
        data.each( function(moduleObject, key, hash) {

            var moduleSequences = moduleObject.sequences;
            var sequenceIds = moduleSequences.getKeys();
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
            moduleData[key] = sequences;
            this.defaultData.extend(moduleData);
        }.bind(this))

        console.log(this.defaultData);
    }
})