angular.module('chat', ['luegg.directives','ngEmoticons'])
	.controller('chatCtrl', function($scope, $anchorScroll, $location, $timeout){
		var socket = io();
		$("#myModal").modal("show")
		var disconnectedcolor = "#"+((1<<24)*Math.random()|0).toString(16)
		$scope.chat = []
		$scope.typing = []
		$scope.connectedUser = []
		$scope.message = "";
		$scope.newuser = ""
		$scope.connected = 0;
		$scope.user = "";
		$scope.ntyping = true;
		$scope.glued = true;
		$scope.nbmsg = 0
		$scope.color = "#"+((1<<24)*Math.random()|0).toString(16);


		$scope.getUserColor = function(arg){
			var index = $scope.connectedUser.map(function(e) { return e.user; }).indexOf(arg)
			if(index >= 0)
			return $scope.connectedUser[index].color;
			return disconnectedcolor;
		}

		$scope.class = function(arg){
			if(arg !== $scope.user) return  "left";
			return "right";
		}
		$scope.pull = function(arg){
			if(arg !== $scope.user) return  "";
			return "pull-left";
		}

		$scope.send = function(){
			if($scope.message.length > 0){
				socket.emit('send message', $scope.message);
				$scope.message = "";
			}
			console.log($scope.connectedUser)
		}
		$scope.register = function(){
			if($scope.newuser.length > 2){
				$scope.color = "#"+((1<<24)*Math.random()|0).toString(16);
				$scope.user = $scope.newuser;
				socket.emit('add user', {newuser: $scope.newuser, color: $scope.color});
				$('#myModal').modal('toggle'); 
			}
			//$('#myModal').modal().hide();
		}

		function  typing(newVal,oldVal,scope){
			if(newVal != "" && $scope.ntyping){
				socket.emit('typing', $scope.user);
				$scope.ntyping = false;
			}
			else if(newVal == "" && !$scope.ntyping){
				socket.emit('ntyping', $scope.user);
				$scope.ntyping = true;
			}
		}

		socket.on('new message', function(msg){
			$scope.$apply(function(){
				$scope.chat.push(msg);
			})
		  
		});

		$scope.$watch("message", typing);

		socket.on('new typing', function(data){
			if(data.user != $scope.user){
				$scope.$apply(function(){				
					$scope.typing.push(data.user)
				})
			}
		})

		socket.on('stop typing', function(data){
			if(data.user != $scope.user){
				$scope.$apply(function(){				
					$scope.typing.splice($scope.typing.indexOf(data.user),1)
					
				})
			}
		})

		socket.on('connected', function(msg){
			$scope.$apply(function(){
		 		$scope.connected = msg.data;
		 		$scope.connectedUser = msg.new
		 		
		 		if($scope.connectedUser[$scope.connectedUser.length-1].user != $scope.user){
		 			var color = $scope.connectedUser[$scope.connectedUser.length-1].color
		 			var icon = $scope.connectedUser[$scope.connectedUser.length-1].user[0].toUpperCase()
		 			$.notify({
		 				
		 				title: $scope.connectedUser[$scope.connectedUser.length-1].user.toUpperCase(),
		 				message: 'is connected !',
		 				

		 			},{
		 				type: 'info',
		 				delay: 5000,
		 				icon_type: 'image',
		 				template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
		 					'<span class="chat-img pull-left avatar img-circle" style="background:'+color+'; height:50px; width:50px; font-size: 1.8em; margin-right: 15px"><p class="avatar_content">'+icon+'</p></span>' +
		 					'<span data-notify="title"><strong>{1}</strong></span></br>' +
		 					'<span data-notify="message">{2}</span>' +
		 				'</div>'
		 			});

		 			
		 		}
		 			console.log($scope.connectedUser)
		 	})
		});
		socket.on('gone', function(msg){
			$scope.$apply(function(){
		 		$scope.connected = msg.data;
		 		var index = $scope.connectedUser.map(function(e) { return e.user; }).indexOf(msg.disc)
		 		if(index != -1){
		 			disconnectedcolor = $scope.connectedUser[index].color
			 		$scope.connectedUser.splice(index,1)
			 		$scope.typing.splice($scope.typing.indexOf(msg.disc),1)
			 		$.notify({
			 			
			 			title: msg.disc.toUpperCase(),
			 			message: 'is disconnected !',
			 			

			 		},{
			 			type: 'danger',
			 			delay: 5000,
			 			icon_type: 'image',
			 			template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
			 				'<span class="chat-img pull-left avatar img-circle" style="background:'+disconnectedcolor+'; height:50px; width:50px; font-size: 1.8em; margin-right: 15px"><p class="avatar_content">'+msg.disc[0].toUpperCase()+'</p></span>' +
			 				'<span data-notify="title"><strong>{1}</strong></span></br>' +
			 				'<span data-notify="message">{2}</span>' +
			 			'</div>'
			 		});
		 		}
		 		
		 	})
		});


  	})