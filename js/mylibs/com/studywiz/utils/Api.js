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
    }
})

Api.loadUserProgress = function() {
  //  console.info("info: loadUserProgress called");
   // console.error('error', "loadUserProgress called");
    //console.debug('debug', "loadUserProgress called");

    var jsonRequest = new Request({
        url : Main.userDataStoreURL,
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
                    var decompressedData = Api.decode(responseText);
                    var myProgress = JSON.decode(decompressedData);
                    Main.userTracker.testLoadedUserProgress(myProgress);
                } catch (e) {
                    log('ERROR: processing loaded user progress data ', e);
                    Api.saveLog("error", "processing loaded user progress data onSuccess: " + e);
                }
            }
        }.bind(this),
        onComplete : function(event, xhr) {
            log('onComplete loadProgress data reading', event, xhr);
        },
        onFailure : function(xhr) {
            log("ERROR: loadUserProgress failure: ", xhr);
            Api.saveLog("error", "onFailure loadUserProgress" + xhr);
        },
        onError : function(text, error) {
            log('ERROR: loadUserProgress error: ', text, error);
            Api.saveLog("error", "onError loadProgress" + text + " " + error);

        }
    })

    Api.sendRequest(jsonRequest, new Object(), false);
}

Api.saveUserProgress = function(callback, requestPayload) {
    //TODO: save the User data version too
    var jsonRequest = new Request.JSON({
        url : Main.userDataStoreURL,
        link : 'chain',
        method : 'post',
        onSuccess : function(xhr) {
            log("jsonUserRequest Success", xhr);
            //TODO: check the response if not 'OK' handle issues
            if (xhr== "OK") {
                log ("OK")
            } else {
                log ("OK")
                log (xhr);
            }
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

    Api.sendRequest(jsonRequest, requestPayload, false);
}

Api.saveLog = function(level, content) {
    var requestPayload = new Object();
    requestPayload[level] = content;

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
            log('onException saveLog');
        },
        onTimeout : function(event, xhr) {
            log('onTimeout saveLog');
        },
        onError : function(text, error) {
            log('onError saveLog', text, error);
        }
    });

    Api.sendRequest(jsonRequest, requestPayload, true);

}

Api.saveModuleProgress = function(callback, requestPayload) {

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
            Api.saveLog("error", "onFailure saveModuleProgress" + xhr);

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
            Api.saveLog("error", "onException saveModuleProgress" + xhr);
        },
        onTimeout : function(event, xhr) {
            log('onTimeout _saveModuleProgress');
            // Try again then alert user
            Api.saveLog("error", "onTimeout saveModuleProgress" + xhr);

        },
        onError : function(text, error) {
            log('onError _saveModuleProgress', text, error);
            Api.saveLog("error", "onError saveModuleProgress" + xhr);
        }
    })
    Api.sendRequest(jsonRequest, requestPayload, true);

    // On completion of each exercise you would need to POST to /user_progress/module_progress/<module_code>
    // payload need to contain two parameters - "score" and "completed_exercises". Both integers.
    // There are two possible responses - OK (200) and "Can't find module" (422). Latter case means that module is not defined in admin section.
}
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
    //log("To Compress:", input);
    var compressedString = Lzw.encode(input);
    //log("compressedString:", compressedString);
    var encodedBase64 = Base64.encode(compressedString);
    // log("encodedBase64:", encodedBase64);
    log(Api.decode(encodedBase64));
    return encodedBase64;
}

Api.decode = function(input) {
    //log("To Decompress:", input);
    var decodedBase64String = Base64.decode(input);
    var decompressedString = Lzw.decode(decodedBase64String);
    //log("decodedBase64String:", decodedBase64String);
    //log("decompressedString:", decompressedString);
    return decompressedString;
}
//  I've done the change. There is a form on the page (only on dashboard where JS application runs) with id=api_form. You need to grab value from hidden field 'authenticity_token' and post it as authenticity_token parameter along with your parameters with each POST request.
//$("#api_form input[name=authenticity_token]")
//Currently token required only for /logs and if everything works fine I will make the change to other controllers.
Api.getToken = function() {
    var token = $m('api_form').getElement('input[name=authenticity_token]').value;
    return token;
}

Api.sendRequest = function(request, requestPayload, isSecured) {
    if (isSecured == true) {
        var authenticity_token = Api.getToken();
        if (authenticity_token) {
            requestPayload.authenticity_token = authenticity_token;
            request.send(Object.toQueryString(requestPayload));
        } else {
            log("ERROR: NO authenticity_token found !!!")
        }
    } else {
        request.send(requestPayload);
    }
}
