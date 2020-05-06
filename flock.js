//Flock class
/*This is a container of a group of boids. It also determines the force multipliers
  for non-normative boids (avoids having each boid process sound analysis each time).
*/

class Flock {
  //Constructor
  //No parameters needed
  constructor() {
    this.boidList = []; //Container for the list of boids within this flock
    this.numQBoids = 0; //number of non-normative boids in this flock
    this.numNBoids = 0; //number of normative boids in this flock

    this.aliMult = 1;   //default alignment multiplier
    this.sepMult = 1.5; //default separation multiplier
    this.cohMult = 1;   //default cohesion multiplier
  }

  //---------------------------------------------------------------------------
  //Add new boid to the flock
  //If boid type if NORM then story will be NULL
  /*parameters
      bType: boid type for the new boid; normative or non-normative
      story: the story that will be tied to the new boid (story object)
  */
  add(bType, story){
    //create new boid
    let newBoid = new Boid(this, bType, story); //this: mark this flock as the parent
    this.boidList.push(newBoid); //add boid to list of boids for this flock

    //Check boid type and increment respective counter
    if(newBoid.bType === boidType.NORM){
      this.numNBoids++;
    }
    else if(newBoid.bType === boidType.NON){
      this.numQBoids++;
      if(followBoid == null){
        followBoid = newBoid;
      }
    }
  //End add
  }

  //---------------------------------------------------------------------------
  //Remove a normative boid from this flock
  remove(){
    //If there is at least 1 normative boid
    if(this.numNBoids > 0){
      //Find the first boid in the list
      for(let i=0; i<this.boidList.length; i++){
        if(this.boidList[i].bType === boidType.NORM){
          this.boidList.splice(i,1); //Delete the boid from the list
          return; //Leave funciton once boid has been found and removed.
        }
      }
    }
  //End remove
  }
  //---------------------------------------------------------------------------
  //Run the flock; Analysis sound, set multipliers, run each boid in flocking
  /*Parameters
      audio: the audio file to be analyzed
  */
  process(audio){
    //Analyze sound
    //Check if activeStory has been set, and that it's playing
    if(activeStory != null && activeStory.isPlaying()){
      let amplitudes = getAmplitudes(); //get the amplitudes (0-255) of the frequency ranges (low, med, hi)
      let effect = 0.05;  //how much does the respective amplitudes affect their multipliers

      this.aliMult = amplitudes.y * effect; //alignment proportional to med_freq amplitudes
      this.sepMult = amplitudes.x * effect; //separation proportional to low_freq amplitudes
      this.cohMult = amplitudes.z * effect; //cohesion proportional to high_freq amplitudes
    }
    //If story is not playing (or set) revert to default values for multipliers
    else {
      this.aliMult = 1;
      this.sepMult = 1.5;
      this.cohMult = 1;
    }

    //Run each boid in this flock
    for(let boid of this.boidList){
      boid.process();
    }
  //End process
  }
//End Class
}
