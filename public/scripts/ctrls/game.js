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
    $scope.userName = null;
    $scope.password = null;
    //$scope.socket = io();
    $scope.connected = false;
    $scope.newTeam;
    $scope.user = undefined;
    /*
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
    */
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
        $scope.getTeams(true,[match],true);
      });
    };
    $scope.removeMatch = function (id) {
      var a,b,c;
      for (x in $scope.matches) if (id === $scope.matches[x]._id) {
        a=x;
        var team =  $scope.matches[x].team;
        for (y in $scope.teams) if ($scope.teams[y].team===team) {
          b=y;
          var m = $scope.teams[y].matches;
          for (z in m) if (m[z]._id = id) {
            c=z;
            break;
          }
          break;
        }
        break;
      };
      $scope.$apply(function() {
        $scope.matches.splice(a,1);
        $scope.teams[b].matches.splice(c,1);
      });
    };
    $scope.changeMatch = function (match) {
      for (x in $scope.matches) if (match._id === $scope.matches[x]._id) {
        //$scope.$apply(function() {
          $scope.matches[x]=match;
          $scope.getTeams(true);
        //});
        break;
      }
    }
    $scope.getCurMatches = function (def) {
      if (!def) return $http.get ('/api/match');
      else {
        $http.get ('/api/match')
          .success(function (data) {
            $scope.matches=data;
          });
      }
    };
    /*
    $scope.getCurGame = function (def) {
      if (!def) return $http.get('/api/game');
      else {
        $http.get('/api/game')
        .success(function (data) {
          $scope.curGame=data;
        });
      }
    }; */
    $scope.getGame = function (id,call) {
      $http.get('/api/game/'+id)
        .success(function (data) {
          call (null,data);
        })
        .error(function (data) {
          call(data,null);
        });
    };
    $scope.editGame = function (id,params,call) {
      $http.put('/api/game/'+id,params)
        .success(function (data) {
          call(null,data); //call(error,content)
        })
        .error(function (data) {
          call(data,null);
        });
    };
    $scope.createGame = function (param,call) {
      $http.post('/api/game',params)
        .success(function (data) {
          call(null,data);
        })
        .error(function (data) {
          call(data,null);
        });
    };
    $scope.deleteGame = function (id,call) {
      $http.delete('/api/game/'+id)
        .success(function (data) {
          call(null,data)
        })
        .error(function (data) {
          call(data,null);
        })
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
      //if ($scope.connected) $scope.socket.emit('editMatch',{_id:x._id,team:x.team,elements:x.elements});
      //else $http.put('/api/match/'+x._id,x);
      $http.put('/api/game/'+$scope.curGame._id+'/sub/'+x._id,x)
        .success(function (data) {
          $scope.changeMatch(data);
        });
    };
    $scope.addMatch = function (elements) {
      //if ($scope.connected) $scope.socket.emit('newMatch',elements);
      //else
      $http.post ('/api/game/'+$scope.curGame._id+'/sub',elements)
        .success(function (data) {
          $scope.appendMatch(data);
          $scope.add={};
        });
    };
    $scope.delMatch = function (id) {
      //if ($scope.connected) $scope.socket.emit('delMatch',id);
      //else
      $http.delete ('/api/game/'+$scope.curGame._id+'/sub/'+id);
    };
    $scope.editGame = function (x) {
      //if ($scope.connected) $scope.socket.emit('editGame',angular.toJson(x));
      //else
      $http.put('/api/game/'+x._id,x);
    };
    $scope.getValue = function (matchx,calc) {
      matchx = matchx || {};
      calc = calc || [];
      var val = 0;
      for (x in calc) val=val+(Number(matchx[calc[x].name])*calc[x].worth || 0);
      return Math.round(val*100)/100;
    };
    $scope.getTeams = function (def,mats,noReset) {
      var teams = noReset ?  $scope.teams : [];
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
      $scope.getGame('5495eb1b46fea7c15102dc7f', function (err,data) {
        if (data) {
          $scope.curGame = data;
          $scope.matches = data.submissions;
          $scope.getTeams(true);
        }
      });
      $scope.userInit();
    };
    $scope.init();
}]);
