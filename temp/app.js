
//nodejs server 

var http = require('http');
var url = require('url');
var util = require('util');
var path = require('path');
var fs = require('fs');
var mime = require('mime');
var queryString = require('querystring');

//connect to mysql 
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '12357'
});
connection.connect();
connection.query('use labsInfo;');
connection.query('create table IF NOT EXISTS vmsInfo(SessionID int(3),ComputerName varchar(100),DomainName varchar(100),excepMes varchar(225),State varchar(50),\
		ClientName varchar(50),WindowStationName varchar(50),UserAccount varchar(225),IPAddress varchar(100),LastInputTime varchar(225),LoginTime varchar(225),\
		create_time datetime);',function(err,rows){
	if(err) throw err;
});



http.createServer(function (req, res) {
	/*var filePath = '.' + req.url;
	if (filePath == './index'){
		filePath = './view/index.html';
	var contentType = 'text/html';
	fs.readFile(filePath, function(error, content) {
    if (error) {
        if(error.code == 'ENOENT'){
            fs.readFile('./404.html', function(error, content) {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            });
        }
        else {
            res.writeHead(500);
            res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
            res.end(); 
        }
    }
    else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
    }
	});
	}*/
	
  var urlObj = url.parse(req.url,true);
  if(urlObj.pathname === "/converttojson"){
	var file = __dirname + '/resources/converttojson.ps1';
	var filename = path.basename(file);
	var mimeType = mime.lookup(file);
	res.setHeader('Content-disposition', 'attachment; filename=' + filename);
	res.setHeader('Content-type', mimeType);
	var filestream = fs.createReadStream(file);
	filestream.pipe(res);
  }else if(urlObj.pathname === "/"){
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.write('hello');
	res.end('Hello World\n' + __dirname);
  }else if(urlObj.pathname === "/labsInfo"){	  
	  //accept data from vm.
	  var data = "";
	  req.on('data',function(chunk){
		  data += chunk;
		  console.log("the data is reaching");
	  });
	  
	  req.on('end',function(){
		 console.log(data);
		 console.log("hello world");
		 var jsonObj = JSON.parse(data);
		 console.log(jsonObj);
		  connection.query('use labsInfo;');
		  for(var i=0;i < jsonObj.length;i++){
			  console.log(jsonObj[i].ComputerName);
			  connection.query('insert into vmsInfo(SessionID,ComputerName,DomainName,excepMes,State,ClientName,WindowStationName,UserAccount,\
			  IPAddress,LastInputTime,LoginTime,create_time) values(?,?,?,?,?,?,?,?,?,?,?,now())',[jsonObj[i].SessionID,jsonObj[i].ComputerName,jsonObj[i].DomainName,
			  jsonObj[i].excepMes,jsonObj[i].State,jsonObj[i].ClientName,jsonObj[i].WindowStationName,jsonObj[i].UserAccount,jsonObj[i].IPAddress,jsonObj[i].LastInputTime,
			  jsonObj[i].LoginTime],function(err,rows,fields){
				 if(err) throw err;
					console.log(rows);
			  });
		  }
		res.end("success");		  
	  });
	}else if(urlObj.pathname === "/labsInfo/getDomainName"){
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'application/json');
		//res.writeHead(200, {'Content-Type': 'text/plain'});
		console.log("getDomainName is starting");
		connection.query('use labsInfo;');
		connection.query('select distinct domainName from vmsInfo;',function(err,rows,fields){
			var retStr = JSON.stringify(rows);
			console.log(retStr);
			//res.write("hahaha");
			res.end(retStr);
		});
	}else if(urlObj.pathname.match("/labsInfo/getVMSByDomainName")){
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'application/json');
		res.setHeader("Access-Control-Allow-Methods", "GET, POST");
		console.log("getVMS is starting");
		console.log(req.method);
		//var jsData = JSON.parse(req.body.myData);
		//console.log(req.body);
		var data = "";
		var jsData = null;
		req.on('data',function(chunk){
		  data += chunk;
		  console.log("the data is reaching");
		});
		req.on('end',function(){
			console.log(data);
			jsData = JSON.parse(data);
		});
		//console.log(urlObj);
		//var dataArray = urlObj.pathname.split('?');
		//console.log(dataArray);
		
		//var dataObj = urlObj.query;
		
		connection.query('use labsInfo;');
		connection.query('select ComputerName,ClientName from vmsInfo where domainName=?',[jsData.domainName],function(err,rows,fields){
			var retStr = JSON.stringify(rows);
			console.log(retStr);
			res.end(retStr);
		});
	}
  //connection.end();
}).listen(3000);
console.log('Server running at http://127.0.0.1:3000/');






//get data from mysql
//select distinct domainName from vmsInfo;
/* console.log("getDomainName is starting");
connection.query('use labsInfo;');
connection.query('select ComputerName,ClientName from vmsInfo where ?',[{domainName:'WM-LN13'}],function(err,rows,fields){
	console.log(rows); 
}); */



/*var receiveJson = JSON.parse('[{"ComputerName":"WM-LN13-DB1","ClientName":"","SessionID":"1","WindowStationName":"Console","State":"Active","DomainName":"WM-LN13",\
"LastInputTime":"3/4/2015 5:24:11 PM","LoginTime":"1/20/2015 9:52:05 PM","IPAddress":"","UserAccount":"WM-LN13\Administrator"},{"ComputerName":"WM-LN13-DB2",\
"ClientName":"","SessionID":"1","WindowStationName":"Console","State":"Active","DomainName":"WM-LN13","LastInputTime":"3/4/2015 5:26:32 PM",\
"LoginTime":"1/27/2015 12:26:17 AM","IPAddress":"","UserAccount":"WM-LN13\Administrator"}]')

console.log(receiveJson);
console.log(receiveJson[0].ComputerName)
for(var i=0;i<receiveJson.length;i++){
	console.log(receiveJson[i].ComputerName);
	for(var v in receiveJson[i]){
		console.log(v);
		var vv = v.toString();
		console.log(receiveJson[i][vv]);
		//console.log(v.key);
		//console.log(v.keys)
	}
}
*/
/*var ss = JSON.parse('[{"xx":"rr"},{"xx":"lala"}]');
//var ss = JSON.parse('{"xx":"rr"}');
console.log(ss);
for(var i = 0; i < ss.length;i++){
	console.log(ss[i].xx);
	console.log(ss[i]);
}*/


/*var jb = JSON.parse(str);
for(var i=0;i<jb.length;i++){
	console.log(jb[i].ComputerName);
	for(var v in jb[i]){
		console.log(v);
		console.log(v.key);
		console.log(v.keys)
	}
}*/

/*var id = 111;
var name="lala";
connection.query('use labsInfo;');
	  connection.query('insert into test(id,name,create_time) values(?,?,now());',[id,name],function(err,rows,fields){
		  if(err) throw err;
		  console.log(rows);
}); */

/* connection.query('use labsInfo;');
	  connection.query('insert into test(id,name,create_time) values(6,"hello",now());',function(err,rows,fields){
		  if(err) throw err;
		  console.log(rows);
	  }); */







/*
var receiveData = function(data,res){
	console.log(data);
	res.end("success");
  };
  
 req.on('end',function(){
	  try{
		  //var result = util.inspect(queryString.parse(data));
	  }catch(er){
		  console.log('error');
	  }
	  //console.log(queryString.parse(data));
	  console.log(data);
	  res.end("success");
  });
  
*/


//download file from the server
var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};
