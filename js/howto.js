(function(){

	var app = angular.module('howtoApp', []);
	
    /*TODO - add custom filters
        https://scotch.io/tutorials/building-custom-angularjs-filters
    */
    app.filter('facetedNavFilter', function() {
        return function(input,scope) {
            /*console.log(scope);
            var out = [];
            var tmpArr = [];
            var isEmptyFilterNav = true;
            angular.forEach(scope.tmpListing, function(howto) {
                angular.forEach(howto.metaData, function(metaRaw){

                    angular.forEach(metaArr,function(meta){
                        angular.forEach(tmpArr,function(el){
                            if(el!==meta){
                                tmpArr.push(meta);
                                isEmptyFilterNav = false;
                            }
                        });
                    }); 
                });
            });

            if(!isEmptyFilterNav){
                angular.forEach(input, function(facetCollection){
                    angular.forEach(facetCollection.categories, function(facetCat){
                        angular.forEach(facetCat.values, function(facet){
                            //console.log(facet);
                        });
                    });
                });
                return out;
            }else{
                return input;
            }*/
            return input;
        }
    });

    app.filter('facetFilterListings', function() {
        return function(input,scope) {
            //scope.tmpListing = [];
            /*var out = [];
            var facetSelectionArr = scope.facetSelectionArr;
            angular.forEach(input, function(howto) {
                if(facetSelectionArr.length > 0){
                    var addToOut = false;
                    angular.forEach(howto.metaData, function(metaRaw){
                        metaArr = metaRaw.split(",");
                        angular.forEach(metaArr,function(meta){
                            angular.forEach(facetSelectionArr,function(facet){
                                if(facet === meta){
                                    addToOut = true;
                                }
                            });
                        });
                    });
                    if(!addToOut){
                        out.push(howto);
                    }
                }else{
                    out.push(howto);
                }
            });
            console.log($scope);

            return out;*/
            return input;
        }
    });

	app.controller('howToController', ['$scope','$filter','$http',function($scope,$filter,$http){
	    
        $scope.orderBy = $filter('orderBy');
        $scope.callbackName = 'fbcallback';
        $scope.defaultQry = "!padrenullquery";
        $scope.query = {};
        $scope.angularCallback = "&callback=JSON_CALLBACK";
        $scope.minInputToSearch = 3;
        $scope.numRanks = 10;
        $scope.currentPage = 1;
        $scope.facetSelectionArr = [];
        $scope.xhrSource = "search.json?1";
        //$scope.xhrSource = "//funnelback-dev.ucl.ac.uk/s/search.json?collection=isd-howto&profile=_default_preview&num_ranks=1000";
        $scope.log = function(){
            console.log($scope.resultModel);
        }
	    $scope.fbEncodeURI = function(str){
            var str = encodeURI(str);
            //return 'hello world';
            return str.replace('+','%20').replace('%257C','%7C');//convert fb use of + and | char
        }
        $scope.loadResultsTmp = function(){
        	return 'js/includes/listings.html';
    	}
    	$scope.loadFacetsTmp = function(){
        	return 'js/includes/facets.html';
    	}
        $scope.loadPaginationTmp = function(){
            return 'js/includes/pagination.html';
        }
        $scope.removeFacet = function(arr,el){
            var pos = arr.indexOf(el);

            if(pos >= 0){
                arr.splice(pos,1);//second arg ensures 1 item is removed from array
            }
            return arr;
        }
    	$scope.filterFacets = function(currentElQry,currentElLabel){
    		var isSelected = false;

            if($scope.facetSelectionArr){
                for(var i in $scope.facetSelectionArr){
                    var tmpSelectedItem = $scope.facetSelectionArr[i]
                    if(tmpSelectedItem == currentElLabel){
                        isSelected = true;
                        $scope.facetSelectionArr = $scope.removeFacet($scope.facetSelectionArr,currentElLabel);
                    }
                    if(isSelected == true)break;
                }
                if(isSelected == false){
    	    		$scope.facetSelectionArr.push(currentElLabel);
                }
            }
            //$scope.filterListings();
    	}
        $scope.updateMeta = function(){
            console.log($filter);
        }
        $scope.isInputChecked = function(el){
            var isChecked = false;
            var facets = $scope.xhrDataSelectedFacets;

            for(var i in facets){
                var tmpArr = facets[i];
                for(var j in tmpArr){
                    var tmpQry = encodeURI(i + '=' + tmpArr[j]);               
                    if($scope.fbEncodeURI(el) === tmpQry)
                        isChecked = true;
                }
            }
            return isChecked;
        }
        $scope.facetHasCount = function(el){
            //console.log($scope.listingModel);
            if($scope.getCount(el) > 0){
                return true;
            }else{
                return false;
            }
        }
        $scope.getCount = function(el){
            var count = 0;
            angular.forEach($scope.xhrDataResults,function(result){
                angular.forEach(result.metaData,function(metaArr){
                    metaArr = metaArr.split(",");
                    angular.forEach(metaArr,function(meta){
                          if(el==meta){
                            count+=1;
                          } 
                    });
                        
                });
                
            });
            return count;
        }
		$scope.showFacetCount = function(facetObj){
            var showFacet = false;
            var tmpCount = 0;
            
            if(typeof facetObj.categories[0] !== 'undefined'){
                for(var i in facetObj.categories[0].values){
                    var facet = facetObj.categories[0].values[i];
                    tmpCount += parseInt(facet.count);
                }
            }
            if(tmpCount > 0)showFacet = true;

            return showFacet;
        }
        $scope.updatePage = function(x) {
            $scope.currentPage = x;

            return;
        }
        $scope.isCurrentPage = function(x) {

            if(x === $scope.currentPage) {
                return true;
            }else{
                return false;
            }
        }
        $scope.showListing = function(x) {

            var rankStart = $scope.currentPage * $scope.numRanks;
            var rankEnd = ($scope.currentPage + 1) * $scope.numRanks;
            if(x >= rankStart && x < rankEnd) {
                return true;
            }else{
                return false;
            }
        }
	    $scope.getData = function(){
	    	var requestUrl = $scope.xhrSource + "&query=" + $scope.defaultQry + $scope.angularCallback;

    		$http.jsonp(requestUrl).success(function(data) {
		    	$scope.data = data;//make available to $scope variable
		        //$scope.xhrDataResults = $scope.orderBy(data.response.resultPacket.results,'title',$scope.direction);
                $scope.xhrDataResults = data.response.resultPacket.results;
		        $scope.xhrDataFacets = $scope.orderBy(data.response.facets,'title',$scope.direction);
                $scope.xhrDataSelectedFacets = data.question.selectedCategoryValues;
                $scope.totalPages = Math.ceil(data.response.resultPacket.resultsSummary.fullyMatching/$scope.numRanks);
                $scope.paginationArr = [];
                var i=1;
                for(i=1;i<=$scope.totalPages;i++){
                    $scope.paginationArr.push(i);
                }
            });
		}
		$scope.getData();
	}]);
})();
