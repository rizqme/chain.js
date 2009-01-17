/**
 * Usage:
 * $(element).items('serialize');
 */ 
(function($){
	
	var JSON = {
		serializeDate: function(date) {
			var f = function(n){
				return n < 10 ? '0' + n : n;
			};
			
			var d = date.getUTCFullYear() 	+ '-' +
				f(date.getUTCMonth() + 1) 	+ '-' +
				f(date.getUTCDate())		+ 'T' +
				f(date.getUTCHours())		+ ':' +
				f(date.getUTCMinutes())		+ ':' +
				f(date.getUTCSeconds())		+ 'Z';
			
			return JSON.serializeString(d);
		},
		
		serializeString: function(string) {
			var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
			var meta = {'\b': '\\b','\t': '\\t','\n': '\\n','\f': '\\f','\r': '\\r','"' : '\\"','\\': '\\\\'};
			escapable.lastIndex = 0;
			return escapable.test(string) ?
				'"' + string.replace(escapable, function (a) {
					var c = meta[a];
					return typeof c === 'string' ? c :
						'\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
				}) + '"' :
				'"' + string + '"';
		},
		
		serializeNumber: function(number) {
			return number.toString();
		},
		
		serializeNull: function(nll) {
			return 'null';
		},
		
		serializeBoolean: function(bool) {
			return bool.toString();
		},
		
		serializeUndefined: function(und) {
			return 'null';
		},
		
		serializeObject: function(object) {
			var result = [];
			for(i in object)
			{
				if(object.hasOwnProperty(i))
				{
					result.push([JSON.serializeString(i), JSON.serialize(object[i])].join(':'));
				}
			}
			
			return '{' + result.join(', ') + '}';
		},
		
		serializeArray: function(array) {
			var result = [];
			for(var i=0; i<array.length; i++)
			{
				result.push(JSON.serialize(array[i]));
			}
			
			return '[' + result.join(', ') + ']';
		},
		
		serialize: function(object) {
			return (object === null)?
				JSON.serializeNull(object)
			:(typeof object == 'undefined')?
				JSON.serializeUndefined(object)
			:(typeof object == 'boolean')?
				JSON.serializeBoolean(object)
			:(typeof object == 'number')?
				JSON.serializeNumber(object)
			:(typeof object == 'string')?
				JSON.serializeString(object)
			:(object.getUTCFullYear == Date.prototype.getUTCFullYear)?
				JSON.serializeDate(object)
			:(Object.prototype.toString.call(object) === '[object Array]')?
				JSON.serializeArray(object)
			:(typeof object == 'object')?
				JSON.serializeObject(object)
			:	JSON.serializeNull(object);
		}
	};
	
	$.Chain.extend('items', {
		
		$serialize: function()
		{
			var data = this.$data();
			return JSON.serialize(data);
		}
		
	});
	
})(jQuery);