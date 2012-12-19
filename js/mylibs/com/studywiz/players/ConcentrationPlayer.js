/*

function ExerciseComplete(iResult){
									
	
	if(iResult.toString() == "NaN"){
		iResult=Number(0)
	}
	//iResult = Number(iResult)
	drace("Exercise Complete "+iResult)
	Background.gotoAndPlay("concentration2")
	movie_holder.unloadMovie()								//Close movie
	drace("RESULT :"+iResult)
	eTracker.score[eTracker.seq-1]=iResult				//Update result
	DebugScreen.txtTrackingScore.text = "Score:"+eTracker.score.toString();
	CalcLevel();	//-->Calc	-->Feedback
						//				->Level increase Audio			
						//			-->AdBreak
						//			-->GoNextCon
	
}

function GoNextCon(){
		eTracker.seq++;
		eTracker.max++;
		RtnFromEx=true;

		if(GetAttribute(ContNode,"gotostart")!=null){
			drace("GOTO CON PROGRESS")
			gotoAndPlay("Concentration")		
		}else{
			drace("GOTO CON2")
			StartButton._visible=1
			Background.gotoAndPlay("concentration2")
			RunExercise()		//We are not returning to Concentration menu here but going straight to the next exercise

		}
	
}
function CalcLevel(){
	if(GetAttribute(ContNode,"calc")!="true") {	//Continue onto Ad if no calc needed
			DoAd()
			return
	}				
	if(eTracker.seq==8){
		drace("Nothing to calculate")
		//eTracker.level++; //No Level increase..stay on level 1
		GoNextCon();		//No feedback or ads are shown so just continue
		return
	}
	
	drace("Processing calc")
	//NOT USED     //FIND THE BASELINE
	//NOT USED     gBaseLineScore=0;
	totalScore=0					//Total score for the current section, not really used for ex8
	if(eTracker.seq==14){				
		//Ex 14 needs to see the baseline for only two exercises 
		//NOT USED     gBaseLineScore=( eTracker.score[2] + eTracker.score[5])/2	//We score exercises 3 and 6 and get the average
		//NOT USED     drace("BASELINE CALC for EX 14"+gBaseLineScore)
	//NOT USED     }else{
		//get the average for the section prior to the one we just completed
		//NOT USED     for(i=eTracker.score.length-12;i<eTracker.score.length-6;i++){			
		//NOT USED     	//NOT USED     gBaseLineScore+=eTracker.score[i]					//Add it up
		//NOT USED     	drace("EX:"+i+"  = "+eTracker.score[i]+" T: "+gBaseLineScore)
		//NOT USED     }		
		//NOT USED     gBaseLineScore = gBaseLineScore/6	//The average
	//NOT USED     }
	
		//Now get the average for the previous 6 exercises
		for(i=eTracker.score.length-6;i<eTracker.score.length;i++){			
			totalScore+=eTracker.score[i]					//Add it up
			drace("EX:"+i+"  = "+eTracker.score[i]+" T: "+totalScore)
		}
	
	
	drace("Total Score: "+totalScore/6+" : Baseline "+gBaseLineScore)
	ScoreAverage = totalScore/6	//Get the average value
	
	ScorePercentage = Math.round(ScoreAverage)
	drace("Score: "+ScorePercentage+" : Baseline "+gBaseLineScore)
	drace("Calc a level jump...")
	
	
	
	//NOT USED     iThreshold = 10
	//NOT USED     iScoreDiff = (100 - gBaseLineScore)/iThreshold		//Threshold = Baseline+(10% of difference)
	//NOT USED     drace("iScoreDiff "+iScoreDiff)
	//NOT USED     drace("Expecting "+(gBaseLineScore + iScoreDiff)+" for a level increase")
	
	//if( ScoreAverage >= (gBaseLineScore + iScoreDiff)){ //Ash muted this as we now jump if >=85
		
	if( ScoreAverage >= 85){	
		// LEVEL INCREASE				
		drace("*********** LEVEL INCREASE ***********:"+ScoreAverage)
		PlayLevelAudio()				//Play audio 
		eTracker.level++;				//Go up a level
		conLevel++					
	}


	ShowFeedback();	//Provide feedback --> Do Ad

}



function PlayLevelAudio(){
			if(eTracker.level=="1"){
					mySound3 = new Sound();
					mySound3.loadSound("sound/concentration/mp3/con_overs1.mp3");
					mySound3.start();
					drace("PLAY AUDIO: Jump Level 1")
			}
			if(eTracker.level=="2"){
					mySound3 = new Sound();
					mySound3.loadSound("sound/concentration/mp3/con_overs2.mp3");
					mySound3.start();
					drace("PLAY AUDIO: Jump Level 2");
			}
			if(eTracker.level=="3"){
					mySound3 = new Sound();
					mySound3.loadSound("sound/concentration/mp3/con_overs3.mp3");
					mySound3.start();
					drace("PLAY AUDIO: Jump Level 3");
			}
}

function ShowFeedback(){
	ConFeedback._visible=1
	myString2 = "Your average score overall for these exercises is " + ScorePercentage;
	ConFeedback.DialogText.text = myString2;
	
}
*/