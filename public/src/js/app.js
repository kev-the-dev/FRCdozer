function oneInstance (list,param,key) { //generates controller for team, match, etc view where you want one of a list updated
  if (!list || !param) return;
  key = key || param;
  var res = ['$stateParams','$scope',function ($stateParams,$scope) {
    $scope.id = $stateParams[param];
    function updateTeam (newList) {
      newList.forEach(function (x) {
        if (x[key] == $scope.id) $scope[param] = x;
      });
    }
    $scope.$watch(list,updateTeam);
  }];
  return res;
}
angular.module('FRCdozer',['ui.router','ui.bootstrap'])
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
      .state('game.addTeam', {
        url: '/pit',
        templateUrl: 'views/AddTeam.html'
      })
      .state('game.teams', {
        url: '/teams',
        templateUrl: 'views/teams.html'
      })
      .state('game.teamID', {
        url: '/team/{id:[0-9a-fA-F]{24}}',
        templateUrl: 'views/team.html',
        controller: ['$stateParams','$scope','$state', function ($stateParams, $scope, $state) {
          console.log("Teamid",$stateParams.id,$stateParams.id.match(/^[0-9a-fA-F]{24}$/));
          $scope.team = {};
          //$scope.team._id  = $stateParams.id;
          $scope.$watchCollection('teams', function (teams) {
            teams.forEach(function (team) {
              if (team._id === $stateParams.id) {
                $scope.team = team;
              }
            });
          });
        }]
      })
      .state('game.team', {
        url: '/team/{team:[0-9]*}',
        templateUrl: 'views/team.html',
        controller: ['$stateParams','$scope','$state',function ($stateParams,$scope,$state) {
          console.log("Team Num",$stateParams.team);
          if (!$stateParams.team) return $state.go('game.teams');
          $scope.param = $stateParams.team;
          $scope.team = {};
          $scope.team.team = Number($scope.param);
          $scope.$watchCollection('teams', function (teams) {
            teams.forEach(function (team) {
              if (Number(team.team) === $scope.team.team) $scope.team = team;
            });
          });
        }]
      })
      .state('game.match', {
        url: '/match/:match',
        templateUrl: 'views/match.html',
        controller: ['$stateParams','$scope','$state',function ($stateParams,$scope,$state) {
          if (!$stateParams.match) return $state.go('game.matches');
          $scope.MatchParam = $stateParams.match;
          $scope.$watchCollection('matches', function (matches) {
            matches.forEach(function (match) {
              if (match.match === $scope.MatchParam) $scope.match = match;
            });
          });
        }]
      })
      .state('game.sub', {
        url: '/sub/:sub',
        templateUrl: 'views/sub.html',
        controller: ['$stateParams','$scope','$state',function ($stateParams,$scope,$state) {
          if (!$stateParams.sub) return $state.go('game.submissions');
          $scope.SubID = $stateParams.sub;
          $scope.$watchCollection('subs', function (subs) {
            subs.forEach(function (sub) {
              if (sub._id === $scope.SubID) $scope.sub = sub;
            });
          });
        }]
      })
      .state('game.matches', {
        url: '/matches',
        templateUrl: 'views/matches.html'
      })
      .state('game.advanced', {
        url:'/advanced',
        templateUrl: 'views/advanced.html'
      })
      .state('org', {
        url: '/org/:name',
        templateUrl: 'views/org.html',
        controller:"orgCtrl"
	  });
      $urlRouterProvider
        .when('/g/:name', '/game/:name')
        .when('','/')
        .otherwise('/404');

  }])
  .controller('mainCtrl',['$scope','$http','$timeout',function ($scope,$http,$timeout) {
    $scope.user = undefined;
    $scope.errors = {};
    $scope.successes = {};
    $scope.handle = function (type,error,description) { //given http req and type string, handle with timout
      if (error !== undefined) { //if there isnt an error (a sucess)
        console.log(error);
        $scope.errors[type] = error;
        $timeout(function () {
          delete $scope.errors[type];
        },3000);
      } else {
        $scope.successes[type] = true;
        $timeout(function () {
          delete $scope.successes[type];
        },3000);
      }
    };
    $scope.userInit = function () {
      $http.get('api/hello')
        .success(function (data) {
          $scope.user=data;
          $scope.handle('init');
        })
        .error(function(x,sta){
          if (sta === 401) $scope.user = undefined;
          $scope.handle('init',x);
        });
    };
    $scope.addGame = function (game) {
      if (!$scope.user || !game || !game.name) return false;
      game.teams = game.teams || [];
      game.submissions = game.submissions || [];
      $http.post('api/game',game)
        .success(function (x) {
          $scope.newGame = {};
          console.log(x);
          $scope.user.games.push(x);
        })
        .error(function (x) {
          $scope.newGame = {};
          console.log(x);
        });
    };
    $scope.delGame = function (name) {
      if (!confirm("Are you sure you want to delete "+name+"?")) return;
      $http.delete('api/game/'+name)
      .success(function (x) {
        for (var y in $scope.user.games) {
          if (name === $scope.user.games[y].name) $scope.user.games.splice(y,1);
        }
      })
      .error(function (x){console.log(x);});
    };
    $scope.changePassword = function (password) {
      $http.put('api/password',{password:password})
        .success(function(){$scope.handle('changePassword');})
        .error(function(x){$scope.handle('changePassword',x);});
    };
    $scope.login = function (user,pass) {
      $http.post('api/login',{username:user,password:pass})
        .success(function (data) {
          $scope.userName  = "";
          $scope.password = "";
          $scope.user = data;
          $scope.handle('login');
        })
        .error(function (x) {$scope.handle('login',x);});
    };
    $scope.logout = function () {
      $http.post('api/logout')
      .success(function () {
        $scope.handle('logout');
        $scope.user = undefined;
      })
      .error(function(x){$scope.handle('logout',x);});
    };
    $scope.register = function (user,pass) {
      $http.post('api/register',{username:user,password:pass})
        .success(function (x) {
          $scope.handle('register');
          $scope.login(user,pass);
        })
        .error(function(x){$scope.handle('register',x);});
    };
    $scope.back = function () {
      window.history.back();
    };
    $scope.userInit();
  }]);
