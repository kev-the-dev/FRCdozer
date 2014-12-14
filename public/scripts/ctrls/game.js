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
    $scope.sTrue = true;
    $scope.sFalse = false;
    $scope.filt="";
    $scope.revr=false;
    $scope.socket = io();
    $scope.connected = false;
    $scope.socket
      .on('connect', function () {$scope.connected=true;})
      .on('connect_timeout', function () {$scope.connected=false;})
      .on('newMatch', function(x){$scope.appendMatch(x);})
      .on('delMatch', function (id) {$scope.removeMatch(id)})
      .on('editMatch',function(mat){$scope.changeMatch(mat);});
    $scope.sort = function (prop) {
      if ($scope.filt === prop) $scope.revr=!$scope.revr;
      else {
        $scope.filt=prop;
        $scope.revr=true;
      }
    };
    $scope.appendMatch = function (match) {
      $scope.$apply(function() {
        $scope.matches.push(match);
        $scope.getTeams(true);
      });
    };
    $scope.removeMatch = function (id) {
      for (x in $scope.matches) if (id === $scope.matches[x]._id) {
        $scope.$apply(function() {
          $scope.matches.splice(x,1);
          $scope.getTeams(true);
        });
        break;
      };
    };
    $scope.changeMatch = function (match) {
      for (x in $scope.matches) if (match._id === $scope.matches[x]._id) {
        $scope.$apply(function() {
          $scope.matches[x]=match;
          $scope.getTeams(true);
        });
        break;
      }
    }
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
      for (x in $scope.matches) if ($scope.matches[x]._id = id) {
        if (!def) return $scope.matches[x];
        else return $scope.match = $scope.matches[x];
      }
      if (!def) return $http.get('/api/match/'+id);
      else {
        $http.get('/api/match/'+id)
        .success(function (data) {
          $scope.match=data;
        });
      }
    };
    $scope.getTeam = function (team,def) {
      for (x in $scope.teams || []) {
        if (Number($scope.teams[x].team) === Number(team)) {
          if (!def) return $scope.teams[x];
          else $scope.team = $scope.teams[x];
          break;
        }
      }
    }
    $scope.editMatch = function (id,params,def) {
      if (!def) return $http.put('/api/match/'+id,params);
      else {
        $http.put('/api/match/'+id,{team:params.team,elements:params.elements})
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
          $scope.add = {};
          //$scope.getMatches(true);
        });
      }
    };
    $scope.delMatch = function (id,def) {
      if (!def) return $http.delete ('/api/match/'+id);
      else {
        $http.delete ('/api/match/'+id)
        .success(function (data) {
          //$scope.getMatches(true);
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
      for (x in calc) val=val+(Number(matchx[calc[x].name])*calc[x].worth || 0);
      return Math.round(val*100)/100;
    };
    $scope.getTeams = function (def,mats,noReset) {
      var teams = [];
      mats = mats || $scope.matches;
      mSearch: for (x in mats) { //sorts matches into teams
        for (y in teams) {
          if (teams[y].team === mats[x].team) {
            teams[y].matches.push(mats[x].elements);
            continue mSearch;
          }
        }
        teams.push({team:mats[x].team,matches:[mats[x].elements],averages:{}});
      }
      if (!def) return teams;
      else $scope.teams = teams;
    };
    $scope.getAverage = function (prop,mats) {
      var avr = 0;
      for (x in mats) avr = Math.round(((avr+(Number(mats[x][prop])||0))/(x+1))*100)/100;
      return avr;
    };
    $scope.init = function (aft) {
      $scope.getCurGame().success(function (data) {
        $scope.curGame=data;
        $scope.getMatches().success(function (data2) {
          $scope.matches=data2;
          $scope.getTeams(true);
          if(aft) aft();
        });
      });
    };
}]);
