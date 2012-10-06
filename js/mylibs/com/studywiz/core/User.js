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

        this.defaultData = new Array();
        this.userData = null;
    },
    loadProgress : function() {
        // try loading userdata from server
        // if fails, clone defaults
        this.userData = Array.clone(this.defaultData);

    },
    saveProgress : function() {
        // save progress to server
        // ajax request ?
        //console.log (this.userData);
        var data = JSON.encode(this.userData);
        var output = lzw_encode(data);
        
        console.log (data);
        alert("Data :" +  output);
        // var output2 = lzw_decode(output)
        //TODO: make an AJAX request and handle errors
        //  alert("Data :" +  output2);
    },
    setDefaultUserData : function(data) {

        data.each( function(moduleObject, key, hash) {
            var moduleInfo = moduleObject.getModuleInfo();
            var sequenceIds = moduleInfo.sequences.getKeys();

            Array.each(sequenceIds, function(value, index) {
                var seqObject = new Object({
                    moduleID : moduleInfo.moduleID,
                    id : value,
                    completed : false,
                    score : 0
                })

                this.defaultData.push(seqObject);

            }.bind(this))
        }.bind(this))

        console.log(this.defaultData);
    },
    updateSequenceProgress : function(sequenceState) {
        /// get the sequence Object and update it
    }
})