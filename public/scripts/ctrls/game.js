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
    $scope.newTeam={};
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
        $scope.curGame = game;
    };
    $scope.appendSub = function (sub) {
        $scope.subs.push(sub);
        $scope.sortTeams([sub],true);
        $scope.sortMatches();
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
      $scope.subs.splice(a,1);
      $scope.teams[b].subs.splice(c,1);
      if ($scope.teams[b].subs.length===0 && !$scope.teams[b]._id) $scope.teams.splice(b,1);
      $scope.sortMatches();
    };
    $scope.removeTeam = function (team) {
      for (x in $scope.teams) if ($scope.teams[x]._id === team._id) {
        $scope.teams.splice(x,1);
        break;
      }
    };
    $scope.changeSub = function (sub) {
      for (x in $scope.subs) if (sub._id === $scope.subs[x]._id) {
        $scope.subs[x]=sub;
        $scope.sortTeams();
        break;
      }
      $scope.sortMatches();
    };
    $scope.changeTeam = function (team) {
      for (x in $scope.teams) if (Number($scope.teams[x].team) === Number(team.team)) {
        $scope.teams[x].name = team.name;
        $scope.teams[x].notes = team.notes;
        $scope.teams[x]._id = team._id  || undefined;
        return;
      }
      $scope.appendTeam(team);
    };
    $scope.getMatch = function (match) {
      for (x in $scope.matches) if ($scope.matches[x].match === match) return $scope.matches[x];
    };
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
    $scope.createGame = function (param,call) {
      $http.post('api/game',params)
        .success(function (data) {
          call(null,data);
        })
        .error(function (data) {
          call(data,null);
        });
    };
    $scope.getSubs = function (id,call) {
      $http.get('api/game/'+(id || $scope.curGame._id)+'/sub')
        .success(function (x) {
          $scope.handle('getSubs');
          $scope.subs=x;
          $scope.sortMatches();
          $scope.sortTeams();
          call();
        })
        .error(function(x){$scope.handle('getSubs',x)});
    };
    $scope.getTeams = function (id,call) {
      $http.get('api/game/'+(id || $scope.curGame._id)+'/team')
        .success(function (teams) {
          $scope.handle('getSubs');
          for (y in teams) $scope.changeTeam(teams[y]);
        })
        .error(function(x){$scope.handle('getSubs',x)});
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
      for (x in $scope.teams) if (Number($scope.teams[x].team) === team) return $scope.teams[x];
    }
    $scope.editSub = function (x) {
      $http.put('api/game/'+$scope.curGame._id+'/sub/'+x._id,x)
        .success(function(x) {
          $scope.handle('editSub');
          if (!$scope.connected) $scope.changeSub(data);
        })
        .error(function (x) {$scope.handle('editSub',x)});
    };
    $scope.editTeam = function (x) {
      if (x._id) var req = $http.put('api/game/'+$scope.curGame._id+'/team/'+x._id,{
        _id:x._id,
        name:x.name || "",
        notes:x.notes || "",
        team:Number(x.team)
      });
      else var req = $http.post ('api/game/'+$scope.curGame._id+'/team',{
        name:x.name || "",
        notes:x.notes || "",
        team:Number(x.team)
      });
      req
        .success(function(x){
          $scope.newTeam = {};
          $scope.handle('editTeam');
          if (!$scope.connected) $scope.changeTeam(x);
        })
        .error(function(x){$scope.handle('editTeam',x);});
    };
    $scope.addSub = function (elements) {
      $http.post ('api/game/'+$scope.curGame._id+'/sub',elements)
        .success(function (x) {
	    $scope.add = {};
          $scope.handle('newSub');
          if (!$scope.connected) $scope.appendSub(data);
        })
        .error(function (x) {$scope.handle('newSub',x)});
    };
    $scope.delSub = function (id) {
      $http.delete ('api/game/'+$scope.curGame._id+'/sub/'+id)
        .success(function (x) {
          $scope.handle('delSub');
          if (!$scope.connected) $scope.removeSub(id);
        })
        .error(function (x){$scope.handle('delSub',x)});
    };
    $scope.delTeam = function (id) {
      $http.delete ('api/game/'+$scope.curGame._id+'/team/'+id)
        .success(function (x) {
          $scope.handle('delTeam');
          if (!$scope.connected) $scope.removeTeam(data);
        })
        .error(function (x) {$scope.handle('delTeam',x)});
    };
    $scope.editGame = function (x) {
      x.teams = undefined;
      x.submissions = undefined;
      $http.put('api/game/'+x._id,x)
        .success(function (data) {
          $scope.handle('editGame');
          if (!$scope.connected) $scope.chanVgeGame(data);
        })
        .error(function(x){$scope.handle('editGame',x)});
    };
    $scope.getValue = function (sub,calc) {
      sub = sub || {};
      calc = calc || [];
      var val = 0;
      for (x in calc) val=val+(Number(sub[calc[x].name])*calc[x].worth || 0);
      return Math.round(val*100)/100 || 0;
    };
    $scope.sortTeams = function (subs,noReset) { //sorts aray of submissions or $scope.subs into teams
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
      $scope.teams = teams;
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
      $scope.getGame($stateParams.name, function (err,x) {
        if (x) {
          //$scope.curGame = x;
          //$scope.getSubs(x._id,function(){$scope.getTeams(x._id);});
          //socketConf();
          $scope.curGame = x;
          $scope.subs = x.submissions;
          $scope.teams = x.teams;
          $scope.sortTeams(null,true);
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
