package com.studywiz.interfaces
{

	import flash.display.DisplayObject;

	public interface SwMedia
	{

		// Interface methods:
		function init(xml:XMLList,willDisplayLoader:Boolean=false):void;
		function get nextAction():String;
		function set nextAction(newID:String):void;
		function get sprite():DisplayObject;
		function get mediaDuration():uint;
		function mediaStart():void;
		function mediaStop():void;
		function mediaPause():void;

	}

}