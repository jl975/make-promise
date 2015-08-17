/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:






/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/

function $Promise() {
	this.state = 'pending';
	this.value;
	this.handlerGroups = [];
}

function Deferral() {
	this.$promise = new $Promise();
}

function defer() {
	return new Deferral();
}

Deferral.prototype.resolve = function(data) {
	if (this.$promise.state != 'resolved' && this.$promise.state != 'rejected') {
		this.$promise.value = data;
		this.$promise.state = 'resolved';
		if (this.$promise.handlerGroups.length) {
			this.$promise.callHandlers();
		}

	}

}; 

Deferral.prototype.reject = function(reason) {
	if (this.$promise.state != 'rejected' && this.$promise.state != 'resolved') {
		this.$promise.value = reason;
		this.$promise.state = 'rejected';
		if (this.$promise.handlerGroups.length) {
			this.$promise.callHandlers();
		}
	}
};

$Promise.prototype.then = function(success_cb, error_cb) {
	if (typeof success_cb != 'function') success_cb = false;
	if (typeof error_cb != 'function') error_cb = false;
	this.handlerGroups.push({successCb: success_cb, errorCb: error_cb});

	if ((this.state == 'resolved' && success_cb)||(this.state == 'rejected' && error_cb)) {
		this.callHandlers();
	}


}

$Promise.prototype.callHandlers = function() {
	while (this.handlerGroups.length) {
		if(this.state==='resolved'){
		this.handlerGroups.shift().successCb(this.value);
		}
		else{
			this.handlerGroups.shift().errorCb(this.value);
		}
	}
};

$Promise.prototype.catch=function(error){
	this.then(null,error);
}



