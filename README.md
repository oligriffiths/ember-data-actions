# ember-data-actions

WARNING - NOT EVEN ALPHA!! DO NOT USE.


## Usage

Attach an action to a model, that is invokeable by the property name on the model, e.g.

```js
import action from 'ember-data-actions/utils/action'
DS.Model.extend({
  like: action('like')
})

DS.Model.extend({
  like: action('like', { liked: true })
})
```

Attach the mixin to your ember data adapter and define an actions hash:

```js
import action from 'ember-data-actions/mixins/adapter'

export default DS.RESTAdapter.extend(AdapterActions, {
  actions: {
    actions: {
      like: {
        url: 'user/like',
        modelKeys: ['id'],
      },
    },
  },
});
```

Then you can call the action on your model using:
```js
model.like()

// or
model.like({foo: 'bar'}); // the hash will be merged with the ajax request body parameters
```

This will by default, send a POST request to http://you-api-server/user/like with a payload 
of key value pairs from the model, in this case `id` (and its value).

## Installation

* `git clone <repository-url>` this repository
* `cd ember-data-actions`
* `npm install`
* `bower install`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
