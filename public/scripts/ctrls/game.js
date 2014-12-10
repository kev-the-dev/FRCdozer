angular.module('FRCdozer')
.controller('frcCtrl',['$scope','$http',function($scope,$http) {
    $scope.matches= undefined; //stores matches for current game
    $scope.match={}; //stores single match that operations are currently being done on
    $scope.add = {} //stores un-posted add
    $scope.game = {}; //stores game that operations are being done on
    $scope.curGame = undefined; //game that is currently active, to show in table
    $scope.games = []; //stores all games
    $scope.sample = {};
    $scope.teams = [];
    $scope.getMatches = function () {
      $http.get ('/api/match')
      .success(function (data) {
        $scope.matches=data;
      });
    };
    $scope.getCurGame = function () {
      $http.get('/api/game')
      .success(function (data) {
        $scope.curGame=data;
      });
    };
    $scope.getGame = function (id) {
        $http.get('/api/game/'+id)
        .success(function (data) {
          $scope.game = data;
        });
    };
    $scope.getMatch = function (id) {
      $http.get('/api/match/'+id)
      .success(function (data) {
        $scope.match=data;
      });
    };
    $scope.editMatch = function (id,elements) {
      $http.put('/api/match/'+id,elements)
      .success(function (data) {
        $scope.getMatches();
      });
    };
    $scope.addMatch = function (elements) {
      $http.post ('/api/match',elements)
      .success(function (data) {
        $scope.getMatches();
      });
    };
    $scope.delMatch = function (id) {
      $http.delete ('/api/match/'+id)
      .success(function (data) {
        $scope.getMatches();
      });
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
    $scope.getTeams = function () {
      $scope.teams = [];
      mSearch: for (var x =0; x<$scope.matches.length; x++) { //sorts matches into teams
        var m = $scope.matches[x];
        for (var y=0; y<$scope.teams.length;y++) {
          var t = $scope.teams[y];
          if (t.team === m.team) {
            t.matches.push(m.elements);
            continue mSearch;
          }
        }
        $scope.teams.push({team:m.team,matches:[m.elements],averages:{}});
      }
      for (var z=0; z<$scope.teams.length;z++) { //for each team
        for (var x=0; x<$scope.curGame.game.length;x++) {
          if ($scope.curGame.game[x].type !== "String") {
            for (var p=0; p<$scope.teams[z].matches.length;p++) {
              if ($scope.teams[z].matches[p][$scope.curGame.game[x].name]) {
                $scope.teams[z].averages[$scope.curGame.game[x].name]=((Number($scope.teams[z].averages[$scope.curGame.game[x].name]) || 0) + Number($scope.teams[z].matches[p][$scope.curGame.game[x].name])) /(p+1);
              }
            }
          }
        }
      }
      console.log($scope.teams);
    };
    $scope.editGame = function (id,elements) {
      $http.put('/api/game/'+id,elements)
        .success(function (data) {
          $scope.game = data;
        })
    };
}]);
