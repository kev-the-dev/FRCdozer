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
    $scope.init();
  }])
  .controller('matchCtrl',['$scope','$routeParams','$http',function ($scope,$routeParams,$http){
    $scope.init(function () {
      $scope.getMatch($routeParams.id,true);
    });
  }])
  .controller('addCtrl',['$scope',function ($scope){
    $scope.init();
  }])
  .controller('teamCtrl',['$scope','$routeParams',function ($scope,$routeParams){
    $scope.init(function () {
      $scope.getTeam($routeParams.team,true);
    });
  }])
  .controller('teamsCtrl', ['$scope', function ($scope) {
    $scope.init();
  }])
  .controller('gameCtrl',['$scope','$routeParams',function($scope,$routeParams){
    $scope.init(function() {
      if (!$routeParams.id) $scope.game=$scope.curGame;
      else $scope.getGame($routeParams.id,true);
    });
  }]);
