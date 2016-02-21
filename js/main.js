document.addEventListener('DOMContentLoaded', function() {
	var snake = document.querySelector("#snake"),
		container = document.querySelector("#gameContainer"),
		gameMusic = document.querySelector('#snakeMusic'),
		_getC = window.getComputedStyle,
		stopId,
		food = null,
		cellSize = 20,
		stepTime = 150,
		dieTime = 3000,
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

	document.addEventListener('keydown', gameArrowHandlers, false);

	function runSnake(key) {
		var dir = key.dir,
			wall = key.wall,
			vector = key.vector;

		if (stopId) {
			clearTimeout(stopId);
			stopId = null;
		}

		startMusicPlay();

		stopId = setInterval(function() {
			if (!food) createFood();

			if ( !snakeArray.length ) snakeArray.push(snake);

			treatSnakeMove(dir, vector, wall);
			snakeEat();
			
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
		clearTimeout(stopId);
		setGameEndHandler();
		animateSnakeDie();
		setTimeout(function(){
			removeFood();
			stopMusicPlay();
			toStartPosition();
			clearSnakeComponents();
			resetGameEndHandler();
			snake.classList.remove('snake-die');
			snakeArray = [];
		}, dieTime);
	}

	function clearSnakeComponents() {
		snakeArray.forEach(function(el, index){
			if (!index) return false;
			el.parentNode.removeChild(el);
		});
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

	function treatSnakeMove(dir, vector, wall) {
		if (parseInt( snake.style[dir] ) * vector >= wall) {
			gameEnd();
			return false;
		}

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

			shiftEverySnakeComponents(el, index, arr);

			if (index) {
				el.futureDirection = arr[index - 1].currentDirection;
				el.futureVector = arr[index - 1].currentVector;
			}
		});
	}

	function shiftEverySnakeComponents(el, index, arr) {
		var head = arr[0],
			  dir = el.currentDirection;
		el.style[dir] = parseInt( _getC(el)[dir] ) + (cellSize * el.currentVector) + "px";

		if (index !== arr.length - 1) return;

		killMySelf(head);
	}

	function killMySelf(head) {
		var kill = snakeArray.slice(1).some(function(item){
			return parseInt( _getC(head).top ) == parseInt( _getC(item).top ) &&
						 parseInt( _getC(head).left ) == parseInt( _getC(item).left );
			});

		if ( !kill ) return;

		gameEnd();
	}

	function animateSnakeDie() {
		snakeArray.forEach(function(el){
			el.classList.add('snake-die');
		});
	}

	function startMusicPlay() {
		if ( !gameMusic.paused ) return false;
		gameMusic.load();
		gameMusic.play();
	}

	function stopMusicPlay() {
		gameMusic.pause();
	}

	function setGameEndHandler() {
		document.addEventListener('keydown', preventArrowsKeyDownEvent, false);
		document.removeEventListener('keydown', gameArrowHandlers, false);
	}

	function resetGameEndHandler() {
		document.removeEventListener('keydown', preventArrowsKeyDownEvent, false);
		document.addEventListener('keydown', gameArrowHandlers, false);
	}

	function preventArrowsKeyDownEvent(event) {
			var code = event.keyCode;
			if (code >=37 && code <= 40) return false;
	}

	function gameArrowHandlers(event) {
		var code = event.keyCode;

		for (var key in keysContainer) {
			if (code == key) {
				runSnake(keysContainer[key]);
			}
		}
	}

	function toStartPosition() {
		snake.style.top = "0";
		snake.style.left = "0";
	}
});