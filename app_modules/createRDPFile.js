// create RDP file and response
var fs = require('fs');


exports.createRDPFile = function(fullComputerName,fileName){
	//copy default rdp file and add vmName
	//exist
	//var defaultFilePath = "./resources/Default.rdp";
	var changeFormatPath = "./resources/default1.txt";
	//fs.rename(defaultFilePath,'./resources/Default.txt');
	var filePath = "./resources/" + fileName;
	if(!fs.existsSync(filePath)){
		fs.readFileSync(changeFormatPath,'utf8').toString().split('\n').forEach(
			function(line){
				console.log(typeof line);
				console.log(line.trim());
				var str = line.toString();
				console.log(typeof str);
				console.log(str);
				console.log(str.length);
				if(str.match("full address:s:")){
					str = "full address:s:" + fullComputerName;
				}
				fs.appendFileSync(filePath,str+ "\n",'utf8');
			}
		);
		/*fs.readFile(changeFormatPath,'utf8',function(err,data){
			if(err) throw err;
			console.log(data);
		});*/
	}
	
}




/* fs.readFileSync("../resources/test.txt").toString().split('\n').forEach(
	function(line){
		console.log(line);
		/* fs.open("../resources/out.txt",'a',0666,function(err,fd){
			fs.writeSync(fd,line.toString() + "\n",null,undefined,function(err,written){
				
			});
		}); 
		fs.appendFileSync("../resources/out.txt", line.toString() + "\n");
	}
);

fs.renameSync("../resources/out.txt","../resources/outtttttttttt.txt") */