'use strict';

app.controller('fingerprintCtrl',function($http,fingerprintService,$sce,$scope,$firebaseArray,$filter,$rootScope){



   var ref = new Firebase("https://intense-fire-1262.firebaseio.com");



   var usersRef = ref.child("users");
   $scope.messages = $firebaseArray(usersRef);
      // synchronize the object with a three-way data binding
      // click on `index.html` above to see it used in the DOM!
      $scope.addMessage = function() {
        $scope.messages.$add({
          text: $scope.newMessageText
        });
      };


      var store = this;
      var http = $http;  
      store.config = fingerprintService.getConfig();      
        //data records models
        store.products = [];

    //$scope.products = store.products


    store.selectedrow = null;
        //player models
        store.playerlink;
        store.playerurl;
        store.playerurldown;
    //Filter
    store.results = 'false';
    store.platform = 'YouTube';
    //Sort
    store.sort = '';
    store.numrows = 20;
    //fingerprint dashboard   
    store.total = 0;
    store.iapstotal = 0;
    //Iaps upload
    store.noticeid;
    store.order = 1;
    store.artistFilter = '';
    store.titleFilter = '';
    store.ownerFilter = '';
    $scope.uploadplatform = 'YouTube';

        //Filtering
        $scope.platform = 'YouTube';
        $scope.artist = '';
        $scope.track = '';
        $scope.expired = false

        //initialise records
        fingerprintService.reload(store,$scope);
        $scope.uploadplatform = $scope.platform;
        fingerprintService.refreshDashboard(store);

        //fingerprint dashboard drilldown
        store.hits_youtube = 0;
        store.iaps_youtube = 0;
        store.hits_soundcloud = 0;
        store.iaps_soundcloud = 0;
        store.hits_dailymotion = 0;
        store.iaps_dailymotion = 0;
        store.hits_vimeo = 0;
        store.iaps_vimeo = 0;


    //watches
    $scope.$watch('uploadplatform',function(newValue,oldValue){
      store.uploadmessagetype = 0;
      console.log('uploadplatform $watch called - new value: '+ newValue);
    });

    $scope.$watch('platform',function(newValue,oldValue){
      store.platform = newValue;
      $scope.uploadplatform = newValue;
      console.log('platform $watch called - new value: '+ newValue);
            //fingerprintService.filterArtist($scope);
            $scope.artist = '';
            //$scope.artists = '{}';
            $scope.track = '';
            //$scope.tracks = '{}';
            store.filterArtist(store);
          });

    $scope.$watch('artist',function(newValue,oldValue){
      console.log('artist $watch called - new value: '+ newValue);
            //fingerprintService.filterArtist($scope);
            $scope.track = '';
            store.filterTrack(store);
          });




    $scope.$watch('messages', function (newVal, oldVal) 
    { 
      //  console.log('##################watching products stringify: '+ JSON.stringify(newVal)); 
      console.log('##################watching products call: '+oldVal._id); 
      


      for(var i = 0; i < newVal.length; i++){
       delete newVal[i].$$hashKey;
     }
    // We filter the array by id, the result is an array
    // so we select the element 0
    var changed = ""
    if(newVal.length == 1 ){
      changed = newVal[newVal.length-1];
    }else if ( newVal.length > oldVal.length){
     for(var i = 0; i < newVal.length; i++){
      for(var j = 0; j < oldVal.length; j++){              
        if(oldVal[j].$id == newVal[i].$id){
         changed = "";
         break;
       }else{          
         changed = newVal[i];
       }
     }
        // console.log("changed "+changed.$id);
        if(changed != ""){ 
          break;
        };
      }
    }else{

      for( i = 0; i < oldVal.length; i++){
        if(JSON.stringify(oldVal[i]) != JSON.stringify(newVal[i]) && oldVal[i].$id == newVal[i].$id){
          changed = newVal[i];
        }
      }
    }
    if($scope.products != undefined){
      for( i = 0; i < $scope.products.length; i++){
        if($scope.products[i]._id == changed.$id){
          $scope.products[i] = changed;
          fingerprintService.refreshDashboard(store)
        }
      }
    }

   /* single_object = $filter('filter')($scope.messages, function (d) {return oldVal._id === $scope.messages._id;})[0];
   */
    // If you want to see the result, just check the log
    /*    console.log(single_object);*/

  }, true);
                     //  $scope.messages.id = v;



                     /* store methods */
          store.filterArtist = function(store){
            //retrieve artist LOV
            fingerprintService.filterArtist($scope);
          };
          store.filterArtist(store);

          store.filterTrack = function(store){
            //retrieve track LOV
            fingerprintService.filterTrack($scope);
          };

          $scope.reload=function(){
           store.products = [];
           fingerprintService.reload(store,$scope);
           $scope.uploadplatform = $scope.platform;
           fingerprintService.refreshDashboard(store);






         };

         $scope.save=function(product){  
           console.log("saving")    
           fingerprintService.save(product, store);
        //push data to iaps
        //fingerprintService.iapsUpload_original(product, store);
      };

      store.iapsUpload = function(store){
      //push data to iaps
      fingerprintService.iapsUpload(store, $scope.uploadplatform);
    };

    store.refreshDashboard = function(store){
      fingerprintService.refreshDashboard(store);
      ref.set(store.products)
    };

    store.refreshDashboardDetails = function(store){
      fingerprintService.refreshDashboardDetails(store);

    };

    store.setPlayerLink = function(product){
     console.log('Log:rowclick - switch playerlink to:'+product.link);
     store.playerurl = product.link;

      //fromat links for player   
      if(product.link.indexOf('soundcloud') >= 0 && product.link.indexOf('url=') == -1){
        store.playerlink = "https://w.soundcloud.com/player/?url="+product.link+"&output=embed"
      }
      if(product.link.indexOf('youtube') >= 0){
        store.playerlink = product.link.replace("watch?v=","embed/") ;
        store.playerlink = store.playerlink + "?autoplay=1";
      }

      //set selected row's class
      store.selectedrow = product._id;            
      console.log('Exiting rowclick with values:recordlink:'+product.link);
      console.log('                            :store.playerlink:'+store.playerlink);
      console.log('                            :store.selectedrow:'+store.selectedrow);
    };



  });


app.filter('trusted', ['$sce', function ($sce) {
  return function(url) {
   return $sce.trustAsResourceUrl(url);
 };
}]);







