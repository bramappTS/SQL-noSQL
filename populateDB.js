importExtension( "qt.core" );
importExtension( "qt.network" );
importExtension( "qt.sql" );
importExtension( "eba.util" );

var item_list = ["Ferarri", "Lamborghini", "Porsche", "Aston Martin", "McLaren", "Buggati"];
var customer_list = ["Bill", "Steve", "Larry", "Mark"];
var address_list = ["Callifornia", "Texas", "New York", "London", "Beijing"];
var ddv_list = ["123456", "654321", "123321"];
var trr_list = ["SI56 1234 5678", "SI56 5555 6666", "SI56 2222 8888"];

function RandomArrayItem(arr){
	return arr[Math.floor(Math.random()*arr.length)]	//Choose a random item from item_list
}
function RandomInt(i){
	return Math.floor(Math.random()*i);
}
function generateItem(startID){	//generate a JSON string
	println(" "+startID);
	JSON = '{"item_id":';
	JSON += startID++;	//Needs a unique ID
	JSON += ', "item_name":"'
	JSON += RandomArrayItem(item_list);	//Choose a random item from item_list
	JSON += '", "item_price":';
	JSON += RandomInt(10);	//Choose a random price
	JSON += '}';
	return JSON;
}
function generateItems(num, startID){
	JSON = "[";
	for(var i = startID; i<startID+num; i++){
		if(i != startID) JSON +=",";	//puts a comma between items
		JSON += generateItem(i);	//gets a JSON with a random item
	}
	JSON += "]";
	return JSON;
}

function generateBill(num, startID){
	startID = startID || 1;
	JSON = '{';
	JSON += '"customer_name": "'+RandomArrayItem(customer_list)+'",';
	JSON += '"customer_address": "'+RandomArrayItem(address_list)+'",';
	JSON += '"ddv": "'+RandomArrayItem(ddv_list)+'",';
	JSON += '"trr": "'+RandomArrayItem(trr_list)+'",';
	JSON += '"items": '+generateItems(num, startID);
	JSON += '}';
	return JSON;
}

function main() {
	
	var Bill = {
		"customer_name": "Bill",
		"customer_address": "Litostrojska 40",
		"ddv": "123456",
		"trr": "SI56 1234 5678",
		"items": [{
			"item_id": 3,
			"item_name": "Ferarri",
			"item_price": 5
		},{
			"item_id": 4,
			"item_name": "Lamborgini",
			"item_price": 4
		}]
	};
	
	var db = QSqlDatabase.addDatabase("QPSQL", "BramApp");
	db.setHostName("localhost");
	db.setDatabaseName("test");
	db.setUserName("postgres");
	db.setPassword("test");
	var ok = db.open();
	if(!ok) {
		println("not connected");
		return -1;
	}else{
		println("connection successful")
	}
	
	itemID = 149850736;	//number at which item IDs start
	billNum = 10;	//number of bills to be added
	
	for(var i = 0; i<billNum; i++){
		println("--------start query------------");
		var que = new QSqlQuery(db);
		que.setForwardOnly(true);
		que.prepare('SELECT addBill(?)');
		billTmp = generateBill(3,itemID+3*i);
		println(billTmp);
		que.addBindValue(billTmp);	//make a bill with <first parameter> items with their IDs starting at <second parameter>
		//que.addBindValue("Demo");
		ok = que.exec();
		if(!ok) {
			println("sql failed, query: ");
			println(que.lastError().text());
			return -1;
		}else{
			println("sql sucess ");
		}
		
		
		while(que.next()) {
			var a = que.value(0);
			var b = que.value(1);
			
			println("a: "+a);
			//println("2: "+b);
			println("--------end query-------------");
		}
		
		println("loope end " + i);
		var rt = 90;
		println(rt);
		println(90);

		
		//que.finish();
	}
}
