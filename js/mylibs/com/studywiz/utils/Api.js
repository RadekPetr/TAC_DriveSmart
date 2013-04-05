/**
 * @author Radek
 */
var Api = new Class({
    Implements : [Options, Events],
    options : {
        parent : null,
        retries : 3
    },
    myParent : function() {
        return this.options.parent;
    },
    // ----------------------------------------------------------
    initialize : function(myParent, myOptions) {
        this.setOptions(myOptions);
        this.options.parent = myParent;
    },
    loadUserProgress : function() {
        var retries = 0;
        var jsonRequest = new Request({
            url : Main.user_progress_GET_URL,
            link : 'chain',
            method : 'get',
            secure : false,
            noCache : true,
            format : 'data',
            onSuccess : function(responseText) {
                if (responseText == 'no data' || responseText == '"no data"') {
                    log('info', "Empty User progress data loaded - new user ? Launching with a default data set.");
                    Main.userTracker.testLoadedUserProgress(undefined);
                } else {
                    try {
                        log("User progress data loaded OK");
                        var decompressedData = this.decode(responseText);
                        var myProgress = JSON.decode(decompressedData);
                        Main.userTracker.testLoadedUserProgress(myProgress);
                    } catch (e) {
                        log('ERROR: processing loaded user progress data ', e);
                        this.saveLog("error", "processing loaded user progress data onSuccess: " + e);
                    }
                }
            }.bind(this),
            onComplete : function(event, xhr) {
                log('onComplete loadProgress data reading', event, xhr);
            }.bind(this),
            onFailure : function(xhr) {
                if (retries >= this.options.retries) {
                    log("ERROR: loadUserProgress Failed", xhr);
                    this.saveLog("error", "onFailure loadUserProgress, no retry left " + xhr);
                    // TODO: try again if fails then show Alert to user with error code and try reloading page ?
                    alert("SDE01: Error loading user data. \n\nPlease reload the page to try again or contact support.");

                } else {
                    log("WARN: loadUserProgress Failed, retry:" + retries, xhr);
                    this.saveLog("warn", "loadUserProgress failed, retry:" + retries + "/" + this.options.retries + " " + xhr);
                    retries += 1;
                    this._sendRequest(jsonRequest, new Object(), false);
                }
            }.bind(this),
            onError : function(text, error) {
                log('ERROR: loadUserProgress error: ', text, error);
                this.saveLog("error", "onError loadProgress" + text + " " + error);

            }.bind(this)
        })
        this._sendRequest(jsonRequest, new Object(), false);
    },
    saveUserProgress : function(requestPayload) {
        var retries = 0;
        //TODO: save the User data version too
        var jsonRequest = new Request.JSON({
            url : Main.user_progress_POST_URL,
            link : 'chain',
            method : 'post',
            onSuccess : function(xhr) {
                log("jsonUserRequest Success", xhr);
                //TODO: check the response if not 'OK' handle issues
                if (xhr == "OK") {
                    log("OK")
                } else {
                    log("OK")
                    log(xhr);
                }
            }.bind(this),
            onFailure : function(xhr) {

                if (retries >= this.options.retries) {
                    log("ERROR: saveUserProgress Failed", xhr);
                    this.saveLog("error", "onFailure saveUserProgress, no retry left " + xhr);
                    // TODO: try again if fails then show Alert to user with error code and try reloading page ?
                    alert("SDE02: Error saving user data. \n\nPlease continue to the next activity and we will attempt to save the progress again later on.");
                } else {
                    log("WARN: saveUserProgress Failed, retry:" + retries, xhr);
                    this.saveLog("warn", "saveUserProgress failed, retry:" + retries + "/" + this.options.retries + " " + xhr);
                    retries += 1;
                    this._sendRequest(jsonRequest, requestPayload, false);
                }

            }.bind(this),
            onRequest : function() {
                // log("Save the User data version too  .... posting");
            }.bind(this),
            onLoadstart : function(event, xhr) {
                // log('onLoadstart Progress data saving');
            }.bind(this),
            onComplete : function(event, xhr) {
                // log('onComplete Progress data saving');
            }.bind(this),
            onCancel : function(event, xhr) {
                // log('onCancel Progress data saving');
            }.bind(this),
            onException : function(event, xhr) {
                // TODO: Handle exception
                log('onException Progress data saving');
                this.saveLog("error", xhr);
            }.bind(this),
            onTimeout : function(event, xhr) {
                // TODO: Handle timeout - try again if fails then show Alert to user with error code and try reloading page ?
                log('onTimeout Progress data saving');
                this.saveLog("error", "Timeout saveUserProgress");
            }.bind(this),
            onError : function(text, error) {
                // TODO: log error to server for analyses ?
                log('onError SaveProgress', text, error);
                this.saveLog("error", "onError saveUserProgress" + text + " " + error);
            }.bind(this)
        })

        this._sendRequest(jsonRequest, requestPayload, false);
    },
    saveModuleProgress : function(requestPayload) {
        var retries = 0;
        var externalModuleID = this._moduleIdMapping(Main.sequencePlayer.sequenceState.moduleID);

        var jsonRequest = new Request({
            url : Main.user_module_progress_POST_URL + externalModuleID,
            link : 'chain',
            method : 'post',
            onSuccess : function(xhr) {
                log("_saveModuleProgress request Success", xhr);
                //TODO: check the response if not 'OK' handle issues
            }.bind(this),
            onFailure : function(xhr) {
                if (retries >= this.options.retries) {
                    log("ERROR: saveUserProgress Failed", xhr);
                    this.saveLog("error", "onFailure saveModuleProgress, no retry left " + xhr);
                    alert("SDE03: Error saving module score. \n\nPlease continue to the next activity and we will attempt to save the score again later on.");
                } else {
                    log("WARN: saveModuleProgress Failed, retry:" + retries, xhr);
                    this.saveLog("warn", "saveModuleProgress failed, retry:" + retries + "/" + this.options.retries + " " + xhr);
                    retries += 1;
                    this._sendRequest(jsonRequest, requestPayload, true);
                }

            }.bind(this),
            onRequest : function() {
                //log("_saveModuleProgress  .... posting");
            }.bind(this),
            onLoadstart : function(event, xhr) {
                //log('onLoadstart _saveModuleProgress');
            }.bind(this),
            onComplete : function(event, xhr) {
                //log('onComplete _saveModuleProgress');
            }.bind(this),
            onCancel : function(event, xhr) {
                //log('onCancel _saveModuleProgress');
            }.bind(this),
            onException : function(event, xhr) {
                log('onException _saveModuleProgress');
                // TODO: log error to server for analyses ?
                this.saveLog("error", "onException saveModuleProgress" + xhr);
            }.bind(this),
            onTimeout : function(event, xhr) {
                log('onTimeout _saveModuleProgress');
                // Try again then alert user
                this.saveLog("error", "onTimeout saveModuleProgress" + xhr);

            }.bind(this),
            onError : function(text, error) {
                log('onError _saveModuleProgress', text, error);
                this.saveLog("error", "onError saveModuleProgress" + xhr);
            }.bind(this)
        })
        this._sendRequest(jsonRequest, requestPayload, true);

        // On completion of each exercise you would need to POST to /user_progress/module_progress/<module_code>
        // payload need to contain two parameters - "score" and "completed_exercises". Both integers.
        // There are two possible responses - OK (200) and "Can't find module" (422). Latter case means that module is not defined in admin section.
    },
    //  I've done the change. There is a form on the page (only on dashboard where JS application runs) with id=api_form. You need to grab value from hidden field 'authenticity_token' and post it as authenticity_token parameter along with your parameters with each POST request.
    //$("#api_form input[name=authenticity_token]")
    //Currently token required only for /logs and if everything works fine I will make the change to other controllers.
    _getToken : function() {
        var token = $m('api_form').getElement('input[name=authenticity_token]').value;
        return token;
    },

    _sendRequest : function(request, requestPayload, isSecured) {
        if (isSecured == true) {
            var authenticity_token = this._getToken();
            if (authenticity_token) {
                requestPayload.authenticity_token = authenticity_token;
                request.send(Object.toQueryString(requestPayload));
            } else {
                log("ERROR: NO authenticity_token found !!!")
            }
        } else {
            request.send(requestPayload);
        }
    },
    /*I also have created a very simple API for you to report errors. It just stores them in log file. Do you need them to be accessible by admin? Is it any valuable? If so, I can easily change them to be persisted.
     To use it just POST to /logs with parameter named error, warn, info or debug and parameter value your message,
     i.e error="Blah" and it will be saved in log file with the corresponding level (if it is on).
     */
    _moduleIdMapping : function(key) {
        var map = new Hash({
            'main_menu' : 'mm',
            'concentration' : 'cc',
            'country' : 'co',
            'urban' : 'ur',
            'kaps' : 'ka',
            'scanning' : 'sc'
        })
        return map.get(key);
    },
    saveLog : function(level, content) {
        var requestPayload = new Object();
        requestPayload[level] = content;

        var jsonRequest = new Request.JSON({
            url : Main.log_POST_URL,
            link : 'chain',
            method : 'post',
            onSuccess : function(xhr) {
                log("saveLog Success", xhr);
            }.bind(this),
            onFailure : function(xhr) {
                log("jsonUserRequest Failed", xhr);
            }.bind(this),
            onRequest : function() {
                // log("SaveLog  .... posting");
            }.bind(this),
            onLoadstart : function(event, xhr) {
                // log('onLoadstart saveLog saving');
            }.bind(this),
            onComplete : function(event, xhr) {
                // log('onComplete saveLog data saving');
            }.bind(this),
            onCancel : function(event, xhr) {
                // log('onCancel saveLog data saving');
            }.bind(this),
            onException : function(event, xhr) {
                log('onException saveLog');
            }.bind(this),
            onTimeout : function(event, xhr) {
                log('onTimeout saveLog');
            }.bind(this),
            onError : function(text, error) {
                log('onError saveLog', text, error);
            }.bind(this)
        });

        this._sendRequest(jsonRequest, requestPayload, true);

    },

    encode : function(input) {
        //log("To Compress:", input);
        var compressedString = Lzw.encode(input);
        //log("compressedString:", compressedString);
        var encodedBase64 = Base64.encode(compressedString);
        // log("encodedBase64:", encodedBase64);
        // log(this.decode(encodedBase64));
        return encodedBase64;
    },

    decode : function(input) {
        //log("To Decompress:", input);
        var decodedBase64String = Base64.decode(input);
        var decompressedString = Lzw.decode(decodedBase64String);
        //log("decodedBase64String:", decodedBase64String);
        //log("decompressedString:", decompressedString);
        return decompressedString;
    }
})

