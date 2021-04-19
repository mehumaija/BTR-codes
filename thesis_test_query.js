const newEngine = require('@comunica/actor-init-sparql').newEngine;
const myEngine = newEngine();


// from wikiData querying hormone that is a protein for test purposes
/* query = `
PREFIX property: <http://www.wikidata.org/prop/direct/>
PREFIX entity: <http://www.wikidata.org/entity/>
SELECT ?item ?itemLabel
WHERE {
	SERVICE <https://query.wikidata.org/sparql> 
	{
  ?item property:P2868 entity:Q11364
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE], en" . }
  }
`

// this is the query from the Comunica tutorial
exampleQuery = `
SELECT ?s ?p ?o
WHERE {
	?s ?p <http://dbpedia.org/resource/Belgium>.
	?s ?p ?o
} LIMIT 100
`
 */
// execute SPARQL query. The first argument is the query String, 
// the second argument is a query context (array of sources to query over)
/* const result = await myEngine.query(exampleQuery, {
	sources: [
		'http://fragments.dbpedia.org/2015/en',
	],
}); */

const result = (async()=> await myEngine.query(`
  SELECT ?s ?p ?o WHERE {
    ?s ?p <http://dbpedia.org/resource/Belgium>.
    ?s ?p ?o
  } LIMIT 100`, {
  sources: ['http://fragments.dbpedia.org/2015/en'],
}));


// more sources
/* 		'https://www.rubensworks.net',
		'https://ruben.verborgh.org/profile/', */
		
		

/* const {data} = myEngine.resultToString(result,
	'application/sparql-results+json');
data.pipe(process.stdout); // print to standard output */

// data-listener
result.bindingsStream.on('data', (binding) => {
	console.log(binding.get('?s').value);
	console.log(binding.get('?s').termType);
	console.log(binding.get('?p').value);
	console.log(binding.get('?o').value);
});

// end-listener
result.bindingStream.on('end', () => {
	// data-listener not called anymore
});

// error-listener
result.bindingsStream.on('error', (error) => {
	console.error(error);
});


// getting results in a simple array, using asynchronous bindings() method
/* const bindings = result.bndings();

console.log(bindings[0].get('?s').value);
console.log(bindings[0].get('?s').termType); */



