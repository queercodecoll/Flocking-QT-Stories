//VAriable Setup
var title;
var txtSubtitles;
var lblNBoid, lblQBoid, lblNInst, lblQInst, lblHarm, lblSupport;
var imgNBoid, imgQBoid, imgNInst, imgQInst, imgHarm, imgSupport;
var cbxInteractions;
var sldNumNorms, lblNumNorms, lblRatio;
var btnNext, btnPrev;
var txtInstructions;
//const guiElements = [];
//----------------------------------------------------------------------------
function createGUI(){
  //title "QT Flocking Stories"

  //createElement('h1')
  title = select('#title');
  //title.position(20,0);
  //title.size(300, 60);
  //guiElements.push(title);

  //Set up canvas Div
  divCanvas = select('#canvasDiv');
  cnv.parent(divCanvas);
  //subtitles
  /* Moved to canvas
  txtSubtitles = createP("");
  txtSubtitles.position(20, cnv.y + cnv.height + 10);
  txtSubtitles.size(300, 100);
  guiElements.push(txtSubtitles);
  */

  //Get UI Column 1 div
  divControls = select('#UI_column1');

  //Checkbox; interactions
  //createCheckbox
  cbxInteractions = createCheckbox('Show Interactions',true);
  cbxInteractions.changed(cbxIntClicked);
  cbxInteractions.parent(divControls);
  cbxInteractions.size(200, 40);
  //cbxInteractions.position(15, txtSubtitles.y + txtSubtitles.height + 10);
  //cbxInteractions.size(150,25);
  //guiElements.push(txtSubtitles);


  divLbl = createDiv();
  divLbl.parent(divControls);
  lblRatio = createP("Boid Ratio");
  lblRatio.parent(divLbl);
  lblRatio.style('font', 'bold');

  lblNumNorms = createP("Normative to Non-normative = " + startNBoids + " : " + startQBoids*objStories.length)
  lblNumNorms.parent(divLbl);
  //lblNumNorms.size(300, 20);
  //guiElements.push(lblNumNorms);

  divLbl.size(278);
  divLbl.style('border-style', 'solid');

  //Slider; number of normatives
  //Slider parameters; min value = 0, max value = 2, starting value = 1, step = 0 for contiunous
  divSlider = createDiv();
  divSlider.parent(divLbl);
  sldNumNorms = createSlider(0, 2, 1, 0); //Works as multiplier to generate number of norm boids
  sldNumNorms.parent(divSlider);
  sldNumNorms.style('width', '275px');    //Set width of slider;
  divSlider.style('background-color', '#B0B');
  divSlider.size(278,25);
  //divSlider.style('border-style', 'solid');
  //guiElements.push(sldNumNorms);

  //Button div
  divButtons = createDiv();
  divButtons.parent(divControls);

  //Buttons; next story, prev story
  //createButton
  btnPrev = createButton("Prev Story");
  btnPrev.mousePressed(btnPrevClicked);
  btnPrev.parent(divButtons);
  btnPrev.size(100, 25);
  btnPrev.style('margin', '5%');
  //btnPrev.position(15, lblNumNorms.y + lblNumNorms.height + 30);
  //btnPrev.size(80,25);
  //guiElements.push(btnPrev);

  btnNext = createButton("Next Story");
  btnNext.mousePressed(btnNextClicked);
  btnNext.parent(divButtons);
  btnNext.size(100,25);
  btnNext.style('margin', '5%');
  //btnNext.position(btnPrev.x + btnPrev.width + 10, lblNumNorms.y + lblNumNorms.height + 30);
  //btnNext.size(80,25);
  //guiElements.push(btnNext);

  //Legend; norm boid, non boid, norm inst, non inst, harm line, support line
  //createDiv and create Img
  divLegend = select('#UI_column2');
  imgLegend = createImg('images/boidLegend.png', 'legend');
  imgLegend.parent(divLegend);
  imgLegend.size(300,300);

  //Instructions
  //createP for a paragraph
  txtInstructions = select('#Instructions');
  //txtInstructions.position(15, btnPrev.y + btnPrev.height + 10);
  //txtInstructions.size(320, 200);
  //guiElements.push(txtInstructions);
}
//----------------------------------------------------------------------------
//Update subtitles
function updateSubtitles(text){
  txtSubtitles.html(text);
}
//----------------------------------------------------------------------------
//Checkbox Callback function; toggle whether interactions are shown or not
function cbxIntClicked(){
  showInteractions = !showInteractions;
  print(showInteractions);
}
//----------------------------------------------------------------------------
//SLider callback function; update number of normative boids
//CHANGE: called during Draw so update happens while user drags
function sldNumNormsChanged(){
  let desiredNum = round(sldNumNorms.value()*startNBoids);
  let change = abs(numNBoids - desiredNum);

  if(numNBoids < desiredNum){
    for(let i=0; i < change; i++){
      flock.add(boidType.NORM, null);
      numNBoids++;
    }
  }
  else if(numNBoids > desiredNum){
    for(let i=0; i < change; i++){
      flock.remove();
      numNBoids--;
    }
  }
  //else don't change the number of normative boids

  //Update label
  lblNumNorms.html("Normative to Non-normative = " + numNBoids + " : " + startQBoids)
}
//----------------------------------------------------------------------------
//Next Story button Callback; stop current story, find and start next story
function btnNextClicked(){

  //CODE FOR SEQUENTIAL PLAYLIST
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

}
//----------------------------------------------------------------------------
//Prev Story button Callback; stop current story, find and start prev story
function btnPrevClicked(){

  // CODE FOR SEQUENTIAL PLAYLIST
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

}
//----------------------------------------------------------------------------
//Update DOM Elements' positions
function updateGUIPositions(){
  title.position(20,0);
  cnv.position(0, 60);
  txtSubtitles.position(20, cnv.y + cnv.height + 10);
  cbxInteractions.position(15, txtSubtitles.y + txtSubtitles.height + 10);
  sldNumNorms.position(15, cbxInteractions.y + cbxInteractions.height + 10);
  lblNumNorms.position(15, sldNumNorms.y + sldNumNorms.height - 10);
  btnPrev.position(15, lblNumNorms.y + lblNumNorms.height + 30);
  btnNext.position(btnPrev.x + btnPrev.width + 10, lblNumNorms.y + lblNumNorms.height + 30);
  txtInstructions.position(15, btnPrev.y + btnPrev.height + 10);
}
//----------------------------------------------------------------------------
