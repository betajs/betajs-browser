The loader allows you to asynchronously load scripts, styles and html:

```javascript
    BetaJS.Browser.Loader.loadScript("//.../script.js", function () {
        // Loaded scripts.js
    });

    BetaJS.Browser.Loader.loadStyles("//.../styles.css", function () {
        // Loaded styles.css
    });
    
    BetaJS.Browser.Loader.loadHtml("//.../web.html", function (content) {
        // Loaded web.html
    });
```