(function($){

/**
 * Chain Namespace
 * 
 * @alias jQuery.Chain
 * @namespace
 */ 	
$.Chain = 
{
	/**
	 * Version Number
	 * 
	 * @alias jQuery.Chain.version
	 * @property {String}
	 */ 
	version: '0.1.9b',
	
	/**
	 * Tag for use in @jQuery.Chain.parse@ (which is used in CustomUpdater).
	 * It is can be altered.
	 * 
	 * @alias jQuery.Chain.tags
	 * @property {Array}
	 */ 
	tag: ['{', '}'],
	
	services: {},
	
	/**
	 * Register a service to the service manager.
	 * 
	 * @alias jQuery.Chain.service
	 * 
	 * @param {String}	name	Service Name
	 * @param {Object}	proto 	Service Object Prototype
	 * 
	 * @example
	 * $.Chain.service('test', {
	 * 		// Default command handler
	 * 		handler: function(option)
	 * 		{
	 * 			// do something
	 * 		},
	 * 		// $(selector).test('what', somearg)
	 * 		$what: function(somearg)
	 * 		{
	 * 			// do something
	 * 		}
	 * });
	 * 
	 * $('#element').test();
	 */ 
	service: function(name, proto)
	{
		this.services[name] = proto;
		
		// Creating jQuery fn module with the service
		$.fn[name] = function(options)
		{
			if(!this.length) return this;
			
			// Create Chain instance
			var instance = this.data('chain-'+name);
			
			// Extract arguments
			var args = Array.prototype.slice.call(arguments, 1);
			
			// Create Instance if it isn't already exist
			if(!instance)
			{
				instance = $.extend({element: this}, $.Chain.services[name]);
				this.data('chain-'+name, instance);
				if(instance.init)
					instance.init();
			}
			
			var result;
			
			// Check whether to execute a command
			if(typeof options == 'string' && instance['$'+options])
				result = instance['$'+options].apply(instance, args);
			
			// Otherwise try to execute default handler
			else if(instance['handler'])
				result = instance['handler'].apply(instance, [options].concat(args));
			
			// Otherwise do nothing
			else
				result = this;
			
			// Remove instance on destroy
			if(options == 'destroy')
				this.removeData('chain-'+name);
			
			return result;
		};
	},

	/**
	 * Extends service functionalities
	 * 
	 * @alias jQuery.Chain.extend
	 * 
	 * @param {String}	name	Service Name
	 * @param {Object}	proto 	Service Object Prototype
	 */ 
	extend: function(name, proto)
	{
		if(this.services[name])
			this.services[name] = $.extend(this.services[name], proto);
	},
	
	/**
	 * Check whether it is a jQuery Object
	 * 
	 * @alias jQuery.Chain.jobject
	 * 
	 * @param {Object} obj Object to be checked
	 * 
	 * @example
	 * $.Chain.jobject($()) // returns true
	 * $.Chain.jobject("test") // returns false
	 * 
	 * @return {Boolean} True or False
	 */ 
	jobject: function(obj)
	{
		return obj && obj.init == $.fn.init;
	},
	
	/**
	 * Check whether two jQuery Collection identic
	 * 
	 * @alias jQuery.Chain.jidentic
	 * 
	 * @param {Object}	j1	jQuery Object
	 * @param {Object}	j2	jQuery Object
	 * 
	 * @example
	 * a = $('div');
	 * b = $('div');
	 * c = $('div.test');
	 * 
	 * (a == b) //returns false
	 * 
	 * $.Chain.jidentic(a, b) // returns true
	 * $.Chain.jidentic(a, c) // returns false
	 * 
	 * @return {Boolean} True or False
	 */ 
	jidentic: function(j1, j2)
	{
		if(!j1 || !j2 || j1.length != j2.length)
			return false;
		
		a1 = j1.get();
		a2 = j2.get();
		
		for(var i=0; i<a1.length; i++)
			if(a1[i] != a2[i])
				return false;
		
		return true;
		
	},
	
	/**
	 * Parse string contained @{something}@ to a Function
	 * that when executed replace those with the data it refers to.
	 * You can change the @{}@ tag by modifying @jQuery.Chain.tag@
	 * 
	 * @param {String} text String
	 * 
	 * @example
	 * var fn = $.Chain.parse("My name is {first} {last}");
	 * fn({first:'Rizqi', last:'Ahmad'}) // returns "My name is Rizqi Ahmad"
	 * 
	 * @return {Function} template string.
	 */ 
	parse: (function()
	{
		var $this = {};
		// Function Closure
		$this.closure =
		[
			'function($data, $el){'
			+'var $text = [];\n'
			+'$text.print = function(text)'
			+'{this.push((typeof text == "number") ? text : ((typeof text != "undefined") ? text : ""));};\n'
			+'with($data){\n',
	
			'}\n'
			+'return $text.join("");'
			+'}'
		];
	
		// Print text template
		$this.textPrint = function(text)
		{
			return '$text.print("'
				+text.split('\\').join('\\\\').split("'").join("\\'").split('"').join('\\"')
				+'");';
		};
	
		// Print script template
		$this.scriptPrint = function(text)
		{
			return '$text.print('+text+');';
		};
		
		$this.parser = function(text){
			var tag = $.Chain.tag;
		
			var opener, closer, closer2 = null, result = [];
	
			while(text){
		
				// Check where the opener and closer tag
				// are located in the text.
				opener = text.indexOf(tag[0]);
				closer = opener + text.substring(opener).indexOf(tag[1]);
		
				// If opener tag exists, otherwise there are no tags anymore
				if(opener != -1){
					// Handle escape. Tag can be escaped with '\\'.
					// If tag is escaped. it will be handled as a normal text
					// Otherwise it will be handled as a script
					if(text[opener-1] == '\\'){
						closer2 = opener+tag[0].length + text.substring(opener+tag[0].length).indexOf(tag[0]);
						if(closer2 != opener+tag[0].length-1 && text[closer2-1] == '\\')
							closer2 = closer2-1;
						else if(closer2 == opener+tag[0].length-1)
							closer2 = text.length;
				
						result.push($this.textPrint(text.substring(0, opener-1)));
						result.push($this.textPrint(text.substring(opener, closer2)));
					}
					else{
						closer2 = null;
						if(closer == opener-1)
							closer = text.length;
				
						result.push($this.textPrint(text.substring(0, opener)));
						result.push($this.scriptPrint(text.substring(opener+tag[0].length, closer)));
					}
					
					text = text.substring((closer2 == null) ? closer+tag[1].length : closer2);
				}
				// If there are still text, it will be pushed to array
				// So we won't stuck in an infinite loop
				else if(text){
					result.push($this.textPrint(text));
					text = '';
				}
			}
	
			return result.join('\n');	
		}
	
	
		/*
		 * Real function begins here.
		 * We use closure for private variables and function.
		 */
		return function($text)
		{
			var $fn;
			try
			{
				eval('$fn = '+ $this.closure[0]+$this.parser($text)+$this.closure[1]);
			}
			catch(e)
			{
				throw "Parsing Error";
				$fn = function(){};
			}
			
			return $fn;
		};
	})()
};
	
})(jQuery);