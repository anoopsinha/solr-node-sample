var http = require('http');
var express = require('express');
var jqtpl = require("jqtpl");

var app = express.createServer();

var index_template = 'index.html.jqtpl';


var SOLR_PORT = (process.env.SOLR_PORT || 8983);
var SOLR_SERVER = (process.env.SOLR_SERVER || "localhost");


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
	searchSolr(req, res, renderJSON, null);
    });



function renderJSON(res, ans, template_file) {
    res.writeHead(200, {'content-type': 'text/plain' });
    res.write(JSON.stringify(ans));
    res.end('\n');
}


function renderJqtpl(res, ans, template_file) {
    res.render(template_file, {
	    as : global,
	    test : ans
	 });
}




function searchSolr(req, res, display_func, jqtpl) {

    var query = req.params.q;
    var display = req.param('display', null);
    var start_p = req.param('start', null);
    var start_str = (start_p != null) ? '&start='+start_p : '';
    var rows_p = req.param('rows', null);
    var rows_str = (rows_p != null) ? '&rows='+rows_p : '&rows=10';
    console.log(query + ", display " + display + ", start " + start_p + ", rows " + rows_p);


    var final_ans = "";
    var t_client = http.createClient(SOLR_PORT, SOLR_SERVER);  
    var request = t_client.request("GET", "/solr/select?q="+escape(query)+'&wt=json' + rows_str + start_str, {"host": SOLR_SERVER});  

    request.addListener("response", function(response) {  
        var body = "";  
        response.addListener("data", function(data) {  
            body += data;  
        });  
        response.addListener("end", function() { 
   	    try {
	      var ans = JSON.parse(body);
	      console.log("items : " + ans.response.docs.length);
	      console.log("rows : " + ans.responseHeader.params.rows);
	      console.log("numfound : " + ans.response.numFound);
	      var rows = ans.responseHeader.params.rows;
	      var numFound = ans.response.numFound;

	      render = [{}];
              if (typeof ans.response.docs != 'undefined') {
		var df = parseDisplayFields(display);
  	        for (var i = 0; i < ans.response.docs.length; i++) {
		    // render[i] = {'a':JSON.stringify(ans.response.docs[i])};
		    render[i] = {'a':(createCollapsibleHtmlBox(ans.response.docs[i], df)),  'numFound':numFound, 'rows':rows, 'index':i+1};  // we pass a second parameter to show just specific fields in the collapsible version
	        }
              }
	      display_func(res, render, jqtpl);
            } catch(err) {
	      console.log(err);
	      display_func(res, [{'a':"", 'numFound':numFound, 'rows':rows, 'index':-1}], jqtpl);
	    }
        });  
    });  
    request.end();
}

function parseDisplayFields(display) {
    var ans;
    if (display == null || typeof display == "undefined" || display.length == 0) {
	ans = null;  // shows all of the fields
    } else {
	ans = display.split(/[ ]*,[ ]*/);
    }
    return ans;
}


// take a JSON object and an array of top level item labels to show
function createCollapsibleHtmlBox(o, toShow){
    var fullHtml = iterateAttributesAndFormHTMLLabels(o, null);
    var partHtml = iterateAttributesAndFormHTMLLabels(o, toShow);
    var s = '';    
    s += '<div onclick="$(this).children().toggle();">';
    s += '  <div class="part">' + partHtml + '</div>';
    s += '  <div class="full" style="display:none">' + fullHtml + '</div>';
    s += '</div>';
    return s;
}

function checkToShow(a, toShow) {
    if (toShow == null || typeof toShow == "undefined") {  // show everything
	return true;
    } else if (toShow.indexOf(a) != -1) {
	return true;
    }
    else return false;
}

// http://stackoverflow.com/questions/4104321/recursively-parsing-json
function iterateAttributesAndFormHTMLLabels(o, toShow){
    var s = '';
    for(var a in o){
	if (checkToShow(a, toShow)) {
          if (typeof o[a] == 'object'){
              s+='<label><font color=green>'+a+':</font></label>';
              s+=iterateAttributesAndFormHTMLLabels(o[a]);
          } else {
              s+='<label>'+a+': <font color=blue>'+o[a]+'</font></label>';
          }//end if
	}
    }//end for
    return s;
}//end function








app.post('/', function(req, res){
    
    console.log('post received');
    console.log(req.param('query', null));

    // for reference -- var url_string = 'http://localhost:8983/solr/select?q='+escape(query)+'&wt=json&rows=10';

    searchSolr(req, res, renderJqtpl, index_template, null);
});


app.listen(process.env.VCAP_APP_PORT || 3000);