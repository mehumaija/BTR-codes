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

//nextprot: Proteins that interact with protein RBM17
query3 = `
PREFIX : <http://nextprot.org/rdf#>
PREFIX entry: <http://nextprot.org/rdf/entry/>
PREFIX cv: <http://nextprot.org/rdf/terminology/>
select distinct entry:NX_Q96I25 ?entry where {
  entry:NX_Q96I25 :isoform / :interaction / :interactant ?entry.
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
query6 = `
SELECT ?interaction ?participant1 ?participant2
WHERE { 
  ?interaction a up:Interaction;
               up:participant ?participant1;
               up:participant ?participant2.
} LIMIT 30
` //WORKS

//5-hydroxytryptamine receptor 2C,P28335 in uniprot
query61 = `
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX intact: <http://purl.uniprot.org/intact/>
SELECT ?interaction ?protein1 ?protein2
WHERE {
  BIND("http://purl.uniprot.org/intact/EBI-994141" AS ?protein1)
  ?interaction a up:Interaction;
               up:participant intact:EBI-994141;
               up:participant ?protein2.
} LIMIT 100
`

query7 = `
PREFIX up: <http://purl.uniprot.org/core/>
SELECT ?interaction ?protein1 ?protein2
WHERE { 
  ?protein1 a up:Protein;
           up:interaction ?interaction.
  ?protein2 a up:Protein;
            up:interaction ?interaction.
} LIMIT 100
`

//replace O43189 with a relevant protein for example GABA-A or serotonin receptor, something estrogen related or inflammation related or ECM related... .. .
query8 = `
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX uniprotkb: <http://purl.uniprot.org/uniprot/>
SELECT ?interaction ?protein1 ?protein2
WHERE {
  BIND("http://purl.uniprot.org/uniprot/P14867" AS ?protein1)
  uniprotkb:P14867 up:interaction ?interaction.
  ?protein2 a up:Protein;
            up:interaction ?interaction.
} LIMIT 100
`

//bio2rdf irefindex
query9 = `
PREFIX irefindex: <http://bio2rdf.org/irefindex_vocabulary:>
SELECT ?interaction ?protein1 ?protein2
WHERE {
  ?interaction a irefindex:Pairwise-Interaction;
            irefindex:interactor_a ?protein1;
            irefindex:interactor_b ?protein2.
} LIMIT 10
`

query10 = `
SELECT ?pathway
WHERE {
	
}
`

queryMDD = `
PREFIX : <http://nextprot.org/rdf#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX cv: <http://nextprot.org/rdf/terminology/>
SELECT DISTINCT ?iso
WHERE {
  {?protein :isoform ?iso.
  ?iso :goMolecularFunction ?GO.
  ?GO :term ?GOterm.
  ?GOterm :childOf cv:GO_0016917;
          rdfs:label ?GOlabel.}
		  UNION
  {?protein :isoform ?iso.
  ?iso :goBiologicalProcess ?GO.
  ?GO :term ?GOterm.
  ?GOterm :childOf cv:GO_0007210;
          rdfs:label ?GOlabel.}
		  UNION
  {?protein :isoform ?iso.
  ?iso :goMolecularFunction ?GO.
  ?GO :term ?GOterm.
  ?GOterm :childOf cv:GO_0099589;
          rdfs:label ?GOlabel.}
		  UNION
  {?protein :isoform ?iso.
  ?iso :disease ?disease.
  ?disease :term cv:DI-00697;
	      rdfs:comment ?diseaseLabel.}
}
`

queryPMDD = `
PREFIX : <http://nextprot.org/rdf#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX cv: <http://nextprot.org/rdf/terminology/>
SELECT DISTINCT ?iso
WHERE {
  {?protein :isoform ?iso.
  ?iso :goBiologicalProcess ?GO.
  ?GO :term ?GOterm.
  ?GOterm :childOf cv:GO_0042698;
          rdfs:label ?GOlabel.}
		UNION
  {?protein :isoform ?iso.
  ?iso :goBiologicalProcess ?GO.
  ?GO :term ?GOterm.
  ?GOterm :childOf cv:GO_0032570;
          rdfs:label ?GOlabel.}
}
`

queryInteractionsNP = `
PREFIX : <http://nextprot.org/rdf#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX cv: <http://nextprot.org/rdf/terminology/>
SELECT DISTINCT ?iso1 ?iso2
WHERE {
  {?protein :isoform ?iso1.
  ?iso1 :goBiologicalProcess ?GO.
  ?GO :term ?GOterm.
  ?GOterm :childOf cv:GO_0042698.}
		UNION
  {?protein :isoform ?iso1.
  ?iso1 :goBiologicalProcess ?GO.
  ?GO :term ?GOterm.
  ?GOterm :childOf cv:GO_0032570.}
        UNION
  {?protein :isoform ?iso2.
  ?iso2 :goMolecularFunction ?GO.
  ?GO :term ?GOterm.
  ?GOterm :childOf cv:GO_0016917.}
		UNION
  {?protein :isoform ?iso2.
  ?iso2 :goBiologicalProcess ?GO.
  ?GO :term ?GOterm.
  ?GOterm :childOf cv:GO_0007210.}
		UNION
  {?protein :isoform ?iso2.
  ?iso2 :goMolecularFunction ?GO.
  ?GO :term ?GOterm.
  ?GOterm :childOf cv:GO_0099589.}
		UNION
  {?protein :isoform ?iso2.
  ?iso2 :disease ?disease.
  ?disease :term cv:DI-00697.}
	    UNION
  {?iso1 :interaction / :interactant ?iso2.}
}
`

queryInteractionsUP = `
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX GO: <http://purl.obolibrary.org/obo/GO_>
SELECT DISTINCT ?protein1 ?protein2
WHERE {
  ?interaction a up:Interaction.
  ?protein1 up:interaction ?interaction.
  ?protein2 up:interaction ?interaction.
  
  {?protein1 a up:Protein;
             up:classifiedWith GO:0016917.}
  UNION
  {?protein1 a up:Protein;
             up:classifiedWith GO:0007210.}
  UNION
  {?protein1 a up:Protein;
             up:classifiedWith GO:0099589.}
  UNION
  {?protein1 a up:Protein;
             up:classifiedWith GO:0006950.}
  UNION
  {?protein2 a up:Protein;
             up:classifiedWith GO:0042698.}
  UNION
  {?protein2 a up:Protein;
             up:classifiedWith GO:0032570.}
} limit 300
`



// SOURCES
	  
sources = [];
//sources.push("https://query.wikidata.org/sparql"); // 0 wikidata
//sources.push({type: "sparql", value: "https://api.nextprot.org/sparql"}); // 1 nextprot
//sources.push({type: "sparql", value: "http://sparql.wikipathways.org/sparql"}); // 2 wikipathways
//sources.push("https://bio2rdf.org/sparql"); // 3 bio2RDF
sources.push({type: "sparql", value: "https://sparql.uniprot.org/sparql"}); // 4 uniprot
// 5 linked life data


// FUNCTIONS

//conducting the query and drawing the nodes inside of it
async function fetchResults() {

	myEngine.query(queryInteractionsUP, {sources: sources,}) // only need to change the query and sources variables if want to alter the query
		.then(function (result) {
		result.bindingsStream.on('data', function (data) {
			// Each variable binding is an RDFJS term
			//interactionValue = data.get('?interaction').value;
			sourceValue = data.get('?protein1').value;
			targetValue = data.get('?protein2').value;
			//nodeValue = data.get('?iso').value;
			
			//console.log(nodeValue);
			console.log(sourceValue + ' ' + targetValue);

			if (!elementsList.includes(sourceValue)) {
				elementsList.push({data: {id: sourceValue}});
			}
			if (!elementsList.includes(targetValue)) {
				elementsList.push({data: {id: targetValue}});
			}
			
			//elementsList.push({data: {id: nodeValue}});
			
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
