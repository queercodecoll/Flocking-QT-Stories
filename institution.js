//Institution Class
/* Institutions are stationary agents. They are not boids and are not part of
   the flock. The exist as points that further the simulation of harm/support.
*/

class Institution {
  /*Parameters
      bType: the boid type that the institution mimics; normative, non-normative
  */
  constructor(bType) {
    this.bType = bType;
    let x,y,pos;
    do{
      x = round(random(width));
      y = round(random(height));
      pos = createVector(x,y);
    }while(isUnderSubs(pos));
    this.position = pos;
  }
  //---------------------------------------------------------------------------
  //Draw this institution
  render(){
    let instSize = 10;  //Size of institutions

    //Choose colour based on type
    //non-normative
    if(this.bType == boidType.NON){
      stroke(nonColour);
      strokeWeight(1);
      fill(nonColour);
    }
    //normative
    else if(this.bType == boidType.NORM){
      stroke(normColour);
      strokeWeight(1);
      fill(normColour);
    }

    //Draw square with center at given position
    rectMode(CENTER);
    square(this.position.x, this.position.y, instSize);
  }
//End Class
}
//------------------------------------------------------------------------------
//FUNCTIONS OUTSIDE OF CLASS
//------------------------------------------------------------------------------
//Draw all institutions
/*Parameters:
    insts: list of institutions to draw
*/
function drawInstitutions(insts){
  for(let inst of insts){
    inst.render();
  }
//End drawInstitutions
}
