
import flash.external.*;
/*
TAC Concentration Module sub app
Version:1.11
Author: John Ryan 
Phone:0412 330 490 
Email:john_ryan@jrdesign.com.au
Date: 13 March 2003

Version History:
1.0:
.1: Keyboard & mouse listeners.
Interval object - move car & countdown display
.2: Interval object - inzone scoring 
.3: Score object  + environment graphics
.4: Juggle object - the numbers game
.5: Scoring
.6: performance bars
.7: client ac's 
also got level-based environment graphics working
and carspeed / number display speed
scoring & passing result back to host
.8: first beta
.9: Changed the display of the headway performace bar to reflect the distance from zone centre
Changed the display of the number performace bar to reflect question count /  correct answers
.10: Changed the number scoring so corrrect display shown.
hacked final seconds display.
.11moved numbers in front of foreground
Fixed under 0% and over 100% scoring problems
Reworked art to show full speedo
Feedback clip showing corrected
Increased thickness of desired performance line

ASH Swapped "f" with "b" for mouse button directions
Multiplied final conScore by 100 to return a whole number.
Search for "ASH" to located modifications
.14 Reworked move function to allow both cars to have actual speed properties and
distance themselves accordingly plus inc/dec velocity. 
Modified mouse handlers to allow user to sustain a speed without juggling mouse buttons. 
Added rnd speed drift for red car. This will be increased per level not game speed.
Reworked Numbers to 50/50 correct/incorrect. Removed zero numbers, checked for generation
of same number twice or numbers producing zero when calculated.
.15 Kept number speed static - too hard at faster levels.
Changed numbers bar divides to 5 instead 3
Reworked scoring....
.16Nick changed tolerance calc level to start at 14 not 8
Changed calc level to include 70 as a score
Changed feedback tolerance to 20 and 40 for headway versus number task
.17  Ash modifed audio feedback to include a fuzzy zone where the user can be 20+/- correct
     around the target score.
.18  Extensive remodification of audio feedback function
================================================================================================*/
//hide the rightmouse menu



_level0.drace = function (input){
	trace (input);
	ExternalInterface.call("debug",input);
}

//trace ("Audio");
//PlayAudio("media/sound/concentration/con_cfeed_g.mp3");//Hey whats too much on headway task
stage.showMenu = FALSE;// hide the rightmouse menuitems...only leaves "settings"
this.debugPanel_mc._visible = true;

var rightClick:ContextMenu = new ContextMenu();//create a new right click menu called rightClick
rightClick.hideBuiltInItems();//hide the built in options of the right click menu
_root.menu = rightClick;//make the neccesary changes to the right click menu
stage.showDefaultContextMenu = false;
stop();

//===============================================================================================

//*load environment variables: ( passed from host movie) *********** 
//*setup local vars
// inzone area y values -- based on size and position of the ZONE mc
_level0.topzone = _level0.zone_mc._y;
_level0.botzone = _level0.topzone + _level0.zone_mc._height;
_level0.rightPerformance = Number((_level0.numberScore_mc._width * 2)) + Number(_level0.numberScore_mc._x);
_level0.zoneCentre = Number(_level0.topzone - (_level0.botzone / 2));
_level0.stageHeight = Stage.height;
_level0.zoneOffSet = (_level0.stageHeight / 2) - _level0.zoneCentre;


// .14 Additions Ash/Wei
_global.mysound = new Sound();
_global.myCarSpeed = 55;//Initial Speeds
_global.theCarSpeed = 55;
_global.g_carY = car._y;//Used to calc delta using floating point not flash's integer mc._y
_level0.drace("Setting Lock");
_global.LockOutUser = true;//Prevent user moving the car for 3 seconds
gKeyLock = false;//Used to prevent user pressing S D after XX period
gArrKeyLock = new Array(5000, 4300, 3300, 2500);
gtimKeyLock = null;
dprint("Debug mode ON");

_global.KillCount = 0;
_global.KillID;

var methodName:String = "rightClick";
var instance:Object = null;
var method:Function = rightClickCalled;
var wasSuccessful:Boolean = ExternalInterface.addCallback(methodName, instance, method);

var methodName:String = "rightClickUp";
var instance:Object = null;
var method:Function = rightClickUpCalled;
var wasSuccessful:Boolean = ExternalInterface.addCallback(methodName, instance, method);

//===============================================================================================
// MOUSE AND KEYBOARD LISTENERS
//===============================================================================================
/* setup mouse trap for left mouse - triggers "move" */
mouseListener = new Object();
mouseListener.onMouseDown = function() {

	_global.direction = "f";// left mouse pushed, ASH -> change b to f
	scoreObject.displayScore();

};

//Ash/Wei This is to kill reset the direction when mouse is released
mouseListener.onMouseUp = function() {

	_global.direction = "x";

};

Mouse.addListener(mouseListener);// activate the listener
//===============================================================================================
/*setup key listeners
right mouse (yes its a key!! : 2) - triggers "move"
"S" - triggers "juggleObject.checkScore" -- the matching function
"D" - triggers "juggleObject.checkScore"  */
_global.keyboardListener = new Object();// to trap the key event as it happens
keyboardListener.onKeyDown = function() {
	// 37: left, 39:right
	if (juggleObject.tossed == false) {// lock out keys if tossed = true
		var keyPressed = String.fromCharCode(Key.getCode());
		if (keyPressed == "S") {// 83 ascii for "S"
			if (gKeyLock == true) {
				_level0.drace("KEYLOCKED " + gKeyLock);
				return;
			}
			juggleObject.attempted = true;
			juggleObject.checkScore("s");//check for score
		}
		if (keyPressed == "D") {// 68 ascii for "D"
			if (gKeyLock == true) {
				_level0.drace("KEYLOCKED " + gKeyLock);
				return;
			}
			juggleObject.attempted = true;
			juggleObject.checkScore("d");//check for score
		}
		juggleObject.tossed = true;// this sets up the key lockout so you can only score once
	}
};
Key.addListener(keyboardListener);// activate the listener
// </> mouse & key listeners ====================================================================

//===============================================================================================
// TIMER AND INTERVAL OBJECTS -- 
//===============================================================================================
//setup timer object (param: globalTime) -- from the host movie
myTimer = new Object();//: make a timer object with minutes and seconds
// hack for debugging: remove at runtime
//myTimer = {globalTime:getTimer() / 1000, minutes:"00", seconds:"30", inzone:"00"};
myTimer ={globalTime:getTimer()/1000,minutes:"01",seconds:"30",inzone:"00"}; // correct line
//setup interval object 
intervalObject = new Object();
//===============================================================================================
// vars
intervalObject.moveArray = ["b", "f"];// to randomise movement at startup
//----------------------------------------------------------------------------------------------
// interval object functions:
//timer display
intervalObject.countDownDisplay = function() {//countdown seconds 
	if (myTimer.seconds == 1) {// we're 
		myTimer.seconds = 60;// reset the seconds
		if (myTimer.minutes == 0) {// we're at the end
			myTimer.seconds = 00;
			seconds = myTimer.seconds;
			delete mouseListener;
			Key.removeListener(keyboardListener);
			delete juggleObject;// kill the juggler
			delete intervalObject;// stop all the time based processes
			// show the score dialog if required // the continue button sends the result back to the host app			
			ExternalInterface.call("debug", "Finished");
			scoreObject.showTotals();
		} else {
			--myTimer.minutes;
		}// count minute down
	} else {
		--myTimer.seconds;
		// need to keep focus on the flash movie to capture the key presses R.
		ExternalInterface.call("focusOnMe()");
	}
};

//----------------------------------------------------------------------------------------------
//right click trapping
function rightClickCalled() {
	
	ExternalInterface.call("debug", "RighClicked");
	
	_global.direction = "b";
		if (car._xscale > 20) {
			scoreObject.displayScore();
		}
	
	
};
function rightClickUpCalled() {
	
	ExternalInterface.call("debug", "RighClickedUp");
	
	//if (_global.direction != "f") {//Ash/Wei Reset direction when released
		_global.direction = "x";
	//}
	
	
};
//----------------------------------------------------------------------------------------------
//drift red car speed
var drift = 0;

intervalObject.DriftCar = function() {
	r = Math.random();
	factor = 0.01 + ((scoreObject.conLevel) / 100);//Add the level multipier
	if (r > 0.5) {
		drift = factor;//Might increase this for a level change instead of speed.
	} else {
		drift = 0 - factor;
	}

};

//----------------------------------------------------------------------------------------------
// move & scale car // Reworked by Ash/Wei
intervalObject.move = function(arg) {// moves and scales the car

	if (LockOutUser == true) {
		return;//bug out if the user is locked out
	}

	var speed = Number(scoreObject.levelMonitor.speedArray[scoreObject.conLevel]);
	var speedoRotation = Number(_level0.cockpit_mc.speedo_mc._rotation);
	var barScale = _level0.headwayScore_mc._xscale;
	var carScale = car._xscale;

	speed = .25;//null this for now

	if ((Number(_level0.format) < 3) || (Number(_level0.format) > 4)) {

		theCarSpeed = theCarSpeed + drift;//Drift the red car



		if (_global.direction == "f") {
			if (myCarSpeed > 20) {
				myCarSpeed -= 0.25;
			}
			if (speedoRotation > -90) {
				speedoRotation = speedoRotation - 1;
			}
		} else if (_global.direction == "b") {
			if ((myCarSpeed < 110) && (car._xscale < 250)) {
				myCarSpeed += 0.25;
				if (speedoRotation < 90) {
					speedoRotation = speedoRotation + 1;
				}
			}
		} else {
			//
		}

		theScaleFactor = myCarSpeed / theCarSpeed;
		deltaScale = Math.abs((speed * 1.75) * (myCarSpeed - theCarSpeed));

		if (theScaleFactor < 1) {
			//We are slower. We have three zones of scaling to allow for the non planar
			//perspective (A nasty hack but it works for now). Allows the car to dissapear quicker the further away and faster
			//it is. Also the scaling would become irregular due to rounding errors when calculating
			//floating point scaling factors and integer Y positions.
			if (car._xscale > 20) {
				if (car._xscale < 60) {
					g_carY = (g_carY - deltaScale * 0.55);
					car._xscale = (carScale - deltaScale * 1.45);
					car._yscale = (carScale - deltaScale * 1.45);
				} else if (car._xscale < 100 && car._xscale >= 60) {
					g_carY = (g_carY - deltaScale * 0.75);
					car._xscale = (carScale - deltaScale * 1.4);
					car._yscale = (carScale - deltaScale * 1.4);
				} else {
					g_carY = (g_carY - deltaScale);
					car._xscale = (carScale - deltaScale);
					car._yscale = (carScale - deltaScale);
				}
				car._y = g_carY;
				cary = car._y;


			}
		} else if (theScaleFactor > 1) {
			//We are faster
			if (car._xscale < 250) {

				if (car._xscale < 60) {
					g_carY = (g_carY + deltaScale * 0.55);
					car._xscale = (carScale + deltaScale * 1.45);
					car._yscale = (carScale + deltaScale * 1.45);
				} else if (car._xscale < 100 && car._xscale >= 60) {
					g_carY = (g_carY + deltaScale * 0.75);
					car._xscale = (carScale + deltaScale * 1.4);
					car._yscale = (carScale + deltaScale * 1.4);
				} else {
					g_carY = (g_carY + deltaScale);
					car._xscale = (carScale + deltaScale);
					car._yscale = (carScale + deltaScale);
				}
				car._y = g_carY;
			}
		}
		//Hide the car when it reaches the horizon and replace with a still. Lock position as the  
		//real car becomes airbourne.  )
		if (car._xscale < 20) {
			car._visible = 0;
			car.duplicateMovieClip("carstill",1);
			car._x = 205.75;
			car._y = 42;
			car._xscale = 20;
			car._yscale = 20;
			carstill._x = 205.75;
			carstill._y = 42;
			g_carY = car._y;
		} else {
			if (car._visible == 0) {
				car._visible = 1;
				carstill.removeMovieClip();
				car._x = 205.75;
				car._y = 42;
			}
		}

	}
	// ex 3 4 condition If  
	scoreObject.displayScore();// for smooth update
	_level0.cockpit_mc.speedo_mc._rotation = speedoRotation;

};
//----------------------------------------------------------------------------------------------
intervalObject.testInZone = function() {// correct distance
	if ((car._y + (car._height / 2)) >= _level0.topzone && (car._y + (car._height / 2)) <= _level0.botzone) {
		if (myTimer.inzone < 90) {
			++myTimer.inzone;
			_level0.drace(myTimer.inzone);
			ExternalInterface.call("debug", "InZone", myTimer.inzone);
		}
	} else {
		if (myTimer.inzone > 0) {
			//--myTimer.inzone;

		}
	}
};
//------------------------------------------------------------------------------------
// update the display 
intervalObject.upDateStage = function() {
	minutes = myTimer.minutes;
	if (myTimer.seconds < 10) {// need to add leading zero
		seconds = "0" + myTimer.seconds;
	} else {
		seconds = myTimer.seconds;
	}
	inzone = myTimer.inzone;
	//scoreObject.displayScore(); // this updates the inzone score only (the number score is updated as you answer questions or juggle)
};
//------------------------------------------------------------------------------------
// play the background clips (which self-destruct when they've finished playing) =====
intervalObject.drawRTStage = function() {
	// get the correct list of bg objects (determined by 'level')
	Rfocus = "rightBG" + Number(scoreObject.levelMonitor.bgArray[random(2)]);// ok
	R_BGtarget_mc.attachMovie(Rfocus,"rtBG_mc",5,rtBGmaster_mc);
};
//------------------------------------------------------------------------------------
intervalObject.drawLStage = function() {
	Lfocus = "leftBG" + Number(scoreObject.levelMonitor.bgArray[random(2)]);
	L_BGtarget_mc.attachMovie(Lfocus,"lBG_mc",10,LBGmaster_mc);
};
// </> interval & timer objects ======================================================

intervalObject.LockUser = function() {
	_level0.drace("Unlocking User");
	LockOutUser = false;
	clearInterval(timLockUser);
};





//====================================================================================
// JUGGLE OBJECT - THE RANDOM NUMBER GENERATOR + MATCHER
//====================================================================================
// setup juggle object
juggleObject = new Object();
//juggleObject.attempted = true; // 
//------------------------------------------------------------------------------------
// juggle object functions:
//------------------------------------------------------------------------------------
// setup the number arrays and attach random number clips to placeholder clips
//------------------------------------------------------------------------------------
// sets up the first 2 numbers and then the third.  also the correct answer is calculated
var ians = "";
var LastNum = -1;
var CurrNum = -1;
var Same = false;



function GenNum(bDiff) {//bDiff = true means return the SAME
	var rnum = 0;
	Same = false;//Reset
	if (bDiff) {
		Same = true;

		if (CurrNum > LastNum) {
			var out1 = Math.abs(CurrNum - LastNum);
		}
		if (LastNum > CurrNum) {
			var out1 = Math.abs(LastNum - CurrNum);
		}
		if (out1 == CurrNum) {

			var chance = Math.random();
			if (chance > 0.5) {
				return GenNum(true);
			} else {
				return GenNum();
				//this.juggleArray.push(rnum);
			}
		} else {
			return out1;
		}
	} else {
		// <1 or same as last
		while ((rnum < 1) || (rnum == CurrNum) || (rnum == LastNum) || (rnum == 0) || (rnum == (CurrNum - LastNum)) || (rnum == (LastNum - CurrNum))) {//Dont gen zeros or same number twice (gets zero as diff otherwise)
			rnum = Math.abs(random(9));
		}
	}
	return rnum;
}

juggleObject.juggle = function() {
	_level0.feedback_mc.feedback_mc.removeMovieClip();// delete the feedback clip if it's there
	_level0.feedback_mc1.removeMovieClip();

	if (scoreObject.levelMonitor.level > 1) {
		//Set a timer to prevent the user pressing S D keys after a certain time
		_level0.drace("Level Keylock : " + gArrKeyLock[scoreObject.levelMonitor.level - 1]);
		clearInterval(gtimKeyLock);
		gtimKeyLock = null;
		gtimKeyLock = setInterval(juggleObject, "keylock", gArrKeyLock[scoreObject.levelMonitor.level - 1], "keylock");
		gKeyLock = false;//reset so user can use keys again
	}

	++scoreObject.nCount;// the number of questions asked in this section
	if (this.twoBallsUp != true) {// this is the first time the program's run
		if (CurrNum == -1) {//1st time here
			newNum = GenNum();//gen current (1st number shown)
		} else {
			LastNum = CurrNum;//Save it
			newNum = GenNum();//and go a new one
		}
		//_level0.movie_holder["number_"+] = newNum; //Display num
		_level0["noPlacer_" + placer + "_mc"].number_mc.attachMovie("number_" + newNum,"number0",1);
		//}
		this.twoBallsUp = true;
	} else {// two balls in the air already, just need one more to make it interesting
		//ASH - First 50/50 if we force a same number
		var chance = Math.random();
		if (chance > 0.5) {
			newNum = GenNum(true);
		} else {
			newNum = GenNum();
			//this.juggleArray.push(rnum);
		}


	}


	// if the last question wasn't answered we have to drop the score - but only if there's been 3 numbers shown
	if ((scoreObject.nCount > 3) && (juggleObject.attempted == false)) {
		_level0.drace("No user input");
		if (_level0.scoreObject.format == 3) {
			_level0.attachMovie("feed_incorrect","feedback_mc1",75);
			_level0.feedback_mc1._x = _level0.feedback_mc._x;
			_level0.feedback_mc1._y = _level0.feedback_mc._y;
		}
		scoreObject.displayNumberScore(0);
	}
	// attach the first number in the juggle array to a random position (marked by invisible clips)  
	var placer = random(9);//Whoops Zero is nolonger shown...
	//NUMBER SHOWN

	//Show number latest number [0]
	//_level0.movie_holder["noPlacer_"+placer+"_mc"].number_mc.attachMovie("number_"+this.juggleArray[0],"number0",1);
	_level0["noPlacer_" + placer + "_mc"].number_mc.attachMovie("number_" + newNum,"number0",1);

	LastNum = CurrNum;
	CurrNum = newNum;

	//This is the number shown 
	this.difference = Math.abs(this.juggleArray[0]-this.juggleArray[1]) // the difference between the first 2 numbers
	juggleObject.tossed = false;// reset so the keys can be captured again
	juggleObject.attempted = false;// reset the answered state 
	dprint(newNum + " - " + Same);
};
//------------------------------------------------------------------------------------
// check number scoring
//------------------------------------------------------------------------------------


juggleObject.keyLock = function() {
	_level0.drace("SD KeyLock!!");
	gKeyLock = true;//prevent user from using S D keys after a timeout
	if (!juggleObject.attempted) {//User hasn't attempted it..
		juggleObject.attempted = true;//Update Score etc (only once)
		juggleObject.checkScore("|");//check for score
	}
};

juggleObject.checkScore = function(choice) {// called from keyListener
	if (scoreObject.nCount > 2) {// the first 2 numbers don't get assessed
		++scoreObject.nAttempted;//


		dprint(Same + " : " + this.difference + " pressed " + choice);
		_level0.feedback_mc1.removeMovieClip();

		if (choice != "|") {

			if (choice == "s" & Same == true) {// last number = difference
				_level0.answerFeedback = "correct";
				var scored = 1;
				++scoreObject.numberScore;
			}
			if (choice == "s" & Same == false) {// last number != difference
				var scored = 0;
				//--scoreObject.numberScore;
				_level0.answerFeedback = "inCorrect";
			}
			if (choice == "d" & Same == false) {// last number != difference
				++scoreObject.numberScore;
				var scored = 1;
				_level0.answerFeedback = "correct";
			}
			if (choice == "d" & Same == true) {// last number = difference
				var scored = 0;
				//--scoreObject.numberScore;
				_level0.answerFeedback = "inCorrect";
			}
		} else {
			var scored = 0;
			//--scoreObject.numberScore;
			_level0.answerFeedback = "inCorrect";
		}



		scoreObject.displayNumberScore(scored);
		_level0.numberScore = scoreObject.numberScore;// debug only
	}
};
// </> juggle object =================================================================
//====================================================================================
// TRIG OBJECT
//====================================================================================
trigObject = new Object();
//----------- trig functions ----------
trigObject.setUp = function() {
	this.carTopScale = 20;// the min scale of the car
	this.carBotScale = 250;// the maxscale of the car
	this.scaleDownSteps = Number(100 - this.carTopScale);// the number of steps down from 100% // 60
	this.scaleUpSteps = Number(this.carBotScale - 100);// the number of steps up from 100% // 150
	this.downHypot = Number(Math.sqrt((Number(this.scaleDownSteps) * Number(this.scaleDownSteps)) + (100 * 100)));// 116
	this.upHypot = Number(Math.sqrt((Number(this.scaleUpSteps) * Number(this.scaleUpSteps)) + (100 * 100)));// 180.277
	this.downDegree = Math.asin(100 / Number(this.downHypot));//59.04; // Calculated as arcSin(100/downHypot)
	this.upDegree = Math.asin(100 / Number(this.upHypot));// 33.69; // Calculated as arcSin(100/upHypot)
};
trigObject.setUp();

// </> trigObject //==================================================================
//====================================================================================
// SCORE OBJECT 
//====================================================================================
//setup score object and define the parameters for each excercise type.  This also has info about enviromnent graphics*/ //
//hardcoded for debug:
//conExercise=1;
//conLevel=1;
//format = 1;
scoreObject = new Object();
scoreObject = {conExercise:_level0.conExercise, conLevel:_level0.conLevel, format:_level0.format, nCount:0, nAttempted:0, numberScore:0, inzoneScore:0, conScore:0};
scoreObject.child = new Array();// this seems longhand, but each child contains specific info
scoreObject.child[0] = {startTime:(getTimer() / 1000) - myTimer.globalTime};
scoreObject.child[1] = {nWeightNumber:0, nWeightHeadway:100, nType:"headway", rect:1, pBar:0, feedback:0, regScore:0};// headway: yellow rectangle no perfomance bar, no score
scoreObject.child[2] = {nWeightNumber:0, nWeightHeadway:100, nType:"headway", rect:0, pBar:1, feedback:0, regScore:1};// headway: no rectangle. add performance bar & score
scoreObject.child[3] = {nWeightNumber:100, nWeightHeadway:0, nType:"number", rect:0, pBar:0, feedback:1, regScore:0};// number; feedback text, no performance bar, no score
scoreObject.child[4] = {nWeightNumber:100, nWeightHeadway:0, nType:"number", rect:0, pBar:1, feedback:0, regScore:1};// number : no feedback, add performance bar, score
scoreObject.child[5] = {nWeightNumber:50, nWeightHeadway:50, nType:"equal", rect:0, pBar:1, feedback:0, regScore:0};// equal : performance bar not scored

scoreObject.child[6] = {nWeightNumber:50, nWeightHeadway:50, nType:"equal", rect:0, pBar:1, feedback:0, regScore:1};// equal : performance bar and scored
scoreObject.child[7] = {nWeightNumber:30, nWeightHeadway:70, nType:"headWeight", rect:0, pBar:1, feedback:0, regScore:1};// headWeight : performance bar and score
scoreObject.child[8] = {nWeightNumber:70, nWeightHeadway:30, nType:"numberWeight", rect:0, pBar:1, feedback:0, regScore:1};// numberWeight : performance bar and score
scoreObject.strikeCount = new Array();// to hold the consecutive number of strikes - three and the bar stops working
scoreObject.scoreCount = new Array();// to hold the consecutive number of scores to scale the bar correctly
scoreObject.levelMonitor = new Object();// to hold the level parameters for the exercise
scoreObject.levelMonitor.bgArray = new Array();// the array for bg images - urban or desert
scoreObject.levelMonitor.speedArray = new Array();// the array for carspeed and display of numbers
scoreObject.levelMonitor.numSpeedArray = new Array();// the the show numbers intervals - got from conLevel
// hardcoded values for speed 
scoreObject.levelMonitor.speedArray = ["0", ".25", ".5", "1", "1.5"];// the relative speed/scaling of the car - got from conLevel
scoreObject.levelMonitor.numSpeedArray = ["0", "5000", "4000", "3000", "2000"];// the relative speed/scaling of the car - got from conLevel
//===============================================================================


scoreObject.setupScore = function() {
	// setup the background graphics
	this.levelMonitor.level = this.conLevel;
	this.levelMonitor.numspeed = scoreObject.levelMonitor.numSpeedArray[this.conLevel];
	var xLevel = 0;

	if (_level0.seq > 8) {
		if (Math.random() > 0.4) {
			while (xLevel == 0) {
				xLevel = random(5);
			}
		}
	}
	ashdebug = _level0.conExercise + ":" + xLevel;
	if (xLevel != 4) {// were at levels 1,2 or 3
		this.levelMonitor.bgArray = ["1", "2"];// so it picks up values for bg linkage (rightBG1' etc) // the urban scenes
		// load the rain or fog if required -- clips are linked as "fgClip1" etc
		this.levelMonitor.fgClip = xLevel.toString();// there's no fgClip1 so nothing happens at level 1
		var FGfocus = "fgClip" + this.levelMonitor.fgClip;

		FGtarget_mc.attachMovie(FGfocus,"FGclip_mc",50);// attach the correct FG clip to the placeholder
	} else {
		this.levelMonitor.bgArray = ["3", "4"];// the desert scenes
		bgColourObject = new Color(_level0.bg_mc);// change the colour of the hills
		bgColourTransObject = {rb:255, gb:18, bb:-255};// for the orange colour
		bgColourObject.setTransform(bgColourTransObject);
		delete bgColourObject;
		delete bgColourTransObject;
	}

	/*
	if (this.conLevel != 4) {// were at levels 1,2 or 3
	this.levelMonitor.bgArray = ["1","2"]; // so it picks up values for bg linkage (rightBG1' etc) // the urban scenes
	 // load the rain or fog if required -- clips are linked as "fgClip1" etc
	this.levelMonitor.fgClip = this.conLevel; // there's no fgClip1 so nothing happens at level 1
	var FGfocus = "fgClip"+ this.levelMonitor.fgClip;
	FGtarget_mc.attachMovie(FGfocus,"FGclip_mc",50); // attach the correct FG clip to the placeholder
	}else{ // were at level 4
	this.levelMonitor.bgArray = ["3","4"]; // the desert scenes
	bgColourObject = new Color(_level0.bg_mc);// change the colour of the hills
	bgColourTransObject = {rb:255,gb:18,bb:-255}; // for the orange colour
	bgColourObject.setTransform(bgColourTransObject);
	delete bgColourObject;
	delete bgColourTransObject;
	}
	*/
	// setup the speed variable
trace (this.child[this.format].rect);
trace (this.child[this.format].pBar);
trace (this.child[this.format].nType);
	// set the environment graphics -- yellow rectangle,performance bar,feedback graphic
	_level0.zone_mc._visible = this.child[this.format].rect;
	_level0.headwayScore_mc._visible = this.child[this.format].pBar;
	_level0.numberScore_mc._visible = this.child[this.format].pBar;
	_level0.marker_mc._visible = this.child[this.format].pBar;
	_level0.perfBarBg_mc._visible = this.child[this.format].pBar;
	if (this.child[this.format].nType == "headway") {
		delete juggleObject;
	}
	//  

	// set the bars to the correct weighting - from above // v13 switched positions of Numbar & Headbar
	// set the default sizes & positions
	this.headScale = this.child[this.format].nWeightHeadway;//// 100
	this.numScale = this.child[this.format].nWeightNumber;//;// 100
	// now set the desired performance level from 'format'
	_level0.headwayScore_mc._xscale = this.headScale;// scale the performance bars
	_level0.numberScore_mc._xscale = this.numScale;// 
	this.numBarWidth = _level0.numberScore_mc._width;// get the width of the num clip
	this.headBarWidth = _level0.headwayScore_mc._width;// head clip width @@
	this.markerX = _level0.numberScore_mc._x + this.numBarWidth;// 275 if we're in the middle
	_level0.headwayScore_mc._x = this.markerX;// place the headway score clip just to the right of the marker
	_level0.marker_mc._x = this.markerX;// place the marker

	//Ash Hack
	if (this.markerX > 30) {//Marker is center so center out text too
		_level0.perfBarBg_mc.txtDesPerLine1._x = this.markerX - (_level0.perfBarBg_mc.txtDesPerLine1._width / 2);
	} else {
		//Otherwise just line it up with the marker.
		_level0.perfBarBg_mc.txtDesPerLine1._x = this.markerX;
	}
	if (this.markerX > 400) {
		//We in numbers a the marker is all the way down the end
		_level0.perfBarBg_mc.txtDesPerLine1._x = this.markerX - (_level0.perfBarBg_mc.txtDesPerLine1._width);
	}
};
//-----------------------------------------------------------------------------------------------------------------
scoreObject.displayNumberScore = function(scored) {
	var showFeedback = this.child[this.format].feedback;
	var performance = _level0.numberScore_mc._width;
	
	if (scored == 1) {// we got the right answer
		var myScore = "correct";
		if (showFeedback == 1) {// show feedback if required
			//_level0.feedback_mc.attachMovie("feed_" + myScore,"feedback_mc",75);
			_level0.attachMovie("feed_correct","feedback_mc1",75);
			_level0.feedback_mc1._x = _level0.feedback_mc._x;
			_level0.feedback_mc1._y = _level0.feedback_mc._y;
			
			
		}
		var scores = scoreObject.scoreCount.length;
		if (scores > 0) {
			scoreObject.scoreCount.shift();// // decrease strike count
		}
	} else {// we answered wrong
		var myScore = "incorrect";
		if (showFeedback == 1) {// show feedback if required
			//_level0.feedback_mc.attachMovie("feed_" + myScore,"feedback_mc",75);
			_level0.attachMovie("feed_incorrect","feedback_mc1",75);
			_level0.feedback_mc1._x = _level0.feedback_mc._x;
			_level0.feedback_mc1._y = _level0.feedback_mc._y;
		}
		var scores = scoreObject.scoreCount.length;
		if (scores < 5) {//-Ash changed from 3 to 5
			scoreObject.scoreCount.unshift(1);// // increase the strike count
			//_level0.numberScore_mc._width = performance -(this.numBarWidth * (33/100));// decrease the bar by a third
		} else {//three strikes - you're out*************
			var scores = scoreObject.scoreCount.length;
			_level0.numberScore_mc._width = 0;// hack
			//_level0.feedback_mc.feedback_mc.removeMovieClip(); // cleanup the stage
		}
	}

	var scores = scoreObject.scoreCount.length;
	var pScale = this.numScale - (this.numScale * (scores / 5));// increase the bar by a third -Ash changed to 5

	if (pScale <= this.numScale) {
		_level0.numberScore_mc._xscale = pScale;
	}
	// position the clip to the right // changed in v13 // commented to leave the clip at the left  
	//_level0.numberScore_mc._x = _level0.rightPerformance - Number(_level0.numberScore_mc._width);// this scores right to left but positioned at the right og the screen
	//_level0.numberScore_mc._x = this.markerX - Number(_level0.numberScore_mc._width); // this scores from  right to left 
};

scoreObject.displayScore = function() {// new in v 1.9 - test distance of car from zone centre@@@@@new in v1.10
	// update the headway performance bar
	var carScale = car._xscale;
	var headScale = this.headScale;
	if (carScale <= 100) {// scaling down the car
		var ratio = 100 / trigObject.scaleDownSteps;
		var newScale = (ratio * (carScale - trigObject.carTopScale)) * (headScale / 100);
		_level0.headwayScore_mc._xscale = newScale;// 
	} else {
		var ratio = 100 / trigObject.scaleUpSteps;
		var newScale = (ratio * (trigObject.carBotScale - carScale)) * (headScale / 100);
		_level0.headwayScore_mc._xscale = newScale;// 
	}
	this.inzoneScore = Number(myTimer.inzone) / 90;// were working with 130 seconds (are we ?)
	// position the clip
	if (this.format >= 5) {// show the bar on the left
		_level0.headwayScore_mc._x = _level0.rightPerformance - Number(_level0.headwayScore_mc._width);// this scores right to left but positioned at the right og the screen

	} else {// Position bar on the right
		_level0.headwayScore_mc._x = _level0.rightPerformance - Number(_level0.headwayScore_mc._width);
		//_level0.headwayScore_mc._x = _level0.NumberScore_mc._x // this scores left to right from the left of the screen
	}
};

scoreObject.showTotals = function() {
	

	var dialog = this.child[this.format].regScore;
	_level0.feedback_mc.feedback_mc.feedback_mc.removeMovieClip();// clear any feedback
	_level0.feedback_mc1.removeMovieClip();

	if (this.child[this.format].regScore == 1 ){
		_level0.feedback_mc.attachMovie("ContinueDialog" + dialog,"ContinueDialog_mc",75);
	}

	dprint("Calculating Scores");
	dprint("Number Score :");
	dprint(this.numberScore + " nCount:" + (this.nCount - 2));
	this.showNumberScore = (Number(this.numberScore) / Number(this.nCount - 2)) * 100;// gets the percentage of right answers
	dprint(this.showNumberScore);
	//Should this be numScale ??/
	var numScore = Number(this.showNumberScore) * Number(this.numScale / 100);//factor in the weighting
	//var numScore = Number(this.showNumberScore)*Number(this.headScale/100)//factor in the weighting
	dprint("Weighting (numberscore*(numScore/100):");
	dprint("H:" + this.headScale);
	dprint("NUMSCORE=:" + numScore);
	this.inzoneScore = Number(_level0.myTimer.inzone) / 90;// were working with 130 seconds
	dprint("MyTimerInZone:/90 :" + myTimer.inzone);
	dprint("INZone :" + this.inzoneScore);
	if (this.headScale == 100) {
		var headScore = this.inzoneScore * 100;
	} else {
		var headScore = (Number(this.inzoneScore) * 100) * Number(this.headScale / 100);
	}
	dprint("HeadScore :" + headScore);
	this.conScore = int(numScore + (headScore));
	dprint("ConScore :(" + numScore + "+" + headScore + "):");
	dprint(this.conScore);

	if ((this.conScore == null) || (this.conScore == 0) || isNaN(this.conScore)) {
		this.conScore = 0;
	}
	//Ash - needed to isolate format 4 as it's just numbers only.      
	if (_level0.format != 4) {
		ExternalInterface.call("debug","Level x score ",headScore,numScore, this.conScore);
		ExternalInterface.call("swiffFinished", this.conScore);
		if ((this.conScore == null) || (this.conScore == 0)) {
			//Dismal
			_level0.feedback_mc.ContinueDialog_mc.percent = 0;
			_level0.feedback_mc.ContinueDialog_mc.pstring = "0";
		} else {
			_level0.feedback_mc.ContinueDialog_mc.percent = Math.round(this.conScore);
			_level0.feedback_mc.ContinueDialog_mc.pstring = Math.round(this.conScore) + " ";
			//Use the pre-weighted numbers
		}
		if (_level0.seq > 8) {
			if (Math.round(this.conScore) < 26) {
				dprint("MUTE AUDIO");
			} else {
				audioFeedback(this.showNumberScore,this.inzoneScore * 100,this.numScale,this.headScale,this.conScore);//Do audio feedback...
			}
		}
	} else {
		if ((showNumberScore == null) || (showNumberScore == 0) || isNaN(showNumberScore)) {
			showNumberScore = 0;
		}
		
		/// score is showNumberScore ?
		ExternalInterface.call("debug","Level 4 score ",showNumberScore);
		ExternalInterface.call("swiffFinished", showNumberScore);
		
		if ((this.conScore == null) || (this.conScore == 0)) {
			//Dismal
			dprint("!!!!!!!!!!!!SUSPECT ERROR this.conScore :" + this.conScore);
			_level0.feedback_mc.ContinueDialog_mc.percent = 0;
			_level0.feedback_mc.ContinueDialog_mc.pstring = "0";
		} else {
			//Level 4 only its the only one with numbers only being scored
			_level0.feedback_mc.ContinueDialog_mc.percent = Math.round(this.showNumberScore);
			_level0.feedback_mc.ContinueDialog_mc.pstring = Math.round(this.showNumberScore);
		}
	}
};
// </> score object




function audioFeedback(numScore, headScore, ns, hs, iTotalScore) {
	_level0.drace("AUDIO FEEDBACK " + numScore + ":" + headScore + ":" + hs + ":" + ns+ ":"+ iTotalScore);
	//logg(myGetOdd()+ " : "+numScore+"|"+headScore)

	var totalScore = iTotalScore;


	_level0.drace("TOTALSCORE   : " + totalScore);
	_level0.drace("LASTHEADSCORE: " + _level0.lastHeadScore);
	_level0.drace("LASTNUMSCORE : " + _level0.lastNumScore);

	if (totalScore < 40) {
		stopAllSounds();
		return;
	}

	if (hs == 50) {
		ratio = numScore / headScore;
		_level0.drace("RATIO: " + ratio);
		//Equal Exercises
		_level0.drace("<<EQUAL EXERCISE>>");
		_level0.lastHeadScore = headScore;
		_level0.lastNumScore = numScore;

		if (totalScore > 89) {
			_level0.drace(">89");
			PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congratulations
		} else if (totalScore < 40) {
			_level0.drace("<40 -NO FEEDBACK");
			LOG = "";
			return;//No Feedback
		} else if (ratio > 1.3) {
			_level0.drace("Ratio > 1.3");
			PlayAudio("media/sound/concentration/con_cfeed_e.mp3");//Too much number

		} else if (ratio < 0.7) {
			_level0.drace("Ratio <.7");
			PlayAudio("media/sound/concentration/con_cfeed_g.mp3");//Too much on Headway

		} else {
			_level0.drace(" DEFAULT");
			PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Too much on Headway
		}


		//Block End


	}
	//Block End  


	//***************************************************************************************
	//**************************************************************************************
	//**************************************************************************************
	//**************************************************************************************
	//**************************************************************************************
	//**************************************************************************************
	//**************************************************************************************


	if (hs == 70) {
		ratio = headScore / numScore;
		_level0.drace("RATIO: " + ratio);
		if (myGetOdd()) {
			//Odd Exercises
			_level0.drace("<<ODD EXERCISE>>");
			_level0.lastHeadScore = headScore;
			_level0.lastNumScore = numScore;
			if (totalScore > 89) {
				_level0.drace(">89 PERF SET 1");
				PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congratulations
				_level0.oddPerformance = 1;
			} else if (totalScore < 40) {
				_level0.drace("<40 PERF SET 1 -NO FEEDBACK");
				_level0.oddPerformance = 1;
				LOG = "";
				return;//No Feedback
			} else if (ratio > 2) {
				_level0.drace("Ratio > 2 PERF SET 2");
				PlayAudio("media/sound/concentration/con_cfeed_l.mp3");//Too much headway
				_level0.oddPerformance = 2;
			} else if ((ratio >= 1.5) && (ratio <= 2)) {
				_level0.drace("Ratio >1.5 <2 PERF SET 3");
				PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congrats
				_level0.oddPerformance = 3;
			} else if ((ratio >= 1.1) && (ratio <= 1.5)) {
				_level0.drace("Ratio >1.1 <1.5 PERF SET 4");
				PlayAudio("media/sound/concentration/con_cfeed_c.mp3");//Next time more on HW
				_level0.oddPerformance = 4;
			} else if (ratio < 1.1) {
				_level0.drace("Ratio <1.5 PERF SET 3");
				PlayAudio("media/sound/concentration/con_cfeed_e.mp3");//Hey whats going on
				_level0.oddPerformance = 3;
			}

		} else {
			_level0.drace("<<EVEN EXERCISE>>");
			//Even exerices
			//Do we include <40 (no feed back??)
			if (_level0.oddPerformance == 1) {
				if (totalScore > 89) {
					_level0.drace(">89 DEFAULT 'Congat' PERF = 1");
					PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congrats
				} else if (ratio > 2) {
					_level0.drace("Ratio >2  PERF = 1");
					PlayAudio("media/sound/concentration/con_cfeed_l.mp3");//Too much on  HW
				} else if ((ratio >= 1.5) && (ratio <= 2)) {
					_level0.drace("Ratio >1.5 < 2  PERF = 1");
					PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congrats
				} else if ((ratio >= 1.1) && (ratio <= 1.5)) {
					_level0.drace("Ratio >1.1 <1.5  PERF = 1");
					PlayAudio("media/sound/concentration/con_cfeed_i.mp3");//next time more on HW
				} else if (ratio < 1.1) {
					_level0.drace("Ratio <1.1  PERF = 1");
					PlayAudio("media/sound/concentration/con_cfeed_e.mp3");//next time more on HW
				}
			}

			if (_level0.oddPerformance == 2) {
				if (totalScore > 89) {
					_level0.drace(">89  PERF = 2");
					PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congrats
				} else if (ratio > 2) {
					_level0.drace("Ratio >2  PERF = 2");
					PlayAudio("media/sound/concentration/con_cfeed_l.mp3");//Too much on  HW
				} else if ((ratio >= 1.5) && (ratio <= 2)) {
					_level0.drace("Ratio >1.5 <2 PERF = 2");
					PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congrats
				} else if ((ratio >= 1.1) && (ratio <= 1.5)) {
					_level0.drace("Ratio >1.1 <1.5 PERF = 2");
					PlayAudio("media/sound/concentration/con_cfeed_i.mp3");//next time more on HW
				} else if (ratio < 1.1) {
					_level0.drace("Ratio <1.1 PERF = 2");
					PlayAudio("media/sound/concentration/con_cfeed_e.mp3");//next time more on HW
				}
			}

			if (_level0.oddPerformance == 3) {
				if (totalScore > 89) {
					_level0.drace(">89  PERF = 3");
					PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congrats
				} else if (ratio > 2) {
					_level0.drace("Ratio >2  PERF = 3");
					PlayAudio("media/sound/concentration/con_cfeed_l.mp3");//Too much on  HW
				} else if ((ratio >= 1.5) && (ratio <= 2)) {
					_level0.drace("Ratio >1.5 <2  PERF = 3");
					PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congrats
				} else if ((ratio >= 1.1) && (ratio <= 1.5)) {
					_level0.drace("Ratio >1.1 <1.5  PERF = 3");
					PlayAudio("media/sound/concentration/con_cfeed_i.mp3");//Hey whats too much on number task
				} else if (ratio < 1.1) {
					_level0.drace("Ratio <1.1  PERF = 3");
					PlayAudio("media/sound/concentration/con_cfeed_e.mp3");//Hey whats too much on number task
				}
			}

			if (_level0.oddPerformance == 4) {
				if (totalScore > 89) {
					_level0.drace(">89  PERF = 4");
					PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congrats
				} else if (ratio > 2) {
					_level0.drace("Ratio >2  PERF = 4");
					PlayAudio("media/sound/concentration/con_cfeed_l.mp3");//Too much on  HW
				} else if ((ratio >= 1.5) && (ratio <= 2)) {
					_level0.drace("Ratio >1.5 <2  PERF = 4");
					PlayAudio("media/sound/concentration/con_cfeed_f.mp3");//Congrats
				} else if ((ratio >= 1.1) && (ratio <= 1.5)) {
					_level0.drace("Ratio >1.1 <1.5  PERF = 4");
					PlayAudio("media/sound/concentration/con_cfeed_i.mp3");//Congrats
				} else if (ratio < 1.1) {
					_level0.drace("Ratio <1.5  PERF = 4");
					if (headScore < lastHeadScore) {
						_level0.drace("--HS < LastHS  PERF = 4");
						PlayAudio("media/sound/concentration/con_cfeed_k.mp3");//Hey less than last time
					} else {
						_level0.drace("--HS > LastHS  PERF = 4");
						PlayAudio("media/sound/concentration/con_cfeed_e.mp3");//hey whats too much on number
					}

				}
			}
		}

	}
	//***************************************************************************************  
	//**************************************************************************************
	//**************************************************************************************
	//**************************************************************************************
	//**************************************************************************************
	//**************************************************************************************
	//**************************************************************************************

	if (ns == 70) {
		ratio = numScore / headScore;
		_level0.drace("RATIO: " + ratio);
		if (myGetOdd()) {
			//Odd Exercises
			_level0.drace("<<ODD EXERCISE>>");
			_level0.lastHeadScore = headScore;
			_level0.lastNumScore = numScore;
			if (totalScore > 89) {
				_level0.drace(">89 PERF SET 1");
				PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congratulations
				_level0.oddPerformance = 1;
			} else if (totalScore < 40) {
				_level0.drace("<40 PERF SET 1 -NO FEEDBACK");
				_level0.oddPerformance = 1;
				LOG = "";
				return;//No Feedback
			} else if (ratio > 2) {
				_level0.drace("Ratio > 2 PERF SET 2");
				PlayAudio("media/sound/concentration/con_cfeed_m.mp3");//Too much number
				_level0.oddPerformance = 2;
			} else if ((ratio >= 1.5) && (ratio <= 2)) {
				_level0.drace("Ratio >1.5 <2 PERF SET 3");
				PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congrats
				_level0.oddPerformance = 3;
			} else if ((ratio > 1.1) && (ratio <= 1.5)) {
				_level0.drace("Ratio >1.1 <=1.5 PERF SET 4");
				PlayAudio("media/sound/concentration/con_cfeed_b.mp3");//Next time more on number task
				_level0.oddPerformance = 4;
			} else if (ratio < 1.1) {
				_level0.drace("Ratio <1.1 PERF SET 3");
				PlayAudio("media/sound/concentration/con_cfeed_g.mp3");//Hey whats going on
				_level0.oddPerformance = 3;
			}




		} else {
			//Even exerices
			//Do we include <40 (no feed back??)
			if (_level0.oddPerformance == 1) {
				if (totalScore > 89) {
					_level0.drace(">89 DEFAULT 'Congat' PERF = 1");
					PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congrats
				} else if (ratio > 2) {
					_level0.drace("Ratio >2  PERF = 1");
					PlayAudio("media/sound/concentration/con_cfeed_m.mp3");//Too much on  number task
				} else if ((ratio >= 1.5) && (ratio <= 2)) {
					_level0.drace("Ratio >1.5 < 2  PERF = 1");
					PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congrats
				} else if ((ratio > 1.1) && (ratio <= 1.5)) {
					_level0.drace("Ratio >1.1 <1.5  PERF = 1");
					PlayAudio("media/sound/concentration/con_cfeed_h.mp3");//Congrats
				} else if (ratio < 1.1) {
					_level0.drace("Ratio <1.5  PERF = 1");
					PlayAudio("media/sound/concentration/con_cfeed_g.mp3");//next time more on number task
				}
			}

			if (_level0.oddPerformance == 2) {
				if (totalScore > 89) {
					_level0.drace(">89  PERF = 2");
					PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congrats
				} else if (ratio > 2) {
					_level0.drace("Ratio >2  PERF = 2");
					PlayAudio("media/sound/concentration/con_cfeed_m.mp3");//Too much on  number task
				} else if ((ratio >= 1.5) && (ratio <= 2)) {
					_level0.drace("Ratio >1.5 <2 PERF = 2");
					PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congrats
				} else if ((ratio > 1.1) && (ratio <= 1.5)) {//Is this actually i ???
					_level0.drace("Ratio >1.1 <1.5 PERF = 2");
					PlayAudio("media/sound/concentration/con_cfeed_h.mp3");//next time more on numb task
				} else if (ratio < 1.1) {//Is this actually i ???
					_level0.drace("Ratio <1.1 PERF = 2");
					PlayAudio("media/sound/concentration/con_cfeed_g.mp3");//next time more on numb task
				}
			}

			if (_level0.oddPerformance == 3) {
				if (totalScore > 89) {
					_level0.drace(">89  PERF = 3");
					PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congrats
				} else if (ratio > 2) {
					_level0.drace("Ratio >2  PERF = 3");
					PlayAudio("media/sound/concentration/con_cfeed_m.mp3");//Too much on  number task
				} else if ((ratio >= 1.5) && (ratio <= 2)) {
					_level0.drace("Ratio >1.5 <2  PERF = 3");
					PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congrats
				} else if ((ratio > 1.1) && (ratio <= 1.5)) {
					_level0.drace("Ratio >1.1 <1.5  PERF = 3");
					PlayAudio("media/sound/concentration/con_cfeed_h.mp3");//Hey whats too much on headway task
				} else if (ratio < 1.1) {
					_level0.drace("Ratio <1.1  PERF = 3");
					PlayAudio("media/sound/concentration/con_cfeed_g.mp3");//Hey whats too much on headway task
				}
			}

			if (_level0.oddPerformance == 4) {
				if (totalScore > 89) {
					_level0.drace(">89  PERF = 4");
					PlayAudio("media/sound/concentration/con_cfeed_a.mp3");//Congrats
				} else if (ratio > 2) {
					_level0.drace("Ratio >2  PERF = 4");
					PlayAudio("media/sound/concentration/con_cfeed_m.mp3");//Too much on  Num
				} else if ((ratio >= 1.5) && (ratio <= 2)) {
					_level0.drace("Ratio >1.5 <2  PERF = 4");
					PlayAudio("media/sound/concentration/con_cfeed_d.mp3");//Congrats
				} else if ((ratio >= 1.1) && (ratio <= 1.5)) {
					_level0.drace("Ratio >1.1 <1.5  PERF = 4");
					PlayAudio("media/sound/concentration/con_cfeed_h.mp3");//Congrats
				} else if (ratio < 1.1) {
					_level0.drace("Ratio <1.5  PERF = 4 --lastHeadway=" + lastNumScore);
					if (numScore < lastNumScore) {
						_level0.drace("--HS < LastHS  PERF = 4");
						PlayAudio("media/sound/concentration/con_cfeed_j.mp3");//Hey less than last time
					} else {
						_level0.drace("--HS > LastHS  PERF = 4");
						PlayAudio("media/sound/concentration/con_cfeed_g.mp3");//hey whats too much on headway
					}

				}
			}
		}




	}
	//Function End  

}





// Added by Wei
function myGetOdd() {
	return (_level0.seq % 2 == 1);
}


/*
function PlayAudio(sFilename) {
	stopAllSounds();
	mySound.onSoundComplete = "";
	mySound.loadSound(sFilename,false);//Force event (non-streaming)
	mySound.start();
}

*/

//===============================================================================================
// MOVIE START
//===============================================================================================
// SPECIFIC ON STAGE OBJECT FUNCTIONS

_level0.cancel_btn.onRelease = function() {// cancel at any time
	//_level0.ExerciseComplete(_level0.scoreObject.conScore);
	_level0.CancelEx();
	trace("cancelled and passed score : " + _level0.scoreObject.conScore);
};


//===============================================================================================  
scoreObject.setupScore();// initialise the score 
// at the end: the score is passed from the continue buttons in the last dialog


//===============================================================================================
// INTERVALS
//===============================================================================================

//_global.direction =intervalObject.moveArray[random(2)]; // need to randomise this
_global.direction = "x";//Ash - we don't move the car does (see drift)

//make the red car drift in speed 

setInterval(intervalObject,"DriftCar",5000 - ((scoreObject.conLevel - 1) * 1000),"Drift red car");


//Need a handler so we can kill it.
var timLockUser;
timLockUser = setInterval(intervalObject, "LockUser", 3000, "Delay User");

setInterval(intervalObject,"countDownDisplay",1000,"countdown second");
setInterval(intervalObject,"move",60,"move car");
setInterval(intervalObject,"testInZone",1000,"inzone");
setInterval(intervalObject,"upDateStage",1000,"update");
setInterval(intervalObject,"drawRTStage",6000,"drawRT stage");
setInterval(intervalObject,"drawLStage",6000,"drawL stage");
//setInterval( juggleObject, "juggle",scoreObject.levelMonitor.numspeed, "juggle" );
setInterval(juggleObject,"juggle",5000,"juggle");

//===============================================================================================





function dprint(msg) {
	msg = msg + "<br>";
	_level0.drace(msg);
}

/*function drace(sMsg) {
	//Allow for a seperate flash app to display trace like stuff via a listening port.
	sendingLC = new LocalConnection();
	sendingLC.send("lc_name","output",sMsg);

}*/


function PlayAudio(sFilename) {
	ExternalInterface.call("debug", "FN PlaySound " + sFilename);
	// create a new Sound object
	var my_sound:Sound = new Sound();

	// if the sound loads, play it; if not, trace failure loading
	my_sound.onLoad = function(success:Boolean) {
		if (success) {
			my_sound.start();
		} else {
			ExternalInterface.call("debug","Error loading flash sound",sFilename );
		}
	};
	// load the sound
	my_sound.loadSound(sFilename,true);
}


