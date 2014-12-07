angular.module('testApp', ['ngRoute'])
    .config(['$routeProvider',function ($routeProvider) {
        $routeProvider
            .when('/', {
                controller: 'tableCtrl',
                templateUrl: '/ang/views/table.html'
            })
            .when('/match/:id', {
                controller: 'matchCtrl',
                templateUrl: '/ang/views/match.html'
            })
            .when('/add', {
                controller: 'addCtrl',
                templateUrl: '/ang/views/add.html'
            })
            .otherwise ({redirectTo: '/'});
    }])
    .controller('gameCtrl',['$scope','$http', function ($scope,$http) {
        $scope.game=[];
        $scope.getGame = function () {
            $http.get ('http://23.94.13.240:3000/frc/api/game')
                .success(function (data) {
                    for (var x in data) {
                        if (data[x].path[0] != '_') $scope.game.push({name:data[x].path,type:data[x].options.type});
                    };
                });
        };
        $scope.getGame();
    }])
    .controller('tableCtrl',['$scope','$http','game',function ($scope,$http,game) {
        $scope.matches = [];
        $scope.new = {};
        $scope.orderProp = '';
        $scope.search = '';
        $scope.update = function () {
            $http.get ('http://23.94.13.240:3000/frc/api/matches')
                .success(function (data) {
                    $scope.matches = data;
                });
        };
        $scope.del = function (id) { //Where id is a position of the array matches
            $http.delete('http://23.94.13.240:3000/frc/api/match/'+$scope.matches[id]._id)
                .success(function (data) {
                    $scope.matches.splice(id,1);
                })
                .error(function (data) {
                    $scope.matches.splice(id,1);
                });
        };
        $scope.edit = function (id,params,ind) {
            $http.put('http://23.94.13.240:3000/frc/api/match/'+id,params)
                .success(function (data) {
                    $scope.matches[ind]=data;
                })
                .error(function (data) {
                    $scope.matches[ind]=data;
                });
        };
        $scope.add = function () {
            $http.post('http://23.94.13.240:3000/frc/api/match', $scope.new)
                .success(function (data) {
                    $scope.matches.push(data);
                    $scope.new={};
                });
        };
        $scope.rules = [

          {name:'Total',items:[
              {item:'Climb',worth:10},
              {item:'Lowgoal',worth:5},
              {item:'Legit',worth:50},
              {item:'highgoal',worth:15}
          ]}
        ];
        $scope.getWorth = function (calc,match) {
          var res = 0;
          if (calc.items) {
            for (var i = 0; i<calc.items.length;i++) {
              res = res + match[calc.items[i].item]*calc.items[i].worth;
            };
          }
          if (calc.calcItems) {

          }
          return res;
        };
        $scope.update();
    }])
    .controller('matchCtrl',['$scope','$routeParams','$http','$testFactory',function ($scope,$routeParams,$http,$testFactory) {
        $scope.id = $routeParams.id;
        $scope.json = {};
        var matchPromise = $http.get ('http://23.94.13.240:3000/frc/api/match/'+$scope.id+'.json')
            .success(function (data) {
                $scope.json=data;
                testFactory.test();
            });
    }])
    .controller('addCtrl',['$scope','$http', function ($scope,$http) {
        $scope.params = {};
        $scope.res = {};
        $scope.send = function () {
            $http.post('http://23.94.13.240:3000/frc/api/match', $scope.params)
                .success(function (data) {
                    $scope.res=data;
                    $scope.params = {};
                });
        };
    }])
