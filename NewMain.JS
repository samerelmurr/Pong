/**
 * ****************************************************************************
 * Name: Samer El-Murr*********************************************************
 * Date: 29/10/2020************************************************************
 * Course: Computer Graphics***************************************************
 * Intructor: Dr Danni Nini****************************************************
 * Project: Pong***************************************************************
 * ****************************************************************************
 * This project is to make pong copy of the original Atari Game****************
 * ****************************************************************************
 */


const keys = []; // the keys for event listener 

//event listeners for the keystrokes 
addEventListener("keydown", function (e) {
	keys[e.keyCode] = true;
});

addEventListener("keyup", function (e) {
	keys[e.keyCode] = false;
});



/**
 * *****************************************************************
 * Game class that contains and calls all the objects to update and 
 * draw. It has a no-arg constructor that constructs the canvas and 
 * initiates the onbject array, the update method calls all objects
 * update methods to update the game, and Draw which calls all obj-
 * ects draw methods.
 * ****************************************************************
 */
class Game{

    //default constructor 
    constructor(){
        this.width = 600; //width of the canvas
        this.height = 400; // height of the canvas
        this.canvas = document.getElementById("pong"); //calling the canvas
        this.ctx = this.canvas.getContext("2d"); //calling the context
        this.objects = []; //object array
        this.canvas.width = this.width; //assigning canvas width 
        this.canvas.height = this.height; //assigning canvas height 
    }

    //Update methods that takes parameter delta and calls all object's updates
    update(delta){

        //for loop to loop through the array of objects 
        for(let i = 0; i < this.objects.length; ++i){
                //if it is object Player
                if (this.objects[i] instanceof Player){

                    //call Player update 
                    this.objects[i].update(keys, delta);

                } else if (this.objects[i] instanceof Ball){

                    //make sure ai and playyer is in correct order in array
                    let player = this.objects[i - 1];
                    let ai = this.objects[i + 1];
                    //call Ball update 
                    this.objects[i].update(this.canvas, player, ai, delta);

                } else if (this.objects[i] instanceof Ai){

                    //make sure that ball is before ai
                    let ball = this.objects[i -1];
                    //call Ai update 
                    this.objects[i].update(ball);
                }
            } 
        
    }

    //drawing all objects on the screen 
    draw(player, ai){

        // set a color
        this.ctx.fillStyle = "#000"; 
        // draws the black board
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        //loop to go through array to draw objects on screen
        for(let i = 0; i < this.objects.length; ++i){
            this.objects[i].draw(this.ctx);
        }

        // draw the user score to the left
        this.drawScore(player.score, this.canvas.width/4, this.canvas.height/5);
        
        // draw the COM score to the right
        this.drawScore(ai.score, 3 * this.canvas.width/4, this.canvas.height/5);

    }

    //draws the score
    drawScore(text,x,y){
        this.ctx.fillStyle = "#FFF";
        this.ctx.font = "75px fantasy";
        this.ctx.fillText(text, x, y);
    }

    //Adding objects to object array
    addObject(obj){
        this.objects.push(obj);
    }
}


/**
 * Object class which is a parent class for all objects in the game
 */
class Object{
    constructor(){

    }

    update(){

    }

    draw(){

    }
}

/**
 * This class is for the Net
 */
class Net extends Object{

    constructor(canvas){
        super();
        this.netWidth = 4; //width of the individual squares
        this.netHeight = 10; //height of individual squares
        this.x = (canvas.width - 2)/2; //centering the net
        this.y = 0; //making it on the y-axis as a strait line
        this.color = "#FFF"; //color white
    }

    update(){

    }

    /**
     * Draw rect for net
     */
    drawRectNet(x, y, w, h, ctx){
        ctx.fillStyle = this.color;
        ctx.fillRect(x, y, w, h);
    }

    draw(ctx){
        
        for(let i = 0; i <= 600; i+=15) //loop will draw 15 dashes
            //drawing mini rectangles to 
            this.drawRectNet(this.x, this.y + i, this.netWidth, this.netHeight, ctx);
    }

}

/**
 * Class for creating the User paddle
 */
class Player extends Object{

    //Constructor for the player object
    constructor(canvas){
        super();
        this.width = 10; //width of paddle
        this.height = 80; //height of paddle
        this.x = 10; //position on x axis
        this.y = canvas.height / 2 - this.height / 2; //position on y axis to center it 
        this.color = '#FFF'; //color white
        this.score = 0; //default score
        this.speed = 200; //default speed
    }

    //movment for object
    update(keys, delta){
        if(keys[87]){ //up W
            this.y -= this.speed * delta;
        }

        if(keys[83]){ //down S
            this.y += this.speed * delta;
        }

    }

    //drawing the square
    draw(ctx){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

}

/**
 * Class for creating the ball
 */
class Ball extends Object{

    //Constructor for the ball
    constructor(canvas){
        super();
        
        //default position of ball
        this.x = canvas.width / 2; 
        this.y = canvas.height / 2;

        this.radius = 7; //radius of ball

        //the speed of the ball on the x and y axis
        this.velocityX = 150;
        this.velocityY = 150;

        this.color = '#fff'; // color is white

        //Got this audio from:
        //https://freesound.org/search/?q=ping+pong&f=&s=duration+asc&advanced=0&g=1
        this.hit= new Audio("sounds/hit.mp3");
    }
    
    //update of movment 
    update(canvas, player, ai, delta){
        // move the ball
        this.x += this.velocityX * delta;
        this.y += this.velocityY * delta;

        // check if ball hits top or bottom wall
        if (this.y + this.radius >= canvas.height || this.y - this.radius <= 0) {
            this.velocityY = -this.velocityY;
        }

        // if this hit on right wall
        if (this.x + this.radius >= canvas.width) {

            // then ai scored 1 point
            player.score += 1;
            this.reset(canvas);
        }

        // if this hit on left wall
        if (this.x - this.radius <= 0) {

            // then player scored 1 point
            ai.score += 1;
            this.reset(canvas);
        }

        let user = (ball.x < canvas.width / 2) ? player : ai; // simple if statment for finding the size of the ball

        if(this.collisionDetectUser(user)){

            //playes the sound of hitting the ball
            this.hit.play(); 

            //everytime the paddle touches the ball just invert the velocityX
            this.velocityX = -this.velocityX;
            this.velocityX *= 1.1; //also increase speed

        } 

    }

    //check for collision of the paddles
    collisionDetectUser(user) {
        // returns true or false

        //assigning user top right bottom left
        user.top = user.y;
        user.right = user.x + user.width;
        user.bottom = user.y + user.height;
        user.left = user.x;
      
        //assigning ball top right bottom left
        this.top = this.y - this.radius;
        this.right = this.x + this.radius;
        this.bottom = this.y + this.radius;
        this.left = this.x - this.radius;
      
        //check for collision
        return this.left < user.right && this.top < user.bottom 
        && this.right > user.left && this.bottom > user.top;
      }

    //reset function to reset the ball everytime it scores
    reset(canvas) {
        // reset ball's value to older values
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.velocityX = 150;
      
        // changes the direction of ball
        this.velocityX = -this.velocityX;
        this.velocityY = -this.velocityY;
      }

    //draws the ball
    draw(ctx){
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true); // π * 2 Radians = 360 degrees
        ctx.closePath();
        ctx.fill();
    }
}

/**
 * Class for creating the Ai paddle
 */
class Ai extends Object{

    //Constructor for the ai
    constructor(canvas){
        super();
        this.width = 10; //width of paddle
        this.height = 80; //height of paddle
        this.x = canvas.width - (this.width + 10); //position on x axis
        this.y = canvas.height / 2 - this.height / 2; //position on y axis to center it 
        this.color = '#FFF'; //color white
        this.score = 0; //default score
        this.speed = 200; //default speed
    }

    //update movment of the ball
    update(ball){
        this.y = ball.y - 40; // follows the ball
    }

    //draws the paddle
    draw(ctx){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

//calling all game objects
let game = new Game();
let net = new Net(game.canvas);
let player = new Player(game.canvas);
let ball = new Ball(game.canvas);
let ai = new Ai(game.canvas);

//adding all game objects
game.addObject(net);
game.addObject(player);
game.addObject(ball);
game.addObject(ai);



//the game loop
let animate = function (){

    //setting up the time for the engine 
    let now = Date.now();
    let delta = now - then;

    game.update(delta/1000);
    game.draw(player, ai);

    then = now;

    requestAnimationFrame(animate);
        
}

//making sure everything is compatable 
var w = window; 
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame 
|| w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

let then = Date.now();

animate(); //calling animate function