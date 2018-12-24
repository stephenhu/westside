/* westside.js */

const octokit       = new Octokit();

const GH_OWNER         = "madsportslab";
const GH_REPO          = "madsportslab.github.io";
const GH_REPOS         = "repos";
const GH_INDEX         = "index.json";
const GH_ROOT          = "/";
const GH_JSON          = "application/vnd.github.v3+json"
const GH_HTML          = "application/vnd.github.v3.html+json"

const EXT_MARKDOWN            = ".md";

const EXCLUDE_README          = "readme.md";


function fName(s) {

  var r = s.replace(/ /g, "-");

  return r.toLowerCase() + EXT_MARKDOWN;

} // fName


function createNewsCard(title, created, data, deck) {

  var card        = document.createElement("div");
  var cardBody    = document.createElement("div");
  var cardTitle   = document.createElement("h5");
  var cardText    = document.createElement("div");
  var cardDate    = document.createElement("h6");
  var br          = document.createElement("br");

  card.setAttribute("class", "card");
  cardBody.setAttribute("class", "card-body");
  cardTitle.setAttribute("class", "card-title");
  cardDate.setAttribute("class", "card-subtitle light-blue");
  cardText.setAttribute("class", "card-text");

  cardTitle.innerText = title;
  cardText.innerHTML  = marked(atob(data.content));
  cardDate.innerText  = created;

  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardDate);
  cardBody.appendChild(br);
  cardBody.appendChild(br);
  cardBody.appendChild(cardText);
  
  card.appendChild(cardBody);

  deck.appendChild(card);

} // createNewsCard


function createNewsDeck() {

  var nd = document.createElement("div");

  nd.setAttribute("class", "card-deck");

  return nd;

} // createNewsDeck


function createArticleHeader(s, t, c) {

  var title   = document.createElement("h2");
  var created = document.createElement("h6");
  
  title.setAttribute("class", "red");
  created.setAttribute("class", "light-blue");

  var d = new Date(c);

  title.innerText = t;
  created.innerText = d.toString();

  s.appendChild(title);
  s.appendChild(created);

} // createArticleHeader


function createArticle(s, data) {

  var d = document.createElement("div");

  d.innerHTML = marked(atob(data.content));

  s.appendChild(d);

} // createArticle


function addRow(articles, obj) {

  var tr    = document.createElement("tr");
  var td1   = document.createElement("td");
  var td2   = document.createElement("td");
  var td3   = document.createElement("td");
  var td4   = document.createElement("td");
  var input = document.createElement("input");
  var a     = document.createElement("a");
  
  input.setAttribute("type", "checkbox");
  input.setAttribute("value", obj.path);

  td1.appendChild(input);

  a.setAttribute("href", "?path=" + obj.path + "&title=" +
    encodeURIComponent(obj.title) + "#editor");

  a.setAttribute("class", "teal");

  a.innerText = obj.title;

  td2.appendChild(a);

  td3.innerText = obj.path;

  var d = new Date(obj.created);

  td4.innerText = d.toUTCString();

  tr.appendChild(td1);
  tr.appendChild(td2);
  tr.appendChild(td3);
  tr.appendChild(td4);

  articles.appendChild(tr);

} // addRow


function listArticles() {

  var articles = document.getElementById("articles");

  octokit.repos.getContents({
    owner: GH_OWNER,
    repo: GH_REPO,
    path: GH_INDEX
  }).then(({data, headers, status}) => {

    var obj = JSON.parse(atob(data.content));

    var h1 = document.getElementById("articleCount");
    
    h1.innerText = "Articles (" + obj.articles.length + ")";

    for(var i = 0; i < obj.articles.length; i++) {
      addRow(articles, obj.articles[i]);
    }

  });

} // listArticles


function loadArticle() {

  var title     = document.getElementById("title");
  var content   = document.getElementById("content");
  var sha       = document.getElementById("sha");

  var params = new URLSearchParams(window.location.search);

  console.log(params);
  title.value = params.get("title");

  octokit.repos.getContents({
    owner: GH_OWNER,
    repo: GH_REPO,
    path: params.get("path")
  }).then(({data, headers, status}) => {
    
    content.value = atob(data.content);
    sha.value     = data.sha;

  });

} // loadArticle


function getArticle(title, created, path, deck) {

  octokit.repos.getContents({
    owner: GH_OWNER,
    repo: GH_REPO,
    path: path
  }).then(({data, headers, status}) => {

    var s   = document.createElement("section");
    var br  = document.createElement("br");
    var hr  = document.createElement("hr");

    createArticleHeader(s, title, created);
    createArticle(s, data);
    //createNewsCard(title, created, data, deck);
  
    var root = document.getElementById("root");

    root.appendChild(s);
    root.appendChild(br);
    root.appendChild(hr);


  });

} // getArticle


function prepareContents(contents) {

  var h = window.location.hash.substr(1).toLowerCase();

  var root = document.getElementById("root");

  var deck = createNewsDeck();

  root.appendChild(deck);

  contents.articles.sort(function(a, b) {
    return b.created - a.created;
  });
  
  for(var i = 0; i < contents.articles.length; i++) {

    var md = contents.articles[i].path.substr(0,
      contents.articles[i].path.length - 3).toLowerCase();

    var mdIndex = contents.articles[i].path.indexOf(".md");

    if(mdIndex > -1) {

      if(contents.articles[i].path.toLowerCase() === EXCLUDE_README) {
        continue;
      } else if(md === h || h === "") {
        
        getArticle(contents.articles[i].title, contents.articles[i].created,
          contents.articles[i].path, deck);

      }
  
    }

  }

} // prepareContents


function render() {

  octokit.repos.getContents({
    owner: GH_OWNER,
    repo: GH_REPO,
    path: GH_INDEX
  }).then(({data, headers, status}) => {

    if(status === 200) {
      prepareContents(JSON.parse(atob(data.content)));
    }

  });

} // parseContents


function addArticle() {

  var t = document.getElementById("title").value;

  var obj = {
    title: t,
    path: fName(t),
    created: Date.now()
  }

  octokit.authenticate({
    type: "token",
    token: document.getElementById("auth-token").value
  });

  octokit.repos.createFile({
    owner: GH_OWNER,
    repo: GH_REPO,
    message: "Add file " + fName(obj.title),
    content: btoa(document.getElementById("content").value),
    path: fName(obj.title)
  }).then(({data, headers, status}) => {

    if(status === 201) {
      
      alert("Article added successfully.");
      updater(addr, obj);

    }

  });

} // addArticle


function updateArticle() {

  var t = document.getElementById("title").value;
  var s = document.getElementById("sha").value;

  var obj = {
    title: t,
    path: fName(t),
    updated: Date.now()
  }

  octokit.authenticate({
    type: "token",
    token: document.getElementById("auth-token").value
  });

  octokit.repos.updateFile({
    owner: GH_OWNER,
    repo: GH_REPO,
    message: "Update file " + fName(t),
    content: btoa(document.getElementById("content").value),
    path: fName(t),
    sha: s
  }).then(({data, headers, status}) => {

    if(status === 200) {
      
      alert("Article updated successfully.");
      updater(modr, obj);

    }

  });

} // updateArticle


function btnAction(u) {

  var b = document.getElementById("editorbtn");

  if(u) {
    
    b.setAttribute("onclick", "updateArticle(); return false;");

    b.innerText = "Update article";

  } else {

    b.setAttribute("onclick", "addArticle(); return false;");

    b.innerText = "Add article";

  }

} // btnAction


function updater(cb, obj) {

  octokit.repos.getContents({
    owner: GH_OWNER,
    repo: GH_REPO,
    path: GH_INDEX
  }).then(({data, headers, status}) => {
    
    if(status === 200) {
       cb(JSON.parse(atob(data.content)), obj, data.sha);
    }

  });

} // updater


function initr(obj) {

  var n = {
    articles: [
    ]
  }

  n.articles.push(obj);

  octokit.repos.createFile({
    owner: GH_OWNER,
    repo: GH_REPO,
    message: "Create r file ",
    content: btoa(JSON.stringify(n)),        
    path: GH_INDEX
  }).then(({data, headers, status}) => {

    if(status === 201) {
      alert("Initialized r file");
    }

  });

} // initr


function addr(r, obj, sha) {

  if(obj !== null && !locater(r, obj)) {

    obj.created = Date.now();

    r.articles.push(obj);

    flushr(r, sha);

  } else {
    initr(obj);
  }

} // addr


function delr(r, obj, sha) {

  if(obj !== null && locater(r, obj)) {

    for(var i = 0; i < r.length; i++) {
      
      if(r[i].path === obj.path) {
        
        r.splice(i, 1);
        break;

      }

    }

    flushr(r, sha);

  } else {
    console.log("not found");
  }

} // delr


function modr(r, obj, sha) {

  if(obj !== null && locater(r, obj)) {

    for(var i = 0; i < r.length; i++) {
      
      if(r[i].path === obj.path) {
        
        r.title = obj.title;
        r.updated = Date.now();
        
        break;

      }

    }

    flushr(r, sha);

  } else {
    console.log("not found");
  }

} // modr


function locater(r, obj) {

  for(var i = 0; i < r.length; i++) {

    if(r[i].path === obj.path) {
      return true;
    }

  }

  return false;

} // locater


function flushr(r, s) {

  octokit.repos.updateFile({
    owner: GH_OWNER,
    repo: GH_REPO,
    message: "Flush r",
    content: btoa(JSON.stringify(r)),
    path: GH_INDEX,
    sha: s
  }).then(({data, headers, status}) => {
    
    if(status === 200) {
      location.reload();
    } else {
      alert(status);
    }
    
  });

} // flushr


function clearEditorPage() {

  var title   = document.getElementById("title");
  var content = document.getElementById("content");

  title.value = "";
  content.value = "";

} // clearEditorPage


function editorPage(u) {

  btnAction(u);

  var editor    = document.getElementById("editor");
  var dashboard = document.getElementById("dashboard");
  var started   = document.getElementById("getstarted");
  var about     = document.getElementById("about");
  
  if(!u) {
    clearEditorPage();
  }

  editor.setAttribute("class", "container");
  dashboard.setAttribute("class", "container d-none");
  started.setAttribute("class", "container d-none");
  about.setAttribute("class", "container d-none");

} // editorPage


function homePage() {

  var editor    = document.getElementById("editor");
  var dashboard = document.getElementById("dashboard");
  var started   = document.getElementById("getstarted");
  var about     = document.getElementById("about");

  editor.setAttribute("class", "container d-none");
  dashboard.setAttribute("class", "container");
  started.setAttribute("class", "container d-none");
  about.setAttribute("class", "container d-none");
  
} // homePage


function settingsPage() {

} // settingsPage


function helpPage() {

} // helpPage


function aboutPage() {

  var editor    = document.getElementById("editor");
  var dashboard = document.getElementById("dashboard");
  var started   = document.getElementById("getstarted");
  var about     = document.getElementById("about");

  editor.setAttribute("class", "container d-none");
  dashboard.setAttribute("class", "container d-none");
  started.setAttribute("class", "container d-none");
  about.setAttribute("class", "container");

} // aboutPage


function routes() {

  var hash = window.location.hash.substr(1).toLowerCase();

  if(hash === "editor") {
    loadArticle();
    editorPage(true);
  } else if(hash === "new") {
    history.pushState("", document.title, window.location.pathname + window.location.hash);
    editorPage(false);
  } else if(hash === "getstarted") {
    history.pushState("", document.title, window.location.pathname + window.location.hash);
    getStartedPage();
  } else if(hash === "settings") {
    history.pushState("", document.title, window.location.pathname + window.location.hash);
    settingsPage();
  } else if(hash === "help") {
    history.pushState("", document.title, window.location.pathname + window.location.hash);
    helpPage();
  } else if(hash === "about") {
    history.pushState("", document.title, window.location.pathname + window.location.hash);
    aboutPage();
  } else {
    history.pushState("", document.title, window.location.pathname + window.location.hash);
    homePage();
  }

} // routes


function wstd() {

  window.onload = routes

  window.onhashchange = routes
  
} // wstd
