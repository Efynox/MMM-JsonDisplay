
Module.register('MMM-JsonDisplay', {
	defaults: {
		url: 'https://fr.openfoodfacts.org/api/v0/produit/3029330003533.json',
		fields: ['code', 'status'],
		updateInterval: 10 * 60 * 1000, // every 10 minutes
		initialLoadDelay: 0,
		animationSpeed: 1000,
	},

	getDom: function () {
		var wrapper = document.createElement('div');

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		
		var list = document.createElement("ul");
		for (var index = 0; index < this.config.fields.length; index++) {
			var element = this.config.fields[index];
			
			var listItem = document.createElement("li");
			listItem.innerHTML = this.data[element];
			list.appendChild(listItem);
		}

		wrapper.appendChild(list);
		return wrapper;
	},

	start: function () {
		Log.info('Starting module: ' + this.name);
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);
	},

	/* scheduleUpdate()
	* Schedule next update.
	*
	* argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	*/
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== 'undefined' && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function() {
			self.update();
		}, nextLoad);
	},

	update: function() {
		Log.info('MMM-JsonDisplay: load');
		if (this.config.url === '') {
			Log.error('MMM-JsonDisplay: url service not set!');
			return;
		}

		var self = this;
		var retry = true;

		var request = new XMLHttpRequest();
		request.open("GET", this.config.url, true);
		request.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} 
				else if (this.status === 401) {
					Log.error(self.name + ": Incorrect APPID.");
					retry = true;
				} else {
					Log.error(self.name + ": Could not load data.");
				}

				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		request.send();
	},

	processData: function(data) {
		this.data = data;
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

});