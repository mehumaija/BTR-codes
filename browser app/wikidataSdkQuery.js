// in this class, the queries and their sources, and functions, are defined.

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
// i took # away from prefix http://nextprot.org/rdf#
query3 = `
PREFIX : <http://nextprot.org/rdf>
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

// basic query
query5 = `
SELECT DISTINCT * WHERE {
  ?s ?p ?o
}
LIMIT 10
`

// SOURCES
	  
sources = [];
sources.push("https://query.wikidata.org/sparql"); // 0 wikidata SPARQL endpoint
sources.push("https://api.nextprot.org/sparql"); // 1 this SHOULD be the right one for nextprot
sources.push("http://sparql.wikipathways.org/sparql"); // 2 wikipathways
sources.push("https://bio2rdf.org/sparql"); // 3 bio2RDF


// FUNCTIONS


// to serialize the data while executing query 
async function fetchJson() {

	var queryUrl = encodeURI(sources[0] + "?query=" + query1); // encode query on the url provided
	
	fetch(queryUrl, {headers: {"Accept": 'application/json'}})
		.then(response => response.json())
		.then(wdk.simplify.sparqlResults)
		.then(function (response) {
			// put the visualization and data processing neede dfor that inside this function
			console.log(response);
			
			//add nodes
			response.forEach(item => elementsList.push({data: {id: item["entry"]}}));
			
			//add edges
			elementsList.push({data: { id: "edge", source: elementsList[0]["data"]["id"], target: elementsList[1]["data"]["id"]}});
			
			drawNetwork();
			
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
