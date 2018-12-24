# Westsidejs

Westsidejs is a single page, client side web framework that utilizes standard web technologies like css, html, js, and md for building dynamic sites.  There's no need to learn jsx or other templating languages.  All content is rendered client side and hosted on Github, S3, or a common web server.

## Design

Raw content like text for an article is written in markdown which allows
for additional formatting and flexibility.  Markdown pages are then downloaded and embedded in sections within a single html page.  Articles can be accessed using hashes for easier navigation and SEO.

## Features

* Develop pages using standard web technologies (css, html, js, md)
* Store content to Github, S3, or other web repositories
* Web interface to manage content
* Can also leverage pug templates and compile in real time

## Dependencies

* Github account
* Github page
* markedjs
* @octokit/rest.js

Tested on Chrome browser

## Usage

### From the Browser

```html
<html>
<head>
  <script src="https://unpkg.com/marked@0.5.2/lib/marked.js"></script>
  <script src="octokit/octokit-rest.min.js"></script>
  <script src="js/westside.js"></script>
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

### TODO: Server side

`npm install westside`

## index.json

```json
{
  "page-title": "Coding Blog",
  "repository": {
    "type": "github",
    "owner": "username",
    "name": "username.github.io"
  },
  "articles": [
    {
      "title": "Golang is the Best Language",
      "created": 1547136000000,
      "updated": 1547136000000,
      "path": "golang.md"
    },
    {
      "title": "Unit Testing Best Pratices",
      "created": 1535136024901,
      "updated": 1535136024901,
      "path": "unit-testing.md"
    }
  ]
}
```

## TODO: Westside API

## Todo

* Stackedit editor integration
* S3 backend support
* Client side router (page.js)
* Javascript modules
* sort articles
* defect: if index.json does not exist.
* create westside module
* doc: westside api
* defect: quota management for github api
