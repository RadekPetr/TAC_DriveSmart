package com.studywiz.utils
{
	import flash.display.DisplayObjectContainer;
	import flash.display.DisplayObject;
	import flash.display.LoaderInfo;
	import flash.system.Capabilities;

	public class Utils
	{



		public static function randListFromRange(firstNo:Number, lastNo:Number, num:Number, shuffled:Boolean):Array
		{
			var tempArray:Array = [];
			for (var i:int = firstNo - 1; i < lastNo && num > 0; ++i)
			{
				if (Math.floor(Math.random() * (lastNo - i)) < num)
				{
					tempArray.push(i + 1);
					num--;
				}
			}
			if (shuffled)
			{
				tempArray.sort(function () {
				   return Math.floor(Math.random() * 2) ? true : false;
				  });
			}
			return (tempArray);
		}


		public static function traceDisplayList(container:DisplayObjectContainer, indentString:String = ""):void
		{
			var child:DisplayObject;

			for (var i:uint=0; i <container.numChildren; i++)
			{
				child = container.getChildAt(i);
				trace(indentString, child.parent.name + " " + indentString + " " + child.name);

				if (container.getChildAt(i) is DisplayObjectContainer)
				{
					traceDisplayList(DisplayObjectContainer(child), indentString + "");
				}
			}
		}


		public static function clean(target:Object, parentDisplayObject:Object):void
		{
			if (target != null)
			{
				if (target.parent == parentDisplayObject)
				{
					trace(" ******* REMOVING ******* "  + target.name);
					parentDisplayObject.removeChild(target);
				}
			}
		}

		public static function safelyAddChild(target:Object, parentDisplayObject:Object):void
		{
			clean(target,parentDisplayObject);
			trace("###### Adding " + target.name);
			parentDisplayObject.addChild(target);

		}

		/**
		 * Check if this is a local flash run.
		 *
		 * @return Returns a boolean whether the application is running locally or online.
		 */
		public static function isLocal():Boolean
		{

			trace(Capabilities.playerType);
			if (Capabilities.playerType == "StandAlone" || Capabilities.playerType == "External" || Capabilities.playerType =="Desktop")
			{

				return true;
			}
			else
			{
				return false;

			}
		}
		public static function pushUnique(myArray:Array, a:*):void
		{


			var l:Number = myArray.length;
			var exists:Boolean = false;

			for (var i=0; i<l; i++)
			{
				if (myArray[i] == a)
				{
					exists = true;
				}
			}
			if (! exists)
			{
				myArray.push( a );
			}
		}
		public static function arrConcatUnique(...args):Array
		{
			var retArr:Array = new Array();
			for each (var arg:* in args)
			{
				if (arg is Array)
				{
					for each (var value:* in arg)
					{
						if (retArr.indexOf(value) == -1)
						{
							retArr.push(value);
						}
					}
				}
			}
			return retArr;
		}

		// => allCon => container00;
		// => container00 => clipA
		// => container00 => clipB
		// => container00 => clipC
		// => ClipC => ClipC1
		// => ClipC => ClipC2
		// ...
		/**
		* Linear Array to String
		* @author Radek
		* @version 0.1
		*/
		public static function LinearArrayToString(my_array:Array)
		{
			var my_string:String = "";
			for (var my_counter:Number = 0; my_counter<my_array.length; my_counter++)
			{
				if (typeof (my_array[my_counter]) == "string")
				{
					my_string +=  my_array[my_counter];
				}
				else
				{
					my_string +=  my_array[my_counter];
				}
				if (my_counter < my_array.length - 1)
				{
					my_string +=  ":";
				}
			}
			return my_string;
		}
		/**
		* String to Linear Array
		* @author Radek
		* @version 0.1
		*/
		public static function StringToLinearArray(my_string:String, myDelimiter:String=":")
		{
			var my_tmp_array:Array = my_string.split(myDelimiter);
			var my_array:Array = new Array();
			for (var my_counter:Number = 0; my_counter<my_tmp_array.length; my_counter++)
			{
				if ((my_tmp_array[my_counter]).indexOf("0x") != -1)
				{
					my_array.push(String(my_tmp_array[my_counter]));
				}
				else
				{
					if (isNaN(Number(my_tmp_array[my_counter])))
					{
						my_array.push(String(my_tmp_array[my_counter]));
					}
					else
					{
						my_array.push(Number(my_tmp_array[my_counter]));
					}
				}
			}
			return my_array;
		}
		
		
		
		/**
		* removes Value from an array
		* @author Radek
		* @version 0.1
		*/
		public static function removeValue(my_array:Array, my_object:Object):void
		{
			for (var i:Number = 0; i<my_array.length; i++)
			{
				if (my_array[i] == my_object)
				{
					my_array.splice(i, 1);
				}
			}
		}

		/*
		* @detail: reemplaza rpl donde se encuentre src en str, case sensitive
		* @access: public static
		* @param: src => String => busqda
		* @param: rpl => String => reemplazo
		* @param: str => String
		* @return: String
		*/
		public static function replace(src:String, rpl:String, str:String):String
		{
			return new String(str.split(src).join(rpl));
		}
		/*
		* @detail: reemplaza rpl donde se encuentre src en str, no case sensitive
		* @access: public static
		* @param: src => String => busqda
		* @param: rpl => String => reemplazo
		* @param: str => String
		* @return: String
		*/
		public static function ireplace(src:String, rpl:String, str:String):String
		{
			var srcClon:String = src.toUpperCase();
			var srcLeng:Number = srcClon.length;
			var strClon:String = str.toUpperCase();
			var strLeng:Number = strClon.length;
			var strResult:String = "";
			for (var a:Number = 0; a<strLeng; a++)
			{
				var len:Number = int(a + srcLeng);
				if (strClon.substring(a,len) == srcClon)
				{
					strResult +=  rpl;
					a = len - 1;
				}
				else
				{
					strResult +=  str.charAt(a);
				}
			}
			return strResult;
		}
		/*
		* @detail: generate a random number within the range
		* @access: public static
		* @param: min => Number => minimum
		* @param: max => Number => maximum
		* @return: Number
		*/
		public static function randRange(min:Number, max:Number):Number
		{
			var randomNum:Number = Math.floor(Math.random()*(max-min+1))+min;
			return randomNum;
		}

		/*
		* @detail: some tracing util
		* @access: public static
		*/
		public static function trace2()
		{
			trace(arguments.join(" : "));
		}


	}

}