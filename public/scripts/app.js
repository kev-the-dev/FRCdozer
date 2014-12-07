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
  .controller('tableCtrl',['$scope','game',function ($scope,game){

  }])
  .controller('matchCtrl',['$scope','game',function ($scope,game){

  }])
  .controller('addCtrl',['$scope','game',function ($scope,game){

  }])
  .controller('teamCtrl',['$scope','game',function ($scope,game){

  }]);
