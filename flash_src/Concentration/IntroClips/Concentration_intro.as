package {
	import flash.display.MovieClip;
	import flash.external.ExternalInterface;
	import flash.ui.ContextMenu;
	import flash.events.ContextMenuEvent;
	import flash.ui.ContextMenuItem;
	import flash.system.Security;
	import flash.system.SecurityPanel;
	import flash.system.SecurityDomain;
	import flash.utils.Timer;
	import flash.events.*;


	public class Concentration_intro extends MovieClip {

		public function Concentration_intro() {

			Security.allowDomain("*");
			if (ExternalInterface.available) {
				try {
					ExternalInterface.addCallback("startSwiff", startIntro);
					
					if (checkJavaScriptReady()) {
						
						ExternalInterface.call("flashLoaded");
					} else {
						trace("JavaScript is not ready, creating timer.\n");
						var readyTimer:Timer = new Timer(100,0);
						readyTimer.addEventListener(TimerEvent.TIMER, timerHandler);
						readyTimer.start();
					}
				} catch (error:SecurityError) {
					trace("A SecurityError occurred: " + error.message + "\n");
				} catch (error:Error) {
					trace("An Error occurred: " + error.message + "\n");
				}
			} else {
				trace("External interface is not available for this container.");
			}

		}

		public function startIntro(exNumber:Number, exLevel:Number, exFormat:Number):void {
			
			gotoAndPlay(2);
		}

		private function checkJavaScriptReady():Boolean {
			var isReady:Boolean = ExternalInterface.call("jsIsReady");
			return isReady;
		}
		private function timerHandler(event:TimerEvent):void {
			trace("Checking JavaScript status...\n");
			ExternalInterface.call("log", "JavaScript is NOT ready.\n");
			var isReady:Boolean = checkJavaScriptReady();
			if (isReady) {
				trace("JavaScript is ready.\n");
				ExternalInterface.call("log", "JavaScript is ready.\n");
				Timer(event.target).stop();
				ExternalInterface.call("flashLoaded");
			}
		}
	}
}