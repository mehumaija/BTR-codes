
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

var dataJSON = {};

myEngine.query(query1, {sources: sources,})
	.then(function (result) {
    result.bindingsStream.on('data', function (data) {
        // Each variable binding is an RDFJS term
        console.log(data.get('?item').value);
    });
			
	dataJSON = myEngine.resultToString(result, 'application/json');
});


console.log(dataJSON);

// this is for cytoscape.js

/* var cy = cytoscape({ // variable cy is the graph?

  container: document.getElementById('cy'), // container to render in

  elements: [ // list of graph elements to start with
    { // node a
      data: { id: 'a' }
    },
    { // node b
      data: { id: 'b' }
    },
    { // edge ab
      data: { id: 'ab', source: 'a', target: 'b' }
    }
  ],

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

}); */