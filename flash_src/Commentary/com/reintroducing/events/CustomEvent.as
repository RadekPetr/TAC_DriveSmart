package com.reintroducing.events
{
	import flash.events.Event;
	public class CustomEvent extends Event
	{
		public static const DEFAULT_NAME:String = "com.reintroducing.events.CustomEvent";
		public static const ON_TEST_CASE:String = "onTestCase";
		public static const ON_FINISHED_RECORDING = "on.Finished.Recording";
		public static const ON_FINISHED_PLAYBACK = "on.Finished.Playback";
		public static const ON_VIDEO_COMPLETE = "on.Video.Complete";
		public static const ON_VIDEO_READY = "on.Video.Ready";
		public static const ON_VIDEO_REWIND = "on.Video.Rewind";
		public static const ON_VIDEO_STARTED = "on.Video.Started";
		public static const ON_VIDEO_PROGRESS = "on.Video.Progress";
		
		
		
		
		public static const ON_AUDIO_COMPLETE = "on.Audio.Complete";
		public static const ON_MOUSE_DOWN = "on.Mouse.Down";
		public static const ON_MOUSE_DRAGSTART = "on.Mouse.DragStart";
		public static const ON_MOUSE_DRAGSTOP = "on.Mouse.DragStop";
		public static const ON_ANIMATION_COMPLETE = "on.Animation.Complete";
		public static const ON_MODULE_NAVIGATION = "on.Module.Navigation";
		public static const ON_LESSON_NAVIGATION = "on.Lesson.Navigation";
		public static const	ON_DATA_LOADED="on.Data.Loaded";
		public static const ON_CLICKED = "on.Clicked";
		
		public var params:Object;
		
		public function CustomEvent($type:String, $params:Object, $bubbles:Boolean = false, $cancelable:Boolean = false)
		{
			super($type, $bubbles, $cancelable);
			this.params = $params;
		}
		public override function clone():Event
		{
			return new CustomEvent(type, this.params, bubbles, cancelable);
		}
		public override function toString():String
		{
			return formatToString("CustomEvent", "params", "type", "bubbles", "cancelable");
		}
	}
}

/*import com.reintroducing.events.CustomEvent;
 
var evt:CustomEvent = new CustomEvent(CustomEvent.ON_TEST_CASE, {param1: "first param", param2: "second param"});
 
this.addEventListener(CustomEvent.ON_TEST_CASE, doTestCase);
this.dispatchEvent(evt);
       
function doTestCase($e:CustomEvent):void
{
    trace("TYPE: " + $e.type + "\nTARGET: " + $e.target + "\nFIRST CUSTOM PARAM: " + $e.params.param1 + "\nSECOND CUSTOM PARAM: " + $e.params.param2);
    trace($e.toString());
}*/