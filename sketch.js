/*FLOCKING QT STORIES
*/

let flock; //Container for the flock
var institutions = []; //Container for all institutions


//String array list of all the stories
//Stories are created and stored with boid
let strStories = ["Anonymous","Dylan (They, Them)","eddy (they, them)",
                    "Gertie (She, Her)","Gertie (She, Her)_2","Gertie (She, Her)_3",
                    "Jo","Jo_2","Jo_3","John (He, Him)",
                    "MC (She, Her)", "Pratim (He, Him)","Riley (She, Her)"];                                                                        //Stories are created and stored with boid
let objStories = []; //Holds refs to the story objects. Loaded on Preload
let activeStory; //The current selected/active story

//List of boid types
const boidType = {
  NORM: 'normative',
  NON: 'nonNormative'
}

//Colours used for boids and institutions (set in setup() below)
let normColour, nonColour;

//Starting values (set in setup() below)
let startNBoids, numNBoids, startQBoids, startNInst, startQInst, numBoidsMult;

let fft; //Container for Fast Fourier Tansform for audio analysis
let cnv; //Container for the canvas

//Define max/min canvas sizes
const minWidth = 320;
const maxWidth = 960;
const minHeight = 320;
const maxHeight = 540;

let followBoid;
//----------------------------------------------------------------------------
//Before showing page
function preload(){
  soundFormats('m4a'); //List of available file formats
  let tempStories = strStories;  //copy list of story names into a temp variable

  //Create randomized playlist
  while(tempStories.length > 0){ //While there are still stories in temp
    var story = tempStories.splice(floor(random(tempStories.length)), 1); //remove a random story name
    var newStory = new Story(story); //create the new story with the obtained string
    objStories.push(newStory); //and add it to the story list
  }
//End preload
}
//----------------------------------------------------------------------------
//before first draw
function setup() {
  let canvasWidth = constrain(windowWidth, minWidth, maxWidth);
  let canvasHeight = map(canvasWidth, minWidth, maxWidth, minHeight, maxHeight);
  cnv = createCanvas(canvasWidth, canvasHeight);
  //cnv = createCanvas(canvasSize.x, canvasSize.y);     //Create the canvas
  cnv.mouseClicked(canvasClicked);  //set callback function for when canvas is clicked
  //cnv.position(0,60);               //set canvas position
  //Define colours
  normColour = color(255);
  nonColour = color(255,0,255);

  frameRate(30);  //Set frame rate. Set to 30 to limit processing power needed

  //Sound analysis setup
  fft = new p5.FFT();

  //Setup the boid world
  loadCanvas();

  //Create the gui - function in ui.js
  createGUI();

//End setup
}
//----------------------------------------------------------------------------
//Every frame...
function draw() {
  background(0);                      //Set canvas background colour
  drawInstitutions(institutions);     //Draw the institutions
  flock.process();                    //Run the flock (which in turn runs the boids)
  displaySubtitles(activeStory);      //Update the subtitles
  sldNumNormsChanged();               //Update the number of normatives with respect to the slider
  if(frameCount % 300 == 0){selectFollowBoid();} //Select a boid to follow every n frames
  drawInvite();                       //Draw an invite near the followed boid
//End draw
}
//----------------------------------------------------------------------------
//Callback function for when the canvas is clicked
//Finds the nearest boid to the click point and activate its story
function canvasClicked(){
  //Stop the current story
  if(activeStory != null){
    if(activeStory.isPlaying()){
      activeStory.stop();
    }
  }

  //Find the nearest boid to pointer
  let boid = getNearestQBoid(createVector(mouseX, mouseY));

  //Set as active Story and play
  if(boid != null){
    activeStory = boid.story;
    activeStory.play();
  }
//End canvasClicked
}
//----------------------------------------------------------------------------
//Find the nearest non-normative boid to a given point
/*Parameters
    point: the center point to find the smallest distance from
*/
function getNearestQBoid(point){
  let nearestBoid; //holds the nearest boid while testing
  let minDist = 30; //keeps track of minimum distance of boid to pointer

  for(let boid of flock.boidList){
    //Is this boid a Non-Normative Boid
    if(boid.bType === boidType.NON){

      //calc distance to boid to pointer
      let d = dist(boid.position.x, boid.position.y,
                   point.x, point .y);
      //is the distance smaller than minDist?
      if(d < minDist){
        nearestBoid = boid; //set nearest boid and distance
        minDist = d; //set the minimum distance value
      }
    }
  }

  //Return the found boid. Returns null if no boid found.
  return nearestBoid;
//End getNearestQBoid
}
//----------------------------------------------------------------------------
function windowResized(){
  //Resize the canvas to fit the window (within min and max values)
  let canvasWidth = constrain(windowWidth, minWidth, maxWidth);
  let canvasHeight = map(canvasWidth, minWidth, maxWidth, minHeight, maxHeight);

  if(canvasWidth != cnv.width){ //If the width has changed
                                //Intended to prevent phone scrolling triggering a resize event
    resizeCanvas(canvasWidth, canvasHeight);

    //Reload boid world (canvas)
    loadCanvas();

    //Number of normative boids may have changed. Update slider value.
    sldNumNorms.value(1);
    //updateGUIPositions();

    selectFollowBoid();
  }
}
//----------------------------------------------------------------------------
function loadCanvas(){
  flock = new Flock();              //Create the flock
  institutions = [];

  //Set number of boids per story dependant on canvas size
  let maxMult = 4;  //Set number of boids per story at maximum canvas size
  let interval = (maxWidth-minWidth) / (maxMult); //determine interval sizes
  for(let i = 0; i < maxMult; i++){
    let bounds = (i*interval) + minWidth; //determine the boundary for this interval (starting with smallest)
    if(width > bounds){
      numBoidsMult = i+1; //Set the multiplier to a value of 1 to maxMult
                          //Starting with lowest value allows loop to find
                          //the largest multiplier for this interval/boundary
    }
  }

  //Start boid SETTINGS
  startNBoids = objStories.length * numBoidsMult;    //Number of normative boids set to number of non-normative boids
  startQBoids = objStories.length * numBoidsMult;    //Number of non-normative boids is proportional to the number of stories
  startNInst = 3 * numBoidsMult;                         //Number of normative institutions
  startQInst = 3 * numBoidsMult;                         //Number of non-normative institutions

  //Add Q boids
  //Find the closest integer multiple of the number of stories
    //-creates multiple boids for each story
    //Note: startQBoids but be >= number of stories
  let perStory = floor(startQBoids/objStories.length); //Determine # of boids per story
  for(let j = 0; j < objStories.length; j++){ //For each story..
    for(let i=0; i < perStory; i++){ //For each number of multiples of that story...
      let x = random(0,width);
      let y = random(0,height);
      flock.add(boidType.NON, objStories[j]); //Add a new non-normative boid to the flock
    }
  }

  //Add N Boids
  for(let i=0; i < startNBoids; i++){
    let x = random(0,width);
    let y = random(0,height);
    flock.add(boidType.NORM, null); //add new normative boid to the flock (story = null)
  }
  numNBoids = startNBoids; //At this point the number of normative boids equals the starting number

  //Add Q inst
  for(let i=0; i<startQInst; i++){
    let x = random(0,width);
    let y = random(0,height);
    institutions.push(new Institution(boidType.NON)); //Add new non-normative institution
  }

  //Add N inst
  for(let i=0; i<startNInst; i++){
    let x = random(width);
    let y = random(height);
    institutions.push(new Institution(boidType.NORM)); //Add new normative institution
  }

}
//----------------------------------------------------------------------------
//Invite user to select a boid
function drawInvite(){
  fill(255,175);
  let followOffset = 5;
  let position = followBoid.position;
  let size = createVector(105, 50);
  rectMode(CORNER);
  rect(followOffset + position.x, position.y + 5, size.x, size.y);
  textSize(12);
  textAlign(CENTER, CENTER);
  fill(200, 0, 200);
  stroke(150, 0, 150);
  text("TAP THIS BOID TO HERE ITS STORY", followOffset + position.x, position.y + 5, size.x, size.y);
  fill(100);
  stroke(200);
  strokeWeight(2);
  triangle(followOffset + position.x - 2, position.y -2 + 5, followOffset + position.x -2, position.y + 13 +5, followOffset + position.x + 13, position.y-2 + 5);

}
//----------------------------------------------------------------------------
//Select a Q boid to follow
function selectFollowBoid(){
  do{
      followBoid = random(flock.boidList);
    }while(followBoid.bType != boidType.NON);
}
