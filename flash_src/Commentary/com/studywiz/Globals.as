package com.studywiz
{
	import flash.text.StyleSheet;
	import com.studywiz.utils.Utils;
	import flash.filters.DropShadowFilter;
	import flash.system.Capabilities;

	public class Globals
	{
		private static const _RELEASE_VERSION:String="120910-b01";	
		//----------------------------------------------------
		
		// enables the skip buttons  - set by param, can enable skip even when using production values
		private static var _is_debug:Boolean = false;
		
		// ----------- DEBUGGING STUFF -----------------
		/*
		// enables the skip buttons 
		private static const _DEBUG:Boolean = true;
		// enable to have promo played instead of Introduction
		private static const _DEBUG_PROMO:Boolean = false;
		// overwrites is_admin - if false it is set to flashvars or default
		private static const _DEBUG_IS_ADMIN:Boolean = true;
		// overwrites  package_schema possible values "N", "R" and null for default
		private static const _DEBUG_PACKAGE_SCHEMA:String =null;
		*/
		
		
		// -------------PRODUCTION VALUES - un-comment before release !!!!!!!!!!!
		
		// enables the skip buttons 
		private static const _DEBUG:Boolean = false;
		// enable to have promo played instead of Introduction		
		private static const _DEBUG_PROMO:Boolean = false;
		// overwrites is_admin - if false it is set to flashvars or default
		private static const _DEBUG_IS_ADMIN:Boolean = false;
		// overwrites  package_schema possible values "N", "R" and null for default
		private static const _DEBUG_PACKAGE_SCHEMA:String = null;
		
		
		
		private static var _main_display:Object;
		private static var _is_admin:Boolean;
		private static var _package_schema:String;
		private static var _mic_allowed:Boolean = false;

		private static var _save_user_progress_url:String= "";
		private static var _load_user_progress_url:String= "";
		
		private static const _BASE_URL:String;		
		private static const _SAVE_USER_PROGRESS_BASE_URL:String = "/user_progress";
		private static const _LOAD_USER_PROGRESS_BASE_URL:String= "/user_progress";		
		
		
		private static const _STAGE_HEIGHT:uint = 600;
		private static const _STAGE_WIDTH:uint = 800;
		
		private static const _PROMO_FREQUENCY:uint = 9;
		private static const _PROMO_RANDOMNESS:uint = 3;
		
		private static const _DEFAULT_SCORE:Number = 10;		
		
		
		private static const _VIDEO_X:int = 0;
		private static const _VIDEO_Y:int = 0;
		private static const _VIDEO_WIDTH:uint = 800;
		private static const _VIDEO_HEIGHT:uint = 600;
		private static const _VIDEO_PRELOAD_LIMIT:Number = 0.9;
		private static const _VIDEO_INT_WIDTH:uint = 704/2.2;
		private static const _VIDEO_INT_HEIGHT:uint = 576/2.2;
		
		private static const _VIDEO_PROMO_WIDTH:uint = 350;
		private static const _VIDEO_PROMO_HEIGHT:uint = 250;
		
		//
		
		private static const _SCENE_ENTRY:String="entry";
		private static const _SCENE_INSTRUCTONS:String="instructions";
		
		//
		private static const _LEFT_BAR_X_OFF:int = -615;
		private static const _LEFT_BAR_Y:int = 475;
		//public static const LEFT_BAR_X_CO_QUESTIONS:int = -328;
		private static const _LEFT_BAR_X_1_BUTTONS_ON:int = -390;
		private static const _LEFT_BAR_X_2_BUTTONS_ON:int = -330;
		private static const _LEFT_BAR_X_3_BUTTONS_ON:int = -270;
		private static const _LEFT_BAR_SHORT_DELAY:Number = 0.4;		
		private static const _LEFT_BAR_LABEL_X:uint = 100;
		private static const _LEFT_BAR_LED_SPACING:uint = 20;
		
		
		private static const _RIGHT_BAR_X_OFF:int = 840;
		private static const _RIGHT_BAR_X_ON:Number = 600;
		private static const _RIGH_BAR_Y:int = 345;	
		private static const _RIGH_BAR_SINGLE_Y:int = LEFT_BAR_Y;
		private static const _RIGHT_BAR_SHORT_DELAY:Number = 0.4;
		
		private static const _QUESTION_PANEL_X:uint = 20;
		private static const _QUESTION_PANEL_Y:uint = 20;
		private static const _QUESTION_SPACING:uint = 42;
		
		private static const _QUESTION_PANEL_CAMEO_X:uint = 415;
		private static const _QUESTION_PANEL_CAMEO_Y:uint = 3;
		private static const _QUESTION_PANEL_CAMEO_VOLUME:uint = 3;
		
		private static const _QUESTION_PANEL_CAMEO_WIDTH:uint = 375;
		private static const _QUESTION_PANEL_CAMEO_HEIGHT:uint = 295;
		
		public static const PANEL_MODE_SINGLE_SELECT:String = "Single";
		public static const PANEL_MODE_MULTIPLE_SELECT:String = "Multi";
		public static const PANEL_MODE_CAMEO:String = "Cameo";
		
		private static const _DELAY_SHORT:Number = 0.4;
		private static const _DELAY_LONG:Number = 0.8;
		
		private static const _MAX_CLICKS:uint = 5;	
		
		
		public static function get save_user_progress_url():String {
			var schemaString:String = "";
			switch (Globals.package_schema){
				case "N":
					schemaString = "standard";
				break;
				case "R":
					schemaString = "refresher";
				break;
				default:
					schemaString = "standard";
			}
			_save_user_progress_url = Globals.SAVE_USER_PROGRESS_BASE_URL + "/" + schemaString;
			return _save_user_progress_url;
		}
		
		public static function get load_user_progress_url():String {
			var schemaString:String = "";
			switch (Globals.package_schema){
				case "N":
					schemaString = "standard";
				break;
				case "R":
					schemaString = "refresher";
				break;
				default:
					schemaString = "standard";
			}
			if (Utils.isLocal()){
				_load_user_progress_url = Globals.LOAD_USER_PROGRESS_BASE_URL;
			} else {
				_load_user_progress_url = Globals.LOAD_USER_PROGRESS_BASE_URL + "/" + schemaString + "?id=" + Math.random();
			}
			return _load_user_progress_url;
		}
		
		
		public static function get DEBUG_IS_ADMIN():Boolean
		{
			return _DEBUG_IS_ADMIN;
		}
		
		public static function get DEBUG_PACKAGE_SCHEMA():String
		{
			return _DEBUG_PACKAGE_SCHEMA;
		}	
		
		
		
		public static function get DEFAULT_SCORE():Number
		{
			return _DEFAULT_SCORE;
		}
		
		
		
		public static function get PROMO_FREQUENCY():uint
		{
			return _PROMO_FREQUENCY;
			
		}
		public static function get PROMO_RANDOMNESS():uint
		{
			return _PROMO_RANDOMNESS;
		}
		
		public static function get QUESTION_PANEL_CAMEO_VOLUME():uint
		{
			return _QUESTION_PANEL_CAMEO_VOLUME;
		}
		
		
		
		
		
		public static function get MAX_CLICKS():uint
		{
			return _MAX_CLICKS;
		}
		
		public static function get DELAY_LONG():Number
		{
			return _DELAY_LONG;
		}
		
		public static function get DELAY_SHORT():Number
		{
			return _DELAY_SHORT;
		}
		
		public static function get QUESTION_SPACING():uint
		{
			return _QUESTION_SPACING;
		}
		
		public static function get QUESTION_PANEL_Y():uint
		{
			return _QUESTION_PANEL_Y;
		}
		
		public static function get QUESTION_PANEL_X():uint
		{
			return _QUESTION_PANEL_X;
		}
		
		public static function get QUESTION_PANEL_CAMEO_Y():uint
		{
			return _QUESTION_PANEL_CAMEO_Y;
		}
		
		public static function get QUESTION_PANEL_CAMEO_X():uint
		{
			return _QUESTION_PANEL_CAMEO_X;
		}
		
		public static function get QUESTION_PANEL_CAMEO_WIDTH():uint
		{
			return _QUESTION_PANEL_CAMEO_WIDTH;
		}
		
		public static function get QUESTION_PANEL_CAMEO_HEIGHT():uint
		{
			return _QUESTION_PANEL_CAMEO_HEIGHT;
		}
		
		public static function get RIGHT_BAR_SHORT_DELAY():Number
		{
			return _RIGHT_BAR_SHORT_DELAY;
		}
		
		public static function get RIGH_BAR_SINGLE_Y():int
		{
			return _RIGH_BAR_SINGLE_Y;
		}
		
		public static function get RIGH_BAR_Y():int
		{
			return _RIGH_BAR_Y;
		}
		
		public static function get RIGHT_BAR_X_ON():Number
		{
			return _RIGHT_BAR_X_ON;
		}
		
		public static function get RIGHT_BAR_X_OFF():int
		{
			return _RIGHT_BAR_X_OFF;
		}
		
		public static function get LEFT_BAR_LED_SPACING():uint
		{
			return _LEFT_BAR_LED_SPACING;
		}
		
		public static function get LEFT_BAR_LABEL_X():uint
		{
			return _LEFT_BAR_LABEL_X;
		}
		
		public static function get LEFT_BAR_SHORT_DELAY():Number
		{
			return _LEFT_BAR_SHORT_DELAY;
		}
		
		public static function get LEFT_BAR_X_3_BUTTONS_ON():int
		{
			return _LEFT_BAR_X_3_BUTTONS_ON;
		}
		
		public static function get LEFT_BAR_X_2_BUTTONS_ON():int
		{
			return _LEFT_BAR_X_2_BUTTONS_ON;
		}
		public static function get LEFT_BAR_X_1_BUTTONS_ON():int
		{
			return _LEFT_BAR_X_1_BUTTONS_ON;
		}
		
		public static function get LEFT_BAR_Y():int
		{
			return _LEFT_BAR_Y;
		}
		
		public static function get LEFT_BAR_X_OFF():int
		{
			return _LEFT_BAR_X_OFF;
		}
		
		public static function get SCENE_INSTRUCTONS():String
		{
			return _SCENE_INSTRUCTONS;
		}
		
		public static function get SCENE_ENTRY():String
		{
			return _SCENE_ENTRY;
		}
		
		public static function get VIDEO_PRELOAD_LIMIT():Number
		{
			return _VIDEO_PRELOAD_LIMIT;
		}
		
		public static function get VIDEO_HEIGHT():uint
		{
			return _VIDEO_HEIGHT;
		}
		public static function get VIDEO_INT_HEIGHT():uint
		{
			return _VIDEO_INT_HEIGHT;
		}
		public static function get VIDEO_PROMO_HEIGHT():uint
		{
			return _VIDEO_PROMO_HEIGHT;
		}
		
		public static function get VIDEO_WIDTH():uint
		{
			return _VIDEO_WIDTH;
		}
		public static function get VIDEO_INT_WIDTH():uint
		{
			return _VIDEO_INT_WIDTH;
		}
		
		public static function get VIDEO_PROMO_WIDTH():uint
		{
			return _VIDEO_PROMO_WIDTH;
		}
		
		public static function get VIDEO_Y():int
		{
			return _VIDEO_Y;
		}
		
		
		
		public static function get main_display():Object
		{
			return _main_display;
		}
		
		public static function set main_display(value:Object):void
		{
			_main_display = value;
		}
		
		public static function get is_admin():Boolean
		{
			return _is_admin;
		}
		
		public static function set is_admin(value:Boolean):void
		{
			_is_admin = value;
		}
		
		
		public static function get mic_allowed():Boolean
		{
			return _mic_allowed;
		}
		
		public static function set mic_allowed(value:Boolean):void
		{
			_mic_allowed = value;
		}
		
		public static function get package_schema():String
		{
			return _package_schema;
		}
		
		public static function set package_schema(value:String):void
		{
			_package_schema = value;
		}
		
		public static function get STAGE_HEIGHT():uint
		{
			return _STAGE_HEIGHT;
		}
		public static function get STAGE_WIDTH():uint
		{
			return _STAGE_WIDTH;
		}
		
		
		public static function get DEBUG():Boolean
		{
			return _DEBUG;
		}
		
		public static function get is_debug():Boolean
		{
			return _is_debug;
		}
		public static function set is_debug(is_Enabled:Boolean):void
		{
			 _is_debug = is_Enabled;
		}
		
		public static function get DEBUG_PROMO():Boolean
		{
			return _DEBUG_PROMO;
		}
		
		public static function get BASE_URL():String{
			if (Utils.isLocal()){
				if (Capabilities.playerType =="Desktop" ){
					//return  "app:/data/" + _package_schema + "/";
					return  "http://tac.studywiz.com/tac/data/" + _package_schema + "/";
				} else {
					return "C:/Users/Radek/Work in progress/Tac_dev/src/data/" + _package_schema + "/";
				}
			} else {
				return "/tac/data/" + _package_schema + "/";
			}
			
		}
		
		public static function get SAVE_USER_PROGRESS_BASE_URL():String{
			return _SAVE_USER_PROGRESS_BASE_URL;
			
		}
		
		public static function get LOAD_USER_PROGRESS_BASE_URL():String{
			if (Utils.isLocal()){
				return Globals.BASE_URL + "xml/user_data.xml";
			} else {
				return _LOAD_USER_PROGRESS_BASE_URL;
			}
			
			
		}
		
		public static function get VIDEO_X():int
		{
			return _VIDEO_X;
		}
		
		public static function get RELEASE_VERSION():String
		{
			return _RELEASE_VERSION;
		}
		
	}
	
}