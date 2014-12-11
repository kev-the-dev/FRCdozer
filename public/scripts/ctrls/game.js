angular.module('FRCdozer')
.controller('frcCtrl',['$scope','$http',function($scope,$http) {
    $scope.matches= undefined; //stores matches for current game
    $scope.match=[]; //stores single match that operations are currently being done on
    $scope.add = {} //stores un-posted add
    $scope.game = {}; //stores game that operations are being done on
    $scope.curGame = {}; //game that is currently active, to show in table
    $scope.games = []; //stores all games
    $scope.sample = {};
    $scope.teams = [];
    $scope.team={};
    $scope.getMatches = function (def) {
      if (!def) return $http.get ('/api/match');
      else {
        $http.get ('/api/match')
          .success(function (data) {
            $scope.matches=data;
          });
      }
    };
    $scope.getCurGame = function (def) {
      if (!def) return $http.get('/api/game');
      else {
        $http.get('/api/game')
        .success(function (data) {
          $scope.curGame=data;
        });
      }
    };
    $scope.getGame = function (id,def) {
      if (!def) return $http.get('/api/game/'+id);
      else {
        $http.get('/api/game/'+id)
        .success(function (data) {
          $scope.game = data;
        });
      }
    };
    $scope.getMatch = function (id,def) {
      if (!def) return $http.get('/api/match/'+id);
      else {
        $http.get('/api/match/'+id)
        .success(function (data) {
          $scope.match=data;
        });
      }
    };
    $scope.editMatch = function (id,elements,def) {
      if (!def) return $http.put('/api/match/'+id,elements);
      else {
        $http.put('/api/match/'+id,elements)
        .success(function (data) {
          $scope.getMatches();
        });
      }
    };
    $scope.addMatch = function (elements,def) {
      if (!def) return $http.post ('/api/match',elements);
      else {
        $http.post ('/api/match',elements)
        .success(function (data) {
          $scope.getMatches(true);
        });
      }
    };
    $scope.delMatch = function (id,def) {
      if (!def) return $http.delete ('/api/match/'+id);
      else {
        $http.delete ('/api/match/'+id)
        .success(function (data) {
          $scope.getMatches(true);
        });
      }
    };
    $scope.editGame = function (id,elements,def) {
      if (!def) return $http.put('/api/game/'+id,elements);
      else {
        $http.put('/api/game/'+id,elements)
        .success(function (data) {
          $scope.game = data;
        })
      }
    };
    $scope.getValue = function (matchx,calc) {
      matchx = matchx || {};
      calc = calc || [];
      var val = 0;
      for (var x=0;x<calc.length;x++) {
        val=val+(Number(matchx[calc[x].name])*calc[x].worth || 0);
      }
      return val;
    };
    $scope.editGame = function (id,elements,def) {
      if (!def) return $http.put('/api/game/'+id,elements);
      else {
        $http.put('/api/game/'+id,elements)
        .success(function (data) {
          $scope.game = data;
        })
      }
    };
    $scope.getTeams = function (def) {
      var teams = [];
      mSearch: for (var x =0; x<$scope.matches.length; x++) { //sorts matches into teams
        var m = $scope.matches[x];
        for (var y=0; y<teams.length;y++) {
          var t = teams[y];
          if (t.team === m.team) {
            t.matches.push(m.elements);
            continue mSearch;
          }
        }
        teams.push({team:m.team,matches:[m.elements],averages:{}});
      }
      for (var z=0; z<teams.length;z++) { //for each team
        for (var x=0; x<$scope.curGame.game.length;x++) {
          if ($scope.curGame.game[x].type !== "String") {
            for (var p=0; p<teams[z].matches.length;p++) {
              if (teams[z].matches[p][$scope.curGame.game[x].name]) {
                teams[z].averages[$scope.curGame.game[x].name]=((Number(teams[z].averages[$scope.curGame.game[x].name]) || 0) + Number(teams[z].matches[p][$scope.curGame.game[x].name])) /(p+1);
              }
            }
          }
        }
      }
      /*
      if (team) {
        team = Number(team);
        for (g in teams) {
          if (teams[g].team===team) {
            $scope.team=teams[g];
            break;
          }
        }
      }
      */
      if (!def) return teams;
      else $scope.teams = teams;
      console.log (teams);
    };
    $scope.init = function () {
      console.log("init started");
      $scope.getCurGame().success(function (data) {
        $scope.curGame=data;
        $scope.getMatches().success(function (data2) {
          $scope.matches=data2;
          $scope.getTeams(true);
        });
      });
      console.log("init done");
    };
    $scope.init();
}]);
