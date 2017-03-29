import Ember from 'ember';

/**
 * Ember data adapter mixin adds triggerAction() support to an adapter.
 * @see triggerAction() for details
 */
export default Ember.Mixin.create({

  /**
   * The default action HTTP method to use, can be overridden in actions
   */
  defaultActionMethod: 'POST',

  /**
   * A hash containing a map of action names to action definitions, there are several options:
   *
   * 1. action: {string} - The URL to make the HTTP request to
   * 2. action: {
   *    url: {string}, - The URL to make the HTTP request to
   *    data: {object}, - A hash of body values to send in the HTTP request
   *    modelKeys: {array} - An array of model keys used to populate the body of the request using values from the model
   * }
   * 3. function (model, action) - Must return either a string or an action hash as above
   */
  actions: {},

  /**
   * Triggers an action using the "actions" hash on the adapter.
   * A custom HTTP request is sent to the "url" defined by the action, along with custom "data", and optional custom method
   * @param {string} action The action name being triggered
   * @param {DS.Model} model The model the action was triggered on
   * @param {DS.Serializer} serializer The serializer for the model
   * @param {object} data Optional data hash to pass to the ajax request
   * @returns {Promise} The XHR promise from the adapters .ajax() method
   */
  triggerAction(action, model, serializer, data) {

    Ember.assert('adapter.triggerAction(action, model, serializer, data) must be called with an action', action);
    Ember.assert('adapter.triggerAction(action, model, serializer, data) must be called with a model', model);
    Ember.assert('adapter.triggerAction(action, model, serializer, data) must be called with a serializer', serializer);

    // Get the action definition
    let actionDefinition = this.get('actions.' + action) || { url: null, data: {}, method: null };

    // If action is a function, call the function with the model
    if (typeof actionDefinition === 'function') {
      actionDefinition = actionDefinition(model, action);
    }

    // If action is a simple string, assign to url
    if (typeof actionDefinition === 'string') {
      actionDefinition = {
        url: actionDefinition,
      };
    }

    // Compile action data into hash
    actionDefinition.data = actionDefinition.data || {};
    const actionData = Object.assign({}, actionDefinition.data, data);

    // Compile data attributes
    if (actionDefinition.modelKeys && Array.isArray(actionDefinition.modelKeys)) {

      // Extract values from model and merge into data
      actionDefinition.modelKeys.forEach(key => {
        actionData[key] = model.get(key);
      });
    }

    // Ensure data is re-encoded using correct serializer attributes
    Object.keys(actionData).forEach(key => {
      actionDefinition.data[serializer.keyForAttribute(key)] = actionData[key];
    });

    // Ensure we have a URL
    Ember.assert('adapter.triggerAction(action, modelName, model) must resolve a URL for the action definition', actionDefinition.url);

    // Ensure host is prefixed
    const url = [
      this.urlPrefix(),
      actionDefinition.url,
    ];

    // Execute ajax request
    return this.ajax(
      url.join('/'),
      actionDefinition.method || this.get('defaultActionMethod'),
      {
        data: actionDefinition.data,
      }
    );
  },
});
