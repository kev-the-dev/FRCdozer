angular.module('FRCdozer',['ui.router'])
  .config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
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
      .state('401', {
        url:'/401',
        templateUrl: 'views/401.html'
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
      $urlRouterProvider
      .when('/g/:name', '/game/:name')
      .otherwise('/404');

  }])
  .controller('mainCtrl',['$scope','$http','$timeout',function ($scope,$http,$timeout) {
    $scope.user = undefined;
    $scope.error = {};
    $scope.errors = [];
    $scope.success = {};
    $scope.handle = function (type,error) { //given http req and type string, handle with timout
      if (error !== undefined) {
        $scope.errors.push({type:type,error:error});
        $scope.error[type] = JSON.stringify(error);
        $timeout(function () {
          $scope.error[type] = false;
        },8000);
      } else {
        $scope.success[type] = true;
        $timeout(function () {
          $scope.success[type] = false;
        },1000);
      }
    };
    $scope.userInit = function () {
      $http.get('api/hello')
        .success(function (data) {
          $scope.user=data;
          $scope.handle('init');
        })
        .error(function(x){$scope.handle('init',x)});
    };
    $scope.addGame = function (game) {
      console.log(game);
      if (!$scope.user || !game || !game.name) return false;
      game.teams = game.teams || [];
      game.submissions = game.submissions || [];
      $http.post('api/game',game)
        .success(function (x) {
          $scope.newGame == {};
          console.log(x);
          $scope.user.games.push({name:x.name,authlevel:x.permissions.users[$scope.user.username] || 4});
        })
        .error(function (x) {
          console.log(x);
        });
    };
    $scope.delGame = function (name) {
      if (!confirm("Are you sure you want to delete "+name+"?")) return;
      $http.delete('api/game/'+name)
      .success(function (x) {
        console.log(x);
        for (y in $scope.user.games) {
          if (name === x.name) $scope.user.games.splice(y);
        }
      })
      .error(function (x){console.log(x);});
    }
    $scope.changePassword = function (password) {
      $http.put('api/password',{password:password})
        .success(function(){$scope.handle('changePassword')})
        .error(function(x){$scope.handle('changePassword',x)});
    };
    $scope.login = function (user,pass) {
      $http.post('api/login',{username:user,password:pass})
        .success(function (data) {
          $scope.user = data;
          $scope.handle('login');
        })
        .error(function (x) {$scope.handle('login',x)});
    };
    $scope.logout = function () {
      $http.post('api/logout')
      .success(function () {
        $scope.handle('logout');
        $scope.user = undefined;
      })
      .error(function(x){$scope.handle('logout',x)});
    };
    $scope.register = function (user,pass) {
      $http.post('api/register',{username:user,password:pass})
        .success(function (x) {
          $scope.handle('register');
          $scope.login(user,pass);
        })
        .error(function(x){$scope.handle('register',x)});
    };
    $scope.back = function () {
      window.history.back()
    }
    $scope.userInit();
  }]);
