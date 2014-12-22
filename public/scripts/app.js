angular.module('FRCdozer',['ui.router'])
  .config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider
      .when('/g/:name', '/game/:name')
      .otherwise('/');

    $stateProvider
      .state('home', {
        url: "/",
        templateUrl: '/views/home.html'
      })
      .state('register', {
        url: '/register',
        templateUrl: '/views/register.html'
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
      })
      .state('game.team', {
        url: '/team/:num',
        templateUrl: '/views/team.html',
        controller: ['$stateParams','$scope',function ($stateParams,$scope) {
          $scope.teamNum = $stateParams.num;
        }]
      })
      .state('game.match', {
        url: '/match/:id',
        templateUrl: '/views/matchid.html',
        controller: ['$stateParams','$scope',function ($stateParams,$scope) {
          $scope.matchId= $stateParams.id;
        }]
      });
  }])
  .controller('mainCtrl',['$scope','$http',function ($scope,$http) {
    $scope.test = "world.";
    $scope.user = undefined;
    $scope.userInit = function () {
      $http.get('/api/hello')
      .success(function (data) {
        $scope.user=data;
      });
    };
    $scope.login = function (user,pass) {
      $http.post('/api/login',{username:user,password:pass})
      .success(function (data) {
        $scope.user = data;
      });
      $scope.userName = null;
      $scope.password = null;
    };
    $scope.logout = function () {
      $http.post('/api/logout')
      .success(function () {
        $scope.user = undefined;
      });
    };
    $scope.register = function (user,pass) {
      $http.post('/api/register',{username:user,password:pass})
        .success(function (x) {
          console.log("registered");
          $scope.login(user,pass);
        });
    };
    $scope.userInit();
  }]);
