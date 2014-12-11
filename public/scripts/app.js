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
    .when('/team', {
      controller: 'teamsCtrl',
      templateUrl: '/views/teams.html'
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
    $scope.getCurGame(true);
    $scope.getMatches(true);
  }])
  .controller('matchCtrl',['$scope','$routeParams','$http',function ($scope,$routeParams,$http){
    $scope.getMatch($routeParams.id,true);
    $scope.getCurGame(true);
  }])
  .controller('addCtrl',['$scope',function ($scope){
    $scope.getCurGame(true);
  }])
  .controller('teamCtrl',['$scope','$routeParams',function ($scope,$routeParams){
    $scope.getTeams($routeParams.team,true);
  }])
  .controller('teamsCtrl', ['$scope', function ($scope) {
    $scope.getCurGame(true);
    $scope.getMatches(true);
  }])
  .controller('gameCtrl',['$scope','$routeParams',function($scope,$routeParams){
    $scope.getGame($routeParams.id || "", true);
  }]);
