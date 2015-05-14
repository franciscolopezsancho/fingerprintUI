/* application DB Service */
app.service('fingerprintService',function($http,myConfig,$timeout){

   //Configure Database
	var host = myConfig.mongohost;
	var port = "3000";
	var database = myConfig.mongodb;   
    var iapsuploadRs = myConfig.iapsNoticeCall;  

   this.getConfig = function(store){
    return myConfig;
   }


	this.refreshDashboard=function(store){
		console.log('Log:Call DBServices.refreshDashboard');
		refreshDashboard(store);
	};

   /* reload records section */
   refreshDashboard=function(store){ // define an instance method
		 // filter construction
		 var request_url = 'http://'+host+':'+port+'/'+database+'/fingerprinting';
		 var request_params = '?query={"supervised":{"$exists":false}}&operation=count';
	     var request1 = request_url + request_params ;
		 console.log('Log:refreshDashboard - Total Pending - XHR request:' + request1);

		 $http.get(request1)
		 	.success(function(data){			
    		  store.total = data;
			  console.log('Log:refreshDashboard - Total Pending - data:'+data);
		    })
		    .error(function(){			
    		  store.total = 'error';
			  console.log('error');
		    });

	   // infringing processed records requiring iaps upload
	   // filter construction
	   var requestUrl = 'http://'+host+':'+port+'/'+database+'/fingerprinting';
	   var requestQuery = '?query={"supervised":{"$exists":true}, "supervised.infringing":true, "supervised.iaps-uploaded":{"$exists":false},"iaps-uploaded":{"$exists":false} }&operation=count';	
	   var request2 = requestUrl + requestQuery;
	   console.log('Log:refreshDashboard - IAPS Pending - XHR request:' + request2);

	   $http.get(request2)
		   .success(function(data){
			   store.iapstotal = data;
			   console.log('Log:refreshDashboard - Iaps Pending - data:'+data);
		   })
		   .error(function(){
			   store.iapstotal = 'error';
			   console.log('error');
		   });

   };


    refreshDashboardDetailsCommon = function(store,platform,fieldToFill,supervised){    
            //Note: total of 8 calls will be make, two for each platform
            var requestUrl = 'http://'+host+':'+port+'/'+database+'/fingerprinting';
            if(!supervised){
                var requestParams = '?query={"supervised":{"$exists":'+supervised+'},"platform":"'+platform+'"}&operation=count';
            }   else{
                var requestParams = '?query={"supervised":{"$exists":'+supervised+'},"platform":"'+platform+'","supervised.infringing":true, "supervised.iaps-uploaded":{"$exists":false} ,"iaps-uploaded":{"$exists":false}}&operation=count';
            }
            var request1 = requestUrl + requestParams;
            $http.get(request1)
                .success(function(data1){
                    store[fieldToFill] = data1;
                });
    }

    /* reload records section */
    this.refreshDashboardDetails=function(store){ // define an instance method
        console.log('Log:Call refreshDashboardDetails');
        //Note: total of 8 calls will be make, two for each platform
        refreshDashboardDetailsCommon(store,"YouTube","hits_youtube",false)
        refreshDashboardDetailsCommon(store,"YouTube","iaps_youtube",true)
        refreshDashboardDetailsCommon(store,"Soundcloud","hits_soundcloud",false)
        refreshDashboardDetailsCommon(store,"Soundcloud","iaps_soundcloud",true)
        refreshDashboardDetailsCommon(store,"DailyMotion","hits_dailymotion",false)
        refreshDashboardDetailsCommon(store,"DailyMotion","iaps_dailymotion",true)
        refreshDashboardDetailsCommon(store,"Vimeo","hits_vimeo",false)
        refreshDashboardDetailsCommon(store,"Vimeo","iaps_vimeo",true)       
    };


    /* reload records section */
   this.reload=function(store,$scope){ // define an instance method
         console.log('Log:Call DBServices.reload');
		 //reset media player
		 store.playerlink = ' ';
		 store.playerurl = ' ';
	     store.uploadmessagetype = 0;

		 var filterPlatform = ''
         var filterArtist = ''
         var filterTitle = ''
         //evaluation filters from UI
         if (store.platform != 'ALL') {filterPlatform = ',"platform":"'+store.platform+'"';}          
         if ($scope.artist != '' && $scope.artist != null) {filterArtist =',"artist.artist":"'+$scope.artist+'"'; }        
         if ($scope.track != '' && $scope.track != null) {filterTitle = ',"title.titlename":"'+$scope.track+'"';} 

		 var requestQuery = '?query={"supervised":{"$exists":'+store.results+'}'+filterPlatform+filterArtist+filterTitle+'}';
		 var requestSort = '&sort={"_id":'+store.order+'}';
         var request0 = 'http://'+host+':'+port+'/'+database+'/fingerprinting' + requestQuery+requestSort;

         if (store.numrows != 'ALL') {
   		     request0 = request0 +'&limit='+store.numrows;
         }

		 console.log('Log:reload request:  ' + request0);
		 $http.get(request0).success(function(data){
  
			store.products = data;
            $scope.products = data;
			data.forEach.call(data,function(a){
				if(!a.supervised){
					a.supervised = Object();
					a.supervised.artist = a.artist.artist;
					a.supervised.titlename=a.title.titlename;
					a.supervised.owner=a.title.owner;
					a.supervised.infringing=false;
					a.supervised.comments="";
				}
                   /* var ref = new Firebase("https://intense-fire-1262.firebaseio.com");        
                    var usersRef = ref.child("users");
                    store.messages = usersRef.child(a._id).set(a);       */             
                });
			});
                     /* var ref = new Firebase("https://intense-fire-1262.firebaseio.com");


        
         var usersRef = ref.child("users");
        usersRef.set(data);*/
        
   };

   /*save document changes */
   this.save = function(product, store){
		console.log('Log:Call DBServies.save');
		console.log('Log:save - product obj: '+JSON.stringify(product));
		console.log('Log:save - store total (entering): '+store.total);

		//prepare request to save to Mongo
		product.supervised["date"] = new Date().toString();
        
		//create a clone of underlying angular product row (so can manipulate for request) 

		// var productupdate = JSON.parse(JSON.stringify(product));
		var productupdate = jQuery.extend({}, product);
        productupdate.supervised["date"] = new Date().toString();
       
		if(productupdate._id == undefined){productId = productupdate.$id}else{productId = productupdate._id};	
		delete productupdate._id;
        delete productupdate.$id;
		delete productupdate.$$hashKey;
		delete productupdate.$$hashKey;
        delete productupdate.$priority;

        var ref = new Firebase("https://intense-fire-1262.firebaseio.com");        
        var usersRef = ref.child("users");                   
        store.messages = usersRef.child(productId).set(productupdate);
		//request url
		var request = 'http://'+host+':'+port+'/'+database+'/fingerprinting/'+productId;
		
		console.log('Log:save - request: ' + request);
		
		$http.put(request,JSON.stringify(productupdate))
		  .success(function(){	
  		    console.log('Log:save - success path');
			refreshDashboard(store);            
		});	         
	};

    /* Filtering methods (incl ordering) */
    //attempts were made to order at source (ie within MongoDB)

    this.filterArtist = function($scope) {
        var filterPlatform = ',"platform":"'+$scope.platform+'"';
        //Logical DB query - retrieve distinct Artist names for the given platform
        var requestUrl = 'http://'+host+':'+port+'/'+database+'/fingerprinting';
        var requestQuery = '?query={"supervised":{"$exists":false}' + filterPlatform + '}&operation=distinct&fields=artist&sort={"artist.artist":1}';

        var request = requestUrl + requestQuery;
        console.log('Log:filterArtist - XHR request:' + request);
        $http.get(request)
            .success(function(data){
                console.log('Log:filterArtist - data: '+data);
                //sort the array for display
                data.sort(function (value1, value2) {
                    value1.artist < value2.artist
                });
                $scope.artists = data;

            })
            
    };

    this.filterTrack = function($scope) {  
        var filterPlatform = ',"platform":"'+$scope.platform+'"';
        var filterArtist = ',"artist.artist":"'+$scope.artist+'"';
        //Logical DB query - retrieve distinct Artist names for the given platform
        var requestUrl = 'http://'+host+':'+port+'/'+database+'/fingerprinting';
        var requestQuery = '?query={"supervised":{"$exists":false}' + filterPlatform + filterArtist + '}&operation=distinct&fields=title&sort={"title.titlename":1}';

        var request = requestUrl + requestQuery;
        console.log('Log:filterTrack - XHR request:' + request);

        $http.get(request)
            .success(function(data){
                console.log('Log:filterTracks - data: '+data);
                //sort the array for display
                data.sort(function (value1, value2) {
                    value1.titlename < value2.titlename
                });
                $scope.tracks = data;
            })
            
    };


    /*NDI IAPS notice call - Submit call */
   this.iapsUpload = function(store, platform){
        //activate modal dialog
        store.expired = false	
        store.playerlink = ' '  
	   //request url
	   var request = iapsuploadRs;
	   console.log('Log:iapsUpload - request: ' + request);

	   // $http.post(request, JSON.stringify(iapsXml))
	   $http.get(request)
		   .success(function(dataxml){
			   //extract notice id
			   console.log('log:iapsUpload Success - Data: ' + dataxml);			  
			   if (dataxml.indexOf("200") != -1) {						  
				   store.uploadmessagetype = 1;  //success
                   //reload screen
                    $timeout(function() {store.reload() }, 2000);
			   }else if (dataxml.indexOf("nothing to process") != -1) {                       
                   store.uploadmessagetype = 3;  //success                                  
               }else {
				   store.uploadmessagetype = 2;  //error
			   }
		   })
		   .error(function(data){
			   //alert('Failure calling IAPS Upload Service.' );
			   store.uploadmessagetype = 5;  //error
			   console.log('log:iapsUpload Error - Data: ' + data);
		   });
        $timeout(function() { 
            store.expired = true }, 5000);    
        };//this.iapsUpload





});
 
