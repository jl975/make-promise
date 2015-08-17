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

function $Promise(state, value) {
	this.state = state || 'pending';
	this.value = value;
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
	var handlerGroup = {
		successCb: success_cb, 
		errorCb: error_cb,
		forwarder: defer()
	};

	this.handlerGroups.push(handlerGroup);

	if (this.state != 'pending') this.callHandlers();

	return handlerGroup.forwarder.$promise;

}

$Promise.prototype.callHandlers = function() {
	var nextPromise;
	while (this.handlerGroups.length) {
		nextPromise = this.handlerGroups.shift();
		if (this.state==='resolved'){
			if (nextPromise.successCb) {
				try {
					var successValue = nextPromise.successCb(this.value);
					if (successValue instanceof $Promise) {
						successValue.then(function(value) {
							nextPromise.forwarder.resolve(value);
						}, function(err) {
							nextPromise.forwarder.reject(err);
						});
					}
					else nextPromise.forwarder.resolve(successValue);
				} catch (err){
					nextPromise.forwarder.reject(err);
				}
			}
			else nextPromise.forwarder.resolve(this.value);
		}
		else if (this.state === 'rejected') {
			if (nextPromise.errorCb) {
				try {
					var errorValue = nextPromise.errorCb(this.value);
					if (errorValue instanceof $Promise) {
						errorValue.then(function(value) {
							nextPromise.forwarder.resolve(value);
						}, function(err) {
							nextPromise.forwarder.reject(err);
						})
					}
					else nextPromise.forwarder.resolve(errorValue);					
				} catch (err) {
					nextPromise.forwarder.reject(err);
				}
			}
			else nextPromise.forwarder.reject(this.value);
		}
	}
};

$Promise.prototype.catch = function(error){
	return this.then(null,error);
}



