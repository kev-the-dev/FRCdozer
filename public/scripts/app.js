angular.module('FRCdozer',['ngRoute'])
  .config(['$routeProvider',function ($routeProvider) {
    $routeProvider
    .when('/', {
      controller: 'tableCtrl',
      templateUrl: '/views/table.html'
    })
    .when('/match/:id', {
      controller: 'matchCtrl',
      templateUrl: '/views/match.html'
    })
    .when('/add', {
      controller: 'addCtrl',
      templateUrl: '/views/add.html'
    })
    .when('/team/:team', {
      controller: 'teamCtrl',
      templateUrl: '/views/team.html'
    })
    .otherwise ({redirectTo: '/'});
  }])
  .controller('tableCtrl',['$scope','game','$http',function ($scope,game,$http){
    $scope.game = game;
    $scope.games = {};
    $scope.matches = [];
    $scope.add = {};
    $http.get('/api/game')
    .success(function (data) {
      $scope.games = data;
    });
    $http.get('/api/match')
      .success(function (data) {
        $scope.matches=data;
      });
    $scope.addMatch = function (x) {
      $http.post ('/api/match',x)
      .success(function (data) {
        $scope.matches.push(data);
      });
    };
  }])
  .controller('matchCtrl',['$scope','game','$routeParams','$http',function ($scope,game,$routeParams,$http){
    $scope.data = {};
    $scope.match = $routeParams.id;
    $http.get('/api/match/'+$scope.match)
    .success(function (data) {
      $scope.data=data;
    });
  }])
  .controller('addCtrl',['$scope','game',function ($scope,game){

  }])
  .controller('teamCtrl',['$scope','game','$routeParams',function ($scope,game,$routeParams){
    $scope.team = $routeParams.team;
  }]);
