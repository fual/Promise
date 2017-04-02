/**
 * @param somebody
 */
const EventEmitter = function() {
	this._eventsCallbacks = {};
};

/**
 * @param somebody
 */
EventEmitter.prototype.trigger = function(event) {
	const eventCallbacks = this._eventsCallbacks[event];
	if (!eventCallbacks) {
		return;
	}
	eventCallbacks.forEach(function(func){
		func();
	})
}

/**
 * @param somebody
 */
EventEmitter.prototype.on = function (event, callback) {
	if (!this._eventsCallbacks[event]) {
		this._eventsCallbacks[event] = [];
	}

	this._eventsCallbacks[event].push(callback);
}

/**
 * @param somebody
 */
const Promise2 = function(f1) {
	EventEmitter.call(this);
	// pending, fulfilled, rejected
	this._status = 'pending';
	this._result = null;

	const reject = () => {
		this._setStatus('rejected');
		return this;
	}
	const approove = (result) => {
		const isResultPromise = result instanceof Promise2;
		if (isResultPromise) {
			result.then((newResult) => {
				this._updateStatePromise(newResult);
			});
			return;
		} 
		this._updateStatePromise(result);
	}

	f1(approove, reject.bind(this));
};

/**
 * @param somebody
 */
Promise2.prototype = Object.create(EventEmitter.prototype);

Promise2.prototype._updateStatePromise = function(result) {
	this._result = result;
	this._setStatus('fulfilled');
	return this;	
}

/**
 * @param somebody
 */
Promise2.prototype._setStatus = function(status) {
	this._status = status;
	this.trigger('changeStatus');
}

/**
 * Добавляет обработчик выполнения и отклонения обещания 
 *
 * @callback коллбек промиса
 * @param {*} 
 */
Promise2.prototype.then = function(callback) {
	// Оборачиваем колбек в функцию для передачи в промис
	const extendedCallback = (approove, reject) => {
		if (this._status === "fulfilled") {
			// @todo: нужно заложиться, если коллбек асинхронный
			const result = callback(this._result);
			approove(result);
		}

		this.on('changeStatus', () => {
			approove(callback(this._result));
		});
	};
	return new Promise2(extendedCallback);
}

/*
 * Examples
 */

var func1 = function(approove, reject) {
	setTimeout(() => {
		approove('ready#1');
	}, 200)

}

var func2 = function(approove, reject) {
	setTimeout(() => {
		approove('ready#2');
	}, 2000)

}

var prom = new Promise2(func1)
prom.constructor.name;

// 	prom.then(function(result) {
		
// 		setTimeout(() => {
// 			console.log('ready#1-after', result);
// 		}, 2000)
// 		return new Promise2(func2);
// 	}).then(function(result) {
// 		console.log('ready#2-after', result);
// 		return 'before3';
// 	}).then(function(result) {
// 		console.log('ready#3', result);
// 	});
// console.log('after-prom')

const promise = new Promise2(func1);

setTimeout(() => {
	promise.then((res) => {
		console.log(res);
	});
}, 1000);
