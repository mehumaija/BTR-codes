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
SELECT DISTINCT ?protein1 ?proteinLabel1 ?GOlabel1 ?protein2 ?proteinLabel2 ?GOlabel2 ?interaction ?interactionType ?strength
WHERE {
  ?iso1 :interaction ?interaction.
  ?interaction :interactant ?iso2;
			   rdf:type ?interactionType;
               :quality ?quality;
			   :evidence ?evidence.			   
			   
  ?evidence :numberOfExperiments ?strength.
			  
  ?entry1 :isoform ?iso1;
			 :swissprotPage ?P1;
			 :recommendedName ?name1.
  ?name1 :fullName ?proteinLabel1.
  
  ?iso2 :swissprotPage ?P2;
		:recommendedName ?name2.
  ?name2 :fullName ?proteinLabel2.

  
  BIND(REPLACE(STR(?P1), "http://www.uniprot.org/uniprot/", "") as ?protein1)
  BIND(REPLACE(STR(?P2), "http://www.uniprot.org/uniprot/", "") as ?protein2)
  
  {
  ?iso1 :goBiologicalProcess ?GO.
  ?GO :term ?GOterm;
      rdfs:comment ?GOlabel1.
  ?GOterm :childOf cv:GO_0042698.}
		UNION
  {
  ?iso1 :goBiologicalProcess ?GO.
  ?GO :term ?GOterm;
      rdfs:comment ?GOlabel1.
  ?GOterm :childOf cv:GO_0032570.}
        UNION
  {?entry2 :isoform ?iso2.
  ?iso2 :goMolecularFunction ?GO.
  ?GO :term ?GOterm;
      rdfs:comment ?GOlabel2.
  ?GOterm :childOf cv:GO_0016917.}
		UNION
  {?entry2 :isoform ?iso2.
  ?iso2 :goBiologicalProcess ?GO.
  ?GO :term ?GOterm;
      rdfs:comment ?GOlabel2.
  ?GOterm :childOf cv:GO_0007210.}
		UNION
  {?entry2 :isoform ?iso2.
  ?iso2 :goMolecularFunction ?GO.
  ?GO :term ?GOterm;
      rdfs:comment ?GOlabel2.
  ?GOterm :childOf cv:GO_0099589.}
		UNION
  {?entry2 :isoform ?iso2.
  ?iso2 :disease ?disease.
  ?disease :term cv:DI-00697;
           rdfs:comment ?GOlabel2.}
} limit 100
`

// add ?GO rdfs:comment ?GOlabel
// add doi URLs
// maybe add image iof the protein !?

//take the GOlabels out to get it working
queryInteractionsUP = `
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX GO: <http://purl.obolibrary.org/obo/GO_>
SELECT DISTINCT ?protein1 ?proteinLabel1 ?GOlabel1 ?protein2 ?proteinLabel2 ?GOlabel2 ?interaction ?interactionType ?strength
WHERE {
  ?interaction a up:Interaction;
               rdf:type ?interactionType;
			   up:experiments ?strength.
			   
  ?P1 up:interaction ?interaction;
      rdfs:label ?proteinLabel1.
  ?P2 up:interaction ?interaction;
      rdfs:label ?proteinLabel2.
  
  BIND(REPLACE(STR(?P1), "http://purl.uniprot.org/uniprot/", "") as ?protein1)
  BIND(REPLACE(STR(?P2), "http://purl.uniprot.org/uniprot/", "") as ?protein2)
  
  {?P1 a up:Protein;
             up:classifiedWith GO:0042698.
   GO:0042698 rdfs:label ?GOlabel1.}
  UNION
  {?P1 a up:Protein;
             up:classifiedWith GO:0032570.
   GO:0032570 rdfs:label ?GOlabel1.}
  UNION
  {?P2 a up:Protein;
             up:classifiedWith GO:0016917.
   GO:0016917 rdfs:label ?GOlabel2.}
  UNION
  {?P2 a up:Protein;
             up:classifiedWith GO:0007210.
   GO:0007210 rdfs:label ?GOlabel2.}
  UNION
  {?P2 a up:Protein;
             up:classifiedWith GO:0099589.
   GO:0099589 rdfs:label ?GOlabel2.}
  UNION
  {?P2 a up:Protein;
             up:classifiedWith GO:0006950.
   GO:0006950 rdfs:label ?GOlabel2.}
} limit 500
`

// with GOlabels
queryAmmar = `
PREFIX : <http://nextprot.org/rdf#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX cv: <http://nextprot.org/rdf/terminology/>
SELECT DISTINCT 
	?protein1
    ?proteinLabel1
    ?GOlabel1
	?protein2
    ?proteinLabel2
    ?GOlabel2
	?interaction ?interactionType ?quality
	(SUM(xsd:integer(?numOfExperiments)) AS ?strength)
	(SAMPLE(?doiUrl) AS ?ref)
WHERE {
	?interaction rdf:type ?interactionType;
				 :quality ?quality;
				 :evidence ?evidence.
  	
	{?evidence :numberOfExperiments ?numOfExperiments.}
  	UNION {
	  	?evidence :reference ?reference.
  		?reference :from ?doi.
	  	FILTER REGEX(STR(?doi), "DOI:")
	  	BIND(REPLACE(STR(?doi), "DOI:", "https://doi.org/") AS ?doiUrl)}
  
	{ SELECT DISTINCT ?protein1 ?protein2 ?interaction ?GOlabel1 ?GOlabel2 ?proteinLabel1 ?proteinLabel2
		WHERE {
			?iso1 :interaction ?interaction.
			?interaction :interactant ?iso2.
		  
            ?protein1 :swissprotPage ?P1;
					  :recommendedName ?name1.
		    ?name1 :fullName ?proteinLabel1.
		  
            ?protein2 :swissprotPage ?P2;
					  :recommendedName ?name2.
		    ?name2 :fullName ?proteinLabel2.
			
			    {?protein1 :isoform ?iso1.
				?iso1 :goBiologicalProcess ?GO1.
				?GO1 :term ?GOterm1.
				?GOterm1 :childOf ?terms1.
				VALUES ?terms1 { cv:GO_0042698 cv:GO_0032570 }
				OPTIONAL
				{
					?GO1 rdfs:comment ?GOlabel1.
				}
				BIND ("PMDD" AS ?condition1)}

			{
			    ?protein2 :isoform ?iso2.
				{  
					?iso2 :goBiologicalProcess ?GO2.
					?GO2 :term ?GOterm2.
					?GOterm2 :childOf ?terms2.
					VALUES ?terms2 { cv:GO_0016917 cv:GO_0007210 cv:GO_0099589}

					OPTIONAL
					{
						?GO2 rdfs:comment ?GOlabel2.
					}
					BIND ("Depression related biological process" AS ?condition2)
				}
				UNION
				{
					?iso2 :disease ?disease2.
					?disease2 :term cv:DI-00697.

					OPTIONAL
					{
						?disease2 rdfs:comment ?GOlabel2.
					}
					BIND ("Depression related disease" AS ?condition2)	
				}
			}
		}
	}
}
GROUP BY ?protein1 ?protein2 ?interaction ?interactionType ?quality ?GOlabel1 ?GOlabel2 ?proteinLabel1 ?proteinLabel2
` 

queryAmmarEdited = `
PREFIX : <http://nextprot.org/rdf#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX cv: <http://nextprot.org/rdf/terminology/>
SELECT DISTINCT 
	?protein1
    ?proteinLabel1
    ?GOlabel1
	?protein2
    ?proteinLabel2
    ?GOlabel2
	?interaction ?interactionType ?quality
	(SUM(xsd:integer(?numOfExperiments)) AS ?strength)
	(SAMPLE(?doiUrl) AS ?ref)
WHERE {
	?interaction rdf:type ?interactionType;
				 :quality ?quality;
				 :evidence ?evidence.
  	
	{?evidence :numberOfExperiments ?numOfExperiments.}
  	UNION {
	  	?evidence :reference ?reference.
  		?reference :from ?doi.
	  	FILTER REGEX(STR(?doi), "DOI:")
	  	BIND(REPLACE(STR(?doi), "DOI:", "https://doi.org/") AS ?doiUrl)}
  
	{ SELECT DISTINCT ?protein1 ?protein2 ?interaction ?GOlabel1 ?GOlabel2 ?proteinLabel1 ?proteinLabel2
		WHERE {
			?iso1 :interaction ?interaction.
			?interaction :interactant ?iso2.
		  
            ?protein1 :swissprotPage ?P1;
					  :recommendedName ?name1.
		    ?name1 :fullName ?proteinLabel1.
		  
            ?protein2 :swissprotPage ?P2;
					  :recommendedName ?name2.
		    ?name2 :fullName ?proteinLabel2.
			
			    {?protein1 :isoform ?iso1.
				?iso1 :goBiologicalProcess ?GO1.
				?GO1 :term ?GOterm1.
				?GOterm1 :childOf cv:GO_0042698.
				OPTIONAL
				{
					?GO1 rdfs:comment ?GOlabel1.
				}
				BIND ("PMDD" AS ?condition1)}

			{
			    ?protein2 :isoform ?iso2.
				{  
					?iso2 :goBiologicalProcess ?GO2.
					?GO2 :term ?GOterm2.
					?GOterm2 :childOf cv:GO_0007210.

					OPTIONAL
					{
						?GO2 rdfs:comment ?GOlabel2.
					}
					BIND ("Depression related biological process" AS ?condition2)
				}
				UNION
				{
					?iso2 :disease ?disease2.
					?disease2 :term cv:DI-00697.

					OPTIONAL
					{
						?disease2 rdfs:comment ?GOlabel2.
					}
					BIND ("Depression related disease" AS ?condition2)	
				}
			}
		}
	}
}
GROUP BY ?protein1 ?protein2 ?interaction ?interactionType ?quality ?GOlabel1 ?GOlabel2 ?proteinLabel1 ?proteinLabel2
` 




// add filter(protein1 = protein2 ) to check how many proteins are the same in both conditions


// SOURCES
	  
//sources = [];
//sources.push("https://query.wikidata.org/sparql"); // 0 wikidata
//sources.push({type: "sparql", value: "https://api.nextprot.org/sparql"}); // 1 nextprot
//sources.push({type: "sparql", value: "http://sparql.wikipathways.org/sparql"}); // 2 wikipathways
//sources.push("https://bio2rdf.org/sparql"); // 3 bio2RDF
//sources.push({type: "sparql", value: "https://sparql.uniprot.org/sparql"}); // 4 uniprot
// 5 linked life data

UP = [];
UP.push({type: "sparql", value: "https://sparql.uniprot.org/sparql"});

NP = [];
NP.push({type: "sparql", value: "https://api.nextprot.org/sparql"});


// FUNCTIONS


//source values are the proteins associated with GO terms that are associated with the menstrual cycle according to literature
//target values are the proteins associated with GO terms that are associated with depression according 
var sourceValues = [];
var targetValues = [];
var elementsListOnlyIDs = [];


//conducting the query and drawing the nodes inside of it
// call the function two times with the source in the argument
async function fetchResults(query, source) {
	
	myEngine.query(query, {sources: source,}) // only need to change the query and sources variables if want to alter the query
		.then(function (result) {
			console.log("getting data");
		result.bindingsStream.on('data', function (data) {
			// Each variable binding is an RDFJS term
			console.log("getting values");
			sourceValue = data.get('?protein1').value; //female endocrine control related in all queries
			sourceValues.push(sourceValue);
			targetValue = data.get('?protein2').value; //depression related in all queries
			targetValues.push(targetValue);
			interaction = data.get("?interaction").value;
			type = data.get('?interactionType').value;
			strength = data.get('?strength').value;
			sourceLabel = data.get('?proteinLabel1').value;
			targetLabel = data.get('?proteinLabel2').value; 
			GOlabel2 = data.get("?GOlabel2").value;
		    GOlabel1 = data.get("?GOlabel1").value;
			quality = data.get("?quality").value;
			ref = data.get("?ref").value;

			// checking if the node already exists and adding it to the elements if it doesn't. Assigning color accrdingly.
			// Red = PMDD related biological process. Blue = depression related biological process. Purple = related to both.
			if (!elementsListOnlyIDs.includes(sourceValue)) {
				
				if (targetValues.includes(sourceValue)) {
					elementsList.push({data: {id: sourceValue, label: sourceLabel, GOlabel: GOlabel1, color: "purple"}});
			    } else {
					elementsList.push({data: {id: sourceValue, label: sourceLabel, GOlabel: GOlabel1, color: "red"}});
				}
				elementsListOnlyIDs.push(sourceValue);
			}
			
			if (!elementsListOnlyIDs.includes(targetValue)) {
				if (sourceValues.includes(targetValue)) {
					elementsList.push({data: {id: targetValue, label: targetLabel, GOlabel: GOlabel2, color: "purple"}});
			    } else {
					elementsList.push({data: {id: targetValue, label: targetLabel, GOlabel: GOlabel2, color: "blue"}});
				}
				elementsListOnlyIDs.push(targetValue);
			}
			
			// assigning edge color according to the interaction type
			var edgeColor;
			if (type == "http://nextprot.org/rdf#BinaryInteraction") {
				edgeColor = "brown"; 
			} else if (type == "http://purl.uniprot.org/core/Interaction") {
				edgeColor = "orange";
			} else if (type == "http://purl.uniprot.org/core/Non_Self_Interaction"){
				edgeColor = "yellow";
			}else {
				edgeColor = "#ccc";
			}
			
			// interactions repeated in the different
			if (sourceValue != null || sourceValue != "" || targetValue != null || targetValue != "") {
			elementsList.push({data: { id: sourceValue + targetValue, source: sourceValue, target: targetValue,
			        sourceLabel: sourceLabel, targetLabel: targetLabel, interaction: interaction, 
					interactionType: type, strength: strength, color: edgeColor}});
			}
			
		});
		result.bindingsStream.on('end', () => {
			console.log("query done");
    		drawNetwork();
		});
		result.bindingsStream.on('error', (error) => {
			console.error(error);
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
	console.log("drawing network " + elementsList.length);
	var cy = cytoscape({ // variable cy is the graph
	
	  container: document.getElementById('cy'), // container to render in, plot appears here

	  elements: elementsList,

	  style: [ // the stylesheet for the graph
		{
		  selector: "core",
          style: {
            "selection-box-color": "#AAD8FF",
            "selection-box-border-color": "#8BB0D0",
            "selection-box-opacity": "0.5"
          }
        }, {
		  selector: 'node',
		  style: {
			'background-color': 'data(color)',
			'label': 'data(label)',
            'width':' 120px',
            'height': '80px',
            'text-wrap': 'wrap',
            'text-halign': 'center',
            'text-valign': 'center',
            'color': '#fff',
            'shape': 'round-rectangle',
            'text-max-width':'100px',
            'font-size': '12px',
            'border-width': '3px',
            'border-color': '#283593'
		  }
		}, {
          selector: "node[?attr]",
          style: {
            "shape": "rectangle",
            "background-color": "#aaa",
            "text-outline-color": "#aaa",
            "width": "16px",
            "height": "16px",
            "font-size": "6px",
            "z-index": "1"
          }
        },{
		  selector: 'node:selected',
		  style: {
			"border-width": "6px",
            "border-color": "#AAD8FF",
            "border-opacity": "0.5",
            "background-color": "#77828C",
            "text-outline-color": "#77828C"
		  }
		},
		{
		  selector: 'edge',
		  style: {
			'width': 'data(n_exp)',
			'line-color': 'data(color)',
			'target-arrow-color': '#ccc',
			'target-arrow-shape': 'none',
			'curve-style': 'bezier'
		  }
		}
	  ],

	  layout: {
		name: 'cose'
	  }

	}); 
	
	// when a node is clicked
	cy.on('tap', 'node', function(evt){
		var node = evt.target;
		
		//adding UniProt URL to the sidebar
		var sideBar = document.getElementById('sidebar');
		var uniprotlink = "https://www.uniprot.org/uniprot/" + node.id();
        sideBar.innerHTML = node.data("label") + ": " + "<a target=\"_blank\" href=\""+uniprotlink+"\" >" + uniprotlink + "</a>"; //how to make a link??
		
    });
	
	// when an edge is clicked
	cy.on('tap', 'edge', function(evt){
		var edge = evt.target;
		
		// adding information about the clicked edge
		var sideBar = document.getElementById('sidebar');
        sideBar.innerHTML = "Interaction between " + edge.data("sourceLabel") + " and " + edge.data("targetLabel")
		    + "<br>Number of experiments to support the existence of this interaction: " + edge.data("strength")
		    + "<br>Type of this interaction: " + edge.data("interactionType");
    });

}
