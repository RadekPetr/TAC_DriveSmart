/**
 * @author Radek
 */
var Modules = new Class({

    Implements : [Options, Events],
    options : {
        unitTagId : 'drivesmart',
        moduleID : "country",
        moduleTitle : "Country driving",
        sequenceID : "seq_1"

    },
    initialize : function(myOptions) {
        this.activeModuleID = 'country';

        this.setOptions(myOptions);
        this.modules = new Hash({
            kaps : {
                data : {},
                score : 0,
                title : "Keeping ahead & play safe",
                id : 'kaps',
                sequenceID : 'seq_1'
            },
            scanning : {
                data : {},
                score : 0,
                title : "Scanning",
                id : 'scanning',
                sequenceID : 'seq_1'
            },
            country : {
                data : {},
                score : 0,
                title : "Country driving",
                id : 'country',
                sequenceID : 'seq_1'
            },
            urban : {
                data : {},
                score : 0,
                title : "Urban driving",
                id : 'urban',
                sequenceID : 'seq_1'
            },
        });

    },
    start : function() {
        //
        this.addEvent("MODULE", this.handleNavigationEvent);
        this.setupModules();

    },
    // ----------------------------------------------------------
    setupModules : function() {
        this.listOfModulesCounter = 0;
        this.modules.each( function(value, key) {
            
            this.listOfModulesCounter++;
            console.log("++++" + this.listOfModulesCounter);
            var module = new Module(this, {
                moduleID : key
            });
        
            value.data = module;

        }.bind(this))
    },
    playModule : function(selectedModule) {

        this.sequencePlayer = new SequencePlayer(this, {
            moduleID : selectedModule.id,
            moduleTitle : selectedModule.title,
            moduleSequences : selectedModule.data.sequences,
            sequenceID : selectedModule.sequenceID
        });
        this.sequencePlayer.start();

    },
    // This handles all timeline events and emulates the timeline
    handleNavigationEvent : function(params) {

        switch (params.next) {
            case "module.ready":

                this.listOfModulesCounter--;
                console.log("Modules count: " + this.listOfModulesCounter);
                if (this.listOfModulesCounter === 0) {

                    console.log("Modules  READY");
                    this.setupDebug();
                }

        }
    },
    setupDebug : function() {
        // add dropdown
        var myDiv = $('debugContainer');
        if (myDiv == null) {
            var myDiv = new Element("div", {
                id : "debugContainer"
            });
            myDiv.inject(this.options.unitTagId, 'before');
            var sequenceSelector = new Element('select', {});
            var moduleSelector = new Element('select', {
                events : {
                    change : function() {
                        var selectedModuleID = moduleSelector.options[moduleSelector.selectedIndex].value;
                        var selectedModule = this.modules[selectedModuleID]
                        console.log("Selected: " + selectedModuleID);
                    }.bind(this)
                }
            });

            var option = new Element('option', {
                value : 'country',
                html : 'Country driving'
            })
            option.inject(moduleSelector);
            var option = new Element('option', {
                value : 'urban',
                html : 'Urban driving'
            })
            option.inject(moduleSelector);
            var option = new Element('option', {
                value : 'scanning',
                html : 'Scanning'
            })
            option.inject(moduleSelector);
            var option = new Element('option', {
                value : 'kaps',
                html : 'Keeping ahead & play safe'
            })
            option.inject(moduleSelector);

            var sequenceSelectorButton = new Element('button', {
                html : 'Start',
                id : 'debug',
                styles : {
                },
                events : {
                    click : function() {
                        var selectedModuleID = moduleSelector.options[moduleSelector.selectedIndex].value;
                        var selectedModule = this.modules[selectedModuleID];
                        selectedModule.sequenceID = sequenceSelector.options[sequenceSelector.selectedIndex].value;
                        console.log("Selected: " + selectedModuleID);
                        this.playModule(selectedModule);
                    }.bind(this)
                }
            });

            var selectedModuleID = 'country';
            //moduleSelector.options[moduleSelector.selectedIndex].value;
            var selectedModule = this.modules[selectedModuleID];
            console.log(selectedModule);

            var sequenceList = this.getModuleSequenceIDs(selectedModule);
            Array.each(sequenceList, function(item, index) {
                var option = new Element('option', {
                    value : item,
                    html : item
                })
                option.inject(sequenceSelector);

            })
            moduleSelector.inject(myDiv);
            moduleSelector.value = this.options.moduleID;
            sequenceSelector.inject(myDiv);
            sequenceSelector.value = this.options.sequenceID;
            sequenceSelectorButton.inject(myDiv);

        }

    },
    getModuleSequenceIDs : function(module) {
        if (module.data.sequences != null) {
            var IDs = module.data.sequences.getKeys();
        } else {
            var IDs = new Array();
        }
        return IDs;
    },
})

