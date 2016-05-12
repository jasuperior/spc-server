var express = require('express');
var sift = require('sift');
var fb = require("firebase");
var pretty = require("pretty-js")
var r = require("retsu")
var app = express();
var db = [];
var ref = new fb("https://spcbase.firebaseio.com");

function naturalCompare(key, a, b) {
    var ax = [], bx = [];

    a[key].replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
    b[key].replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });

    while(ax.length && bx.length) {
        var an = ax.shift();
        var bn = bx.shift();
        var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
        if(nn) return nn;
    }

    return ax.length - bx.length;
}

packages = ref.child("packages");
packages.on("child_added", function(snap){
    db.push(snap.val())
});
packages.on("child_changed", function(snapshot) {
  var obj = snapshot.val();
  db.find(function(v,k){
      if(v.name == obj.name){
          Object.assign(v,obj);
          return true;
      }
    })
});
packages.on("child_removed", function(snapshot) {
  var obj = snapshot.val();
  console.log(obj);
  // db.find(function(v,k){
  //     if(v.name = obj.name){
  //         Object.assign(a,obj);
  //         return true;
  //     }
  //   })
});
app.get('/:query', function (req, res) {
    var result = new Set(), query = req.params.query;
    var result = sift({
        $where: function(){
            if(this.name.indexOf(query) > -1 )
                return true;
            if(this.readme && this.readme.indexOf(query) > -1)
                return true;
            if(this.author.indexOf(query) > -1 )
                return true;
            if(this.keywords && this.keywords.find(function(v){ return query.indexOf(v) > -1 }))
                return true;
        }
    }, db)
    res.setHeader('Content-Type', 'application/json');
    res.send(pretty(JSON.stringify(result)));
});
app.get('/:query/order/:order', function (req, res) {
    var result = new Set(), query = req.params.query,  order = req.params.order;
    var result = sift({
        $where: function(){
            if(this.name.indexOf(query) > -1 )
                return true;
            if(this.readme && this.readme.indexOf(query) > -1)
                return true;
            if(this.author.indexOf(query) > -1 )
                return true;
            if(this.keywords && this.keywords.find(function(v){ return query.indexOf(v) > -1 }))
                return true;
        }
    }, db)
    try{
        result = result.sort(naturalCompare.bind(result,order));
    }catch(e){
        console.log("normal sort");
        result = result.sort(function(a,b){ return a[order] < b[order] })
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(pretty(JSON.stringify(result)));
});
app.get('/:query/limit/:limit/page/:page', function (req, res) {
    var result = new Set(), limit = req.params.limit,  page = req.params.page, query = req.params.query;
    var result = sift({
        $where: function(){
            if(this.name.indexOf(query) > -1 )
                return true;
            if(this.readme && this.readme.indexOf(query) > -1)
                return true;
            if(this.author.indexOf(query) > -1 )
                return true;
            if(this.keywords && this.keywords.find(function(v){ return query.indexOf(v) > -1 }))
                return true;
        }
    }, db);
    result = r.limit(result,page*limit,limit);
    res.setHeader('Content-Type', 'application/json');
    res.send(pretty(JSON.stringify(result)));
});
app.get('/:query/order/:order/limit/:limit/page/:page', function (req, res) {
    var result = new Set(), limit = req.params.limit,  page = req.params.page, query = req.params.query, order = req.params.order;
    var result = sift({
        $where: function(){
            if(this.name.indexOf(query) > -1 )
                return true;
            if(this.readme && this.readme.indexOf(query) > -1)
                return true;
            if(this.author.indexOf(query) > -1 )
                return true;
            if(this.keywords && this.keywords.find(function(v){ return query.indexOf(v) > -1 }))
                return true;
        }
    }, db);
    try{
        result = result.sort(naturalCompare.bind(result,order));
    }catch(e){
        result = result.sort(function(a,b){ return a[order] < b[order] })
    }
    result = r.limit(result,page*limit,limit);
    res.setHeader('Content-Type', 'application/json');
    res.send(pretty(JSON.stringify(result)));
});
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});