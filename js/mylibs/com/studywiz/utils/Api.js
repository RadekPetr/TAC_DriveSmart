/**
 * @author Radek
 */
var Api = new Class({
    Implements : [Options, Events],
    options : {
        parent : null
    },
    myParent : function() {
        return this.options.parent;
    },
    // ----------------------------------------------------------
    initialize : function(myParent, myOptions) {
        this.setOptions(myOptions);
        this.options.parent = myParent;
    }
})

Api.loadUserProgress = function() {
    log("loadUserProgress called");
    var jsonUserRequest = new Request({
        url : Main.userDataStoreURL,
        link : 'chain',
        method : 'get',
        secure : false,
        noCache : true,
        format : 'data',
        onSuccess : function(responseText) {
            log("responseText 1", responseText);
            if (responseText == 'no data') {
                log("responseText 2", responseText);
                Main.userTracker.testLoadedUserProgress(undefined);
            } else {
                // TODO: handle empty data with new user
                try {
                    log("loadProgress Success 0", responseText);

                    // var decompressedData = lzw_decode(responseText);
                    var decompressedData = Api.decode(responseText);

                    log("decompressedData", decompressedData);
                    var myProgress = JSON.decode(decompressedData);

                    log('callback', Main.userTracker);
                    Main.userTracker.testLoadedUserProgress(myProgress);
                } catch (e) {
                    log('Error ', e);
                    // TODO: log error to server for analyses ?
                    Api.saveLog("error", "onError loadProgress onSuccess" + e);
                }
            }
        }.bind(this),
        onComplete : function(event, xhr) {
            log('onComplete loadProgress data reading', event, xhr);
        },
        onFailure : function(xhr) {
            log("jsonUserRequest loadProgress Failed", xhr);
            // TODO: log error to server for analyses ?
            Api.saveLog("error", "onFailure loadUserProgress" + xhr);
        },
        onError : function(text, error) {
            log('onError loadProgress', text, error);
            // TODO: log error to server for analyses ?
            Api.saveLog("error", "onError loadProgress" + text + " " + error);

        }
    }).send()
}, Api.saveUserProgress = function(callback, requestPayload) {
    //TODO: save the User data version too
    var jsonRequest = new Request.JSON({
        url : Main.userDataStoreURL,
        link : 'chain',
        method : 'post',
        onSuccess : function(xhr) {
            log("jsonUserRequest Success", xhr);
            //TODO: check the response if not 'OK' handle issues
        },
        onFailure : function(xhr) {
            log("jsonUserRequest Failed", xhr);
            // TODO: handle the failed
            // TODO: try again if fails then show Alert to user with error code and try reloading page ?
            Api.saveLog("error", "onFailure saveUserProgress" + xhr);
        },
        onRequest : function() {
            // log("Save the User data version too  .... posting");
        },
        onLoadstart : function(event, xhr) {
            // log('onLoadstart Progress data saving');
        },
        onComplete : function(event, xhr) {
            // log('onComplete Progress data saving');
        },
        onCancel : function(event, xhr) {
            // log('onCancel Progress data saving');
        },
        onException : function(event, xhr) {
            // TODO: Handle exception
            log('onException Progress data saving');
            Api.saveLog("error", xhr);
        },
        onTimeout : function(event, xhr) {
            // TODO: Handle timeout - try again if fails then show Alert to user with error code and try reloading page ?
            log('onTimeout Progress data saving');
            Api.saveLog("error", "Timeout saveUserProgress");
        },
        onError : function(text, error) {
            // TODO: log error to server for analyses ?
            log('onError SaveProgress', text, error);
            Api.saveLog("error", "onError saveUserProgress" + text + " " + error);
        }
    })

    jsonRequest.send(requestPayload);
}, Api.saveLog = function(level, content) {
    var requestPayload = level + "=" + content;

    var jsonRequest = new Request.JSON({
        url : Main.logStoreURL,
        link : 'chain',
        method : 'post',
        onSuccess : function(xhr) {
            log("saveLog Success", xhr);

        },
        onFailure : function(xhr) {
            log("jsonUserRequest Failed", xhr);

        },
        onRequest : function() {
            // log("SaveLog  .... posting");
        },
        onLoadstart : function(event, xhr) {
            // log('onLoadstart saveLog saving');
        },
        onComplete : function(event, xhr) {
            // log('onComplete saveLog data saving');
        },
        onCancel : function(event, xhr) {
            // log('onCancel saveLog data saving');
        },
        onException : function(event, xhr) {

        },
        onTimeout : function(event, xhr) {

            log('onTimeout saveLog data saving');
        },
        onError : function(text, error) {

            log('onError saveLog', text, error);
        }
    })

    jsonRequest.send(requestPayload);
}, Api.saveModuleProgress = function(callback, requestPayload) {

    var externalModuleID = Api.moduleIdMapping(Main.sequencePlayer.sequenceState.moduleID);

    var jsonRequest = new Request({
        url : Main.userDataProgressURL + externalModuleID,
        link : 'chain',
        method : 'post',
        onSuccess : function(xhr) {
            log("_saveModuleProgress request Success", xhr);
            //TODO: check the response if not 'OK' handle issues
        },
        onFailure : function(xhr) {
            log("_saveModuleProgress request Failed", xhr);
            // TODO: handle the failed
        },
        onRequest : function() {
            //log("_saveModuleProgress  .... posting");
        },
        onLoadstart : function(event, xhr) {
            //log('onLoadstart _saveModuleProgress');
        },
        onComplete : function(event, xhr) {
            //log('onComplete _saveModuleProgress');
        },
        onCancel : function(event, xhr) {
            //log('onCancel _saveModuleProgress');
        },
        onException : function(event, xhr) {
            log('onException _saveModuleProgress');
            // TODO: log error to server for analyses ?
        },
        onTimeout : function(event, xhr) {
            log('onTimeout _saveModuleProgress');
            // Try again then alert user
        },
        onError : function(text, error) {
            log('onError _saveModuleProgress', text, error);
            // TODO: log error to server for analyses ?
        }
    })

    jsonRequest.send("score=" + requestPayload.score + "&completed_exercises=" + requestPayload.completed_exercises);

    // On completion of each exercise you would need to POST to /user_progress/module_progress/<module_code>
    // payload need to contain two parameters - "score" and "completed_exercises". Both integers.
    // There are two possible responses - OK (200) and "Can't find module" (422). Latter case means that module is not defined in admin section.
},
/*I also have created a very simple API for you to report errors. It just stores them in log file. Do you need them to be accessible by admin? Is it any valuable? If so, I can easily change them to be persisted.
 To use it just POST to /logs with parameter named error, warn, info or debug and parameter value your message,
 i.e error="Blah" and it will be saved in log file with the corresponding level (if it is on).
 */
Api.moduleIdMapping = function(key) {
    var map = new Hash({
        'main_menu' : 'mm',
        'concentration' : 'cc',
        'country' : 'co',
        'urban' : 'ur',
        'kaps' : 'ka',
        'scanning' : 'sc'
    })
    return map.get(key);
}

Api.encode = function(input) {
    log("To Compress:", input);
    var compressedString = Lzw.encode(input);
    log("compressedString:", compressedString);
    var encodedBase64 = Base64.encode(compressedString);
    log("encodedBase64:", encodedBase64);

    log(Api.decode(encodedBase64));
    return encodedBase64;
}
Api.decode = function(input) {
    /*log("To Decompress:", input);
    var decodedBase64String = Base64.decode(input);
    var decompressedString = Lzw.decode(decodedBase64String);
    log("decodedBase64String:", decodedBase64String);
    log("decompressedString:", decompressedString);
    return decompressedString;
    */
    return null
}

