angular.module('FRCdozer')
.controller('frcCtrl',['$scope','$http',function($scope,$http) {
    $scope.matches= undefined; //stores matches for current game
    $scope.match=[]; //stores single match that operations are currently being done on
    $scope.add = {} //stores un-posted add
    $scope.game = {}; //stores game that operations are being done on
    $scope.curGame = {}; //game that is currently active, to show in table
    $scope.games = []; //stores all games
    $scope.sample = {};
    $scope.teams = {};
    $scope.team={};
    $scope.filt="";
    $scope.revr=false;
    $scope.sort = function (prop) {
      if ($scope.filt === prop) $scope.revr=!$scope.revr;
      else {
        $scope.filt=prop;
        $scope.revr=true;
      }
    };
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
      return Math.round(val*100)/100;
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
    $scope.updateTeams = function (mats) {
      for (var x=0;x<mats.length;x++) {
        if ($scope.teams[mats[x].team]) {
          if ($scope.teams[mats[x].team].matches) $scope.teams[mats[x].team].matches.push (mats[x].elements);
          else $scope.teams[mats[x].team].matches = [mats[x].elements];
        }
        else $scope.teams[mats[x].team] = {matches:[mats[x].elements]};
      }
    };
    $scope.getTeams = function () {
      var mats = $scope.matches;
      $scope.teams = {};
      for (var x=0;x<mats.length;x++) {
        if ($scope.teams[mats[x].team]) {
          if ($scope.teams[mats[x].team].matches) $scope.teams[mats[x].team].matches.push (mats[x].elements);
          else $scope.teams[mats[x].team].matches = [mats[x].elements];
        }
        else $scope.teams[mats[x].team] = {matches:[mats[x].elements]};
      }
    };
    $scope.getAverage = function (prop,mats) {
      var avr = 0;
      for (x in mats) avr = (avr + (mats[x][prop] || 0)) / (x+1);
      return Math.round(avr*100)/100;
    };
    $scope.init = function (aft) {
      $scope.getCurGame().success(function (data) {
        $scope.curGame=data;
        $scope.getMatches().success(function (data2) {
          $scope.matches=data2;
          $scope.getTeams();
          if(aft) aft();
        });
      });
    };
}]);
