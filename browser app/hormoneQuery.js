const myEngine = Comunica.newEngine();

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
	  
sources = [];
sources.push('https://query.wikidata.org/sparql');
//sources.push('https://api.nextprot.org/sparql');

var elementsList = [];


myEngine.query(query1, {sources: sources,})
	.then(function (result) {
    result.bindingsStream.on('data', function (data) {
        // Each variable binding is an RDFJS term
		itemValue = data.get('?item').value
        console.log(itemValue);
		
		// for each data item (one identifier from wikidata) create an object {data: {id: "url"}}
		elementsList.push({data: {id: itemValue}});
    });
});

console.log(elementsList);


var dataJSON = {};

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


 /* [ // list of graph elements to start with
		{ // node a
		  data: { id: 'a' }
		},
		{ // node b
		  data: { id: 'b' }
		},
		{ // edge ab
		  data: { id: 'ab', source: 'a', target: 'b' }
		}
	  ] */