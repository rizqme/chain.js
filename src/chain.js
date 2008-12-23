/**
 * Chain Binding Service.
 * Method to activate the chaining / element rendering service.
 * 
 * @alias chain
 * 
 * @syntax $(selector).chain(parameters);
 */ 

(function($){

/**
 * Chain Binding Service Object - Providing methods of @chain@.
 * All method listed here can only be used internally
 * using @jQuery.Chain.service@ or @jQuery.Chain.extend@
 * 
 * @namespace
 * 
 * @alias jQuery.Chain.services.chain
 * 
 * @see jQuery.Chain.service
 * @see jQuery.Chain.extend
 */ 

$.Chain.service('chain', {
	/**
	 * Initializer. Executed once at the first time @chain@ invoked.
	 * 
	 * @alias jQuery.Chain.services.chain.init
	 * 
	 * @see jQuery.Chain.service
	 */ 
	init: function()
	{
		this.anchor = this.element;
		this.template = this.anchor.html();
		this.tplNumber = 0; // At Default it uses the first template.
		this.builder = this.createBuilder();
		this.plugins = {};
		this.isActive = false;
		this.destroyers = [];
		
		// Add class 'chain-element' as identifier
		this.element.addClass('chain-element');
	},
	
	/**
	 * Default handler.
	 * 
	 * @alias jQuery.Chain.services.chain.handler
	 * 
	 * @param {Object} obj Object to be handled
	 * 
	 * @return {Object} jQuery Object
	 * 
	 * @see jQuery.Chain.service
	 * @see jQuery.Chain.services.chain.handleUpdater
	 * @see jQuery.Chain.services.chain.handleBuilder
	 */ 
	handler: function(obj, bool)
	{
		// Backup items and item, all items will be stored in Buffer
		this.element.items('backup');
		this.element.item('backup');
		
		if(typeof obj == 'object')
			{this.handleUpdater(obj);}
		else if(typeof obj == 'function')
			{this.handleBuilder(obj, bool);}
		
		// Empty element, if @item@ it will filled again later
		this.anchor.empty();
		
		this.isActive = true;
		this.element.update();
		
		return this.element;
	},
	
	/**
	 * Updater Handler.
	 * If you pass an object to @chain@, it will treated as a updater object.
	 * The updater is a hash of selector and value string:
	 * like @chain({'my css selector': 'My Content String'})@
	 * or @chain({'my css selector': {attributes}})@
	 * 
	 * @alias chain(updater)
	 * @alias jQuery.Chain.services.chain.handleUpdater
	 * 
	 * @param {Object} rules Updater rules to be parsed
	 * 
	 * @example Usage
	 * $(selector)
	 * 		.chain({
	 * 			// Items anchor, where the Item iteration should be placed
	 * 			anchor: anchor,
	 * 			// If true, the default updater is overridden
	 * 			override: false, 
	 * 			// Use custom builder
	 * 			builder: function(){},
	 * 			// Update the element self
	 * 			self: "This is my {data}",
	 * 			// Use css selector to update child element
	 * 			'.element.selector': "Using String Updater",
	 * 			// Use Function as updater
	 * 			'.element.selector': function(data, el){},
	 * 			// Updating Attributes
	 * 			'.element.selector': {
	 * 				attribute1: "{attribute}",
	 * 				className: "{className}",
	 * 				content: "This is the {content}",
	 * 				value: "This is the {value}"
	 * 			}
	 * 		});
	 * 
	 * @example Using Default Updater
	 * $('<div><span class="name">Name</span></div>')
	 * 		.item({name: 'Steve Jobs'})
	 * 		.chain()
	 * 		.appendTo(document.body);
	 * 
	 * @example Using Custom Updater
	 * $('<div><div class="name"><span class="first">First</span> <span class="last">Last</span></div></div>')
	 * 		.item({first:'Steve', last:'Jobs'})
	 * 		.chain({
	 * 			'.name .first': {
	 * 				style: 'color: blue;',
	 * 				content: 'First Name: {first}'
	 * 			},
	 * 			'.name .last': 'Family Name: {last}'
	 * 		})
	 * 		.appendTo(document.body);
	 * 
	 * @example Attach Builder Inside Updater
	 * $('<div><div class="name">Name</div><div class="address">Address</div></div>')
	 * 		.item({name:'Steve Jobs', address:'Cupertino'})
	 * 		.chain({
	 * 			builder: function(){
	 * 				var data = this.item();
	 * 				this.find('.name').click(function(){alert(data.name)});
	 * 				this.find('.address').mouseout(function(){alert(data.address)});
	 * 			},
	 * 			'.name': '{name}',
	 * 			'.address': '{address}'
	 * 		})
	 * 		.appendTo(document.body);
	 */ 
	handleUpdater: function(rules)
	{
		// Extract Builder
		var builder = rules.builder;
		delete rules.builder;
		
		// Extract Options
		this.options = rules.options || {};
		delete rules.options;
		
		// Extract Anchor
		if(rules.anchor)
			{this.setAnchor(rules.anchor);}
		delete rules.anchor;
		
		// Extract Override
		var override = rules.override;
		delete rules.override;
	
		for(var i in rules)
		{
			// Parse String to Function
			if(typeof rules[i] == 'string')
			{
				rules[i] = $.Chain.parse(rules[i]);
			}
			// Parse Attributes Object to Functions
			else if(typeof rules[i] == 'object')
			{
				for(var j in rules[i])
				{
					if(typeof rules[i][j] == 'string')
					{
						rules[i][j] = $.Chain.parse(rules[i][j]);
					}
				}
			}
		}
	
		// Create Updater
		var fn = function(event, data)
		{
			var el, val;
			var self = $(this);
			for(var i in rules)
			{
				// If self, update the element itself
				if(i == 'self')
					{el = self;}
				// Otherwise find element inside self
				else
					{el = $(i, self);}
				
				// Executing
				// If no attributes, put the result to html (value if input)
				if (typeof rules[i] == 'function')
				{
					val = rules[i].apply(self, [data, el]);
					if(typeof val == 'string')
						{el.not(':input').html(val).end().filter(':input').val(val);}
				}
				// If attributes, then execute the function for each attr.
				else if(typeof rules[i] == 'object')
				{
					for(var j in rules[i])
					{
						if (typeof rules[i][j] == 'function')
						{
							val = rules[i][j].apply(self, [data, el]);
							if(typeof val == 'string')
							{
								// Some special attributes
								if(j == 'content')
									{el.html(val);}
								else if(j == 'text')
									{el.text(val);}
								else if(j == 'value')
									{el.val(val);}
								else if(j == 'class' || j == 'className')
									{el.addClass(val);}
								// Otherwise fill attribute as normal
								else
									{el.attr(j, val);}
							}
							
						}
					}
				}
			}
		};
		
		var defBuilder = this.defaultBuilder;
		
		// Define Builder
		this.builder = function(root)
		{
			if(builder)
				{builder.apply(this, [root]);}
			
			if(!override)
				{defBuilder.apply(this);}
			
			// Here goes the updater
			this.update(fn);
			
			// This prevent infinite recursion
			// see: jQuery.Chain.services.item.build
			return false;
		};
	},
	
	/**
	 * Builder Handler.
	 * If you pass a function to @chain@, it will be handled 
	 * as @{builder: function}@, enabling you to use the default
	 * updater while customizing the events etc.
	 * 
	 * @alias chain(fn)
	 * @alias jQuery.Chain.services.chain.handleBuilder
	 * 
	 * @param {Function} fn Builder Function
	 * @param {Boolean} bool If true, it just use the builder provided. Not creating new Builder
	 * 
	 * @example
	 * $('<div><div class="name">Name</div><div class="address">Address</div></div>')
	 * 		.item({name:'Steve Jobs', address:'Cupertino'})
	 * 		.chain(function(){
	 * 			this.bind('click', function(){
	 * 				var data = this.item();
	 * 				alert('name:'+data.name+', address:'+data.address);
	 * 			});
	 * 			
	 * 			// if you return false, default builder wont be executed
	 * 			// You don't have to return true;
	 * 			return true;
	 * 		})
	 * 		.appendTo(document.body);
	 * 
	 * @see jQuery.Chain.services.chain.handleUpdater
	 * @see jQuery.Chain.services.chain.createBuilder
	 */ 
	handleBuilder: function(fn, bool)
	{
		if(bool)
			{this.builder = fn;}
		else
			{this.builder = this.createBuilder(fn);}
	},
	
	
	/**
	 * Default Builder - Automatic Data filler
	 * 
	 * @alias jQuery.Chain.services.chain.defaultBuilder
	 * 
	 * @param {Function} 	builder 	Builder Function
	 * @param {Object}		root		Root Element Object
	 * 
	 * @see jQuery.Chain.services.chain.createBuilder
	 */ 
	defaultBuilder: function(builder, root)
	{
		// Caution:
		// @this@ is in this function @this.element@
		
		// if builder return false, res will be false
		// Otherwise true
		// Using this, the default updater can be disabled
		var res = builder ? (builder.apply(this, [root]) !== false) : true;
		
		// Default Updater
		if(res)
		{
			this.bind('update', function(event, data){
				var self = $(this);
				// Iterate through data
				// Find element with the same class as data property
				// Insert data depending of elemen type
				for(var i in data)
				{	
					if(typeof data[i] != 'object' && typeof data[i] != 'function')
					{
						// This prevents selector to select inside nested chain-element
						// Important to support recursion & nested element
						// NEED OPTIMIZATION
						self.find('> .'+i+', *:not(.chain-element) .'+i)
							.each(function(){
								var match = $(this);
								if(match.filter(':input').length)
									{match.val(data[i]);}
								else if(match.filter('img').length)
									{match.attr('src', data[i]);}
								else
									{match.html(data[i]);}
							});
					}
				}
			});
		}
	},
	
	/**
	 * Builder Generator (Wrapper).
	 * 
	 * @alias jQuery.Chain.services.chain.createBuilder
	 * 
	 * @param {Function} builder Builder
	 * 
	 * @return {Function} Wrapped Builder
	 * 
	 * @see jQuery.Chain.services.chain.defaultBuilder;
	 */ 
	createBuilder: function(builder)
	{
		var defBuilder = this.defaultBuilder;
		return function(root){
			defBuilder.apply(this, [builder, root]);
			return false;
		};
	},
	
	/**
	 * Set Anchor (Container for @items@ to be populated, default: @this.element@)
	 * 
	 * @alias jQuery.Chain.services.chain.setAnchor
	 * 
	 * @param {Object} anchor Anchor element
	 * 
	 * @see jQuery.Chain.services.chain.$anchor
	 */ 
	setAnchor: function(anchor)
	{
		this.anchor.html(this.template);
		this.anchor = anchor == this.element ? anchor : this.element.find(anchor).eq(0);
		this.template = this.anchor.html();
		this.anchor.empty();
	},
	
	/**
	 * Set new Anchor and rerender if new anchor passed.
	 * Otherwise return current anchor.
	 * 
	 * If you use @items()@ with @chain()@,
	 * you can use @chain('anchor', selector)@ to move the element,
	 * where the items will be generated.
	 * 
	 * @alias chain('anchor')
	 * @alias jQuery.Chain.services.chain.$anchor
	 * 
	 * @param {Object} anchor Anchor element or selector
	 * 
	 * @return {Object} current element (if new Anchor passed), otherwise current anchor
	 * 
	 * @example
	 * $('#persons').chain('anchor', '.wrapper');
	 * 
	 * // Define Anchor directly while building
	 * $('#persons').items([...]).chain({anchor:'.wrapper', builder: ...});
	 */ 
	$anchor: function(anchor)
	{
		if(anchor)
		{
			this.element.items('backup');
			this.element.item('backup');
			
			this.setAnchor(anchor);
			this.element.update();
			
			return this.element;
		}
		else
		{
			return this.anchor;
		}
	},
	
	/**
	 * Getting/Switching Template.
	 * 
	 * @alias chain('template')
	 * @alias jQuery.Chain.services.chain.$template
	 * 
	 * @param {Number, String} arg Argument
	 * 
	 * @return {Object} jQuery Object
	 * 
	 * @example
	 * $(selector).chain('template') // Returns current Template (jQuery Object)
	 * $(selector).chain('template', 'raw') // Returns raw HTML Templates (all)
	 * $(selector).chain('template', nr) // Switch to template nr (read: Number)
	 * $(selector).chain('template', '.tree-column') // Switch by selector
	 */ 
	$template: function(arg)
	{
		// Returns current Template (jQuery Object)
		if(!arguments.length)
			{return $('<div>').html(this.template).children().eq(this.tplNumber);}
		
		// Returns raw HTML Template
		if(arg == 'raw')
			{return this.template;}
		
		// Switch template by Number
		if(typeof arg == 'number')
		{
			this.tplNumber = arg;
		}
		// Switch template by selector
		else
		{
			var tpl = $('<div>').html(this.template).children();
			var node = tpl.filter(arg).eq(0);
			
			if(node.length)
				{this.tplNumber = tpl.index(node);}
			else
				{return this.element;} // If not found do nothing
		}
		
		this.element.items('backup');
		this.element.item('backup');
		this.element.update();
		
		return this.element;
	},
	
	/**
	 * Get/Change Builder.
	 * If you don't pass any argument, it will return the created builder.
	 * 
	 * @alias chain('builder')
	 * @alias jQuery.Chain.services.chain.$builder
	 * 
	 * @param {Function, Object} builder (Optional)
	 * 
	 * @return {Function, Object} returns builder function, or jQuery Object depends on arg
	 * 
	 * @example
	 * $('#el').chain('builder') // returns builder function
	 * $('#el').chain('builder', newBuilder) // Replace Builder
	 */ 
	$builder: function(builder)
	{
		if(builder)
			{return this.handler(builder);}
		else
			{return this.builder;}
	},
	
	/**
	 * Check status
	 * 
	 * @alias chain('active')
	 * @alias jQuery.Chain.services.chain.$active
	 * 
	 * @return {Boolean} true if active
	 */ 
	$active: function()
	{
		return this.isActive;
	},
	
	/**
	 * Set/Get options
	 * 
	 * @alias chain('options')
	 * @alias jQuery.Chain.services.chain.$options
	 * 
	 * @param {String} opt Option name
	 * @param {Anything} val Option value
	 * 
	 * @return {Object} if no value given, it returns the value, otherwise the element itself
	 */ 
	
	$options: function(opt, val)
	{
		this.options = this.options || {};
		
		if(arguments.length == 2)
		{
			this.options[opt] = val;
			return this.element;
		}
		
		else
		{
			return this.options[opt];
		}
	},
	
	/**
	 * Add/Remove Plugins that extend builder
	 * 
	 * @alias chain('plugin')
	 * @alias jQuery.Chain.services.chain.$plugin
	 * 
	 * @param {String} 				name 	Plugin Name
	 * @param {Function, Boolean} 	fn 		Plugin Function / False to remove
	 * 
	 * @return {Object} jQuery Object
	 */ 
	$plugin: function(name, fn)
	{
		if(fn === null)
			{delete this.plugins[name];}
		else if(typeof fn == 'function')
			{this.plugins[name] = fn;}
		else if(name && !fn)
			{return this.plugins[name];}
		else
			{return this.plugins;}
		
		if(typeof fn == 'function')
		{
			this.element.items(true).each(function(){
				var self = $(this);
				fn.call(self, self.item('root'));
			});
		}
		
		this.element.update();
		
		return this.element;
	},
	
	/**
	 * Clone Element unchained, with ID removed.
	 * 
	 * @alias chain('clone')
	 * @alias jQuery.Chain.services.chain.$clone
	 * 
	 * @return {Object} jQuery Object containing cloned Element
	 */ 
	$clone: function()
	{
		var id = this.element.attr('id');
		this.element.attr('id', '');
		
		var clone = this.element.clone().empty().html(this.template);
		this.element.attr('id', id);
		
		return clone;
	},
	
	/**
	 * Destroy Chain, restore Element to previous condition.
	 * 
	 * @alias chain('destroy')
	 * @alias jQuery.Chain.services.chain.$destroy
	 * 
	 * @param {Boolean} nofollow If true, it won't destroy nested chain elements
	 * 
	 * @return {Object} jQuery Object
	 */ 
	$destroy: function(nofollow)
	{
		this.element.removeClass('chain-element');
		
		if(!nofollow)
		{
			// Backup to buffer
			this.element.items('backup');
			this.element.item('backup');
			
			// Destroy nested elements
			this.element.find('.chain-element').each(function(){
				$(this).chain('destroy', true);
			});
		}
		
		// Trigger destroy event
		this.element.triggerHandler('destroy');
	
		this.isActive = false;
	
		// Restore HTML
		this.anchor.html(this.template);
		
		return this.element;
	}
});
	
})(jQuery);