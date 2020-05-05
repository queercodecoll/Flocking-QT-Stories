//Institution Class

class Institution {

  //Private Class Variables

  //Public Class Variables

  constructor(bType) {
    this.bType = bType;
    this.position = createVector(random(width), random(height));
  }
  //---------------------------------------------------------------------------
  //Draw this institution
  render(){
    let instSize = 10
    //Choose colour based on type
    if(this.bType == boidType.NON){
      stroke(nonColour);
      strokeWeight(1);
      fill(nonColour);
    }
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
//GLOBAL: draw all institutions
function drawInstitutions(insts){
  for(let inst of insts){
    inst.render();
  }
}
