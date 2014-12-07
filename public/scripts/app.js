angular.module('FRCdozer',['ngRoute'])
  .config(['$routeProvider',function ($routeProvider) {
    $routeProvider
    .when('/', {
      controller: 'tableCtrl',
      templateUrl: '/views/table.html'
    })
    .when('/match/:id', {
      controller: 'matchCtrl',
      templateUrl: '/views/matchid.html'
    })
    .when('/add', {
      controller: 'addCtrl',
      templateUrl: '/views/add.html'
    })
    .when('/team/:team', {
      controller: 'teamCtrl',
      templateUrl: '/views/team.html'
    })
    .when('/game/', {
      controller: 'gameCtrl',
      templateUrl: '/views/game.html'
    })
    .when('/game/:id', {
      controller: 'gameCtrl',
      templateUrl: '/views/game.html'
    })
    .otherwise ({redirectTo: '/'});
  }])
  .controller('tableCtrl',['$scope',function ($scope){
    $scope.getCurGame();
    $scope.getMatches();
  }])
  .controller('matchCtrl',['$scope','$routeParams','$http',function ($scope,$routeParams,$http){
    $scope.getMatch($routeParams.id);
    $scope.getCurGame();
  }])
  .controller('addCtrl',['$scope',function ($scope){

  }])
  .controller('teamCtrl',['$scope','$routeParams',function ($scope,$routeParams){
    $scope.team = $routeParams.team;
  }])
  .controller('gameCtrl',['$scope','$routeParams',function($scope,$routeParams){
      $scope.getGame($routeParams.id || "");
  }]);
