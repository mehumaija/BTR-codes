(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
exampleQuery = `
      SELECT * {
	    ?s ?p <http://dbpedia.org/resource/Belgium>.
	    ?s ?p ?o
      } LIMIT 100
      `
	  
sources = [];
sources.push('http://fragments.dbpedia.org/2015/en');

Comunica.newEngine().query(exampleQuery, {sources: sources,})
	.then(function (result) {
    result.bindingsStream.on('data', function (data) {
        // Each variable binding is an RDFJS term
        console.log(data.get('?s').value + ' ' + data.get('?p').value + ' ' + data.get('?o').value);
    });
});
},{}]},{},[1]);
