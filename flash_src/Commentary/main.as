package 
{


	import com.hexagonstar.util.debug.Debug;
	import com.reintroducing.events.CustomEvent;
	import flash.external.ExternalInterface;
	import flash.display.Sprite;
	import flash.utils.Timer;
	import com.studywiz.Globals;
	import com.studywiz.units.Commentary;
	import com.studywiz.utils.Utils;
	import flash.events.*;
	import flash.system.Security;
    import flash.system.SecurityPanel;
	import flash.system.SecurityDomain;
	import flash.display.MovieClip;




	public class main extends Sprite
	{
		public var commentary:Commentary;
		public var micClip:MovieClip;

		public function main()
		{
			Globals.main_display = this;
			Debug.trace("Version: " + Globals.RELEASE_VERSION,Debug.LEVEL_INFO);

			Security.allowDomain("*");
			if (ExternalInterface.available)
			{
				try
				{

					ExternalInterface.addCallback("recordStart", startRecorder);
					ExternalInterface.addCallback("playBack", playBack);
					ExternalInterface.addCallback("recordStop", stopRecording);

					if (checkJavaScriptReady())
					{
						Debug.trace("JavaScript is ready.\n");
						ExternalInterface.call("flashLoaded");
					}
					else
					{
						Debug.trace("JavaScript is not ready, creating timer.\n");
						var readyTimer:Timer = new Timer(100,0);
						readyTimer.addEventListener(TimerEvent.TIMER, timerHandler);
						readyTimer.start();
					}
				}
				catch (error:SecurityError)
				{
					Debug.trace("A SecurityError occurred: " + error.message + "\n");
				}
				catch (error:Error)
				{
					Debug.trace("An Error occurred: " + error.message + "\n");
				}
			}
			else
			{
				Debug.trace("External interface is not available for this container.");
			}
			
			micClip = new mc_Mic();
			micClip.id = "micClip";
			micClip.x = 520;
			micClip.y =10;
			
			Globals.main_display.addChild (micClip);
			commentary = new Commentary;

			
			//loadParams();
			//custom_menu();

			

		}
		public function startRecorder():void
		{
			Debug.trace("Started recorder");
			commentary.startRecorder();
			//ExternalInterface.call("load");
			//ExternalInterface.call("onLoad");
		}

		public function stopRecording():void
		{
			Debug.trace("Stopped recorder");
			commentary.stopRecorder();
			
			//commentary.playBack();
		}

		public function playBack():void
		{
			Debug.trace("Playback");
			commentary.playBack();
			//ExternalInterface.call("load");
			//ExternalInterface.call("onLoad");
		}


		
		private function checkJavaScriptReady():Boolean
		{
			var isReady:Boolean = ExternalInterface.call("jsIsReady");
			return isReady;
		}
		private function timerHandler(event:TimerEvent):void
		{
			Debug.trace("Checking JavaScript status...\n");
			var isReady:Boolean = checkJavaScriptReady();
			if (isReady)
			{
				Debug.trace("JavaScript is ready.\n");
				Timer(event.target).stop();
				ExternalInterface.call("flashLoaded");
			}
		}

	}
}