//Define Boid Class

var showInteractions = true;
let edgeConsideration = true;

class Boid {
  //Constructor
    /*Parameters:
        Parent: the group of boids/flock that this boid belongs to
        Type: the type of boid; normative, non-normative, etc.
        Story: The story that this boid is tied to (story object)
    */
  constructor(parent, bType, story) {
    //Characteristics
    this.parent = parent; //parent flock
    this.bType = bType; //Boid type; NORM, NON
    this.story = story; //Story object stored in boid

    //Neighbours
    //Lists of neighbours are used to limit processing time rather than searching
    //through the whole boid list each time.
    this.neighbours = []; //List of close neighbours (within distance of neighbourRange)
    this.neighboursFar = []; //List of farther neighbours (between neighbourRange and neighbourFarRange)
    this.neighbourRange = 20; //Max range that defines a "close" neighbour, and min dist for "far" neighbour
    this.neighbourFarRange = this.neighbourRange * 1.5; //Max range that defines a "far" neighbour

    //Energy
    this.maxEnergy = 100;   //Maximum Energy this boid can have
    this.energy = 100;      //Current Engergy of this boid
    this.harmFactor = 0.1;    //Negative effect on energy from harm interactions
    this.supportFactor = 0.1; //Positive effect on energy from support interaction
    this.experienceDist = this.neighbourRange * 1.5;  //Range that a boid experiences Interactions
                                                      //Ideally this value is between 0 and far neighbour range
                                                      //but can exceed at sacrifice of processing time.

    //Physics
    this.maxForce = 0.1;  //The max value that ali, sep, coh calculate before multipliers
    this.maxSpeed = 1.5;  //Fastest that a boid can travel
    this.position = createVector(random(width), random(height));
    this.velocity = createVector(random(-1,1), random(-1,1))
    this.velocity.setMag(random(this.maxSpeed));
    this.acceleration = createVector();
  }
  //----------------------------------------------------------------------------
  //Check if boid is at edge of canvas. If so, teleport to other side
  boundaryCheck() {
    //Check if x value (horizontal) is outside area.
    //If so, set to opposite side.
    if (this.position.x > width) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = width;
    }

    //Same for y value (vertical)
    if (this.position.y > height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = height;
    }
  //End boundaryCheck
  }
  //----------------------------------------------------------------------------
  //Check if other boid is closer through the edge(s)
  //If it isn't, return original position
  //If it is, determine a reflected position and return it
  /*Parameters:
      other: the boid that is being tested compared to this boid
  */
  altPosition(other){
    if(edgeConsideration){ //Toggle for turning edge consideration on/off
      //calc dist between points
      let xdist = abs(this.position.x - other.position.x);
      let ydist = abs(this.position.y - other.position.y);

      //preload variables to be returned, in case they are not changed
      //(eg. boid is not closer through edge)
      let xpos = other.position.x;
      let ypos = other.position.y;

      //is the horizontal distance greater than half width? then use reflected xpos
      if (xdist < width/2) {  //boid is not closer through edge
        xpos = other.position.x;
      }
      else if(this.position.x < other.position.x){
        xpos = other.position.x - width;
      }
      else if(this.position.x > other.position.x){
        xpos = other.position.x + width;
      }

      //same for Vertical
      if (ydist < height/2){ //boid is not closer through edge
        ypos = other.position.y;
      }
      else if(this.position.y < other.position.y){ //if other on the right of this boid...
        ypos = other.position.y - height; //determine reflective position to left of this boid
      }
      else if(this.position.y > other.position.y){ //if other is on right of this boid...
        ypos = other.position.y + height; //determine reflective position to right of this boid
      }

      //Return determined positions
      return createVector(xpos,ypos);
    }
    else {
      return other.position;
    }
  //End altPosition
  }
  //----------------------------------------------------------------------------
  //Fill the lists for far and close neighbours
  findNeighbours(boidList){
    //Go through the list of boids in the given flock
    for (let other of boidList){
      //If other boid is not this boid, continue
      if (other != this){
        //Check if other boid is closer through edge

        //let otherPos = other.position;
        let otherPos = this.altPosition(other); //altPosition determines if other is closer through edge
                                                //and returns other position or the alt other position

        //Determine the distance to the other boid
        let d = dist(this.position.x, this.position.y,
                     otherPos.x, otherPos.y);

        //If boid is in neighbour range, add to neighbour list
        if (d < this.neighbourRange){
          this.neighbours.push(other);
        }
        //If it's between close neighbour range and far neighbour range then add to far neighbour list
        else if(d < this.neighbourFarRange){
          this.neighboursFar.push(other);
        }
      }
    }

  //End find neighbours
  }
  //----------------------------------------------------------------------------
  //Determine force vector to align with neighbours
  alignment() {
    let steering = createVector();

    for (let other of this.neighbours) {
      steering.add(other.velocity); //sum all velocity vectors of close neighbours
    }
    for (let other of this.neighboursFar) {
      steering.add(other.velocity); //add all the velocity vectors of far neighbours
    }

    //As long as there is at least 1 neighbour (close or far)...
    if (this.neighbours.length + this.neighboursFar.length > 0) {
      steering.div(this.neighbours.length + this.neighboursFar.length); //average the velocity vectors
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity); //Determine the vector direction
      steering.limit(this.maxForce); //Cap the amount of force
    }

    //Return the determined force vector for alignment
    return steering;
  //End alignment
  }
  //----------------------------------------------------------------------------
  //Determine force vector to separate from neighbours
  separation() {
    let steering = createVector();

    for (let other of this.neighbours) { //for only close neighbours
      let otherPos = this.altPosition(other); //check if the boid is closer through an edge
      let dis = dist(this.position.x, this.position.y, //determine the distance to the other boid
                   otherPos.x, otherPos.y);          //(or it's reflection)
      let dif = p5.Vector.sub(this.position, otherPos); //Determine the direction for separation
                                                         //from the other boid
      dis = max(dis, 0.01); //To avoid dividing by 0 below, set minimum value for distance
      dif.div(dis);         //Magnitude of force vector is inversely proportional to distance
      steering.add(dif);    //Sum all the determined force vectors
    }

    //If there is at least one neighbour, set the force vectors
    if (this.neighbours.length > 0) {
      steering.div(this.neighbours.length); //Determine the average force magnitude
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);  //Determine the vector direction
      steering.limit(this.maxForce); //Cap the amount force
    }

    //Return the determined force vector for separation
    return steering;
  //End separation
  }
  //----------------------------------------------------------------------------
  //Determine force vector to cohere with neighbours
  cohesion() {
    let steering = createVector();

    //For all the close neighbours
    for (let other of this.neighbours) {
      let otherPos = this.altPosition(other); //Determine if they are closer through an edge
      steering.add(otherPos); //Sum their collective positions
    }

    //Same for far neighbours
    for (let other of this.neighboursFar) {
      let otherPos = this.altPosition(other);
      steering.add(otherPos);
    }

    //If there is at least 1 close or far neighbour, determine the force vector
    if (this.neighbours.length + this.neighboursFar.length > 0) {
      steering.div(this.neighbours.length + this.neighboursFar.length); //Calculate the average magnitude
      steering.sub(this.position); //Find vector from this boid to average point
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity); //Determine vector direction to average point
      steering.limit(this.maxForce); //Cap amount of force
    }

    //Return the determined force vector for cohesion
    return steering;
  //End cohesion
  }
  //----------------------------------------------------------------------------
  //Apply multipliers to determined forces and apply them to acceleration of this boid
  calcAcceleration() {
    //Determine base values for forces
    let alignment = this.alignment();
    let cohesion = this.cohesion();
    let separation = this.separation();

    let aliMult, sepMult, cohMult; //Declare the multipliers

    //Normative boids use default multipliers
    if(this.bType === boidType.NORM){
      aliMult = 1;
      sepMult = 1.5;
      cohMult = 1
    }
    //Non-normative boids have their multipliers set by the flock
    //These are default if story is not playing, but if it is playing
    //then the multipliers are determined through sound analysis of the story
    else if(this.bType === boidType.NON){
      aliMult = this.parent.aliMult;
      sepMult = this.parent.sepMult;
      cohMult = this.parent.cohMult;
    }

    //Apply the multipliers to the forces
    alignment.mult(aliMult);
    cohesion.mult(cohMult);
    separation.mult(sepMult);

    //Apply the multiplied forces to the acceleration by summing them
    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  //End calcAcceleration
  }
  //----------------------------------------------------------------------------
  //Apply the acceleration to the velocity, which in turn is applied to the position
  update() {
    this.position.add(this.velocity); //Update the location based on last frame's velocity.
    this.velocity.add(this.acceleration); //Update the current velocity with determine acceleration.
    this.velocity.limit(this.maxSpeed * this.energy / this.maxEnergy); //Cap the velocity relative to energy of the boid
    this.acceleration.mult(0); //Reset the acceleration to 0 (to be re-determined).
  //End update
  }
  //----------------------------------------------------------------------------
  //Draw this boid
  render(){
    let boidSize = 4; //Size of boids on the canvas

    //Set colour for normative boid
    if(this.bType === boidType.NORM){
      stroke(normColour);
      fill(normColour);
    }
    //Set colour for non-normative boid, where transparency is proportional to its energy
    else {
      stroke(nonColour);
      fill(255,0,255, (255* this.energy / this.maxEnergy));
    }

    //Determine rotation of boid
    var rot = -this.velocity.angleBetween(createVector(0,1)); //Find the angle between a straight up vector and velocity

    //Draw the boid
    strokeWeight(1);  //Set the line width
    push();           //push the drawing matrix (start at 0,0)
      translate(this.position.x, this.position.y);  //Set current drawing position to this boids position
      rotate(rot);  //Rotate the drawing space so that velocity points directly up
      triangle(0,boidSize*2,              //Draw the boids triangle shape (top, bottom left, bottom right)
               -boidSize, -boidSize*2,
               boidSize, -boidSize*2);
    pop();      //Bring back the standard drawing matrix

    //Show that the boid's story is selected (if story is playing)
    if(this.story != null && this.story === activeStory && activeStory.isPlaying()){
      stroke(50,255,50);
      strokeWeight(2);
      noFill();
      circle(this.position.x, this.position.y, boidSize*6);
    }

  //End render
  }
  //----------------------------------------------------------------------------
  //Apply harm/support due to neighbours and nearby institutions
  /*Parameters:
      isnts: a list of institutions (boid list is already known)
  */
  minorityExperience(insts){
    let harmColor = color(255,0,0); //Colour of the harm lines
    let supportColor = color(0,255,255); //Colour of the support lines
    let lineSize = 1; //Size of the interaction lines
    let boidsInRange = []; //Container for boids interacting with this one
    let otherPos; //Container for the other boid's position (or reflective position)

    //Not for norms. If this is a normative boid, exit the function
    if(this.bType == boidType.NORM){
      return;
    }

    //Determine boids within range of experience distatnce
    //If the experience range is within the close neighbour range
    //Only check through the close neighbours list
    if(this.experienceDist < this.neighbourRange){
      //Determine which of the close neighbours are in range
      for(let other of this.neighbours){
        otherPos = this.altPosition(other); //Determine other boids position or reflective position

        let d = dist(this.position.x, this.position.y,  //Determine distance to other boid
                     otherPos.x, otherPos.y);
        if(d <= this.experienceDist){ //If within interaction range...
          boidsInRange.push(other); //Add to list of boids
        }
      }
    }

    //If the experience distance is equal to the close neighbour range then
    //only the close neighbours are in range.
    else if(this.experienceDist == this.neighbourRange){
      boidsInRange = this.neighbours; //Add all the close neighbours to the list
    }

    //If experience distance is greater than close neighbour range
    //but less than far neighbour range, use all close neighbours
    //and check through far neighbours
    else if(this.experienceDist < this.neighbourFarRange){
      boidsInRange = this.neighbours; //Add all of the close neighbours to the list

      //Determine which of the far neighbours are in range
      for(let other of this.neighboursFar){
        otherPos = this.altPosition(other); //Determine other boids position or reflective position
        let d = dist(this.position.x, this.position.y, //Determine distance to other boid
                     otherPos.x, otherPos.y);
        if(d <= this.experienceDist){ //If within interaction range...
          boidsInRange.push(other); //Add to list of boids
        }
      }
    }

    //If the experience distance is equal to the far neighbour range
    //then all known neighbours are in range
    else if(this.experienceDist == this.neighbourFarRange){
      //Add both close and far neighbours to the list
      boidsInRange = concat(this.neighbours, this.neighboursFar);
    }

    //If experience distance is greater than far range then check ALL boids
    //to see which are in range.
    else {
      for(let other of this.parent.boidList){
        otherPos = this.altPosition(other); //Determine other boids position or reflective position
        let d = dist(this.position.x, this.position.y,
                     otherPos.x, otherPos.y); //Determine distance to other boid
        if(d <= this.experienceDist){ //If within interaction range...
          boidsInRange.push(other); //Add to list of boids
        }
      }
    }

    //Harm/support from boids in range
    //Above, the list of boids within range were determined
    for(let other of boidsInRange){
      //Harm
      if(other.bType === boidType.NORM){  //If the other boid is normative...
        this.energy -= this.harmFactor;   //subtract harm factor from current energy
        //Draw harm line
        stroke(harmColor);  //set line colour
        strokeWeight(lineSize); //set line width
        this.drawInteractionLine(other); //Draw the line from this boid to the other
      }
      //Support
      else if(other.bType === boidType.NON){ //If the other boid is non-normative...
        this.energy += this.supportFactor; //add the support factor to current energy
        //Draw support line
        stroke(supportColor); //set line colour
        strokeWeight(lineSize); //set line size
        this.drawInteractionLine(other); //Draw the line form this boid to the other
      }

      //Keep enegy value between 0 and max energy allowed
      this.energy = constrain(this.energy, 0, this.maxEnergy);
    }

    //Harm/Support from institutions in range
    //Using the passed list of institutions, determine which are in range
    for(let inst of insts){
      let instPos = this.altPosition(inst); //Determine the instition's position or reflective position
      let dis = dist(this.position.x, this.position.y, //Determine the distance from the boid
                     instPos.x, instPos.y);            //to the the institution
      if(dis <= this.experienceDist){ //If the institution is in range...
        //Harm
        if(inst.bType === boidType.NORM){ //If the institution is normative...
          this.energy -= this.harmFactor; //subtract harm factor from current energy
          //Draw harm line
          stroke(harmColor); //set line colour
          strokeWeight(lineSize); //set line size
          this.drawInteractionLine(inst); //Draw the line from this boid to the institution
        }
        //Support
        else if(inst.bType === boidType.NON){ //If the institution is non-normative...
          this.energy += this.supportFactor; //add support factor to current energy
          //Draw support line
          stroke(supportColor); //set line colour
          strokeWeight(lineSize); //set line size
          this.drawInteractionLine(inst); //Draw the line from this boid to the institution
        }

        //Keep enegy value between 0 and max energy allowed
        this.energy = constrain(this.energy, 0, this.maxEnergy);
      }
    }
  //End minorityExperience
  }
  //----------------------------------------------------------------------------
  //Draw interaction line from this boid to the other point
  //taking edge interactions into account.
  /*Parameters
      other: the other boid or institution to have a line drawn to
  */
  drawInteractionLine(other){
    let otherPos = this.altPosition(other); //Determine the other's position or reflective position
    let thisPosX, thisPosY; //Containers for this boid's reflective position

    if(showInteractions){ //variable is determined by status of check box to turn these line on/off
      //Draw a line from this boid to the other point (or it's relfection)
      line(this.position.x, this.position.y, otherPos.x, otherPos.y);

      //If going through an edge, draw line form this to edge and other to edge
      if (other.position != otherPos){ //Check if stored point is a reflection
        //if the other's x value is different, determine this boid's x reflection
        //Same as in altPosition() but for this boid
        if(otherPos.x < other.position.x){
          thisPosX = this.position.x + width;
        }
        else if(otherPos.x > other.position.x){
          thisPosX = this.position.x - width;
        }
        else { //If the x value is not different
          thisPosX = this.position.x;
        }

        //if the other's y value is different, determine this's y reflection
        if(otherPos.y < other.position.y){
          thisPosY = this.position.y + height;
        }
        else if(otherPos.y > other.position.y){
          thisPosY = this.position.y - height;
        }
        else { //If the y value is not different
          thisPosY = this.position.y;
        }

        //If either x or y is different, draw two lines (this-edge, edge-other)
        if((otherPos.x != other.position.x) || (otherPos.x != other.position.y)){
          //this-edge
          line(this.position.x, this.position.y, otherPos.x, otherPos.y);
          //edge-other
          line(thisPosX, thisPosY, other.position.x, other.position.y);
        }
      }
    }
  //End drawInteractionLine
  }
  //----------------------------------------------------------------------------
  //Run the boids
  process(){
    this.boundaryCheck(); //Check that the boids position is not outside the area
    this.findNeighbours(this.parent.boidList); //build the list of neighbours
    this.calcAcceleration(); //Determine flocking variables; alignment, cohesion, separation
    this.update();  //Use determined forces to update the current position
    this.render();  //Draw this boid
    this.minorityExperience(institutions); //Determine interactions and draw them
    this.neighbours = []; //reset the list of close neighbours
    this.neighboursFar = []; //reset the list of far neighbours
  //End process
  }
//End Boid Class
}
