//read userNameMapping from mysql
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '12357'
});
connection.connect();
connection.query('use labsInfo;');
connection.query('create table if not exists userNameMapping(id int(11) primary key auto_increment,Owner varchar(100),QuestPropertyNO varchar(100));',function(err,rows){
	if(err) throw err;
}); 

/*exports.getUserNamesMapping = function(){
	connection.query('select * from userNameMapping;',function(err,rows,fields){
		console.log(rows);
	}
}*/
function getUserNamesMapping(){
	var result = null;
	connection.query('select * from userNameMapping;',function(err,rows,fields){
		console.log(rows);
		//return rows;
		result = rows;
	});
	return result;
}

function saveUserNamesToDB(workbook){
	connection.query('use labsInfo;');
	connection.query('select count(*) count from userNameMapping;',function(err,rows,fields){
		console.log(rows[0].count);
		if(rows[0].count == 0){
			var userNameJson = to_json(workbook);
			var rows = userNameJson.Sheet1;
			for(var i=0;i < rows.length;i++){
				connection.query('insert into userNameMapping(Owner,QuestPropertyNO) values(?,?);',[rows[i].Owner,rows[i].QuestPropertyNO],function(err,rows,fields){
					if(err) throw err;
				});
			}
		}
	});
}

var result = getUserNamesMapping();
console.log(result);