var http = require('http');
var express = require('express');
var jqtpl = require("jqtpl");

var app = express.createServer();

var index_template = 'index.html.jqtpl';


app.configure(function(){
    app.set("view engine", "html");
    app.register(".jqtpl", jqtpl.express);
    app.set("view options", { layout: false })
    app.set('views', __dirname + '/views');
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});



app.get('/', function(req, res){
	    res.render(index_template, {
		    as : global,
		    test : {"a" : ""}
	       });
    });




app.get('/search/:q?', function(req, res) {
	query = req.params.q;
	console.log(query);
	searchSolr(res, query, renderJSON, null);
    });



function renderJSON(res, ans, template_file) {
    res.writeHead(200, {'content-type': 'text/plain' });
    res.write(JSON.stringify(ans));
    res.end('\n');
}


function renderJqtpl(res, ans, template_file) {
    console.log("made it into renderJqtpl")
    res.render(template_file, {
	    as : global,
	    test : ans
	 });
}





function searchSolr(res, query, display_func, jqtpl) {
    var final_ans = "";
    var t_client = http.createClient(8983, "localhost");  
    var request = t_client.request("GET", "/solr/select?q="+escape(query)+'&wt=json&rows=10', {"host": "localhost"});  
  
    request.addListener("response", function(response) {  
        var body = "";  
        response.addListener("data", function(data) {  
            body += data;  
        });  
        response.addListener("end", function() { 
   	    try {
	      ans = JSON.parse(body);
	      console.log("items : " + ans.response.docs.length);
	      render = [{}];
              if (typeof ans.response.docs != 'undefined') {
  	        for (var i = 0; i < ans.response.docs.length; i++) {
		    // render[i] = {'a':JSON.stringify(ans.response.docs[i])};
		    render[i] = {'a':(iterateAttributesAndFormHTMLLabels(ans.response.docs[i]))};
		    // console.log(iterateAttributesAndFormHTMLLabels(ans.response.docs[i]));
	        }
              }
	      display_func(res, render, jqtpl);
            } catch(err) {
	      display_func(res, [{'a':""}], jqtpl);
	    }
        });  
    });  
    request.end();
}



// http://stackoverflow.com/questions/4104321/recursively-parsing-json
function iterateAttributesAndFormHTMLLabels(o){
    var s = '';
    for(var a in o){
        if (typeof o[a] == 'object'){
            s+='<label><font color=green>'+a+':</font></label>';
            s+=iterateAttributesAndFormHTMLLabels(o[a]);
        }else{
            s+='<label>'+a+': <font color=blue>'+o[a]+'</font></label>';
        }//end if
    }//end for
    return s;
}//end function


app.post('/', function(req, res){
    
    console.log('post received');
    console.log(req.param('query', null));

    // var url_string = 'http://localhost:8983/solr/select?q='+escape(query)+'&wt=json&rows=10';

    var query = req.param('query', null);
    searchSolr(res, query, renderJqtpl, index_template);
});


app.listen(process.env.VCAP_APP_PORT || 3000);