/* List of functions that govern DOM Elements used to create the user interface.
*/

//Variable Declaration
var title;
var txtSubtitles;
var lblNBoid, lblQBoid, lblNInst, lblQInst, lblHarm, lblSupport;
var imgNBoid, imgQBoid, imgNInst, imgQInst, imgHarm, imgSupport;
var cbxInteractions;
var sldNumNorms, lblNumNorms, lblRatio;
var btnNext, btnPrev;
var txtInstructions;

//----------------------------------------------------------------------------
function createGUI(){

  //TITLE
  title = select('#title');

  //CANVAS
  //Get the division for the canvas and set canvas as a child of it
  divCanvas = select('#canvasDiv');
  cnv.parent(divCanvas);

  //CONTROLS
  //Get division that contains the buttons and sliders
  divControls = select('#UI_column1');

  //CHECKBOX
  //Create a checkbox for toggling interactions being drawn
  //Add to Controls division
  cbxInteractions = createCheckbox('Show/Hide Interactions',true);
  cbxInteractions.changed(cbxIntClicked);
  cbxInteractions.parent(divControls);
  cbxInteractions.size(200, 40);

  //SLIDER
  //Create container for all elements; slider heading, data/value, slider element
  //Set as child of Controls division
  divLbl = createDiv();
  divLbl.parent(divControls);
  divLbl.size(285);
  divLbl.style('border-style', 'solid');
  //Create slider heading
  lblRatio = createP("Boid Ratio Slider");
  lblRatio.parent(divLbl);
  lblRatio.style('font', 'bold');
  lblRatio.style('text-align', 'center');
  //Create slider value explanation
  lblNumNorms = createP("Normative to Non-normative = " + startNBoids + " : " + startQBoids*objStories.length)
  lblNumNorms.parent(divLbl);
  //Create slider element
  //Division containing slider used to set background colour
  divSlider = createDiv();
  divSlider.parent(divLbl);
  divSlider.style('background-color', '#000');
  divSlider.size(285,25);
  //Slider parameters; min value = 0, max value = 2, starting value = 1, step = 0 for contiunous
  sldNumNorms = createSlider(0, 2, 1, 0); //Works as multiplier to generate number of norm boids
  sldNumNorms.parent(divSlider);
  sldNumNorms.style('width', '280px');    //Set width of slider;

  //BUTTONS
  //Create division to contain button elements
  //Set as child of Controls division
  divButtons = createDiv();
  divButtons.parent(divControls);
  divButtons.style('margin-top', '5%');
  //Create 'Prev' button
  btnPrev = createButton("Prev Story");
  btnPrev.mousePressed(btnPrevClicked);
  btnPrev.parent(divButtons);
  btnPrev.size(100, 35);
  btnPrev.style('margin', '7%');
  //Create 'Next' button
  btnNext = createButton("Next Story");
  btnNext.mousePressed(btnNextClicked);
  btnNext.parent(divButtons);
  btnNext.size(100,35);
  btnNext.style('margin', '7%');

  //LEGEND
  //Create division for the legend and load the legend image into it
  divLegend = select('#UI_column2');
  imgLegend = createImg('images/boidLegend.png', 'legend');
  imgLegend.parent(divLegend);
  imgLegend.size(300,300);

  //INSTRUCTIONS
  //Get paragraph element for instructions
  txtInstructions = select('#Instructions');

//End createGUI
}
//----------------------------------------------------------------------------
//Checkbox Callback function; toggle whether interactions are shown or not
function cbxIntClicked(){
  showInteractions = !showInteractions; //Flip global boolean for interactions
//End cbxIntClicked
}
//----------------------------------------------------------------------------
//Called during Draw() to update number of normative boids
//The slider's value is used as a multiplier (0 to 2 continuously)
function sldNumNormsChanged(){
  //Determine the number of normative boids desired
  let desiredNum = round(sldNumNorms.value()*startNBoids);
  //Determine the difference between the desired and current number
  let change = abs(numNBoids - desiredNum);

  //If there's less boids than desired, add more normative boids
  if(numNBoids < desiredNum){
    for(let i=0; i < change; i++){
      flock.add(boidType.NORM, null);
      numNBoids++;
    }
  }
  //If there's more normative boids than desired, remove them
  else if(numNBoids > desiredNum){
    for(let i=0; i < change; i++){
      flock.remove();
      numNBoids--;
    }
  }
  //Otherwise, don't change the number of normative boids

  //Update label
  lblNumNorms.html("Normative to Non-normative = " + numNBoids + " : " + startQBoids);

//End sldNumNormsChanged
}
//----------------------------------------------------------------------------
//Next Story button Callback; stop current story, find and start next story
function btnNextClicked(){
  //If activeStory is not set (null) select first story in list
  if(activeStory == null){
    activeStory = objStories[0];
    activeStory.play();
    return; //leave function and don't run rest of following code
  }

  //Stop current Story
  activeStory.stop();

  //If this is the last story in the list then set the first story as active
  if(activeStory == objStories[objStories.length-1]){
    activeStory = objStories[0];
    activeStory.play();
    return;
  }

  //Find current story in story list (ignoring the last story in the list)
  for(let i=0; i < objStories.length-1; i++){
    if(activeStory === objStories[i]){
      //Set activeStory as next Story
      activeStory = objStories[i+1];
      //Play the "next" story
      activeStory.play();
      return; //Leave this function
    }
  }
//End btnNextClicked
}
//----------------------------------------------------------------------------
//Prev Story button Callback; stop current story, find and start prev story
function btnPrevClicked(){
  //If activeStory is not set (null) select last story in list
  if(activeStory == null){
    activeStory = objStories[objStories.length-1]; //-1 because counting starts at 0
    activeStory.play();
    return; //leave function and don't run rest of following code
  }

  //Stop current Story
  activeStory.stop();

  //If this is the first story in the list then set the last story as active
  if(activeStory === objStories[0]){
    activeStory = objStories[objStories.length-1];
    activeStory.play();
    return;
  }

  //Find current story in story list (ignoring the first story in the list)
  for(let i=1; i < objStories.length; i++){
    if(activeStory === objStories[i]){
      //Set activeStory as next Story
      activeStory = objStories[i-1];
      //Play the "next" story
      activeStory.play();
      return; //Leave this function
    }
  }
//End btnPrevClicked
}
//----------------------------------------------------------------------------
