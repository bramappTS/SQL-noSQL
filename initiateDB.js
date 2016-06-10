importExtension( "qt.core" );
importExtension( "qt.network" );
importExtension( "qt.sql" );
importExtension( "eba.util" );

function main() {

	var queries = ['    \
		CREATE TABLE billJSONB (   \
			id      SERIAL PRIMARY KEY, \
			bill     jsonb,  \
			added   timestamp   \
		); \
		','\
		CREATE TABLE billSQLcustomer ( \
			bill_id	SERIAL PRIMARY KEY, \
			customer_name	varchar(30),    \
			customer_address	varchar(50),  \
			ddv		varchar(10),    \
			trr		varchar(15),	\
			added timestamp	DEFAULT now()\
		);',' \
		CREATE TABLE billSQLitems ( \
			item_id	SERIAL PRIMARY KEY, \
			bill_id integer REFERENCES billSQLcustomer,   \
			item_name varchar(30),   \
			item_price	integer    \
		);','\
		DROP TYPE IF EXISTS holder CASCADE;	\
		','\
		create type holder as (item_id int, item_name text, item_price int);	\
		','\
		CREATE OR REPLACE FUNCTION addBillJ(JSON)RETURNS int AS $$  \
			DECLARE	\
				result int;	\
			BEGIN   \
				INSERT INTO billJSONB(bill, added) VALUES($1, now()) RETURNING id INTO result;   \
				RETURN result;	\
			END;    \
		$$ LANGUAGE plpgsql;    \
		','\
		CREATE OR REPLACE FUNCTION get_items_from_bill(JSON) RETURNS SETOF holder AS $$	\
		DECLARE	\
			r json;	\
			i json;	\
			b holder%rowtype;	\
		BEGIN	\
			FOR i IN	\
				SELECT * FROM json_array_elements_text($1)	\
			LOOP	\
				SELECT x.item_id, x.item_name, x.item_price FROM json_to_record(i) as x(item_id int, item_name text, item_price int) INTO b;	\
				RETURN NEXT b;	\
				\
			END LOOP;	\
			RETURN;	\
		END;	\
		$$ LANGUAGE plpgsql;	\
		','\
		CREATE OR REPLACE FUNCTION addBill(JSON) RETURNS void AS $$  \
			DECLARE	\
				json_id int;	\
				sql_id int;	\
			BEGIN   \
				SELECT addBillJ($1) INTO json_id;   \
				\
				INSERT INTO billSQLcustomer VALUES(DEFAULT, $1::jsonb ->> \'customer_name\', $1::jsonb ->> \'customer_address\', $1::jsonb ->> \'ddv\', $1::jsonb ->> \'trr\') RETURNING bill_id INTO sql_id;   \
				\
				INSERT INTO billSQLitems(item_id, item_name, item_price) SELECT * FROM get_items_from_bill($1::json-> \'items\');	\
				\
				RETURN;	\
			END;    \
		$$ LANGUAGE plpgsql;    \
		'];

		//SELECT '{"foo": {"bar": "baz"}}'::jsonb @> '{"bar": "baz"}'::jsonb;
		//json_array_elements(json)
		//json_to_record(json)
		//json_to_recordset(json)
		//json_to_recordset('[{"a":1,"b":"foo"},{"a":"2","c":"bar"}]') as x(a int, b text);
		/*
		FOR r IN
        SELECT * FROM foo WHERE fooid > 0
		LOOP
			INSERT INTO billSQLitems(itemID, itemName, itemPrice) VALUES r
		END LOOP;
		
		INSERT INTO user_subservices(user_id, subservice_id) 
		SELECT 1 id, x
		FROM  	unnest(ARRAY[1,2,3,4,5,6,7,8,22,33]) x
		*/
	// connect to database
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
	
	for(var i=0; i<queries.length; i++){
		var que = new QSqlQuery(db);
		que.setForwardOnly(true);
		que.prepare(queries[i]);
		//que.addBindValue(new Date());
		//que.addBindValue("Demo");
		ok = que.exec();
		if(!ok) {
			println("sql failed, qurey #"+i+": "+ que.lastError().text());
			//return -1;
		}else{
			println("sql sucess, qurey #"+i);
		}
		
		while(que.next()) {
			var a = que.value(0);
			var b = que.value(1);
		}
	}
	
	/** end of script
	*/
	
	/** below here are usefull functions and variables
	*/

}