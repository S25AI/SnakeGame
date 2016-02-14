document.addEventListener('DOMContentLoaded', function() {
	var snake = document.querySelector("#snake"),
		container = document.querySelector("#gameContainer"),
		_getC = window.getComputedStyle,
		stopId,
		food = null,
		cellSize = 20,
		stepTime = 150,
		snakeArray = [],
		changeSnakeDirArray = [],
		innerContainerWidth = container.clientWidth,
		innerContainerHeight = container.clientHeight,
		cellsInRow = innerContainerWidth / cellSize,
		cellsInColumn = innerContainerHeight / cellSize;

	var keysContainer = {
		"40": {
			"dir" : "top",
			"wall": innerContainerHeight - cellSize,
			"vector": 1
		},
		"39": {
			"dir" : "left",
			"wall" : innerContainerWidth - cellSize,
			"vector": 1
		},
		"37": {
			"dir" : "left",
			"wall": 0,
			"vector": -1
		},
		"38": {
			"dir" : "top",
			"wall": 0,
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
	}

	function runSnake(key) {
		var dir = key.dir,
			wall = key.wall,
			vector = key.vector;

		if (stopId) {
			clearTimeout(stopId);
			stopId = null;
		}

		stopId = setInterval(function() {
			if (!food) createFood();

			if ( !snakeArray.length ) snakeArray.push(snake);

			shiftEverySnakeComponents(dir, vector);

			snakeEat();

			if (parseInt( snake.style[dir] ) * vector > wall) {
				gameEnd();
			}
		}, stepTime);
	}

	function createFood() {
		food = document.createElement('div');
		food.setAttribute('id', 'food');
		food.style.left = Math.floor( Math.random() * cellsInRow ) * cellSize + "px";
		food.style.top = Math.floor( Math.random() * cellsInColumn ) * cellSize + "px";
		container.appendChild(food);
	}

	function removeFood() {
		container.removeChild(food);
		food = null;
	}

	function gameEnd() {
		alert("You lose!");
		removeFood();
		clearTimeout(stopId);
		toStartPosition();
		snakeArray.forEach(function(el, index){
			if (!index) return false;
			el.parentNode.removeChild(el);
		});
		snakeArray = [];
	}

	function snakeEat() {
		var snakeTop = _getC(snake).top,
				snakeLeft = _getC(snake).left,
				foodTop = _getC(food).top,
				foodLeft = _getC(food).left;

		if (snakeTop == foodTop && snakeLeft == foodLeft)
				snakeGrow();
	}

	function snakeGrow() {
		removeFood();
		createSnakeTail();
	}

	function createSnakeTail() {
		var tail = document.createElement('tail'),
				prevTail = snakeArray[snakeArray.length - 1];

		tail.className = 'snake';
		tail.currentDirection = prevTail.currentDirection;
		tail.currentVector = prevTail.currentVector;
		tail.futureDirection = null;
		tail.futureVector = null;
		tail.currentTopOffset = prevTail.currentTopOffset;
		tail.currentLeftOffset = prevTail.currentLeftOffset;

		tail.style.left = tail.currentLeftOffset + "px";
		tail.style.top = tail.currentTopOffset + "px";

		container.appendChild(tail);
		snakeArray.push(tail);
	}

	function shiftEverySnakeComponents(dir, vector) {
		snakeArray.forEach(function(el, index, arr){
			var result;
			el.currentLeftOffset = parseInt( _getC(el).left );
			el.currentTopOffset = parseInt( _getC(el).top );

			if (!index) {
				el.currentDirection = dir;
				el.currentVector = vector;
			} else {
				el.currentDirection = el.futureDirection || el.currentDirection;
				el.currentVector = el.futureVector || el.currentVector;
			}

			el.style[el.currentDirection] = parseInt( _getC(el)[el.currentDirection] ) + (cellSize * el.currentVector) + "px";

			if (index) {
				el.futureDirection = arr[index - 1].currentDirection;
				el.futureVector = arr[index - 1].currentVector;
			}
		});
	}

	function toStartPosition() {
		snake.style.top = "0";
		snake.style.left = "0";
	}
});