# westsidejs

Westsidejs is a psuedo-MVC web framework that utilizes standard web technologies like css, html, js, and md,
there's no need to learn jsx or other templating languages.  All content is rendered client side and
stored to either Github, S3, or web server.

## Features

* Develop pages using standard web technologies (css, html, js, md)
* Store content to Github, S3, or other web repositories
* Web interface to manage content

## Requirements

* Github account or S3
* Tested on Chrome browser

## Usage

```html
<html>
<head>
  <script src="westside.js"></script>
</head>
<body>
  <main id="root">
  </main>
  <script>
    render();
  </script>
</body>
</html>
```
