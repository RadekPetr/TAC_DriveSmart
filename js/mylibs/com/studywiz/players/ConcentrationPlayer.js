/*

function ExerciseComplete(iResult){									
	
	if(iResult.toString() == "NaN"){
		iResult=Number(0)
	}
	
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
	
	totalScore=0					//Total score for the current section, not really used for ex8
	
		//Now get the average for the previous 6 exercises
		for(i=eTracker.score.length-6;i<eTracker.score.length;i++){			
			totalScore+=eTracker.score[i]					//Add it up
			drace("EX:"+i+"  = "+eTracker.score[i]+" T: "+totalScore)
		}
	
	
	drace("Total Score: "+totalScore/6")
	ScoreAverage = totalScore/6	//Get the average value
	
	ScorePercentage = Math.round(ScoreAverage)
	drace("Score: "+ScorePercentage")
	drace("Calc a level jump...")
	
		
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