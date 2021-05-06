// in this class, the queries and their sources, and functions, are defined.

const myEngine = Comunica.newEngine();
var elementsList = [];
var dataJSON = {};

// QUERIES

// from wikidata
query1 = `
PREFIX wdp: <http://www.wikidata.org/prop/direct/>
PREFIX wde: <http://www.wikidata.org/entity/>
SELECT ?item
WHERE {
  ?item wdp:P2868 wde:Q11364
  }
`

//from nextprot
//Proteins associated with diseases that are associated with cardiovascular aspects (D002318) --> tried with depression (C2982), but doesn't work
query2 = `
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

// SOURCES
	  
sources = [];
//sources.push('https://query.wikidata.org/sparql');
sources.push('https://www.nextprot.org/proteins/search?mode=advanced');


// FUNCTIONS

//conducting the query and drawing the nodes inside of it
function fetchResults() {
	
	myEngine.query(query3, {sources: sources,}) // only need to change the query and sources variables if want to alter the query
		.then(function (result) {
		result.bindingsStream.on('data', function (data) {
			// Each variable binding is an RDFJS term
			itemValue = data.get('?item').value
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

    const results = await myEngine.query(query1, {sources: sources,});

    const data = await myEngine.resultToString(results,
      'application/sparql-results+json', results.context);

    data.data.on('data', (a) => {
        dataJSON += a
    })

    data.data.on('end', () => {
    console.log(dataJSON)
    })
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
