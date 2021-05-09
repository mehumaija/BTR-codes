// in this class, the queries and their sources, and functions, are defined.

/* const WBK = require('wikibase-sdk')
const wbk = WBK({
  instance: 'https://my-wikibase-instan.se',
  sparqlEndpoint: 'https://query.my-wikibase-instan.se/sparql'
}) */

var elementsList = [];
var dataJSON = {};

// QUERIES

// from wikidata: Something that has a role of a hormone
query1 = `
PREFIX wdp: <http://www.wikidata.org/prop/direct/>
PREFIX wd: <http://www.wikidata.org/entity/>
SELECT ?entry
WHERE {
  ?entry wdp:P2868 wd:Q11364
  }
`

//from nextprot
//Proteins associated with diseases that are associated with cardiovascular aspects (D002318) --> tried with depression (C2982), but doesn't work
query2 = `
PREFIX : <http://nextprot.org/rdf#>
PREFIX cv: <http://nextprot.org/rdf/terminology/>
select distinct ?entry where {
  ?entry :isoform /:medical / :term /:related / :childOf cv:D002318.
}
`

//nextprot: Proteins that interact with protein RBM17 and that are involved in splicing
query3 = `
PREFIX : <http://nextprot.org/rdf#>
PREFIX entry: <http://nextprot.org/rdf/entry/>
PREFIX cv: <http://nextprot.org/rdf/terminology/>
select distinct ?entry where {
  entry:NX_Q96I25 :isoform / :interaction / :interactant ?entry.
  ?entry :isoform / :keyword / :term cv:KW-0508
}
`

//wikipathways: interactions of a pathway
query4 = `
PREFIX wp:      <http://vocabularies.wikipathways.org/wp#>
PREFIX dc:      <http://purl.org/dc/elements/1.1/> 
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
SELECT DISTINCT ?pathway ?interaction ?participants ?DataNodeLabel
WHERE {

   ?pathway a wp:Pathway ;
      dc:identifier <https://identifiers.org/wikipathways/WP1425> .
   ?interaction dcterms:isPartOf ?pathway ; 
      a wp:Interaction ;
      wp:participants ?participants .
   ?participants a wp:DataNode ;
      rdfs:label ?DataNodeLabel .  
}
`

//Bio2RDF standard query for testing
query5 = `
select * where {[] a ?Concept} LIMIT 100
`


// SOURCES
	  
sources = [];
sources.push('https://query.wikidata.org/sparql'); // wikidata SPARQL endpoint
sources.push('https://api.nextprot.org/sparql'); // this SHOULD be the right one for nextprot
sources.push("http://sparql.wikipathways.org/sparql"); // wikipathways
sources.push('https://bio2rdf.org/sparql'); // bio2RDF


// FUNCTIONS

//conducting the query and drawing the nodes inside of it
function fetchResults() {

	myEngine.query(query5, {sources: sources,}) // only need to change the query and sources variables if want to alter the query
		.then(function (result) {
		result.bindingsStream.on('data', function (data) {
			// Each variable binding is an RDFJS term
			itemValue = data.get('?entry').value
			console.log(itemValue);
			
			// for each data item (one identifier from wikidata) create an object {data: {id: "url"}}, take the beginning of the url out and leave only the wikidata identifier
			elementsList.push({data: {id: itemValue}});
			
			//draws an edge between two nodes
			if (elementsList.length > 0) {
				// edge item {data: { id: 'ab', source: 'a', target: 'b' }}
			}
			
			drawNetwork();
		});
	});
}


// to serialize the data while executing query 
async function fetchJson() {

	var queryUrl = encodeURI(sources[0] + "?query=" + query1); // encode query on the url provided
	
	fetch(queryUrl, {headers: {"Accept": 'application/json'}})
		.then(response => response.json())
		.then(wdk.simplify.sparqlResults)
		.then(function (response) {
			// put the visualization and data processing neede dfor that inside this function
			
			console.log(response);
		});
			
}


// this is for cytoscape.js
 function drawNetwork() { 
 
	console.log("Drawing network");
	var cy = cytoscape({ // variable cy is the graph?

	  container: document.getElementById('cy'), // container to render in, plot appears here

	  elements: elementsList,

	  style: [ // the stylesheet for the graph
		{
		  selector: 'node',
		  style: {
			'background-color': '#666',
			'label': 'data(id)'
		  }
		},

		{
		  selector: 'edge',
		  style: {
			'width': 3,
			'line-color': '#ccc',
			'target-arrow-color': '#ccc',
			'target-arrow-shape': 'triangle',
			'curve-style': 'bezier'
		  }
		}
	  ],

	  layout: {
		name: 'grid',
		rows: 1
	  }

	}); 
}
