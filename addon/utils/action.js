import Ember from 'ember';

/**
 * Triggers an action on the models associated adapter
 * @param {DS.Model} model The model the action is being performed on
 * @param {string} actionName The action being performed
 * @param {object} data Optional data hash to pass to the ajax request
 * @returns {Promise} The XHR promise from the adapter .ajax() method
 */
const triggerAdapterAction = function (model, actionName, data) {

  const store = model.get('store');
  const modelName = model.get('constructor.modelName');
  const adapter = store.adapterFor(modelName);
  const serializer = store.serializerFor(modelName);

  return adapter.triggerAction(actionName, model, serializer, data);
};

/**
 * Sets model attributes based on the supplied newAttributes hash
 * @param {DS.Model} model The model to set the attributes on
 * @param {object} newAttributes A hash of key:value pairs of model attributes to set
 * @param {DS.Promise} promise returned from the action
 * @param {string} actionName The action being performed
 * @returns {void}
 */
const setAttributes = function (model, newAttributes, promise, actionName) {

  // If newAttributes is a function, run it now and capture result
  if (typeof newAttributes === 'function') {
    newAttributes = newAttributes.apply(model, [actionName]);
  }

  // Ensure the newAttributes is in the correct format
  Ember.assert(
    'The "newAttributes" argument to action() must be either null, an hash or a function that returns a hash',
    typeof newAttributes === 'object'
  );

  // Store dirty state to reset after changing
  const isDirty = model.get('currentState');

  // Store the attributes that were changed
  const changedAttributes = {};

  // Cache and change each attributes value
  Object.keys(newAttributes).forEach(key => {

    const oldValue = model.get(key);
    const newValue = newAttributes[key];

    if (oldValue !== newValue) {
      changedAttributes[key] = [oldValue, newValue];
      model.set(key, newValue);
    }
  });

  // Reset dirty flag so model doesn't appear modified
  model.set('currentState.isDirty', isDirty);

  // If action failed, reset properties
  promise.catch(() => {
    Object.keys(changedAttributes).forEach(key => {
      const values = changedAttributes[key];
      model.set(key, values[0]);
    });
  });
};

/**
 * A DS.Model action, that is invokeable by the property name on the model, e.g.
 *
 * import action from 'ember-data-actions/utils/action'
 * DS.Model.extend({
 *
 *   like: action('like')
 * })
 *
 * DS.Model.extend({
 *
 *   like: action('like', { liked: true })
 * })
 *
 * And can be called like:
 *
 * model.like()
 *
 * or
 *
 * model.like({foo: 'bar'}) // the hash will be merged with the ajax request body parameters
 *
 * @param {string} actionName The action name to invoke
 * @param {string|object|function} newAttributes An object or function containing attributes to change.
 * These are reset if the promise rejects.
 * If a hash is provided, it must contain key/value pairs of model attributes to set.
 * If a function is provided, it must return either a hash as above. The function accepts actionName as a single argument.
 * @returns {Function} An action that can be executed on the model
 */
export default function (actionName, newAttributes) {

  /**
   * @param {object} data Optional data hash passed to ajax function
   * @returns {DS.Promise} The promise returned from the adapter.ajax() method
   */
  return function (data) {

    // Trigger the action, returns a promise
    const promise = triggerAdapterAction(this, actionName, data);

    // If there are no attributes to update, return now
    if (!newAttributes) {
      return promise;
    }

    // Set the new attributes
    setAttributes(this, newAttributes, promise, actionName);

    return promise;
  };
}
