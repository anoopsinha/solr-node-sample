var http = require('http');
var express = require('express');
var app = express.createServer();

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
        res.sendfile('index.html', {layout:false});

    });

app.post('/', function(req, res){
    
    console.log('post received');
    console.log(req.param('query', null));

    var query = req.param('query', null);
    var url_string = 'http://localhost:9200/_search?q='+escape(query)+'&pretty=true';

    var t_client = http.createClient(9200, "localhost");  
    var request = t_client.request("GET", "/_search?q="+escape(query), {"host": "localhost"});  
  
    request.addListener("response", function(response) {  
        var body = "";  
        response.addListener("data", function(data) {  
            body += data;  
        });  
  
        response.addListener("end", function() { 
            console.log(body);

	    res.send(body);
        });  
    });  

    request.end();
});


app.listen(process.env.VCAP_APP_PORT || 3000);