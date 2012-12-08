/**
 * @author Radek
 */

var Modules = new Class({

    Implements : [Options, Events],
    options : {
        moduleID : "main_menu",      
        sequenceID : "1",
        id : "Modules"

    },
    initialize : function(myOptions) {
        this.setOptions(myOptions);
        this.modules = new Hash();
    },
    start : function() {
        this.addEvent("MODULE", this.handleNavigationEvent);
        this.setupModules();
    },
    // ----------------------------------------------------------
    setupModules : function() {
        this.listOfModulesCounter = 0;

        var modules = new Hash({
            main_menu : {
                score : 0,
                title : "Dashboard",
                id : 'main_menu',
                sequenceID : '1'
            },
            concentration : {
                score : 0,
                title : "Concentration - placeholder",
                id : 'concentration',
                sequenceID : '1'
            },
            kaps : {
                score : 0,
                title : "Keep ahead & play safe",
                id : 'kaps',
                sequenceID : '1'
            },
            scanning : {

                score : 0,
                title : "Scanning",
                id : 'scanning',
                sequenceID : '1'
            },
            country : {

                score : 0,
                title : "Country driving",
                id : 'country',
                sequenceID : '1'
            },
            urban : {

                score : 0,
                title : "Urban driving",
                id : 'urban',
                sequenceID : '1'
            }
        });

        modules.each( function(value, key) {

            this.listOfModulesCounter++;
            //log("++++" + this.listOfModulesCounter);
            var module = new Object();
            //log(value);

            module[key] = new ModulePlayer(this, {
                id : key,
                score : value.score,
                title : value.title,
                id : key,
                currentSequenceID : value.sequenceID
            });
            this.modules.extend(module);
        }.bind(this))

    },
    // This handles all timeline events and emulates the timeline
    handleNavigationEvent : function(params) {

        switch (params.next) {
            case "module.ready":
                this.listOfModulesCounter--;
                //log("Modules count: " + this.listOfModulesCounter);
                if (this.listOfModulesCounter === 0) {
                    this._setupUser();
                    log("Modules READY");
                    this._startMainMenu();
                }
                break;
            case "module.exit":
                this._startMainMenu();
                break;
            case "module.finished":
                log("Module Finished");
                // TODO: finish end module - do allow repeating ? Let user choose which in some Module intro screen ?
                 this._startMainMenu();
                break;
            case "module.start":
                var selectedModule = this.modules.get(this.options.moduleID);
                selectedModule.fireEvent("SEQUENCE", {
                    type : "sequence.event",
                    next : 'sequence.next'
                });
                this.setupDebug();
                break;
           
        }
    },
    _setupUser : function() {
        userTracker = new User(this, {});
        userTracker.setDefaultUserData(this.modules);
        userTracker.loadProgress();
        //userTracker.saveProgress();
    },
    _startMainMenu : function() {
        var selectedModule = this.modules.get("main_menu");
        var sequenceID = "1";
        selectedModule.playSequence(sequenceID);
    },
    setupDebug : function() {
        // add dropdown
        var myDiv = $('debugContainer');
        if (myDiv == null) {
            var myDiv = new Element("div", {
                id : "debugContainer"
            });
            myDiv.inject(driveSmartDivID, 'before');

            var moduleSelector = new Element('select', {
                events : {
                    change : function() {
                        var selectedModuleID = moduleSelector.options[moduleSelector.selectedIndex].value;
                        var selectedModule = this.modules.get(selectedModuleID);
                        log("Selected Module: " + selectedModuleID);
                        this._populateSequenceSelector(sequenceSelector, selectedModule);
                    }.bind(this)
                }
            });
            var option = new Element('option', {
                value : 'concentration',
                html : 'Concentration'
            })
            option.inject(moduleSelector);
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

            var option = new Element('option', {
                value : 'main_menu',
                html : 'Main menu'
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
                        log("Selected Module: " + selectedModuleID);
                        selectedModule.playSequence(sequenceID);
                    }.bind(this)
                }
            });

            var skipButton = new Element('button', {
                html : 'Skip',
                id : 'debug.skip',
                styles : {
                },
                events : {
                    click : function() {
                        if (sequencePlayer != null && sequencePlayer.activeVideo != null) {
                            sequencePlayer.activeVideo.skip();
                        }
                    }.bind(this)
                }
            });

            var selectedModuleID = this.options.moduleID;
            //moduleSelector.options[moduleSelector.selectedIndex].value;
            var selectedModule = this.modules.get(selectedModuleID);
            // log(selectedModule);

            moduleSelector.inject(myDiv);

            moduleSelector.value = this.options.moduleID;
            var sequenceSelector = new Element('select', {});

            this._populateSequenceSelector(sequenceSelector, selectedModule);

            sequenceSelector.inject(myDiv);
            sequenceSelector.value = this.options.sequenceID;
            sequenceSelectorButton.inject(myDiv);
            skipButton.inject(myDiv);
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

