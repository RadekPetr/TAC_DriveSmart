package com.studywiz
{
	import com.reintroducing.events.CustomEvent;
	import com.hexagonstar.util.debug.Debug;
	import com.dVyper.utils.Alert;

	import flash.display.DisplayObject;
	import flash.display.Sprite;
	import flash.events.*;
	import flash.media.Microphone;
	import flash.media.Sound;
	import flash.media.SoundChannel;
	import flash.system.Security;
	import flash.system.SecurityPanel;

	import flash.utils.ByteArray;
	import flash.utils.Timer;



	public class SwSoundRecorder extends Sprite
	{
		public var recLength:int;
		public var mic:Microphone;
		public var soundBytes:ByteArray;
		public var timer:Timer;
		public var output:ByteArray;
		private var _nextAction:String = "no.action.set";
		private var finishedRecordingEvent:CustomEvent;
		private var finishedPlaybackEvent:CustomEvent;
		private var alertDone:Boolean = false;
		private var isRecording = false;

		public function SwSoundRecorder()
		{
			this.name = "SoundRecorder";
			mic = Microphone.getMicrophone();
			if (mic != null)
			{
				mic.addEventListener(StatusEvent.STATUS,statusHandler);
				trace("MIC: " + mic.muted);
				//mic.codec= SoundCodec.SPEEX;
				if (mic.muted == true)
				{
					Globals.main_display.micClip.gotoAndStop("not_ok");
					Security.showSettings(SecurityPanel.PRIVACY);
				}
				else
				{
					Globals.main_display.micClip.gotoAndStop("ok");
				}

				//Security.showSettings(SecurityPanel.MICROPHONE);
				mic.gain = 100;
				mic.rate = 44;
				mic.encodeQuality = 9;
				mic.setUseEchoSuppression(true);
				finishedRecordingEvent = new CustomEvent(CustomEvent.ON_FINISHED_RECORDING,{});
				finishedPlaybackEvent = new CustomEvent(CustomEvent.ON_FINISHED_PLAYBACK,{});

			}
			else
			{
				Globals.main_display.micClip.gotoAndStop("not_ok");
				Debug.trace("** NO MIC **", Debug.LEVEL_ERROR);
				Alert.init(Globals.main_display.stage);
				Alert.show("No microphone detected or available. You will not be able to record your commentary in this activity.",{buttons:["OK"]});
			}
		}

		public function startRecoding(delay:Number=0):void
		{
			if (mic != null)
			{
				if (mic.muted == true)
				{
					Globals.main_display.micClip.gotoAndStop("not_ok");

				}
				else
				{
					Globals.main_display.micClip.gotoAndStop("recording");
				}

				isRecording = true;
				mic.rate = 44;
				mic.setSilenceLevel(10, 2000);
				// start recording
				mic.addEventListener(SampleDataEvent.SAMPLE_DATA, micSampleDataHandler);

				soundBytes = new ByteArray();
				soundBytes.clear();
				if (delay != 0)
				{
					// setup timer
					timer = new Timer(delay);
					timer.addEventListener(TimerEvent.TIMER, stopRecording);
					timer.start();
				}
				else
				{
					// setup timer - just in case 2 minutes if no delay set
					//timer = new Timer(2 * 60 * 1000);
					//timer.addEventListener(TimerEvent.TIMER, stopRecording);
				}

				Debug.trace("** Started to record sound **", Debug.LEVEL_INFO);
				// ToDo: check mic status, display warning if muted etc., Error handling
			}
			else
			{
				isRecording = false;
				Globals.main_display.micClip.gotoAndStop("not_ok");
				Debug.trace("** NOt recording - no MIC **", Debug.LEVEL_WARN);
			}

		}
		public function startPlayback():void
		{
			if (soundBytes.bytesAvailable > 0)
			{
				Globals.main_display.micClip.gotoAndStop("playback");
			}
			else
			{
				Globals.main_display.micClip.gotoAndStop("recorded_not_ok");
			}


			if (mic != null)
			{
				isRecording = false;
				Debug.trace("startPlayback: Start Playback", Debug.LEVEL_INFO);
				// setup sound
				var sound:Sound = new Sound();
				var channel:SoundChannel;

				// make sure the recording hase stopped
				mic.removeEventListener(SampleDataEvent.SAMPLE_DATA, micSampleDataHandler);
				mic.removeEventListener(StatusEvent.STATUS, statusHandler);
				if (timer != null)
				{
					timer.stop();
				}
				// start the playback from 0
				soundBytes.position = 0;
				
				// to trace sample rate
				sound.addEventListener(SampleDataEvent.SAMPLE_DATA, playbackSampleHandler);
				// play
				channel = sound.play();
				channel.addEventListener(Event.SOUND_COMPLETE, playbackCompleteHandler);
				channel.addEventListener(IOErrorEvent.IO_ERROR, errorHandler);
			}
			else
			{
				isRecording = false;
				Debug.trace("Nothing recorded" , Debug.LEVEL_ERROR);
			}
		}

		private function micSampleDataHandler(event:SampleDataEvent):void
		{
			while (event.data.bytesAvailable > 0)
			{
				soundBytes.writeFloat(event.data.readFloat());
			}

		}
		public function stopRecording(event:TimerEvent):void
		{
			isRecording = false;
			Debug.trace("Stopped recorded");
			// recording finished
			if (mic != null)
			{
				mic.removeEventListener(SampleDataEvent.SAMPLE_DATA, micSampleDataHandler);
				mic.removeEventListener(StatusEvent.STATUS, statusHandler);
				if (timer != null)
				{
					timer.stop();
				}

				soundBytes.position = 0;
				if (soundBytes.bytesAvailable > 0)
				{
					Globals.main_display.micClip.gotoAndStop("recorded_ok");
				}
				else
				{
					Globals.main_display.micClip.gotoAndStop("recorded_not_ok");
				}
				//output = myEncoder.encode(soundBytes,1);
				// dispatch custom event
				this.dispatchEvent(finishedRecordingEvent);
			}
		}


		private function playbackSampleHandler(event:SampleDataEvent):void
		{

			for (var i:int = 0; i < 8192 && soundBytes.bytesAvailable > 0; i++)
			{
				var sample:Number = soundBytes.readFloat();
				event.data.writeFloat(sample);
				event.data.writeFloat(sample);
			}
		}

		private function playbackCompleteHandler( event:Event ):void
		{
			Debug.trace( "playbackCompleteHandler: Playback finished.", Debug.LEVEL_INFO);
			this.dispatchEvent(finishedPlaybackEvent);
			soundBytes.position = 0;
			if (soundBytes.bytesAvailable > 0)
			{
				Globals.main_display.micClip.gotoAndStop("recorded_ok");
			}
			else
			{
				Globals.main_display.micClip.gotoAndStop("recorded_not_ok");
			}
		}

		private function errorHandler( event:Event ):void
		{
			Debug.traceObj(  event, 10, Debug.LEVEL_ERROR);

		}

		public function onSkip():void
		{
			// TODO: skip
		}
		private function statusHandler(evt:StatusEvent):void
		{
			Debug.trace("Microphone is muted?: " + mic.muted, Debug.LEVEL_INFO);
			switch (evt.code)
			{
				case "Microphone.Unmuted" :


					Debug.trace("Microphone access was allowed.", Debug.LEVEL_INFO);
					Globals.mic_allowed = true;
					Debug.trace("Microphone is muted?: " + mic.muted, Debug.LEVEL_INFO);
					if (isRecording == true)
					{
						Globals.main_display.micClip.gotoAndStop("recording");

					}
					else
					{
						Globals.main_display.micClip.gotoAndStop("ok");
					}
					break;
				case "Microphone.Muted" :
					if (isRecording == true)
					{
						Globals.main_display.micClip.gotoAndStop("not_ok");

					}
					else
					{
						Globals.main_display.micClip.gotoAndStop("not_ok");
					}

					Debug.trace("Microphone access was denied.",Debug.LEVEL_WARN);
					Globals.mic_allowed = false;
					Debug.trace("Microphone is muted?: " + mic.muted, Debug.LEVEL_INFO);
					if (alertDone == false)
					{
						//Alert.init(Globals.main_display.stage);
						//Alert.show("Microphone access was denied or the microphone is muted. The voice recording will not work",{buttons:["OK"]});
						//Security.showSettings();
						//alertDone = true;
					}
					break;
			}
		}
	}
}