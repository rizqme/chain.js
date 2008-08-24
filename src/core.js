(function($){
	
$.Chain = 
{
	version: '0.1.9a',
	
	tag: ['{', '}'],
	
	services: {},
	
	service: function(name, proto)
	{
		this.services[name] = proto;
		
		$.fn[name] = function(options)
		{
			if(!this.length) return this;
			
			var instance = this.data('chain-'+name);
			var args = Array.prototype.slice.call(arguments, 1);
			
			if(!instance)
			{
				instance = $.extend({element: this}, $.Chain.services[name]);
				this.data('chain-'+name, instance);
				if(instance.init)
					instance.init();
			}
			
			var result;
			
			if(typeof options == 'string' && instance['$'+options])
				result = instance['$'+options].apply(instance, args);
			else if(instance['handler'])
				result = instance['handler'].apply(instance, [options].concat(args));
			else
				result = this;
			
			if(options == 'destroy')
				this.removeData('chain-'+name);
			
			return result;
		};
	},
	
	extend: function(name, proto)
	{
		if(this.services[name])
			this.services[name] = $.extend(this.services[name], proto);
	},
	
	jobject: function(obj)
	{
		return obj && obj.init == $.fn.init;
	},
	
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
	
	parse: (function()
	{
		// Function Closure
		var closure =
		[
			'var $text = [];\n'
			+'$text.print = function(text)'
			+'{this.push((typeof text == "number") ? text : ((typeof text != "undefined") ? text : ""));};\n'
			+'with($data){\n',
	
			'}\nreturn $text.join("");'
		];
	
		// Print text template
		var textPrint = function(text)
		{
			return '$text.print("'
				+text.split('\\').join('\\\\').split("'").join("\\'").split('"').join('\\"')
				+'");';
		};
	
		// Print script template
		var scriptPrint = function(text)
		{
			return '$text.print('+text+');';
		};
	
	
		/*
		 * Real function begins here.
		 * We use closure for private variables and function.
		 */
		return function(text)
		{
			// Printing tag
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
					
						result.push(textPrint(text.substring(0, opener-1)));
						result.push(textPrint(text.substring(opener, closer2)));
					}
					else{
						closer2 = null;
						if(closer == opener-1)
							closer = text.length;
					
						result.push(textPrint(text.substring(0, opener)));
						result.push(scriptPrint(text.substring(opener+tag[0].length, closer)));
					}
						
					text = text.substring((closer2 == null) ? closer+tag[1].length : closer2);
				}
				// If there are still text, it will be pushed to array
				// So we won't stuck in an infinite loop
				else if(text){
					result.push(textPrint(text));
					text = '';
				}
			}
		
			var fn;
			// The parsed text will be transformed to a function.
			// Exception handler is handling errors in parsing
			// so, it won't make the whole program crash.
			try{
				fn = new Function('$data, $el', closure[0]+result.join('\n')+closure[1]);
			}catch(e){
				throw 'error in parsing rules';
				fn = function(){};
			}
		
			fn.parsed = true;
		
			return fn;
		};
	})()
};
	
})(jQuery);