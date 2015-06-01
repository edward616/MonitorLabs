
var http = require('http'),
	path = require('path'),
    url = require('url');
var dao = require('./app_modules/dao'),
    http_server = require('./app_modules/http_server'),
	RDPFileService = require('./app_modules/createRDPFile');
var rdp = require('node-rdp');
var util = require('util');
var qs = require('querystring');

http.createServer(function(req, res) {
  var uri = url.parse(req.url).pathname;
  var data = "";
  if(req.method == "POST"){
	  req.on('data',function(chunk){
		  data += chunk;
		  console.log("the data is reaching");
	  });
  }
  if(uri === "/MonitorLabs"){
	http_server.responseFile(__dirname,res,"MonitorLabs.zip");
	
  }else if(uri === "/saveLabsInfo"){	  
	  //accept data from vm.
	  req.on('end',function(){
		dao.saveLabsInfo(data);
		res.end("success");		  
	  });
  }else if(uri === "/labsInfo/getDomainName"){
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'application/json');
		console.log("getDomainName is starting");
		dao.getDomainName(res);
  }else if(uri.match("/labsInfo/getVMSByDomainName")){
		console.log("getVMS is starting");
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'application/json');
		res.setHeader("Access-Control-Allow-Methods", "POST");	
		req.on('end',function(){
			dao.getVMSByDomainName(res,data);
		});
  }else if(uri == "/labsInfo/getRDPFileByFullName"){
	  req.on('end',function(){
		  console.log(data);
		  var jsObj = JSON.parse(data);
		  var fullDomainName = jsObj.fullDomainName;
		  var fileName = fullDomainName + ".rdp";
		  //var fileFullPath = 
		  RDPFileService.createRDPFile(fullDomainName,fileName);
		  http_server.responseFile(__dirname,res,fileName);
		  res.end(fileName);
	  })
	  //http_server.responseFile(__dirname,res,"WM-LN13-DB3.wm-ln13.wm.zhu.cn.qsft.rdp");
  }else if(uri.match("/labsInfo/downloadRDPFile")){
	   var data = qs.parse(url.parse(req.url).query);
	   console.log(data);
	   var fileName = data.fileName;
	   http_server.responseFile(__dirname,res,fileName);
  }else if(uri == '/aaa'){
	   http_server.responseFile(__dirname,res,"WM-LN13-DB3.wm-ln13.wm.zhu.cn.qsft.rdp");
   }else{
		http_server.httpRespond(res,uri);
		//http_server.responseFile(__dirname,res,"test.txt");
  }
}).listen(3000);
console.log('Server running at http://127.0.0.1:3000/');




/*rdp({
  address: '10.30.150.200:1334',
  username: 'wm-ln13.wm.zhu.cn.qsft\administrator',
  password: 'I@mroot'
}).then(function() {
  console.log('At this, point, the connection has terminated.');
});*/

/*var child_process = require('child_process');
child_process.exec(__dirname + '/resources/WM-LN13-DB3.wm-ln13.wm.zhu.cn.qsft.rdp', function(err, stdout, stderr) {
  console.log(err);
});*/



/*var a = "youare right";
if(a.match("youare")){
	console.log("hello");
}
console.log(a.subString(1,4));
if(a.endsWith("ht")){
	console.log("htttt");
}

var fs = require('fs');
fs.readFile('test.txt','utf8',function(err,data){
	if(err) throw err;
	console.log(data);
})
var changeFormatPath = "./resources/default1.txt";
fs.readFile(changeFormatPath,'utf8',function(err,data){
			if(err) throw err;
			console.log(data);
});*/