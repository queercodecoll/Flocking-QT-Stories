//Story class
/*Properties
  -name
  -audio file ( = name.mp3)
  -subtitles file ( = name.txt)
  -speaker (obtained from subtitle file; 1st line)
  -pronouns (obtained from subtitle file; 2nd line)
*/

/*Note:
  Right now, building loading of audio into contructor. Story needs
  to be declared in preload.
  If that doesn't work, use another array (audioList) to preload then
  add parameter in contructor for audioFile.
*/

class Story {
  /*Parameters
      name: a string identifying the story. Used to find the audio and text files.
  */
  constructor(name) {
    this.name = name; //set the name of this story
    this.audio = loadSound('stories/audio/'+name); //load the audio
    this.text = loadStrings('stories/subs/'+name+".txt"); //load the text
    this.speaker = this.text[0];  //1st line of text file is the speaker
    this.pronouns = this.text[1];  //2nd line of text file is their pronouns
    this.subtitlePointer = 1; //3rd line is first subtitle (format = ####(seconds):subtitle)
    this.currSubtitle; //The current loaded subtitle
  }
  //----------------------------------------------------------------------------
  //Play the story
  play(){
    if(this.audio != null){ //If the audio exists...
      this.audio.play(); //play it
    }
  //End play
  }
  //----------------------------------------------------------------------------
  //Stop the story
  stop(){
    if(this.audio.isPlaying()){ //if the audio is playing (should already exist or would have been playing)
      this.audio.stop(); //stop the audio
      this.subtitlePointer = 1; //reset pointer position to first subtitle (3rd line)
    }
  //End stop
  }
  //----------------------------------------------------------------------------
  //Find the current subtitle line in the txt file and return it
  //For first run, subtitlePointer + 1 should = 3, so that it will perceive
  //the first subtitle as 'the next' subtitle.
  getCurrentSubtitle(){
    if((this.subtitlePointer + 1) <= this.text.length-1){ //If there is a next line...
      let audioTime = this.audio.currentTime(); //get the current audio's track time
      let nextLine = this.text[this.subtitlePointer+1]; //Look at next line in txt file to check time stamp
      let splitStr = split(nextLine, ':') //':' is used to separate time stamp and subtitle
                                          //loads splitStr with an array of 2 parts; [0]time, [1]subtitle

      //Check time stamp for next subtitle
      if(audioTime >= nf(splitStr[0],4,0)){ //Is it time for the next subtitle?
        let txt = splitStr[1]; //get the next subtitle
        if(txt != null){  //as long as the next subtitle exists...
          this.currSubtitle = splitStr[1]; //If it's time, set the next subtitle as current
          this.subtitlePointer++; //increment the subtitle pointer
        }
      }
    }

    //Return the current subtitle
    return this.currSubtitle;
  //End getCurrentSubtitle
  }
  //----------------------------------------------------------------------------
  //Check if story is playing
  isPlaying(){
    if(this.audio != null){ //as long as audio exists...
      return this.audio.isPlaying(); //check if it's playing and return the value
    }
    else{ //If audio doesn't exist...
      return false; //return false;
    }
  //End isPlaying
  }
//End Story Class
}
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//Display the subtitles
//Set to display as DOM element in ui.js
/*Prameters
    story: the story object that is playing
*/
function displaySubtitles(story){
  if(story != null){  //Check that story exists
    if(story.isPlaying()){ //Check that it's playing
      let textboxSize = createVector(300,65);
      let pos = createVector(width/2, height-textboxSize.y/2 - 10);

      //Draw subtitle background
      fill(200);
      stroke(200);
      strokeWeight(1);
      rectMode(CENTER);
      rect(pos.x, pos.y, textboxSize.x, textboxSize.y);

      //Get speaker & pronouns
      let strSpeaker = "Speaker: " + story.name;

      //Get subtitle
      let subtitle= story.getCurrentSubtitle();

      //Display text
      fill(0);
      stroke(0);
      textAlign(CENTER, TOP);
      text(strSpeaker + "\n" + subtitle, pos.x, pos.y + 5,
      textboxSize.x, textboxSize.y);
    }
    //If story finished or was stopped, reset the subtitles to blank
    else{

    }
  }
//End displaySubtitles
}
