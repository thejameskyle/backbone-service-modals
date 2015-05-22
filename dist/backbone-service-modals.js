(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('backbone.service'), require('backbone'), require('underscore'), require('es6-promise')) : typeof define === 'function' && define.amd ? define(['backbone.service', 'backbone', 'underscore', 'es6-promise'], factory) : global.ModalService = factory(global.Service, global.Backbone, global._, global.PromisePolyfill);
})(this, function (Service, Backbone, _, PromisePolyfill) {
  'use strict';

  var ES6Promise = PromisePolyfill.Promise;

  /**
   * @class ModalService
   */
  var backbone_service_modals = Service.extend({

    /**
     * @abstract
     * @method requests
     */
    requests: function requests() {
      return {
        open: 'open',
        close: 'close',
        alert: 'alert',
        confirm: 'confirm',
        prompt: 'prompt' };
    },

    /**
     * @constructs ModalService
     */
    constructor: function constructor() {
      var _this = this;

      this.views = [];

      this.listenTo(Backbone.history, 'route', function () {
        if (_this.fragment !== Backbone.history.fragment) {
          _this.fragment = null;
          _this.close();
        }
      });

      this._super.apply(this, arguments);
    },

    /**
     * @method open
     * @param {Backbone.View} [view]
     * @returns {Promise}
     */
    open: function open(view) {
      var _this2 = this;

      var previousView = undefined;
      return ES6Promise.resolve().then(function () {
        _this2.fragment = Backbone.history.fragment;
        _this2._isOpen = true;

        previousView = _.last(_this2.views);
        _this2.views.push(view);

        return _this2.render(view);
      }).then(function () {
        if (previousView) {
          return _this2.animateSwap(previousView, view);
        } else {
          return _this2.animateIn(view);
        }
      });
    },

    /**
     * @method close
     * @param {Backbone.View} [view]
     * @returns {Promise}
     */
    close: function close(view) {
      var _this3 = this;

      var previousView = undefined;
      var views = undefined;

      return ES6Promise.resolve().then(function () {
        _this3._isOpen = false;

        if (view) {
          views = _this3.views = _.without(_this3.views, view);
        } else {
          views = _this3.views;
          _this3.views = [];
        }

        previousView = _.last(views);

        if (view && previousView) {
          return _this3.animateSwap(view, previousView);
        } else if (view) {
          return _this3.animateOut(view);
        } else if (previousView) {
          return _this3.animateOut(previousView);
        }
      }).then(function () {
        if (view) {
          return _this3.remove(view);
        } else {
          return Promise.all(_.map(views, _this3.remove, _this3));
        }
      });
    },

    /**
     * @method alert
     * @param {Object} [options]
     * @returns {Promise}
     */
    alert: function alert(options) {
      var _this4 = this;

      return new ES6Promise(function (resolve, reject) {
        var view = new _this4.AlertView(options);
        var promise = _this4.open(view);

        view.on('confirm cancel', function () {
          promise.then(function () {
            return _this4.close(view);
          }).then(resolve, reject);
        });
      });
    },

    /**
     * @method confirm
     * @param {Object} [options]
     * @returns {Promise}
     */
    confirm: function confirm(options) {
      var _this5 = this;

      return new ES6Promise(function (resolve, reject) {
        var view = new _this5.ConfirmView(options);
        var promise = _this5.open(view);

        var close = function close(result) {
          promise.then(function () {
            return _this5.close(view);
          }).then(function () {
            return resolve(result);
          }, reject);
        };

        view.on({
          confirm: function confirm() {
            return close(true);
          },
          cancel: function cancel() {
            return close(false);
          }
        });
      });
    },

    /**
     * @method prompt
     * @returns {Promise}
     */
    prompt: function prompt(options) {
      var _this6 = this;

      return new ES6Promise(function (resolve, reject) {
        var view = new _this6.PromptView(options);
        var promise = _this6.open(view);

        var close = function close(result) {
          promise.then(function () {
            return _this6.close(view);
          }).then(function () {
            return resolve(result);
          }, reject);
        };

        view.on({
          submit: function submit(text) {
            return close(text);
          },
          cancel: function cancel() {
            return close();
          }
        });
      });
    },

    /**
     * @method isOpen
     * @returns {Boolean}
     */
    isOpen: function isOpen() {
      return !!this._isOpen;
    },

    /**
     * @abstract
     * @method render
     */
    render: function render() {},

    /**
     * @abstract
     * @method remove
     */
    remove: function remove() {},

    /**
     * @abstract
     * @method animateIn
     */
    animateIn: function animateIn() {},

    /**
     * @abstract
     * @method animateSwap
     */
    animateSwap: function animateSwap() {},

    /**
     * @abstract
     * @method animateOut
     */
    animateOut: function animateOut() {} });

  return backbone_service_modals;
});
//# sourceMappingURL=./backbone-service-modals.js.map