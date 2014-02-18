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

        Main.MODULES.each( function(value, key) {
            this.listOfModulesCounter++;
            var module = new Object();

            module[key] = new ModulePlayer(this, {
                id : key,
                score : value.score,
                title : value.title,
                currentSequenceID : value.sequenceID
            });
            this.modules.extend(module);
        }.bind(this));
    },
    // This handles all timeline events and emulates the timeline
    handleNavigationEvent : function(params) {

        switch (params.next) {
            case "module.data.ready":
                this.listOfModulesCounter--;
                if (this.listOfModulesCounter === 0) {
                    log("Modules READY, setting up user now ... ");
                    this._setupUser();
                }
                break;
            case "main.menu.start":
            case "module.exit":
                this._startMainMenu();
                break;
            case "module.finished":
                log("Module Finished");
                // TODO: finish end module - do allow repeating ? Let user choose which in some Module intro screen ?
                this._startMainMenu();
                break;
            case "module.start":
                Main.sequencePlayer.fromMenu = true;
                var selectedModule = this.modules.get(this.options.moduleID);
                selectedModule.fireEvent("SEQUENCE", {
                    type : "sequence.event",
                    next : 'sequence.next'
                });
                if (Main.DEBUG == true) {
                    this._setupDebug();
                }
                break;
        }
    },
    _setupUser : function() {
        Main.userTracker = new User(this, {});
        Main.userTracker.setDefaultUserData(this.modules);
        Main.userTracker.loadProgress();
        // DEBUG: local only
        //if (Main.isLocal == true) {
        //   Api.loadUserProgress(Main.userTracker.testLoadedUserProgress());
        // }
    },
    _startMainMenu : function() {
        var selectedModule = this.modules.get("main_menu");
        var sequenceID = "1";
        selectedModule.playSequence(sequenceID);
    },
    _setupDebug : function() {
        // add dropdown
        var myDiv = $m('debugContainer');
        if (myDiv == null) {
            var myDiv = new Element("div", {
                id : "debugContainer"
            });
            myDiv.inject(Main.DIV_ID, 'before');

            var moduleSelector = new Element('select', {
                events : {
                    change : function() {
                        var selectedModuleID = moduleSelector.options[moduleSelector.selectedIndex].value;
                        var selectedModule = this.modules.get(selectedModuleID);
                        this._populateSequenceSelector(sequenceSelector, selectedModule);
                    }.bind(this)
                }
            });
            var option = new Element('option', {
                value : 'intro',
                html : 'Introduction'
            });
            option.inject(moduleSelector);
            var option = new Element('option', {
                value : 'concentration',
                html : 'Concentration'
            });
            option.inject(moduleSelector);
            var option = new Element('option', {
                value : 'country',
                html : 'Country driving'
            });
            option.inject(moduleSelector);
            var option = new Element('option', {
                value : 'urban',
                html : 'Urban driving'
            });
            option.inject(moduleSelector);
            var option = new Element('option', {
                value : 'scanning',
                html : 'Scanning'
            });
            option.inject(moduleSelector);
            var option = new Element('option', {
                value : 'kaps',
                html : 'Keeping ahead & play safe'
            });
            option.inject(moduleSelector);

            var option = new Element('option', {
                value : 'main_menu',
                html : 'Main menu'
            });
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
                        var stepType = Main.sequencePlayer.currentStep.attributes.fmt;
                        if (Main.sequencePlayer != null && Main.sequencePlayer.activeVideo != null) {
                            Main.sequencePlayer.activeVideo.skip();
                        }
                        if (stepType == "ConIntro") {
                            Main.sequencePlayer.fireEvent("TIMELINE", {
                                type : "swiff.done",
                                id : "intro",
                                next : "ConIntro.done.clicked"
                            });
                        }
                    }.bind(this)
                }
            });

            var resetUserDataButton = new Element('button', {
                html : 'Empty User Data',
                id : 'debug.empty.user',
                styles : {
                },
                events : {
                    click : function() {
                        Main.userTracker.saveCompleteUserData_Empty();

                    }.bind(this)
                }
            });

            var selectedModuleID = this.options.moduleID;
            var selectedModule = this.modules.get(selectedModuleID);
            moduleSelector.inject(myDiv);
            moduleSelector.value = this.options.moduleID;
            var sequenceSelector = new Element('select', {});
            this._populateSequenceSelector(sequenceSelector, selectedModule);
            sequenceSelector.inject(myDiv);
            sequenceSelector.value = this.options.sequenceID;
            sequenceSelectorButton.inject(myDiv);
            skipButton.inject(myDiv);
            resetUserDataButton.inject(myDiv);
        }
    },
    _populateSequenceSelector : function(el, selectedModule) {
        el.empty();
        var sequenceList = selectedModule.getModuleSequenceIDs();
        Array.each(sequenceList, function(item, index) {
            var option = new Element('option', {
                value : item,
                html : item
            });
            option.inject(el);
        });
    }
});

