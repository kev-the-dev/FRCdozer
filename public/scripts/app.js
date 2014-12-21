angular.module('FRCdozer',['ngRoute'])
  .config(['$routeProvider',function ($routeProvider) {
    $routeProvider
    .when('/', {
      controller: 'homeCtrl',
      templateUrl: '/views/home.html'
    })
    .when('/g/',{
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
    .when('/team', {
      controller: 'teamsCtrl',
      templateUrl: '/views/teams.html'
    })
    .when('/game/', {
      controller: 'gameCtrl',
      templateUrl: '/views/game.html'
    })
    .otherwise ({redirectTo: '/'});
  }])
  .controller('tableCtrl',['$scope',function ($scope){
  }])
  .controller('matchCtrl',['$scope','$routeParams','$http',function ($scope,$routeParams,$http){
    $scope.matchId = $routeParams.id;
  }])
  .controller('addCtrl',['$scope',function ($scope){
    $scope.addteam="def";
  }])
  .controller('teamCtrl',['$scope','$routeParams',function ($scope,$routeParams){
    $scope.teamNum = $routeParams.team;
  }])
  .controller('teamsCtrl', ['$scope', function ($scope) {
  }])
  .controller('gameCtrl',['$scope','$routeParams',function($scope,$routeParams){
    $scope.game=$scope.curGame;
  }])
  .controller('homeCtrl',['$scope',function ($scope) {
    $scope.test = "world.";
  }])
