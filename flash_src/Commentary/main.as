package 
{


	import com.hexagonstar.util.debug.Debug;
	import com.reintroducing.events.CustomEvent;
	

	import flash.external.ExternalInterface;

	import flash.display.Sprite;
	import flash.utils.Timer;
	import flash.text.TextField;
	import com.studywiz.Globals;
	import com.studywiz.units.Commentary;
	import com.studywiz.utils.Utils;
	import flash.events.*;
	import flash.display.LoaderInfo;

	import flash.ui.ContextMenu;
	import flash.events.ContextMenuEvent;
	import flash.ui.ContextMenuItem;
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
			micClip.x = 10;
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


		private function custom_menu():void
		{
			var my_menu:ContextMenu = new ContextMenu  ;
			my_menu.hideBuiltInItems();

			var my_notice = new ContextMenuItem("RideSmart " + Globals.RELEASE_VERSION);

			function reload_params(e:ContextMenuEvent):void
			{
				loadParams();
				Debug.enabled = true;
			}
			my_notice.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT,reload_params);

			my_menu.customItems.push(my_notice);

			contextMenu = my_menu;
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
		private function loadParams():void
		{
			try
			{
				var paramObj:Object = LoaderInfo(this.root.loaderInfo).parameters;
				Debug.trace("Getting from params admin: " + paramObj["admin"]);
				Debug.trace("Getting from params schema : " + paramObj["schema"]);
				Debug.trace("Getting from params debug : " + paramObj["debug"]);

				Globals.is_debug = new Boolean(paramObj["debug"]);

				if (Globals.DEBUG || Globals.is_debug)
				{
					Debug.enabled = true;
				}
				else
				{
					Debug.enabled = false;
				}


				if (paramObj["admin"] == "true")
				{
					Globals.is_admin = true;
				}
				else
				{
					Globals.is_admin = false;
				}

				if (paramObj["schema"] == "R" || paramObj["schema"] == "r")
				{
					Globals.package_schema = "R";
					Debug.trace("OK R");
				}
				else
				{
					Globals.package_schema = "N";
					Debug.trace("Using Default N");
				}

				// DEBUG
				if (Globals.DEBUG_PACKAGE_SCHEMA != null)
				{
					Globals.package_schema = Globals.DEBUG_PACKAGE_SCHEMA;
					Debug.trace("Overriden to N");
				}

				if (Globals.DEBUG_IS_ADMIN == true)
				{
					Globals.is_admin = true;
				}

				Debug.trace("Admin: " + Globals.is_admin);
				Debug.trace("Package: " + Globals.package_schema);
			}
			catch (error:Error)
			{
				Debug.trace(error);
				//    tf.appendText(error);
			}
		}


	}
}