
var i, j, html, x, y;

var blackpic = "<img src='black.png'/>";
var whitepic = "<img src='white.png'/>";


var mainBoard = null;
var userCanPlay = false;
var gameRunning = false;
var passedOnce = false;

var currentHeight = -1;
var currentWidth = -1;

var whitePlayer = "";
var blackPlayer = "";

// Displays the board in the "board" table in HTML
function displayBoard()
{
	clearPlayableCells();

	//alert("in display");
	for (x = 0; x < 8; x++) 
		for (y = 0; y < 8; y++) 
		{
			var el = document.getElementById(x + "" + y);
			switch (mainBoard.getColor(x, y))
			{
				case 1:
					el.innerHTML = whitepic;
					break;
				case -1:
					el.innerHTML = blackpic;
					break;
				default:
					el.innerHTML = "";
					break;
			}
		}

	document.getElementById("numWhites").innerHTML = mainBoard.numWhites;
	document.getElementById("numBlacks").innerHTML = mainBoard.numBlacks;
}


function markPlayableCells()
{
	var n = mainBoard.findPlayableCells();

	if(mainBoard.currentPlayer == 1)
		c = "playable-white";
	else
		c = "playable-black";
	
	for (x = 0; x < 8; x++)
		for (y = 0; y < 8; y++)
			if(mainBoard.getPlayable(x,y))
				document.getElementById(x+""+y).className = c;
				
	return n;
}

function clearPlayableCells()
{
	for (x = 0; x < 8; x++) 
		for (y = 0; y < 8; y++) 
			document.getElementById(x+""+y).className = "";
}

function initBoard()
{
	userCanPlay = false;
	passedOnce = false;

	clearPlayableCells();

	mainBoard = new ReversiBoard();

	displayBoard();
}

// State machine for play logics
// Function to be called with x=-1 after each game turn, in order to check all
//   cases systematically (pass, pass&pass, zero pieces for a player, finished)
function playStep(x, y)
{
	// Makes sure that no click on board can disturb current function
	userCanPlay = false;

	// Abortion mechanism in case of "computer vs computer" game
	if(!gameRunning)
		return;

	// Depending on case, used to re-schedule one step, or not, at end of function	
	var reschedule = true;
	
	// Info message to be displayed after this step
	var msg = "";
	
	// Current player as string
	var player = "";
	if ((mainBoard.currentPlayer == 1 && whitePlayer == "C") ||
		  (mainBoard.currentPlayer == -1 && blackPlayer == "C"))
		player = "Computer";
	else
		player = "Human";

	// Evaluates current number of playable cells
	var n = mainBoard.findPlayableCells();

	// Checks all cases
	// ----------------
	if ((n == 0 && passedOnce) || // pass & pass
	(mainBoard.numBlacks + mainBoard.numWhites == 64) || // board full
	(mainBoard.numBlacks == 0) || // no more black pieces
	(mainBoard.numWhites == 0)) // no more white pieces	 
	{
		// Case 1: Finished
		// ----------------
		msg = "Finished - ";
		if (mainBoard.numBlacks > mainBoard.numWhites) 
			msg += "Blacks won";
		else if (mainBoard.numBlacks < mainBoard.numWhites) 
			msg += "Whites won";
		else 
			msg += "Equality";
		
		reschedule = false;
		gameRunning = false;
	}
	else if (n == 0 && !passedOnce) 
	{
		// Case 2: Pass
		// ------------
		mainBoard.pass();
		passedOnce = true;
		msg = player + " passes";
	}
	else if ((n == 1 && player == "Human") || // human has only one cell to play 
	(player == "Computer")) // computer plays
	{
		// Case 3: Automatic play
		// ----------------------
		mainBoard.evaluatePlayableCells();
		mainBoard.playEvaluated();
		
		passedOnce = false;
		msg = player + " plays";
	}
	else if (x >= 0) 
	{
		// Case 4: Human plays
		// -------------------
		
		passedOnce = false;
		msg = "Human plays";
		mainBoard.pushState();
		mainBoard.play(x, y);
	}
	else if (x == -2) 
	{
		// Case 5: Undo
		// ------------	
		passedOnce = false;
		msg = "Undo";
		mainBoard.popState();
	}
	else if (x == -1)
	{
		// Case 6: Wait for human click
		// ----------------------------
		
		passedOnce = false;
		reschedule = false;
		msg = "Human to play";
		userCanPlay = true;
	}

	// Updates display
	displayBoard();
	markPlayableCells();
	displayInfoMessage(msg);

	// Re-schedules a play step to cover all cases
	if(reschedule)
		setTimeout("playStep(-1,-1)", 300);
}

function displayInfoMessage(s)
{
	document.getElementById("info-message").innerHTML = s;
}

function changeView(showID, hideID)
{
	document.getElementById(showID).style.display = "block";
	document.getElementById(hideID).style.display = "none";
}

function showPlayScreen()
{
	changeView("game-status", "game-options");

	whitePlayer = document.getElementById("white-player").value;
	blackPlayer = document.getElementById("black-player").value;
	mainBoard.level = document.getElementById("level-selection").value;

	gameRunning = true;
	playStep(-1,-1);
}

function showSelectionScreen()
{
	gameRunning = false;
	displayInfoMessage("Configure options and press Start");
	
	initBoard();	

	changeView("game-options", "game-status");
}


function boardClick(x, y)
{
	//alert("click at "+x+","+y);

	// Checks if click is allowed	in current GUI dynamics
	if (mainBoard == null || !userCanPlay || !gameRunning) 
		return;
	
	// Checks if clicked cell is playable
	if (!mainBoard.getPlayable(x, y))
		return;
	
	// Calls common play logics function
	playStep(x, y);
}

function restartClick()
{
	// In case "computer vs computer" game, puts a signal to stop game
	gameRunning = false;
	
	showSelectionScreen();	
}

function undoClick()
{
	// Only if user has control
	if(!userCanPlay)
		return;
	
	// Prepare call
	gameRunning = true;
	passedOnce = false;
	playStep(-2, -2);
}

function onLoadHandler()
{
	onResizeHandler();

	showSelectionScreen();
}

function startClick()
{
	//alert("in startclick");
	showPlayScreen();
}

function exitClick()
{
	userCanPlay = false;
	window.close();
	
	// In case it did not work, contine silently
	userCanPlay = true;
}

function aboutClick()
{
	changeView("info-page", "container");
}

function infoPageClick()
{
	changeView("container", "info-page");
}

function onResizeHandler()
{
	var h, w;
	
	// Determine width and height depending on browser
	if (window.innerWidth) 
	{
		w = window.innerWidth;
		h = window.innerHeight;
	}
	else if (document.documentElement && document.documentElement.clientWidth) 
	{
		w = document.documentElement.clientWidth;
		h = document.documentElement.clientHeight;
	}
	else if (document.body.clientWidth) 
	{
		w = document.body.clientWidth;
		h = document.body.clientHeight;
	}
	
	// Set CSS layout depending on resolution
	if (w != currentWidth || h != currentHeight) 
	{
		// Update current values
		currentWidth = w;
		currentHeight = h;
		
		// Determine the screen orientation and set style class to body
		var minDim;
		if (h >= w) 
		{
			document.body.className = "portrait";
			minDim = w;
		}
		else 
		{
			document.body.className = "landscape";
			minDim = h;
		}

		document.getElementById("board").className = "dim" + minDim;
		
		//alert(w+","+h);
	}

}


