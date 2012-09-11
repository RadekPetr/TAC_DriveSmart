/**
 * @author Radek
 */

var DataLoader = new Class({

    Implements : [Options, Events],
    options : {
        style : {
            position : 'absolute',
            top : '0px',
            left : '0px'
        },
        src : '',
        id : 'element.id',
        next : 'next.action',
        parent : null
    },
    initialize : function(myParent, myOptions) {
        // Intial scene setup
        this.setOptions(myOptions);
        this.options.parent = myParent;

    },
    start : function() {
        var myRequest = new Request({
            url : 'data/Country.xml',
            method : 'get',
            onProgress : function(event, xhr) {
                var loaded = event.loaded, total = event.total;

                console.log(parseInt(loaded / total * 100, 10));
            },
            onSuccess : function(responseText, responseXML) {

                this.handleXMLLoaded(responseXML);
            }.bind(this)
        })
        var xml2json = new XML2Object();
        xml2json.convertFromURL('data/Country.xml', function(response) {
            var lessons = response.childNodes
            var lesson = lessons[0];
            var lessonId = lesson.attributes.Ex;
            var steps = lesson.childNodes;
            var step = steps[0];
            var stepType = step.attributes.fmt;
            var stepData = step.childNodes;

            console.log(lessons);
            console.log(lesson);
            console.log('LessonID ' + lessonId);
            console.log(steps);
            console.log(step);
            console.log('Step Type ' + stepType);
            console.log(stepData);

            

            // Object.each(response.childNodes[0] , function(value, key) {
            //    console.log('Key ' + key + ' day of the week is ' + value);
            // });

        });

        myRequest.send();
    },
    handleXMLLoaded : function(responseXML) {
        console.log("Loaded XML");
        // console.log(responseXML.selectNodes('Seq'));
        // console.log(responseXML.evaluate('Seq', responseXML, null, XPathResult.ANY_TYPE, null));
        //   console.log(responseXML.getElements('Seq'));
        //   var mySeq = responseXML.getElements('Seq')[0];
        //  var myStep = mySeq.getElements ('Step')[0];
        // console.log(myStep.get('fmt'));

    }
})
