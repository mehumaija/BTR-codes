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