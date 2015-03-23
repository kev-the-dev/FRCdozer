angular.module('FRCdozer')
.config(['$httpProvider', function($httpProvider) {
	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
}])
.controller('frcCtrl',['$scope','$http','$stateParams','$state','$location',function($scope,$http,$stateParams,$state,$location) {
		$scope.location = window.location;
		$scope.authlevel = 1;
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
		$scope.filters = {};
    $scope.revr = $state.params.reverse || false;
    $scope.connected = false;
    $scope.newTeam;
    $scope.getDate = function (id) {
      if (id) {
        var date = new Date(parseInt(id.substring(0, 8), 16) * 1000);
        return date;
      }
    };
    function discon (x) {
      $scope.$apply(function() {
        $scope.connected=false;
				$scope.userInit();
      });
    }
    function con(x) {
      $scope.$apply(function() {
        $scope.connected=true;
				$scope.userInit();
      });
    }
    $scope.unfilt = function () {
      $scope.filt='';
      $scope.revr=false;
    };
    $scope.sort = function (prop,type,name) {
			var name = name ? name : prop;
			if (!$scope.filters[type]) {
				$scope.filters[type] = {
					key:prop,
					reverse:false,
					name: name
				};
				return;
			}

      if ($scope.filters[type].key === prop) { //If already at this property, reverse
				$scope.filters[type].reverse=!$scope.filters[type].reverse;
				$scope.filters[type].name = name;
			}
      else {
				$scope.filters[type].key=prop;
				$scope.filters[type].reverse=false;
				$scope.filters[type].name = name;
      }
    };
    $scope.changeGame = function (game) {
        $scope.curGame = game;
    };
    $scope.appendSubs = function (subs) {
			for (i in subs) $scope.subs.push($scope.fixSub(subs[i]));
      $scope.sortTeams();
      $scope.sortMatches();
    };
		$scope.fixSub = function (sub) { //ensure sub has all needed elements and returns fixed version
			sub.matchObj = sub.matchObj || $scope.deserializeMatch(sub.match);
			sub.calc = sub.calc || {};
			sub.elements = sub.elements || {};

			for (i in $scope.curGame.game) {
				ele = $scope.curGame.game[i];
				if (ele.type === "Boolean") sub.elements[ele.name] = sub.elements[ele.name] || false;
				else if (ele.type === "Number") sub.elements[ele.name] = sub.elements[ele.name] || 0;
			}
			sub.calc = $scope.getValues(sub.elements);
			return sub;
		};
    $scope.appendTeam = function (team) {
      $scope.teams.push($scope.fixTeam(team));
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
        $scope.subs[x]=$scope.fixSub(sub);
        break;
      }
			$scope.sortTeams();
      $scope.sortMatches();
    };
		$scope.changeMatch = function (match) {
			if (!match.match) return;
			match.matchObj = match.matchObj || $scope.deserializeMatch(match.match);

			for (var x in $scope.matches) if (match.match === $scope.matches[x].match) {
				match.time = match.time ? match.time : $scope.matches[x].time; //if change doesn't have team, but original does, keep original
				for (var y in match.blue.teams) if (match.blue.teams.hasOwnProperty(y)) {
					match.blue.teams[y] = (typeof $scope.matches[x].blue.teams[y] === "object") ? $scope.matches[x].blue.teams[y] : match.blue.teams[y]
				}
				for (var z in match.red.teams) if (match.red.teams.hasOwnProperty(z)) {
					match.red.teams[z] = (typeof $scope.matches[x].red.teams[z] === "object") ? $scope.matches[x].red.teams[z] : match.red.teams[z]
				}
				$scope.matches[x] = $scope.fixMatch(match);
				return;
			}
			$scope.matches.push(match);
		};
		$scope.fixMatch = function (match) {
			match.matchObj = match.matchObj || $scope.deserializeMatch(match.match);
			match.blue.calc = $scope.matchCalcs(match.blue.teams);
			match.red.calc =  $scope.matchCalcs(match.red.teams);
			match.winner = $scope.winnerString(match.blue.score,match.red.score);
			return match;
		};
		$scope.resetSubs = function () {
			if (!confirm("Are you sure you want to clear all submissions for "+$scope.curGame.name+"?")) return false;
			$http.delete("api/game/"+$scope.curGame._id+"/sub")
				.success(function (x) {
					$scope.subs=[];
					$scope.sortMatches();
					$scope.sortTeams();
				})
				.error(function (x) {
					console.log("Error resetting subs",x);
				});
		};
		$scope.resetTeams = function () {
			if (!confirm("Are you sure you want delete all teams for "+$scope.curGame.name+"?")) return false;
			$http.delete("api/game/"+$scope.curGame._id+"/team")
				.success(function (x) {
					$scope.teams=[];
					$scope.sortMatches();
					$scope.sortTeams();
				})
				.error(function (x) {
					console.log("Error resetting subs",x);
				});
		};
		$scope.tbaGrabTeams = function () {
			$http.get("api/tbaproxy/event/"+$scope.curGame.tbakey+"/teams?X-TBA-App-Id=frc4118:scouting:1")
			.success(function (res) {
				for (i in res) {
					var team = {team:res[i].team_number,name:res[i].nickname};
					for (x in $scope.teams) if (Number($scope.teams[x].team) === Number(team.team)) {
						team._id = $scope.teams[x]._id;
					}
					$scope.editTeam(team);
				}
			})
			.error(function (x) {
				console.log(x);
			});
		};
		$scope.changeTeam = function (team) { //if you want a preporty to not be there, set to null
			for (x in $scope.teams) if (Number($scope.teams[x].team) === Number(team.team)) {
				console.log("found");
				$scope.teams[x].name = team.name;
				$scope.teams[x].notes = team.notes;

				$scope.teams[x]._id = team._id  || undefined;
				$scope.teams[x] = $scope.fixTeam($scope.teams[x]);
				return false;
			}
			$scope.appendTeam(team);
			return true;
		};
		$scope.editTeam = function (x,event) {
			if (event) var file = event.target.form.elements.files.files[0];
			if (file) {
				var uri = 'api/game/'+$scope.curGame._id+'/team/'+x._id+'/pic';
				var fd = new FormData();
				fd.append('pic', file);
				$http.post(uri,fd,{
					transformRequest: angular.identity,
					headers: {'Content-Type': undefined}
				})
				.success(function (res) {
					x.pic = res;
					$scope.changeTeam(x);
				})
				.error(function (x) {
					console.log(x);
				});
			}

			if (x._id) {
				var req = $http.put('api/game/'+$scope.curGame._id+'/team/'+x._id,x);
			}
			else var req = $http.post ('api/game/'+$scope.curGame._id+'/team',x);

			req
			.success(function(x,sta){
				$scope.newTeam = {};
				$scope.handle('editTeam');
				$scope.changeTeam(x);
			})
			.error(function(x,sta){
				$scope.handle('editTeam',x);
			});
		};
    $scope.getMatch = function (match) {
      for (x in $scope.matches) if ($scope.matches[x].match === match.toLowerCase()) return $scope.matches[x];
    };
    $scope.sortMatches = function () { //sorts array of submissions, or the scope submissions, into matches
      var subs = $scope.subs;
      var matches = $scope.matches;
			for (var z in matches) {
				matches[z].noAlliance = [];

				if (!matches[z].blue) matches[z].blue = {teams:{},score:0};
				if (!matches[z].red) matches[z].red = {teams:{},score:0};

				for (var bluekey in matches[z].blue.teams) if (matches[z].blue.teams.hasOwnProperty(bluekey)) { //delete blue matches that aren't from TBA
					if (matches[z].blue.teams[bluekey] !== true) delete matches[z].blue.teams[bluekey];
				}
				for (var redkey in matches[z].red.teams) if (matches[z].red.teams.hasOwnProperty(redkey)) { //delete red matches that aren't from TBA
					if (matches[z].red.teams[redkey] !== true) delete matches[z].red.teams[redkey];
				}
			}
      s: for (var x in subs) { //For each submision
				if (subs[x].match) {
					for (var y in matches) if (matches[y].match === subs[x].match.toLowerCase()) { //If the match with that sub's match exsists, add it to that match
						if (subs[x].side === "Blue") matches[y].blue.teams[subs[x].team] = subs[x];
						else if (subs[x].side === "Red") matches[y].red.teams[subs[x].team] = subs[x];
						else matches[y].noAlliance.push(subs[x]);
						continue s;
					}
					if (subs[x].side === "Blue") {
						var o = {}
						o[subs[x].team] = subs[x];
						matches[matches.length] = {
							match:subs[x].match.toLowerCase(),
							matchObj:$scope.deserializeMatch(subs[x].match),
							blue:{
								teams:o
							},
							red : {
								teams:{}
							},
							noAlliance : []
						};
					}
					else if (subs[x].side === "Red")  {
						var o = {}
						o[subs[x].team] = subs[x];
						matches[matches.length] = {
							match:subs[x].match.toLowerCase(),
							matchObj:$scope.deserializeMatch(subs[x].match),
							red:{
								teams:o
							},
							blue : {
								teams:{}
							},
							noAlliance : []
						};
					}
					else {
						matches[matches.length] = {
							match:subs[x].match.toLowerCase(),
							matchObj:$scope.deserializeMatch(subs[x].match),
							red:{
								teams:{}
							},
							blue : {
								teams:{}
							},
							noAlliance : [subs[x]]
						};
					}
				}
      }
			for (var f in matches) matches[f] = $scope.fixMatch(matches[f]);
      $scope.matches = matches;
    };
		$scope.matchTeams = function (teams) { //given object of teams, return array of team keys
			var z = [];
			for (x in teams) if (teams.hasOwnProperty(x) && teams[x] !== true) z[z.length] = teams[x];
			return z;
		};
		$scope.matchSort = [ //Array of functions for sorting matches
			function (pre,rev) { //sorts first by match level (quaterfinals)
				var l = pre.matchObj.level;
				if (l === "qm" || l === "q" ) return 1;
				else if (l === "qf" ) return 2;
				else if (l === "sf" ) return 3;
				else if (l === "f" ) return 4;
				else return 0;
			},
			function (pre,rev) { //sorts next by set
				return pre.matchObj.set;
			},
			function (pre,rev) { //sorts finnaly by match number
				return pre.matchObj.number;
			}
		]
		$scope.serializeMatch = function (match) { //given object, turn in into string containers: level, set, number
			var ret = "";
			if (typeof match === "object") {
				if (match.level === "qm" || !match.set) ret =  match.level + match.number;
				else {
					ret = match.level+match.set+"m"+match.number;
				}
			}
			return ret;
		};
		$scope.deserializeMatch = function  (match) { //given string, turn in into an object
			var res = {};
			if (!match) return {};
			var x;
			for (x=0;x<match.length;x++) {
				if (!isNaN(match[x])) { //if you hit a number, you have level
					res.level = match.slice(0,x).toLowerCase();
					break;
				}
			}
			for (var y = x; y<match.length; y++) {
				if (isNaN(match[y])) { // If you hit a character, has a set
					res.set = Number(match.slice(x,y));
					break;
				}
			}
			if (res.set) { //if there is a set and next character is m
				res.number = Number(match.slice(y+1));
			}
			else {
				res.set = 1;
				res.number = Number(match.slice(x));
			}
			return res;
		};
		$scope.getVideoUrl = function (obj) {
			switch (obj.type) {
				case "youtube":
					return 'https://www.youtube.com/watch?v='+obj.key;
			}
		};
		function parseTBAmatch (match) {
			var o = {};
			var m = {};
			o[match.alliances.blue.teams[0].slice(3)] = true;
			o[match.alliances.blue.teams[1].slice(3)] = true;
			o[match.alliances.blue.teams[2].slice(3)] = true;

			m[match.alliances.red.teams[0].slice(3)] = true;
			m[match.alliances.red.teams[1].slice(3)] = true;
			m[match.alliances.red.teams[2].slice(3)] = true;

			var z = {
				level: match.comp_level,
				number: match.match_number,
				set: match.set_number
			};
			return {
				matchObj : z,
				match:($scope.serializeMatch(z)),
				time:Number(match.time*1000),
				blue : {
					score : (match.alliances.blue.score > 0 ? match.alliances.blue.score :  0),
					teams : o
				},
				red : {
					score : (match.alliances.red.score > 0 ? match.alliances.red.score :  0),
					teams : m
				},
				noAlliance : [],
				videos: match.videos
			};
		}
		$scope.tbaGrabMatches = function () {
			$http.get("api/tbaproxy/event/"+$scope.curGame.tbakey+"/matches?X-TBA-App-Id=frc4118:scouting:1")
			.success(function (x) {
				for (i in x) $scope.changeMatch(parseTBAmatch(x[i]));
				$scope.sortMatches();
			})
			.error(function (x) {
				console.log(x);
			});
		};
		$scope.matchCalc = function (teams,elements) { //given an object of a match team, calculate blue total worth of element
			var total = 0;
			for (var key in teams) {
				if (teams.hasOwnProperty(key)) {
					if (teams[key] !== true) {
						total = total + $scope.getValue(teams[key].elements,elements)
					}
				}
			}
			return total;
		};
		$scope.matchCalcs = function (teams) {
			var res = {};
			for (i in $scope.curGame.calc) res[$scope.curGame.calc[i].name] = $scope.matchCalc(teams,$scope.curGame.calc[i].elements);
			return res;
		};
    $scope.getGame = function (id,call) {
      $http.get('api/game/'+id)
        .success(function (data) {
          call (null,data);
        })
        .error(function (data,status) {
          call({message:data,status:status},null);
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
			return {team:team,name:""};
    }
    $scope.editSub = function (x) {
      $http.put('api/game/'+$scope.curGame._id+'/sub/'+x._id,x)
        .success(function(x) {
          $scope.handle('editSub');
          if (!$scope.connected) $scope.changeSub(data);
        })
        .error(function (x) {$scope.handle('editSub',x)});
    };
    $scope.addSub = function (elements) {
      $http.post ('api/game/'+$scope.curGame._id+'/sub',elements)
        .success(function (x) {
	    		$scope.add = {};
          $scope.handle('newSub');
          if (!$scope.connected) $scope.appendSubs([data]);
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
		$scope.downloads = {};
		$scope.subsToCSV = function (subs) {
			var str = "Match,Team,Alliance";
			for (y in $scope.curGame.game) str +=","+$scope.curGame.game[y].name;
			for (y in $scope.curGame.calc) str +=","+$scope.curGame.calc[y].name;
			str += "\n";
			for (x in subs) {
				str += subs[x].match.toLowerCase()+",";
				str += subs[x].team+",";
				str += subs[x].side;
				for (z in $scope.curGame.game) str+=","+(subs[x].elements[$scope.curGame.game[z].name] || "");
				for (z in $scope.curGame.calc) str+=","+($scope.getValue(subs[x].elements,$scope.curGame.calc[z].elements) || 0);
				str += "\n"
			}
			return str;
		};
		$scope.stringify = JSON.stringify;
		$scope.confirm = function (x) {
			confirm(x);
		};
		$scope.download = function (prop,stuff,type) {
			var blob = new Blob([ stuff ], { type : (type || 'text/plain')+';charset=utf-8;' });
			var url = (window.URL || window.webkitURL).createObjectURL( blob );
			$scope.downloads[prop] = url;
		}
    $scope.getValue = function (sub,calc) {
      sub = sub || {};
      calc = calc || [];
      var val = 0;
      for (x in calc) val=val+(Number(sub[calc[x].name])*calc[x].worth || 0);
      return Math.round(val*100)/100 || 0;
    };
		$scope.getValues = function (elements) {
			var res = {};
			for (i in $scope.curGame.calc) res[$scope.curGame.calc[i].name] = $scope.getValue(elements,$scope.curGame.calc[i].elements);
			return res;
		};
    $scope.sortTeams = function () { //sorts aray of submissions or $scope.subs into teams
			var teams = $scope.teams;
			var subs = $scope.subs;
			for (k in teams) teams[k].subs = [];

			s: for (h in subs) {
				for (i in teams) {
					if (Number(subs[h].team) === Number(teams[i].team)) {
						teams[i].subs.push(subs[h])
						continue s;
					}
				}
				teams.push({
					team:(subs[h].team),
					subs:[subs[h]]
				});
			}

			for (k in teams) teams[k] = $scope.fixTeam(teams[k]);

			$scope.teams = teams;
    };
		$scope.fixTeam = function (team) {
			team.averages =  $scope.getAverages(team.subs);
			team.calc = $scope.getValues(team.averages);
			return team;
		};
    $scope.getAverage = function (prop,subs) {
      subs = subs || [];
      var avr = 0;
      for (x in subs) avr = avr+(Number(subs[x].elements[prop])||0);
      avr = avr / (subs.length);
      avr = Math.round(avr*100)/100 || 0;
      return avr;
    };
		$scope.getAverages = function (subs) {
			var res = {}
			for (i in $scope.curGame.game) res[$scope.curGame.game[i].name] = $scope.getAverage($scope.curGame.game[i].name,subs);
			return res;
		};
    function socketConf () {
      $scope.socket = io('/game?name='+$scope.curGame.name,{path:window.location.pathname+'socket.io/','force new connection' : true})
        .on('message', function (data) {console.log(data);})
        .on('connect', con)
				.on('connect_error',discon)
        .on('reconnect',con)
				.on('disconnect',discon)
        .on('connect_timeout', discon)
        .on('reconnecting', discon)
        .on('reconnect_error',discon)
        .on('reconnect_failed',discon)
        .on('newSub', function(x){$scope.$apply(function () {$scope.appendSubs([x]);});})
        .on('newTeam',function(x){$scope.$apply(function () {$scope.changeTeam(x);});})
        .on('delSub', function(x){$scope.$apply(function () {$scope.removeSub(x._id);});})
        .on('delTeam', function(x){$scope.$apply(function () {$scope.removeTeam(x);});})
        .on('editSub',function(x){$scope.$apply(function () {$scope.changeSub(x);});})
        .on('editTeam',function(x){$scope.$apply(function () {$scope.changeTeam(x);});})
        .on('editGame',function(x){$scope.$apply(function () {$scope.changeGame(x);});})
				.on('resetSubs',function(x){$scope.$apply(function () {$scope.resetSubs();});})
				.on('resetTeams',function(x){$scope.$apply(function () {$scope.resetTeams();});})
				.on('TBAverification',function(x){$scope.$apply(function () {
					$scope.curGame.verification = x;
				});})
				.on('TBAping',function(x){$scope.$apply(function () {
					console.log(x);
				});})
				.on('editMatch',function(x){$scope.$apply(function () {
					if (x.message_data.match.event_key === $scope.curGame.tbakey) {
						$scope.changeMatch(parseTBAmatch(x.message_data.match));
						return;
					} else console.log("Not using match score beacuase wrong event key",x);
				});})
				.on('upcomingMatch',function(x){$scope.$apply(function () {
					//if (x.message_data.match.event_key === $scope.curGame.tbakey) {
						var m = {};
						m.match = x['message_data']['match_key'].split('_')[1];
						m.matchObj = $scope.deserializeMatch(m.match);
						m.predictedTime = x['message_data']['predicted_time'];
						m.scheduledTime = x['message_data']['scheduled_time'];
						$scope.nextMatch = m;
						return;
					//} else console.log("Not using match score beacuase wrong event key",x);
				});})
        .on('error',function(x){console.log(x);});
    }
    $scope.init = function () {
      if (!$stateParams.name) $state.go('404');
      $scope.getGame($stateParams.name, function (err,x) {
        if (x) {
					$scope.curGame = x;

					$scope.teams = x.teams;
					$scope.appendSubs(x.submissions)

					delete $scope.curGame.submissions;
					delete $scope.curGame.teams;

          socketConf();
    	  	$scope.tbaGrabInfo();
					$scope.tbaGrabMatches();
        }
        else if (err) {
					if (err.status === 401) $state.go('401');
          else $state.go('404');
        }
      });
    };
		$scope.winnerString = function (blue,red) {
			if (!blue || !red) return "";
			if (blue > red) return "Blue";
			else if (red > blue) return "Red";
			else if (red === blue) return "Tie";
		};
		$scope.delPermission = function (user) {
			delete $scope.curGame.permissions.users[user];
		};
    $scope.tbaGrabInfo = function () {
			$http.get("api/tbaproxy/event/"+$scope.curGame.tbakey+"?X-TBA-App-Id=frc4118:scouting:1")
				.success(function (x) {
					$scope.tbaResponse = x;
				})
				.error(function (x) {
	        console.log(x);
	      });
    };
    $scope.init();
}]);
