(function (window){

    var Sakri = window.Sakri || {};
    window.Sakri = window.Sakri || Sakri;

	Sakri.ImageStore = function(){};
		
	Sakri.ImageStore.prototype.loadImages = function(urls, completeCallback, updateCallback){
		this.urls = urls;
		this.completeCallback = completeCallback;
		this.updateCallback = updateCallback != undefined ? updateCallback : undefined;
		this.images = [];
		this.currentLoadIndex = 0;
		this.loadNextImage();
	};

	Sakri.ImageStore.prototype.stop = function(){
		this.completeCallback = undefined;
		this.updateCallback = undefined;
		this.urls = [];
	};
	
	Sakri.ImageStore.prototype.getProgressPercent = function(){
		return BCHWMathUtil.normalize(this.currentLoadIndex, 0, this.urls.length);
	};
	
	Sakri.ImageStore.prototype.getProgressString = function(){
		return this.currentLoadIndex+" / "+this.urls.length;
	};

	Sakri.ImageStore.prototype.loadNextImage = function(){
		if(this.currentLoadIndex >= this.urls.length){
			//console.log("all images loaded");
			this.completeCallback();
			return;
		}
		//console.log("Sakri.ImageStore.prototype.loadNextImage(", this.currentLoadIndex, "/", this.urls.length,") : ",this.urls[this.currentLoadIndex]);
		var image = new Image();
		var _this = this;
		image.onload = function(){
			_this.imageLoadComplete();
		};

		var url = this.urls[this.currentLoadIndex];
        console.log("Sakri.ImageStore.loadNextImage()", url );
		image.onerror = function(){
			alert("Sakri.ImageStore ERROR : "+url+" could not be loaded.");
		};
		image.src = this.urls[this.currentLoadIndex];
		this.images.push(image);
		this.currentLoadIndex++;
	};
	
	Sakri.ImageStore.prototype.imageLoadComplete = function(){
		//console.log("Sakri.ImageStore.imageLoadComplete()");
		for(var i=0; i<this.images.length; i++){
			this.images[i].onload = undefined;
		}
		if(this.updateCallback != undefined){
			this.updateCallback();
		}
		this.loadNextImage();
	};

	window.Sakri.ImageStore = Sakri.ImageStore;
	
}(window));