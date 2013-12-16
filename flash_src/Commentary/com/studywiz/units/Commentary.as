package com.studywiz.units
{


	import com.hexagonstar.util.debug.Debug;
	// 3rd party
	import com.reintroducing.events.CustomEvent;

	// SW

	import com.studywiz.units.*;
	import com.studywiz.utils.*;
	import com.studywiz.*;

	// flash
	import flash.events.Event;
	import flash.events.TimerEvent;
	import flash.display.Sprite;

	import flash.events.MouseEvent;


	public class Commentary extends Sprite
	{
		private var exercise:Object;
		//public var timer:Timer;

		public function Commentary()
		{
			exercise = new Object();
			Debug.trace(" @@@ Commentary @@@ ", Debug.LEVEL_INFO);
			exercise.recorder = new SwSoundRecorder();

		}

		public function startRecorder():void
		{
			Debug.trace(" @@@ Recording @@@ ", Debug.LEVEL_INFO);
			if (exercise.recorder.mic != null)
			{
				//exercise.entry_video.addEventListener(CustomEvent.ON_VIDEO_PROGRESS, updateRecorderProgressBar,false,0,true);


				exercise.recorder.startRecoding();

				// Add Recording progress bar;

				Utils.clean(exercise.recorderProgressBar, this);

				
			}
		}

		public function stopRecorder():void
		{
			Debug.trace(" @@@ Stopping @@@ ", Debug.LEVEL_INFO);

			//Utils.clean(exercise.controls.recorderProgressBar, this);
			if (exercise.recorder.mic != null)
			{
				exercise.recorder.stopRecording(new TimerEvent(TimerEvent.TIMER_COMPLETE));
				Debug.trace(" @@@ Stopped @@@ ", Debug.LEVEL_INFO);
			}
		}

		public function playBack():void
		{
			Debug.trace(" @@@ Playback @@@ ", Debug.LEVEL_INFO);
			if (exercise.recorder.mic != null)
			{
				// video started, now we can start the sound too
				exercise.recorder.startPlayback();
			}
		}


	}
}