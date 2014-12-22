angular.module('FRCdozer',['ui.router'])
  .config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider
      .when('/g/:name', '/game/:name')
      .otherwise('/');

    $stateProvider
      .state('home', {
        url: "/",
        controller: 'homeCtrl',
        templateUrl: '/views/home.html'
      })
      .state('game', {
        url: '/game/:name',
        templateUrl: '/views/game.html',
        controller: 'frcCtrl'
      })
      .state('game.edit', {
        url: '/edit',
        templateUrl: '/views/edit.html',
      })
      .state('game.submissions', {
        url: '/subs',
        templateUrl: '/views/table.html'
      })
      .state('game.add', {
        url: '/add',
        templateUrl: '/views/add.html'
      })
      .state('game.teams', {
        url: '/teams',
        templateUrl: '/views/teams.html'
      });
  }])
  .controller('homeCtrl',['$scope',function ($scope) {
    $scope.test = "world.";
  }]);
