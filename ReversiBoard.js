

// Static weights used for the evaluation
var ReversiWeights = new Array(8);
ReversiWeights[0] = new Array( 99, -8,  8,  6,  6,  8, -8, 99);
ReversiWeights[1] = new Array( -8,-24, -4, -3, -3, -4,-24, -8);
ReversiWeights[2] = new Array(  8, -4,  7,  4,  4,  7, -4,  8);
ReversiWeights[3] = new Array(  6, -3,  4,  0,  0,  4, -3,  6);
ReversiWeights[4] = new Array(  6, -3,  4,  0,  0,  4, -3,  6);
ReversiWeights[5] = new Array(  8, -4,  7,  4,  4,  7, -4,  8);
ReversiWeights[6] = new Array( -8,-24, -4, -3, -3, -4,-24, -8);
ReversiWeights[7] = new Array( 99, -8,  8,  6,  6,  8, -8, 99);
//alert(ReversiWeights[0][0]);


// Object used to manage cell properties
function ReversiCell()
{
  // The current color of the cell, 1:white, -1: black, 0:empty
	this.color = 0;
	// True if the cell is playable by the current player
	this.playable = false;
	// Temporary number used for next move evaluation
	this.evaluation = 0;
}

// Represents the 8x8 board and provides methods for play operations
function ReversiBoard()
{
	// Constructor code
	this.init = function()
	{
		// Creates the bi-dimensional arrays and inits the table with 0
		var x, y;
		this.columns = new Array(8);
		for (x = 0; x < 8; x++)
		{
			this.columns[x] = new Object();			
			this.columns[x].rows = new Array(8);
			for (y = 0; y < 8; y++) 
			{
				this.columns[x].rows[y] = new ReversiCell();
				this.setColor(x, y, 0);
			}
		}
		
		// Sets the first pieces
		this.setColor(3, 3, 1);
		this.setColor(4, 4, 1);
		this.setColor(3, 4, -1);
		this.setColor(4, 3, -1);
		
		// Inits counters
		this.numWhites = 2;
		this.numBlacks = 2;
		
		// Blacks play first
		this.currentPlayer = -1;
		
		// Sets level to 1
		this.level = 1;
		
		// Inits evaluated move
		this.xEval = 0;
		this.yEval = 0;
		
		// Undo stack containing strings give by getStatus function
		this.undoStack = new Array();
	}
	
	// Pops a state of the object previsouly pushed using pushState (used for undo)
	this.popState = function()
	{
		// Checks if the stack is empty		if(this.undoStack.length==0)
			return;
			
		// Pops and parses string
		var elems = this.undoStack.pop().split(";");
	
		// Sets the status of the board
		var x, y, i = 0;
		for (x = 0; x < 8; x++) 
			for (y = 0; y < 8; y++)
				this.setColor(x, y, parseInt(elems[i++]));
				
		this.numBlacks = elems[i++];
		this.numWhites = elems[i++];
		this.currentPlayer = elems[i++];
	}
	
	// Stores the current state of the board in the undo stack
	this.pushState = function()
	{
		var x, y;
		var res = "";

		// Gets the status of the board
		for (x = 0; x < 8; x++) 
			for (y = 0; y < 8; y++) 
				res += this.getColor(x, y) + ";";
				
		res += this.numBlacks + ";" + this.numWhites + ";";
		
		res += this.currentPlayer + ";";

		this.undoStack.push(res);
	}
	// Sets the color at pos x,y
	this.setColor = function(x, y, col)
	{
		this.columns[x].rows[y].color = col;
	}
	
	// Gets the color at pos x,y
	this.getColor = function(x, y)
	{
		return this.columns[x].rows[y].color;
	}
	
	// Sets the playable flag at pos x,y
	this.setPlayable = function(x, y, p)
	{
		this.columns[x].rows[y].playable = p;
	}
	
	// Gets the playable flag at pos x,y
	this.getPlayable = function(x, y)
	{
		return this.columns[x].rows[y].playable;
	}

	// Sets the evaluation value at pos x,y
	this.setEvaluation = function(x, y, e)
	{
		this.columns[x].rows[y].evaluation = e;
	}
	
	// Gets the evaluation value at pos x,y
	this.getEvaluation = function(x, y)
	{
		return this.columns[x].rows[y].evaluation;
	}

	// Counts the number of pieces that can be reversed by a play of color col at px, py,
	// in direction dx, dy
	this.countReversable = function(px, py, dx, dy)
	{
		// the null vector to be skipped
		if (dx == 0 && dy == 0) 
			return 0;

		var opened = false; // true when checked direction is not closed at the end
		var closed = false; // true when one direction is counted and an adversary piece is at the end
		var count = 0; // number of pieces counted in one direction
		var tpx = px + dx; // temp. pos. x
		var tpy = py + dy; // temp. pos. y

		// Iterates in one direction and counts the pieces to reverse
		while (tpx >= 0 && tpx <= 7 && tpy >= 0 && tpy <= 7 && !opened && !closed) 
		{
			// Gets the color at current position
			var curcol = this.getColor(tpx, tpy);
			
			// Continue if adversary color at current position
			if (curcol == -this.currentPlayer) 
			{
				count++;
				tpx += dx;
				tpy += dy;
			}
			// Else, if own color, stops and prepares count if col found
			else if (curcol == this.currentPlayer) 
				closed = true;
			else 
				// Else, if empty, stop the count
				opened = true;
		}
		
		if(closed)
			return count;
		else
			return 0;
	//alert("count="+count);	
	}
		
	this.pass = function()
	{
		this.currentPlayer = -this.currentPlayer;
	}

	// Plays one step by currentPlayer at px,py
	this.play = function(px, py)
	{
		var x, y, numReversed = 0; // Number of reversed pieces in this step
		var dx, dy; // Vector in the direction of  
		
		// Checks it is an empty cell
		if(this.getColor(px,py) != 0)
			alert("CELL NOT EMPTY AT "+px+","+py+" currentPlayer="+this.currentPlayer);
	
		//alert("in play");	
		// Iterates over the 9 possible directions around the cell, vector (dx,dy)
		for(dx=-1;dx<=1;dx++)
			for(dy=-1;dy<=1;dy++)
			{
				var count = this.countReversable(px, py, dx, dy);
				
				// When checked, reverses pieces
				if ( count > 0) 
				{
					tpx = px; tpy = py;
					numReversed += count;
					for (i = 0; i < count; i++) 
					{
						tpx += dx; tpy += dy;
						this.setColor(tpx, tpy, this.currentPlayer);
					}
				}
			}
				
		// Sets central piece and updates counters
		if (numReversed > 0) 
		{
			this.setColor(px,py,this.currentPlayer);
			
			// Updates the counters
			if (this.currentPlayer == 1) 
			{
				this.numWhites += 1 + numReversed;
				this.numBlacks -= numReversed;
			}
			else 
			{
				this.numBlacks += 1 + numReversed;
				this.numWhites -= numReversed;
			}
		}
		else
			alert("MOVE DOES NOT REVERSE PIECES AT "+px+","+py+" currentPlayer="+this.currentPlayer);
		
		this.currentPlayer = -this.currentPlayer;
		
		// Returns the number of reversed pieces
		return numReversed;
	}
	
	this.findPlayableCells = function()
	{
		var x, y, count = 0;
		
		// Iterrates over all cells
		for (x = 0; x < 8; x++) 
			for (y = 0; y < 8; y++) 
			{
				var dx, dy, done = false; // Vector in the direction of check 
				// Checks it is an empty cell
				if (this.getColor(x, y) == 0) 
					// Iterates over the 9 possible directions around the cell, vector (dx,dy)
					for (dx = -1; dx <= 1 && !done; dx++) 
						for (dy = -1; dy <= 1 && !done; dy++)
							// Finds the first direction in which some pieces can be reversed, stops as soon as one is found
							if (this.countReversable(x, y, dx, dy) > 0) 
								done = true;
				
				// Updates the value in the table
				this.setPlayable(x, y, done);
				
				// Updates counter
				if(done)
					count++;
			}
			
		return count;
	}

	// Evaluates the best move for the current player	
	// To be called after computePlayableCells
	this.evaluatePlayableCells = function()
	{
		var x, y, dx, dy, n, tpx, tpy, m = -1e100;

		// Iterrates over all cells
		for (x = 0; x < 8; x++) 
			for (y = 0; y < 8; y++) 
				// Verifies this cell is playable 
				if (this.getPlayable(x, y)) 
				{
					// The variable used to sum the evaluation at this position
					var evaluation = 0.0;
					
					// Iterates over the 9 possible directions around the cell, vector (dx,dy)
					for (dx = -1; dx <= 1; dx++) 
						for (dy = -1; dy <= 1; dy++) 
							// Tests if some pieces can be reversed in the current direction
							if ((n = this.countReversable(x, y, dx, dy)) > 0)
							{
								// Evaluates this direction using weights
								tpx = x;
								tpy = y;
								for (i = 0; i < n; i++) 
								{
									tpx += dx;
									tpy += dy;
									evaluation += ReversiWeights[tpx][tpy];
								}
							}
					
					// Do not forget the cell itself
					evaluation += ReversiWeights[x][y];
					
					// Adds minor random behaviour
					evaluation += Math.random();
					
					// Stores the value
					this.setEvaluation(x, y, evaluation);
					
					// Remembers the max
					if (evaluation > m) 
					{
						//alert("Max evaluated: "+evaluation+" at "+x+","+y);
						m = evaluation;
						this.xEval = x;
						this.yEval = y;
					}
				}
				
		return m;
	}
	
	this.playEvaluated = function()
	{
		this.play(this.xEval, this.yEval);
	}

	// Calls constructor
	this.init();
}

