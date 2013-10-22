/*
Class:    	dwProgress bar
Author:   	David Walsh
Website:    http://davidwalsh.name
Version:  	1.0
Date:     	07/03/2008
Built For:  MooTools 1.2.0

SAMPLE USAGE AT BOTTOM OF THIS FILE

*/

//class is in
var dwProgressBar = new Class({

    //implements
    Implements : [Options],

    //options
    options : {
        container : '$m(drivesmart)',
        boxID : '',
        boxClass : 'box',
        percentageID : '',
        percentageClass : 'perc',
        displayID : '',
        displayClass : '',
        startPercentage : 0,
        displayText : false,
        speed : 10,
        styles : {
            'width' : '200px'
            //,            'height' : '20px'
        }
    },

    //initialization
    initialize : function(options) {
        //set options
        this.setOptions(options);
        this.box = null;
        this.perc = null;
        this.text = null;
        //create elements
        this.createElements();
    },

    //creates the box and percentage elements
    createElements : function() {
        this.container = new Element('div', {
            id : 'progressBarHolder'
        });

        this.container.setStyles(this.options.style);

        this.box = new Element('div', {
            id : this.options.boxID,
            'class' : this.options.boxClass,
            styles : this.options.styles
        });
        this.perc = new Element('div', {
            id : this.options.percentageID,
            'style' : 'width:0px;',
            'class' : this.options.percentageClass
        });
        this.perc.inject(this.box);
        this.box.inject(this.container);
        if (this.options.displayText) {
            this.text = new Element('div', {
                id : this.options.displayID,
                'class' : this.options.displayClass
            });
            this.text.inject(this.container);
        }

        this.container.inject(this.options.container);
        this.set(this.options.startPercentage);
    },

    //calculates width in pixels from percentage
    calculate : function(percentage) {
        return (this.box.getStyle('width').replace('px', '') * (percentage / 100)).toInt();
    },

    //animates the change in percentage
    animate : function(to) {
        //log("this.perc ", this.perc);
        var myEffect = new Fx.Morph(this.perc, {
            duration : this.options.speed,
            transition : Fx.Transitions.Sine.easeOut
        });

        myEffect.start({
            'width' : [0, this.calculate(to.toInt())] // Morphs the 'width' style from 900px to 300px.
        });

        if (this.options.displayText) {
            this.text.set('text', "Progress: "+ to.toInt() + '%');
        }
    },

    //sets the percentage from its current state to desired percentage
    set : function(to) {
        this.animate(to);
    },
    hide : function() {
        this.container.hide();
    },
    remove : function() {
        this.container.dispose();
    },
    show : function() {
        this.container.show();
    }
});

/* sample usage */
/*
 //once the DOM is ready
 window.addEvent('domready', function() {

 //create the progress bar for example 1
 pb = new dwProgressBar({
 container: $m('put-bar-here'),
 startPercentage: 25,
 speed:1000,
 boxID: 'box',
 percentageID: 'perc'
 });

 //movers
 $$('.mover').each(function(el) {
 el.addEvent('click',function() {
 pb.set(el.get('rel'));
 });
 });

 */
