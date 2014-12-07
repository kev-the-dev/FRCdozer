angular.module('FRCdozer')
  .factory('game', ['$http',function () {
    return {
      getMatches: function () {
        $http.get ('/api/match')
          .success(function (data) {
            return data;
          });
      },
      getGame: function () {
        $http.get('/api/game')
          .success(function (data) {
            return data;
          });
      },
      getMatch: function (id) {
        $http.get('/api/match/'+id)
          .success(function (data) {
            return data;
          });
      },
      editMatch: function (id,elements) {
        $http.put('/api/match/'+id,elements)
          .success(function (data) {
            return data;
          });
      },
      addMatch: function (elements) {
        $http.post ('/api/match',elements)
          .success(function (data) {
              return data;
          });
      },
      delMatch: function (id) {
        $http.delete ('/api/match',match)
          .success(function (data) {
            return data;
          });
      }
    };
  }]);
