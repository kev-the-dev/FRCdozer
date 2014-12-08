angular.module('FRCdozer')
.controller('frcCtrl',['$scope','$http',function($scope,$http) {
    $scope.matches= []; //stores matches for current game
    $scope.match={}; //stores single match that operations are currently being done on
    $scope.add = {} //stores un-posted add
    $scope.game = {}; //stores game that operations are being done on
    $scope.curGame = {}; //game that is currently active, to show in table
    $scope.games = []; //stores all games
    $scope.sample = {};
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
        return data;
      });
    };
    $scope.delMatch = function (id) {
      $http.delete ('/api/match/'+id)
      .success(function (data) {
        $scope.getMatches();
      });
    };
    $scope.getValue = function (match,calc) {
      var val = 0;
      for (var x=0;x<calc.length;x++) {
        val=val+(Number(match[calc[x].name])*calc[x].worth || 0);
      }
      return val;
    };
    $scope.editGame = function (id,elements) {
      $http.put('/api/game/'+id,elements)
        .success(function (data) {
          $scope.game = data;
        })
    };
    $scope.test = function () {
      console.log("Blured");
    };
}]);
