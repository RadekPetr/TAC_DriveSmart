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
   
    // TODO: finish loading from server
    // TODO: wait for user data, then continue.
    var jsonUserRequest = new Request({
        url : Main.userDataStoreURL,
        link : 'chain',
        method : 'get',
        secure : false,
        format : 'data',
        onSuccess : function(responseText) {
            try {
                log("loadProgress Success 0", responseText);
                var decompressedData = lzw_decode(responseText);
                log(decompressedData);
                var myProgress = JSON.decode(decompressedData);
                
                log('callback', Main.userTracker);
                Main.userTracker.testLoadedUserProgress(myProgress);
            } catch (e) {
                log('Error ', e);
                // TODO: log error to server for analyses ?
            }
        }.bind(this),
        onComplete : function(event, xhr) {
            //log('onComplete loadProgress data reading', event, xhr);
        },
        onFailure : function(xhr) {
            log("jsonUserRequest loadProgress Failed", xhr);
            // TODO: log error to server for analyses ?

        },
        onError : function(text, error) {
            log('onError loadProgress', text, error);
            // TODO: log error to server for analyses ?
        }
    }).send()
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
        },
        onFailure : function(xhr) {
            log("jsonUserRequest Failed", xhr);
            // TODO: handle the failed
            // TODO: try again if fails then show Alert to user with error code and try reloading page ?
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
            // TODO: log error to server for analyses ?
            log('onException Progress data saving');
        },
        onTimeout : function(event, xhr) {
            // TODO: Handle timeout - try again if fails then show Alert to user with error code and try reloading page ?
            log('onTimeout Progress data saving');
        },
        onError : function(text, error) {
            // TODO: log error to server for analyses ?
            log('onError SaveProgress', text, error);
        }
    })

    jsonRequest.send(requestPayload);
}
