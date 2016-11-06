The Browser Router package adds routing functionality to the BetaJS Router that allows you to:
- bind a router to location hash routes
- bind a router to location routes
- bind a router to the browser location history

We assume that we already have created a router:

```js
  var router = new BetaJS.Router.Router();
```

Then, we can add the location hash route binder as follows:

```js
  var hashRouteBinder = new BetaJS.Browser.HashRouteBinder(router);
```

Similarly, we can add a location route binder:

```js
  var locationRouteBinder = new BetaJS.Browser.LocationRouteBinder(router);
```

Finally the history route binder allows you to control the browser history while navigating with your router:

```js
  var historyRouteBinder = new BetaJS.Browser.HistoryRouteBinder(router);
```
