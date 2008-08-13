(function($){

$.Chain.service('update', {
	handler: function(obj)
	{
		if(typeof obj == 'function')
			return this.bind(obj);
		else
			return this.trigger();
	},
	
	bind: function(fn)
	{
		return this.element.bind('update', fn);
	},
	
	trigger: function()
	{
		this.element.items('update');
		this.element.item('update');
		
		this.element.triggerHandler('preupdate', this.element.item());
		this.element.triggerHandler('update', this.element.item());
		
		return this.element;
	}
});
	
})(jQuery);