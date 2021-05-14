// in this class, the queries and their sources, and functions, are defined.

const myEngine = Comunica.newEngine();
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
select distinct entry:NX_Q96I25 ?entry where {
  entry:NX_Q96I25 :isoform / :interaction / :interactant ?entry.
  ?entry :isoform / :keyword / :term cv:KW-0508
}
`

query31 = `
PREFIX : <http://nextprot.org/rdf#>
PREFIX entry: <http://nextprot.org/rdf/entry/>
PREFIX cv: <http://nextprot.org/rdf/terminology/>
select distinct ?protein1 ?protein2 where {
  ?protein1 :isoform / :interaction / :interactant ?protein2.
  ?protein2 :isoform / :keyword / :term cv:KW-0508
}
`

//wikipathways: interactions of a pathway
/* the ?interaction variable gives a unique URL for each interaction. For example ComplexBinding/a9b99 means the binding of SMAD1 and SMAD4 into a complex. 
Thus, both of the nodes get this as their ?interaction.*/
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

//uniprot interaction queries
/*VOCABULARY 
Classes: up:Interaction, up:Participant
Properties: up:interaction, up:participant*/
query6 = `
SELECT ?interaction ?participant1 ?participant2
WHERE { 
  ?interaction a up:Interaction;
               up:participant ?participant1;
               up:participant ?participant2.
} LIMIT 30
` //WORKS

query7 = `
PREFIX up: <http://purl.uniprot.org/core/>
SELECT ?interaction ?protein1 ?protein2
WHERE { 
  ?protein1 a up:Protein;
           up:interaction ?interaction.
  ?protein2 a up:Protein;
            up:interaction ?interaction.
} LIMIT 100
` //WORKS

//replace O43189 with a relevant protein for example GABA-A or serotonin receptor, something estrogen related or inflammation related or ECM related... .. .
query8 = `
SELECT ?interaction ?protein2
WHERE { 
  uniprotkb:O43189 up:interaction ?interaction.
  ?protein2 a up:Protein;
            up:interaction ?interaction.
} LIMIT 30
`


// SOURCES
	  
sources = [];
//sources.push("https://query.wikidata.org/sparql"); // 0 wikidata SPARQL endpoint
//sources.push({type: "sparql", value: "https://api.nextprot.org/sparql"}); // 1 this SHOULD be the right one for nextprot
//sources.push({type: "sparql", value: "http://sparql.wikipathways.org/sparql"}); // 2 wikipathways
//sources.push("https://bio2rdf.org/sparql"); // 3 bio2RDF
sources.push({type: "sparql", value: "https://sparql.uniprot.org/sparql"});


// FUNCTIONS

//conducting the query and drawing the nodes inside of it
async function fetchResults() {

	myEngine.query(query7, {sources: sources,}) // only need to change the query and sources variables if want to alter the query
		.then(function (result) {
		result.bindingsStream.on('data', function (data) {
			// Each variable binding is an RDFJS term
			interactionValue = data.get('?interaction').value;
			sourceValue = data.get('?protein1').value;
			targetValue = data.get('?protein2').value;
			console.log(interactionValue + ' ' + sourceValue + ' ' + targetValue);

			if (!elementsList.includes(sourceValue)) {
				elementsList.push({data: {id: sourceValue}});
			}
			if (!elementsList.includes(targetValue)) {
				elementsList.push({data: {id: targetValue}});
			}
			// make an if-statement to get distinct edges or use the information about having multiple similar edges for weighting?
			elementsList.push({data: { id: sourceValue + targetValue, source: sourceValue, target: targetValue}});
			
		    drawNetwork();
		});
	});
}


// to serialize the data while executing query 
async function fetchJson() {

    const results = await myEngine.query(query3, {sources: sources,});

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
