angular.module('FRCdozer')
	.controller('orgCtrl',['$scope','$http','$stateParams',function($scope,$http,$stateParams){
		$scope.test = "Hello World";
		$scope.org = {};
		$scope.getOrg = function (id,call) {
			$http.get('api/org/'+id)
				.success(function (data) {
					call (null,data);
				})
				.error(function (data,status) {
					call({message:data,status:status},null);
				});
		};
		$scope.init = function () {
			if (!$stateParams.name) $state.go('404');
			$scope.getOrg($stateParams.name, function (err,data) {
				if (err) console.log(err);
				else $scope.org = data;
			});
		};
		$scope.init();
	}]);

