package com.studywiz
{
	import flash.text.StyleSheet;
	import com.studywiz.utils.Utils;
	import flash.filters.DropShadowFilter;
	import flash.system.Capabilities;

	public class Globals
	{
		private static const _RELEASE_VERSION:String="140315-b02";	
		//----------------------------------------------------
		
		
		
		private static var _main_display:Object;		
		private static var _mic_allowed:Boolean = false;
		
		
		
		public static function get main_display():Object
		{
			return _main_display;
		}
		
		public static function set main_display(value:Object):void
		{
			_main_display = value;
		}
		
		
		
		
		public static function get mic_allowed():Boolean
		{
			return _mic_allowed;
		}
		
		public static function set mic_allowed(value:Boolean):void
		{
			_mic_allowed = value;
		}	
		
		public static function get RELEASE_VERSION():String
		{
			return _RELEASE_VERSION;
		}
		
	}
	
}