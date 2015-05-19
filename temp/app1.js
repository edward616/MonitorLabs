
var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
	util = require('util'),
	mime = require('mime'),
	queryString = require('querystring');


//connect to mysql 
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '12357'
});
connection.connect();
connection.query('use labsInfo;');
connection.query('create table IF NOT EXISTS vmsInfo(ID int(11),SessionID int(3),ComputerName varchar(100),DomainName varchar(100),excepMes varchar(225),State varchar(50),\
		ClientName varchar(50),WindowStationName varchar(50),UserAccount varchar(225),IPAddress varchar(100),LastInputTime varchar(225),LoginTime varchar(225),\
		create_time datetime);',function(err,rows){
	if(err) throw err;
});

var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"
};
/*var getHistoryUsersByVMS = function(vms,callback){
	var vmsLen = vms.length;
	var results = [];
	for(var i in vms){	
		(function(cName){		
			//var vm = vms[i];
			var sql = "select ClientName,CAST(create_time AS CHAR(30)) create_time from vmsInfo a where a.ComputerName=? and a.ClientName is not NULL and a.ClientName !='' \
			and create_time < (select create_time from vmsInfo b where b.ComputerName=a.ComputerName order by create_time desc limit 1);";
			connection.query(sql,[cName],function(err,rows,fields){
				console.log(cName);
				console.log(rows);
				results.push(rows);
				//results.push(123);
				console.log(results);
				if(0 == --vmsLen){					
					callback(results);
				}
				
			});
		})(vms[i].ComputerName);	
	}
	
}*/

var getHistoryUsersByVMS = function(vms,callback){
	var vmsLen = vms.length;
	var results = [];
	for(var i in vms){
		(function(vm){		
			var cName = vm.ComputerName;
			//var vm = vms[i];
			var sql = "select ClientName,CAST(create_time AS CHAR(30)) create_time from vmsInfo a where a.ComputerName=? and a.ClientName is not NULL and a.ClientName !='' \
			and create_time < (select create_time from vmsInfo b where b.ComputerName=a.ComputerName order by create_time desc limit 1);";
			connection.query(sql,[cName],function(err,rows,fields){
				console.log(cName);
				vm.historyUsers = rows;
				results.push(vm);
				console.log(results);
				if(0 == --vmsLen){					
					callback(results);
				}
			});
		})(vms[i]);	
	}
	
}



/*function addHistoryUsersToVMS(vms,historyUsers){
	for(var i=0;i<historyUsers.length;i++){
		vms[i].historyUsers = historyUsers[i];
	}
	return vms;
}*/


http.createServer(function(req, res) {
  var uri = url.parse(req.url).pathname;
  
  if(uri === "/converttojson"){
	var file = __dirname + '/resources/converttojson.ps1';
	var filename = path.basename(file);
	var mimeType = mime.lookup(file);
	res.setHeader('Content-disposition', 'attachment; filename=' + filename);
	res.setHeader('Content-type', mimeType);
	var filestream = fs.createReadStream(file);
	filestream.pipe(res);
  }else if(uri === "/labsInfo"){	  
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
  }else if(uri === "/labsInfo/getDomainName"){
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'application/json');
		//res.writeHead(200, {'Content-Type': 'text/plain'});
		console.log("getDomainName is starting");
		connection.query('use labsInfo;');
		connection.query('select distinct domainName from vmsInfo;',function(err,rows,fields){
			var retStr = JSON.stringify(rows);
			console.log(retStr);
			res.end(retStr);
		});
  }else if(uri.match("/labsInfo/getVMSByDomainName")){
		console.log("getVMS is starting");
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'application/json');
		res.setHeader("Access-Control-Allow-Methods", "POST");
		var jsData = null;
		var data = "";
		req.on('data',function(chunk){
		  data += chunk;
		  console.log("the data is reaching");
		});
		req.on('end',function(){
			console.log(data);
			jsData = JSON.parse(data);
			console.log(jsData['domainName']);
			
			connection.query('use labsInfo;');
			connection.query('select ComputerName,ClientName from vmsInfo a where a.domainName=? and create_time = (\
			select create_time from vmsInfo b where b.domainName=a.domainName order by create_time desc limit 1)',[jsData.domainName],function(err,rows,fields){				
				console.log(rows);			
				var vms = rows;
				getHistoryUsersByVMS(vms,function(results){
					console.log(results);
					//vms = addHistoryUsersToVMS(vms,results);
					//var jsonData = JSON.stringify(vms);
					//res.end(jsonData);
					res.end(JSON.stringify(results));
				})
				//getHistoryUsersByVMS(vms);
				//console.log(vms);
			});
		});
		req.on('error', function(e) {
			console.log('problem with request: ' + e.message);
		});
		
	}else if(uri.match("/labsInfo/getHistoryUsersByName")){
		console.log("getHistoryUsersByName is starting");
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'application/json');
		res.setHeader("Access-Control-Allow-Methods", "POST");
		var data = "";
		req.on('data',function(chunk){
		  data += chunk;
		  console.log("the data is reaching");
		});
		req.on('end',function(){
			console.log(data);
			var jsonData = JSON.parse(data);
			console.log(jsonData["vmName"]);
			connection.query('use labsInfo;');			
			var sql = "select ClientName,CAST(create_time AS CHAR(30)) create_time from vmsInfo a where a.ComputerName=? and a.ClientName is not NULL and a.ClientName !='' \
			and create_time < (select create_time from vmsInfo b where b.ComputerName=a.ComputerName order by create_time desc limit 1);";
			connection.query(sql,[jsonData.vmName],function(err,rows,fields){
				console.log(rows);
				var retStr = JSON.stringify(rows);
				console.log(retStr);
				res.end(retStr);
			})
		})
	}else{
		
		  console.log(uri);
		  var filename = path.join(process.cwd(), unescape(uri));
		  console.log(filename + process.cwd() + unescape(uri));
		  if(uri === "/"){
			filename += "view/index.html";
		  }
		  var stats;
		  try {
			stats = fs.lstatSync(filename); // throws if path doesn't exist
		  } catch (e) {
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('404 Not Found\n');
			res.end();
			return;
		  }
		  if (stats.isFile()) {
			// path exists, is a file
			var mimeType = mimeTypes[path.extname(filename).split(".").reverse()[0]];
			res.writeHead(200, {'Content-Type': mimeType} );
			var fileStream = fs.createReadStream(filename);
			fileStream.pipe(res);
		  } else if (stats.isDirectory()) {
			// path exists, is a directory
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.write('Index of '+uri+'\n');
			res.write('TODO, show index?\n');
			res.end();
		  } else {
			// Symbolic link, other?
			// TODO: follow symlinks?  security?
			res.writeHead(500, {'Content-Type': 'text/plain'});
			res.write('500 Internal server error\n');
			res.end();
		  }
  }
}).listen(3000);
console.log('Server running at http://127.0.0.1:3000/');

