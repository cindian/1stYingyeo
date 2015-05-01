var imdae_yingyeo= {}
var db_file= null;

imdae_yingyeo.indexedDB= function(request, callback){
	this.db= null;
	var version= 2;
	var db_request= indexedDB.open('imdae_yingyeo', version);

	db_request.onupgradeneeded= function(event) {
		var db= event.target.result;
		
		if(!db.objectStoreNames.contains('setting')){
			var objectStore= db.createObjectStore('setting', {keyPath: 'last_sync'});
		}
		if(!db.objectStoreNames.contains('my_threads')){
			var objectStore= db.createObjectStore("my_threads", { keyPath: "articleIndex" });
			objectStore.createIndex("table_id", "table_id", { unique: false });
			objectStore.createIndex("last_update", "last_update", { unique: false });
      		// 0: favorite, 1: owned, 2: commented
			objectStore.createIndex("type", "type", { unique: false }); 
		}
		if(!db.objectStoreNames.contains('fav_rethreads')){
			var objectStore= db.createObjectStore('fav_rethreads', {keyPath: 'rethreadIndex'});
			objectStore.createIndex('table_id', 'table_id', {unique: false});
			objectStore.createIndex('articleIndex', 'articleIndex', {unique: false});
			objectStore.createIndex('last_update', 'last_update', {unique: false});
		}
		if(!db.objectStoreNames.contains('recent_threads')){
			var objectStore= db.createObjectStore("recent_threads", { keyPath: "articleIndex" });
			objectStore.createIndex("table_id", "table_id", { unique: false });
			objectStore.createIndex("last_update", "last_update", { unique: false });
		}
	}

	db_request.onsuccess= function(event){
		imdae_yingyeo.indexedDB.db= event.target.result;
		imdae_yingyeo.indexedDB.exec(request, callback);
	}

	db_request.onerror= this.onerror;
}

imdae_yingyeo.indexedDB.onerror= function(){
	console.log("DB Error", arguments);
}

imdae_yingyeo.indexedDB.exec= function(request, callback){
	var result= null;
	var trans= this.db.transaction([request.table], 'readwrite');
	var store= trans.objectStore(request.table);
	var db_request= null;
	switch(request.action){
		case 'get':
			db_request= store.get(request.key * 1);
			db_request.onsuccess= function(event){
				result= db_request.result;
			}
			break;
		case 'getAll':
			result= [];
			db_request= store.index('last_update').openCursor(null, 'prev');
			db_request.onsuccess= function(event){
				var resource= event.target.result;
				if(!!resource){
					result.push(resource.value);
					resource.continue();
				}
			}
			break;
		case 'find':
			result= [];
			var range= IDBKeyRange.only(request.key * 1);
			db_request= store.index(request.filter).openCursor(range);
			db_request.onsuccess= function(event){
				var resource= event.target.result;
				if(!!resource){
					result.push(resource.value);
					resource.continue();
				}
			}
			break;
		case 'add':
		case 'update':
			db_request= store.put(request.data);
			db_request.onsuccess= function(event){
				result= true;
			}
			break;
		case 'delete':
			db_request= store.delete(request.key);
			db_request.onsuccess= function(event){
				result= true;
			}
			break;
		default:
	}
	trans.oncomplete= function(){
		callback({'result': result});
	}
}

/*
 * @table should be ['fav_rethreads', 'my_threads', 'setting'],
 * @result should be {} at the first call
 */
imdae_yingyeo.indexedDB.exec.export= function(tables, result){
	var result= result;
	var trans= this.db.transaction([tables[0]], 'readwrite');
	var store= trans.objectStore(tables[0]);
	var db_request= store.openCursor();
	db_request.onsuccess= function(event){
		var resource= event.target.result;
		var table_result= [];
		if(!!resource){
			table_result.push(resource.value);
			resource.continue();
		}
		result[tables[0]]= table_result;
		tables.shift();
		if(tables.length > 0){
			imdae_yingyeo.indexedDB.exec.export(tables, result);
		} else {
			imdae_yingyeo.indexedDB.exec.export.throwFile(result);
		}
	}
	function throwFile(result){
		var data= new Blob([result], {type: 'text/json'});
		if(db_file != null) window.URL.revokeObjectURL(db_file);
		db_file= window.URL.createObjectURL(data);
		return db_file;
	}
}