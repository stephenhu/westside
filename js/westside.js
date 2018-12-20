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


function getArticle(title, created, path, deck) {

  octokit.repos.getContents({
    owner: GH_OWNER,
    repo: GH_REPO,
    path: path, 
    header: {
      "Accept": GH_HTML
    }
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


function modr(r, sha) {

  if(obj !== null && locater(r, obj)) {

    for(var i = 0; i < r.length; i++) {
      
      if(r[i].path === obj.path) {
        
        r.title = obj.title;
        r.created = Date.now();
        
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
