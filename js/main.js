'use strict';

function runSimpleSequence(...rest) {
	rest.reduce((p, n) => n(), () => {});
}

document.addEventListener('DOMContentLoaded', function() {
	let snake = document.querySelector("#snake"),
		container = document.querySelector("#gameContainer"),
		gameMusic = document.querySelector('#snakeMusic'),
		modal = document.querySelector('.modal'),
		form = document.forms.auth,
		_getC = window.getComputedStyle,
		stopId = null,
		food = null,
		cellSize = 20,  //px
		stepTime = 50,  //px
		dieTime = 3000, //ms
		snakeArray = [],
		userName = '',
		innerContainerWidth = container.clientWidth,
		innerContainerHeight = container.clientHeight,
		cellsInRow = innerContainerWidth / cellSize,
		cellsInColumn = innerContainerHeight / cellSize;

	const keyContainersMap = new Map([
		[40, {
			"dir" : "top",
			"wall": innerContainerHeight - cellSize,
			"vector": 1
		}],
		[39, {
			"dir" : "left",
			"wall" : innerContainerWidth - cellSize,
			"vector": 1
		}],
		[37, {
			"dir" : "left",
			"wall": 0,
			"vector": -1
		}],
		[38, {
			"dir" : "top",
			"wall": 0,
			"vector": -1
		}]
	]);

	appInit();

	function appInit() {
		auth();
	}

	function auth() {
		userName = getUserDataFromLocalStorage();

		if (userName) {
			showMainScreen();
		} else {
			form.onsubmit = onFormSubmit;
		}
	}

	function showMainScreen() {
		modal.classList.add('hide');
		showUserData();
		setMoveListener();
	}

	function showUserData() {
		let item = document.createElement('li');
		item.className = 'dashboard-list__item';
		item.textContent = userName;
		let list = document.querySelector('.dashboard-list');
		list.appendChild(item);
	}

	function onFormSubmit(e) {
		e.preventDefault();
		let {login} = form.elements;
		userName = login.value;
		if (!userName.trim()) {
			login.value = '';
			login.focus();
			return;
		}
		saveUserDataToLocalStorage(userName);
		showMainScreen();
	}

	function saveUserDataToLocalStorage(login) {
		localStorage.setItem('login', login);
	}

	function getUserDataFromLocalStorage() {
		let login = '';
		try {
			login = localStorage.getItem('login');
		} catch(e) {
			console.log(e.message);
		} finally {
			return login;
		}
	}

	function setMoveListener() {
		document.addEventListener('keydown', gameArrowHandlers, false);
	}

	function runSnake({dir, wall, vector}) {
		if (stopId) {
			clearTimeout(stopId);
			stopId = null;
		}

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

	function resetTimer() {
		clearTimeout(stopId);
	}

	function gameEnd() {
		runSimpleSequence(resetTimer, setGameEndHandler, animateSnakeDie);
		setTimeout(() => {
			runSimpleSequence(removeFood, stopMusicPlay, toStartPosition, clearSnakeComponents,
			resetGameEndHandler, restoreDefaultSnakeColor);
			snakeArray = [];
		}, dieTime);
	}

	function clearSnakeComponents() {
		snakeArray.forEach((el, index) => {
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
		var tail = document.createElement('div'),
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

		snakeArray.forEach((el, index, arr) => {
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
		var kill = snakeArray.slice(1).some(item => {
			return parseInt( _getC(head).top ) == parseInt( _getC(item).top ) &&
						 parseInt( _getC(head).left ) == parseInt( _getC(item).left );
			});

		if ( !kill ) return;

		gameEnd();
	}

	function animateSnakeDie() {
		snakeArray.forEach(el => el.classList.add('snake-die'));
	}

	function restoreDefaultSnakeColor() {
		snake.classList.remove('snake-die');
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
		runSnake(keyContainersMap.get(code));
	}

	function toStartPosition() {
		snake.style.top = "0";
		snake.style.left = "0";
	}
});