
	
	<script src="/path/to/wikibase-sdk.js"></script>
    <script>console.log('can access WBK', WBK)</script>
    <script src="/path/to/wikidata-sdk.js"></script>
    <script>console.log('can access wdk, the wikidata.org bound product of WBK', wdk)</script>



// Make sure you initialize wbk with a sparqlEndpoint
const wbk = require('wikibase-sdk')({
  instance: 'https://my-wikibase-instan.se',
  sparqlEndpoint: 'https://query.my-wikibase-instan.se/sparql'
})
const sparql = 'SELECT * WHERE { ?s ?p ? o } LIMIT 10'
const url = wbk.sparqlQuery(sparql)
// request the generated URL with your favorite HTTP request library
request({ method: 'GET', url })

wbk.simplify.sparqlResults(results, { minimize: false })