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
    function discon () {
      $scope.$apply(function() {
        $scope.connected=false;
      });
    }
    function con() {
      $scope.$apply(function() {
        $scope.connected=true;
      });
    }
    $scope.socket
      .on('connect', con)
      .on('reconnect',con)
      .on('connect_timeout', discon)
      .on('reconnecting', discon)
      .on('reconnect_error',discon)
      .on('reconnect_failed',discon)
      .on('newMatch', function(x){$scope.appendMatch(x);})
      .on('delMatch', function(x){$scope.removeMatch(x);})
      .on('editMatch',function(x){$scope.changeMatch(x);})
      .on('editGame',function(x){$scope.changeGame(x);})
      .on('error',function(x){console.log(x);});
    $scope.sort = function (prop) {
      if ($scope.filt === prop) $scope.revr=!$scope.revr;
      else {
        $scope.filt=prop;
        $scope.revr=true;
      }
    };
    $scope.changeGame = function (game) {
      $scope.$apply(function() {
        $scope.curGame = game;
      });
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
    $scope.getMatch = function (id) {
      for (x in $scope.matches) if ($scope.matches[x]._id === id) {
        return $scope.matches[x];
      }
    };
    $scope.getTeam = function (team) {
      team = Number(team);
      for (x in $scope.teams) if (Number($scope.teams[x].team) === team){
          return $scope.teams[x];
          break;
      }
    }
    $scope.editMatch = function (x) {
      if ($scope.connected) $scope.socket.emit('editMatch',{_id:x._id,team:x.team,elements:x.elements});
      else $http.put('/api/match/'+x._id,x);
    };
    $scope.addMatch = function (elements) {
      if ($scope.connected) $scope.socket.emit('newMatch',elements);
      else $http.post ('/api/match',elements);
    };
    $scope.delMatch = function (id) {
      if ($scope.connected) $scope.socket.emit('delMatch',id);
      else $http.delete ('/api/match/'+id);
    };
    $scope.editGame = function (x) {
      if ($scope.connected) $scope.socket.emit('editGame',angular.toJson(x));
      else $http.put('/api/game/'+x._id,x);
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
            teams[y].matches.push(mats[x]);
            continue mSearch;
          }
        }
        teams.push({team:mats[x].team,matches:[mats[x]],averages:{}});
      }
      if (!def) return teams;
      else $scope.teams = teams;
    };
    $scope.getAverage = function (prop,mats) {
      var avr = 0;
      for (x in mats) avr = avr+(Number(mats[x].elements[prop])||0);
      avr = avr / (mats.length);
      avr = Math.round(avr*100)/100;
      return avr;
    };
    $scope.init = function () {
      $scope.getCurGame().success(function (data) {
        $scope.curGame=data;
        $scope.getMatches().success(function (data2) {
          $scope.matches=data2;
          $scope.getTeams(true);
          $scope.add = {};
        });
      });
    };
    $scope.init();
}]);
