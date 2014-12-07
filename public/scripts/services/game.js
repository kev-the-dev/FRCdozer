angular.module('testApp')
  .factory('game', ['$http',function () {
    return {
      getMatches: function () {
        $http.get ('http://23.94.13.240:3000/frc/api/game')
          .success(function (data) {
            return data;
          });
      },
      getGame: function (id) {

      },
      getGames: ['$http',function() {
        $http.get ('http://23.94.13.240:3000/frc/api/matches')
          .success(function (data) {
            return data;
          });
      }],
      editMatch: function (params,id) {
        if(id) {
          $http.put('http://23.94.13.240:3000/frc/api/match/'+id,params)
            .success(function () {

            });
        }
      },
      addMatch: function (match) {
        $http.post ('http://23.94.13.240:3000/frc/api/match',match)
          .success(function (data) {
              return data;
          });
      },
      delMatch: function () {

      }
    };
  }]);
