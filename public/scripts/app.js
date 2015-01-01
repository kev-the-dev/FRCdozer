angular.module('FRCdozer',['ui.router'])
  .config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider
      .when('/g/:name', '/game/:name')
      .otherwise('/404');

    $stateProvider
      .state('home', {
        url: "/",
        templateUrl: 'views/home.html'
      })
      .state('me', {
        url: '/me',
        templateUrl: 'views/me.html'
      })
  	  .state('login', {
  		url: "/login",
  		templateUrl: 'views/login.html'
  	  })
      .state('register', {
        url: '/register',
        templateUrl: 'views/register.html'
      })
      .state('404', {
        url: '/404',
        templateUrl: 'views/404.html'
      })
      .state('game', {
        url: '/game/:name?filter&reverse',
        templateUrl: 'views/game.html',
        controller: 'frcCtrl'
      })
      .state('game.edit', {
        url: '/edit',
        templateUrl: 'views/edit.html',
      })
      .state('game.submissions', {
        url: '/subs',
        templateUrl: 'views/subs.html'
      })
      .state('game.add', {
        url: '/add',
        templateUrl: 'views/add.html'
      })
      .state('game.teams', {
        url: '/teams',
        templateUrl: 'views/teams.html'
      })
      .state('game.team', {
        url: '/team/:num',
        templateUrl: 'views/team.html',
        controller: ['$stateParams','$scope',function ($stateParams,$scope) {
          $scope.teamNum = $stateParams.num;
        }]
      })
      .state('game.match', {
        url: '/match/:id',
        templateUrl: 'views/match.html',
        controller: ['$stateParams','$scope',function ($stateParams,$scope) {
          $scope.matchId= $stateParams.id;
        }]
      })
      .state('game.sub', {
        url: '/sub/:id',
        templateUrl: 'views/sub.html',
        controller: ['$scope','$stateParams',function ($scope,$stateParams) {
          $scope.subId = $stateParams.id;
        }]
      })
      .state('game.matches', {
        url: '/matches',
        templateUrl: 'views/matches.html'
      });
  }])
  .controller('mainCtrl',['$scope','$http','$timeout',function ($scope,$http,$timeout) {
    $scope.user = undefined;
    $scope.error = {};
    $scope.success = {};
    $scope.handle = function (req,type) { //given http req and type string, handle with timout
      req.success(function() {
        $scope.success[type] = true;
        $timeout(function () {
          $scope.success[type] = false;
        },5000);
      });
      req.error(function() {
        $scope.error[type] = true;
        $timeout(function () {
          $scope.error[type] = false;
        },5000);
      });
    };
    $scope.userInit = function () {
      $http.get('api/hello')
      .success(function (data) {
        $scope.user=data;
      });
    };
    $scope.changePassword = function (password) {
      $scope.handle($http.put('api/password',{password:password}),'changePassword');
    };
    $scope.login = function (user,pass) {
      $http.post('api/login',{username:user,password:pass})
      .success(function (data) {
        $scope.user = data;
        $scope.error.login = false;
      })
      .error(function (data) {
        $scope.error.login = true;
        $timeout(function () {
          $scope.error.login=false;
        },5000);
      });
      $scope.userName = null;
      $scope.password = null;
    };
    $scope.logout = function () {
      $http.post('api/logout')
      .success(function () {
        $scope.user = undefined;
      });
    };
    $scope.register = function (user,pass) {
      $http.post('api/register',{username:user,password:pass})
        .success(function (x) {
          console.log("registered");
          $scope.login(user,pass);
        });
    };
    $scope.userInit();
  }]);
