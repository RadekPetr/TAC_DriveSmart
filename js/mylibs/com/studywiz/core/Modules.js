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
        this.modules = new Hash();

    },
    start : function() {
        //
        this.addEvent("MODULE", this.handleNavigationEvent);
        this.setupModules();

    },
    // ----------------------------------------------------------
    setupModules : function() {
        this.listOfModulesCounter = 0;

        var modules = new Hash({
            kaps : {
                score : 0,
                title : "Keeping ahead & play safe",
                id : 'kaps',
                sequenceID : 'seq_1'
            },
            scanning : {

                score : 0,
                title : "Scanning",
                id : 'scanning',
                sequenceID : 'seq_1'
            },
            country : {

                score : 0,
                title : "Country driving",
                id : 'country',
                sequenceID : 'seq_1'
            },
            urban : {

                score : 0,
                title : "Urban driving",
                id : 'urban',
                sequenceID : 'seq_1'
            }
        });

        modules.each( function(value, key) {

            this.listOfModulesCounter++;
            //console.log("++++" + this.listOfModulesCounter);
            var module = new Object();
            //console.log(value);

            module[key] = new Module(this, {
                moduleID : key,
                score : value.score,
                title : value.title,
                id : key,
                sequenceID : value.sequenceID
            });
            this.modules.extend(module);
        }.bind(this))

    },
    // This handles all timeline events and emulates the timeline
    handleNavigationEvent : function(params) {

        switch (params.next) {
            case "module.ready":

                this.listOfModulesCounter--;
                //console.log("Modules count: " + this.listOfModulesCounter);
                if (this.listOfModulesCounter === 0) {

                    console.log("Modules READY");
                    this.setupDebug();
                }
                break;
            case "module.exit":
                console.log("Module Exited");
                this.setupDebug();

                break;

            case "module.finished":

                console.log("Module Finished");
                break;

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

            var moduleSelector = new Element('select', {
                events : {
                    change : function() {
                        var selectedModuleID = moduleSelector.options[moduleSelector.selectedIndex].value;
                        var selectedModule = this.modules.get(selectedModuleID);
                        console.log("Selected Module: " + selectedModuleID);
                        this._populateSequenceSelector(sequenceSelector, selectedModule);
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
                        var selectedModule = this.modules.get(selectedModuleID);
                        var sequenceID = sequenceSelector.options[sequenceSelector.selectedIndex].value;
                        console.log("Selected Module: " + selectedModuleID);
                        selectedModule.playSequence(sequenceID);
                    }.bind(this)
                }
            });

            var selectedModuleID = 'country';
            //moduleSelector.options[moduleSelector.selectedIndex].value;
            var selectedModule = this.modules.get(selectedModuleID);
           // console.log(selectedModule);

            moduleSelector.inject(myDiv);
            moduleSelector.value = this.options.moduleID;
            var sequenceSelector = new Element('select', {});

            this._populateSequenceSelector(sequenceSelector, selectedModule);

            sequenceSelector.inject(myDiv);
            sequenceSelector.value = this.options.sequenceID;
            sequenceSelectorButton.inject(myDiv);

        }

    },
    _populateSequenceSelector : function(el, selectedModule) {
        el.empty();
        var sequenceList = selectedModule.getModuleSequenceIDs();
        Array.each(sequenceList, function(item, index) {
            var option = new Element('option', {
                value : item,
                html : item
            })
            option.inject(el);

        })
    }
})

