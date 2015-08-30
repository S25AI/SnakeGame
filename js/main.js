document.addEventListener('DOMContentLoaded', function() {
	var snake = document.querySelector("#snake"),
		container = document.querySelector("#gameContainer"),
		stopId,
		cellSize = 20,
		turnTime = 20,
		innerContainerWidth = container.clientWidth,
		innerContainerHeight = container.clientHeight;

	var keysContainer = {
		"40": {
			"dir" : "top",
			"limit": innerContainerHeight - cellSize,
			"vector": 1
		},
		"39": {
			"dir" : "left",
			"limit" : innerContainerWidth - cellSize,
			"vector": 1
		},
		"37": {
			"dir" : "left",
			"limit": 0,
			"vector": -1
		},
		"38": {
			"dir" : "top",
			"limit": 0,
			"vector": -1
		}
	};

	document.onkeydown = function(event) {
		var code = event.keyCode;

		for (var key in keysContainer) {
			if (code == key) {
				runSnake(keysContainer[key]);
			}
		}

		return false;
	}

	function runSnake(key) {
		var dir = key.dir,
			limit = key.limit,
			vector = key.vector;

		if (stopId) {
			clearTimeout(stopId);
			stopId = null;
		}

		stopId = setInterval(function() {

			snake.style[dir] = parseInt( getComputedStyle(snake)[dir] ) + (cellSize * vector) + "px";

			if (parseInt( snake.style[dir] ) * vector > limit) {
				alert("You lose!");
				clearTimeout(stopId);
				toStartPosition();
				return;
			}
		}, turnTime);
	}

	function toStartPosition() {
		snake.style.top = "0";
		snake.style.left = "0";
	}
});

