angular.module('FRCdozer')
.controller('frcCtrl',['$scope','$http','$stateParams','$state',function($scope,$http,$stateParams,$state) {
    $scope.subs = []; //stores matches for current game
    $scope.sub = {};
    $scope.matches = [];
    $scope.match = {};
    $scope.add = {} //stores un-posted add
    $scope.game = {}; //stores game that operations are being done on
    $scope.curGame = {}; //game that is currently active, to show in table
    $scope.games = []; //stores all games
    $scope.sample = {};
    $scope.teams = [];
    $scope.team={};
    $scope.filt = $state.params.filter || "";
    $scope.revr = $state.params.reverse || false;
    $scope.connected = false;
    $scope.newTeam;
    $scope.getDate = function (id) {
      if (id) {
        var date = new Date(parseInt(id.substring(0, 8), 16) * 1000);
        return date;
      }
    };
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
    $scope.unfilt = function () {
      $scope.filt='';
      $scope.revr=false;
    };
    $scope.sort = function (prop) {
      if ($scope.filt === prop) $scope.revr=!$scope.revr;
      else {
        $scope.filt=prop;
        $scope.revr=true;
      }
    };
    $scope.changeGame = function (game) {
      //$scope.$apply(function() {
        $scope.curGame = game;
      //});
    };
    $scope.appendSub = function (sub) {
      //$scope.$apply(function() {
        $scope.subs.push(sub);
        $scope.getTeams(true,[sub],true);
        $scope.sortMatches();
      //});
    };
    $scope.appendTeam = function (team) {
      $scope.teams.push(team);
      $scope.sortMatches();
    };
    $scope.removeSub = function (id) {
      var a,b,c;
      for (x in $scope.subs) if (id === $scope.subs[x]._id) {
        a=x;
        var team =  $scope.subs[x].team;
        for (y in $scope.teams) if ($scope.teams[y].team===team) {
          b=y;
          var m = $scope.teams[y].subs;
          for (z in m) if (m[z]._id = id) {
            c=z;
            break;
          }
          break;
        }
        break;
      };
      //$scope.$apply(function() {
        $scope.subs.splice(a,1);
        $scope.teams[b].subs.splice(c,1);
        if ($scope.teams[b].subs.length===0) $scope.teams.splice(b,1);
        $scope.sortMatches();
      //});
    };
    $scope.removeTeam = function (team) {
      for (x in $scope.teams) if ($scope.teams[x].team === team.team) {
        $scope.teams.splice(x,1);
        break;
      }
    };
    $scope.changeSub = function (sub) {
      for (x in $scope.subs) if (sub._id === $scope.subs[x]._id) {
        $scope.subs[x]=sub;
        $scope.getTeams(true);
        break;
      }
      $scope.sortMatches();
    };
    $scope.changeTeam = function (team) {
      for (x in $scope.teams) if ($scope.teams[x].team === team.team) {
        $scope.teams[x].name = team.name;
        $scope.teams[x].notes = team.notes;
        $scope.teams[x]._id = team._id;
        return;
      }
      $scope.appendTeam(team);
    };
    $scope.getMatch = function (match) {
      for (x in $scope.matches) if ($scope.matches[x].match === match) return $scope.matches[x];
    };
    /*
    $scope.getCurSubs = function (def) {
      if (!def) return $http.get ('/api/match');
      else {
        $http.get ('/api/match')
          .success(function (data) {
            $scope.subs=data;
          });
      }
    };
    */
    $scope.sortMatches = function (subs) { //sorts array of submissions, or the scope submissions, into matches
      var subs = subs || $scope.subs;
      var matches = [];
      z: for (x in subs) {
        for (y in matches) if (matches[y].match === subs[x].match) {
              matches[y].subs.push(subs[x]);
              continue z;
        }
        matches.push({match:subs[x].match || "n/a",subs:[subs[x]]});
      }
      $scope.matches = matches;
    };
    $scope.getGame = function (id,call) {
      $http.get('api/game/'+id)
        .success(function (data) {
          call (null,data);
        })
        .error(function (data) {
          call(data,null);
        });
    };
    $scope.editGame = function (id,params,call) {
      $http.put('api/game/'+id,params)
        .success(function (data) {
          call(null,data); //call(error,content)
        })
        .error(function (data) {
          call(data,null);
        });
    };
    $scope.createGame = function (param,call) {
      $http.post('api/game',params)
        .success(function (data) {
          call(null,data);
        })
        .error(function (data) {
          call(data,null);
        });
    };
    $scope.deleteGame = function (id,call) {
      $http.delete('api/game/'+id)
        .success(function (data) {
          call(null,data)
        })
        .error(function (data) {
          call(data,null);
        })
    };
    $scope.getSub = function (id) {
      for (x in $scope.subs) if ($scope.subs[x]._id === id) {
        return $scope.subs[x];
      }
    };
    $scope.getTeam = function (team) {
      team = Number(team);
      for (x in $scope.teams) if (Number($scope.teams[x].team) === team){
          return $scope.teams[x];
          break;
      }
    }
    $scope.editSub = function (x) {
      var req = $http.put('api/game/'+$scope.curGame._id+'/sub/'+x._id,x);
      if (!$scope.connected) req.success(function (data) {
          $scope.changeSub(data);
      });
    };
    $scope.editTeam = function (x) {
      delete x.subs;
      delete x.averages;
      delete x.calc;
      if (x._id) {
        var req = $http.put('api/game/'+$scope.curGame._id+'/team/'+x._id,x);
        if (!$scope.connected) req.success(function (data) {
          $scope.changeTeam(data);
        });
      } else {
        var req = $http.post ('api/game/'+$scope.curGame._id+'/team',x);
        if (!$scope.connected) req.success(function (data) {
          $scope.changeTeam(data);
        });
      }
    };
    $scope.addSub = function (elements) {
      var req = $http.post ('api/game/'+$scope.curGame._id+'/sub',elements);
      if (!$scope.connected) req.success(function (data) {
          $scope.appendSub(data);
          $scope.add={};
      });
    };
    $scope.addTeam = function (team) {
      var req = $http.post ('api/game/'+$scope.curGame._id+'/team',team);
      if (!$scope.connected) req.success(function (data) {
        $scope.appendTeam(data);
      });
    };
    $scope.delSub = function (id) {
      var req = $http.delete ('api/game/'+$scope.curGame._id+'/sub/'+id);
      if (!$scope.connected) req.success(function() {
      		$scope.removeSub(id);
      });
    };
    $scope.delTeam = function (id) {
      var req = $http.delete ('api/game/'+$scope.curGame._id+'/team/'+id);
      if (!$scope.connected) req.success(function(data) {
        $scope.removeTeam(data);
      });
    };
    $scope.editGame = function (x) {
      var req = $http.put('api/game/'+x._id,x);
      if (!$scope.connected) req.success(function (data) {
        $scope.changeGame(data);
      });
    };
    $scope.getValue = function (sub,calc) {
      sub = sub || {};
      calc = calc || [];
      var val = 0;
      for (x in calc) val=val+(Number(sub[calc[x].name])*calc[x].worth || 0);
      return Math.round(val*100)/100 || 0;
    };
    $scope.getTeams = function (def,subs,noReset) {
      var teams = noReset ?  $scope.teams : [];
      subs = subs || $scope.subs;
      mSearch: for (x in subs) { //sorts matches into teams
        for (y in teams) {
          if (Number(teams[y].team) === Number(subs[x].team)) {
            (teams[y].subs || (teams[y].subs=[])).push(subs[x]);
            continue mSearch;
          }
        }
        teams.push({team:subs[x].team,subs:[subs[x]],averages:{}});
      }
      if (!def) return teams;
      else $scope.teams = teams;
    };
    $scope.getAverage = function (prop,subs) {
      subs = subs || [];
      var avr = 0;
      for (x in subs) avr = avr+(Number(subs[x].elements[prop])||0);
      avr = avr / (subs.length);
      avr = Math.round(avr*100)/100 || 0;
      return avr;
    };
    function socketConf () {
      $scope.socket = io('/game?name='+$scope.curGame.name,{path:window.location.pathname+'socket.io/','force new connection' : true})
        .on('message', function (data) {console.log(data);})
        .on('connect', con)
        .on('reconnect',con)
        .on('connect_timeout', discon)
        .on('reconnecting', discon)
        .on('reconnect_error',discon)
        .on('reconnect_failed',discon)
        .on('newSub', function(x){$scope.$apply(function () {$scope.appendSub(x);});})
        .on('newTeam',function(x){$scope.$apply(function () {$scope.changeTeam(x);});})
        .on('delSub', function(x){$scope.$apply(function () {$scope.removeSub(x._id);});})
        .on('delTeam', function(x){$scope.$apply(function () {$scope.removeTeam(x);});})
        .on('editSub',function(x){$scope.$apply(function () {$scope.changeSub(x);});})
        .on('editTeam',function(x){$scope.$apply(function () {$scope.changeTeam(x);});})
        .on('editGame',function(x){$scope.$apply(function () {$scope.changeGame(x);});})
        .on('error',function(x){console.log(x);});
    }
    $scope.init = function () {
      if (!$stateParams.name) $state.go('404');
      $scope.getGame($stateParams.name, function (err,data) { //'5495eb1b46fea7c15102dc7f'
        if (data) {
          $scope.curGame = data;
          $scope.subs = data.submissions;
          $scope.teams = data.teams;
          $scope.getTeams(true,null,true);
          $scope.sortMatches();
          socketConf();
        }
        else {
          $state.go('404');
        }
      });
    };
    $scope.init();
}]);
