const baseURL = "http://localhost:8080/bot?q=";
const query = "Hi forgot my password how to fix?";
const encoded = baseURL + encodeURIComponent(query);

console.log(encoded);
// http://localhost:8080/bot?q=How%20do%20I%20reset%20my%20password%3F
