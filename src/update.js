(function($){

/**
 * Chain Update Service
 * 
 * @alias update
 * 
 * @usage
 * $(selector).update(parameters);
 * 
 */ 
$.Chain.service('update', {
	handler: function(opt)
	{
		if(typeof opt == 'function')
			return this.bind(opt);
		else
			return this.trigger(opt);
	},
	
	/**
	 * If you pass a function to update, it will bind it to the update event.
	 * just like jQuery’s @click()@ or @mouseover()@.
	 * 
	 * @alias update(fn)
	 * 
	 * @param {Function} fn Listener
	 * 
	 * @example
	 * // assuming #person is already chained
	 * $('#person').update(function{
	 * 		alert($(this).item().name);
	 * });
	 * 
	 * $('#person').item({name: 'Rizqi'})
	 * 
	 * @return {Object} jQuery Object
	 */ 
	bind: function(fn)
	{
		return this.element.bind('update', fn);
	},
	
	/**
	 * If no argument or "hard" is passed,
	 * it will update the elementand trigger the update event.
	 * 
	 * @alias update(opt)
	 * 
	 * @param {String} opt If 'hard', it will update each of items
	 * 
	 * @example
	 * $('#person').update();
	 * 
	 * @return {Object} jQuery Object
	 * 
	 */ 
	trigger: function(opt)
	{
		this.element.items('update');
		this.element.item('update');
		
		this.element.triggerHandler('preupdate', this.element.item());
		
		if(opt == 'hard')
			this.element.items(true).each(function(){$(this).update();});
		
		this.element.triggerHandler('update', this.element.item());
		
		return this.element;
	}
});
	
})(jQuery);