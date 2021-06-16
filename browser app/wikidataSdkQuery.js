// in this class, the queries and their sources, and functions, are defined.

var elementsList = [];

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
//This is a simple query. The nework would be like there is one node that is RBM17 to which all the other nodes are connected to.
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

	var queryUrl = encodeURI(sources[1] + "?query=" + query2); // encode query on the url provided
	
	fetch(queryUrl, {headers: {"Accept": 'application/json'}})
		.then(response => response.json())
		.then(wdk.simplify.sparqlResults)
		.then(function (response) {
			// put the visualization and data processing neede dfor that inside this function
			console.log(response);
			
		});
			
}

// to create list of elements for drawNetwork()
function getElementsList() {
	
	var nodeElements = [];
	var nodeIDs = [];
	var edgeElements = [];
			
	// add nodes
	/*each node will contain information on what other nodes it is connected to. Maybe in a form of a list. Then edges are formed accordingly.
	the information about the connections is retrieved from the queries*/
			
	/*For example if we can make the nextprot query3 work, all the results of the query get protein RBM17 in the connections of a node. 
	RBM17 must be added as a node. Can use the nextprot identifier in the query for that. Maybe add all the known entries in the query as nodes?
	All the nodes are added to nodeElements. Then we iterate through nodeElements and add edges between a node and the nodes in 
	it's connections list. Connections of a node must also be in the nodes list then. */
			
	for (i = 0; i < response.length; i++) {
		var entry = response[i]["entry"];
		nodeElements.push({data: {id: entry, connections: ["serotonin receptor", "GABA-A"]}})); // how to add elements to connections?
		nodeIDs.push(entry);
	}
			
	// add edges
	/* go through all the elements in nodeElements, read what is in connections of each node. Make edges accordingly and push to edgeElements. */
			
	for (i = 0; i < nodeElements.length; i++) {
		var connections = nodeElements[i]["data"]["connections"];
				
		for (j = 0; j < connections.length; j++) {
			if (nodeIDs.includes(connections[j])) {
				edgeElements.push({data: { id: "edge", source: nodeIDs[i], target: connections[j]}});
			}
		}
	}
			
	// combine node and edge lists into one list and return that and give to drawNetwork
	elementsList = nodeElements.concat(edgeElements);
	
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
