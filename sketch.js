let rows=6;
let cols=30;
let cellSize=20;
const uiTop=10;
const canvasTop=165;

let structures;
let currentPatternA="random";
let currentPatternB="random";
let canvasElement;

let patternALabel, patternBLabel, middleLabel, blendCenterLabel;
let patternAInput, patternBInput, middleInput, blendCenterInput, verticalCheckbox, helpText, blendCenterHelpText;
let middleColumnCount=18;
let middleTileCount=3; // derived helper from column count
let interpPercent=50;
let isVertical=false;

function setup(){
  canvasElement=createCanvas(cols*cellSize,rows*cellSize);

  patternALabel=createP("Pattern A:");
  patternAInput = createInput(currentPatternA);
  patternAInput.input(updatePatterns);

  patternBLabel=createP("Pattern B:");
  patternBInput = createInput(currentPatternB);
  patternBInput.input(updatePatterns);

  middleLabel=createP("Blend region length (ends):");
  middleInput = createInput(String(middleColumnCount));
  middleInput.input(updateMiddleLength);

  blendCenterLabel=createP("Blend center %:");
  blendCenterInput = createInput(String(interpPercent));
  blendCenterInput.input(updateInterpolation);

  verticalCheckbox=createCheckbox("Vertical", isVertical);
  verticalCheckbox.changed(updateVertical);

  blendCenterHelpText=createP("Shift blend center with arrow keys.");
  blendCenterHelpText.style("border","1px solid #c8c8c8");
  blendCenterHelpText.style("background","#efefef");
  blendCenterHelpText.style("padding","4px 8px");
  blendCenterHelpText.style("font-weight","400");
  helpText = createP("Possible patterns: (loading...)");

  updateControlPositions();
  updateMiddleLength();
}

function applyCanvasSize(){
  if(!isVertical){
    resizeCanvas(cols*cellSize,rows*cellSize);
  }
  else{
    resizeCanvas(rows*cellSize,cols*cellSize);
  }
  updateControlPositions();
}

function updateControlPositions(){
  helpText.position(10, uiTop);
  blendCenterHelpText.position(10, uiTop + 35);

  patternALabel.position(10, uiTop + 70);
  patternAInput.position(10, uiTop + 105);

  patternBLabel.position(200, uiTop + 70);
  patternBInput.position(200, uiTop + 105);

  middleLabel.position(390, uiTop + 70);
  middleInput.position(390, uiTop + 105);

  blendCenterLabel.position(600, uiTop + 70);
  blendCenterInput.position(600, uiTop + 105);

  verticalCheckbox.position(780, uiTop + 105);

  if(canvasElement){
    canvasElement.position(10, canvasTop);
  }
}

function gcd(a,b){      // LCM functions
  while (b!==0){
    let t=b;
    b=a%b;
    a=t;
  }
  return Math.abs(a);
}

function lcm(a,b){
  return Math.abs(a*b)/gcd(a,b);
}

function repeatPatternToSize(pattern,targetH,targetW){    // Two different sized functions repeated to fit LCM height and width array
  let patternH=pattern.length;
  let patternW=pattern[0].length;
  let output=[];
  for(let i=0;i<targetH;i++){
    output[i]=[];
    for(let j=0;j<targetW;j++){
      output[i][j]=pattern[i%patternH][j%patternW];
    }
  }
  return output;
}

function preload(){
  structures=loadJSON("structures.json");
}

function updatePatterns(){     // Update patterns with what user picked
  let patternAName=patternAInput.value().trim();
  let patternBName=patternBInput.value().trim();
  if (structures && structures.patterns[patternAName]) {
    currentPatternA=patternAName;
  }
  if (structures && structures.patterns[patternBName]) {
    currentPatternB=patternBName;
  }
  updateMiddleLength();
}

function updateInterpolation(){    // updates interpolation % location
  let v=Math.floor(Number(blendCenterInput.value()));
  if(v<0){
    v=0;
  }
  if(v>100){
    v=100;
  }
  else{
    interpPercent=v;
  }
  blendCenterInput.value(String(interpPercent));
}

function updateVertical(){
  isVertical=verticalCheckbox.checked();
  applyCanvasSize();
}

function updateMiddleLength(){
  let value=Math.floor(Number(middleInput.value()));
  if (structures){
    let patternA=structures.patterns[currentPatternA];
    let patternB=structures.patterns[currentPatternB];
    let commonW=lcm(patternA[0].length,patternB[0].length);
    let commonH=lcm(patternA.length,patternB.length);
    if(Number.isNaN(value) || value<0){
      value=0;
    }
    middleColumnCount=value;
    middleInput.value(String(middleColumnCount));
    middleTileCount=Math.floor(middleColumnCount/commonW);
    rows=commonH;
    cols=commonW+commonW+middleColumnCount;
    applyCanvasSize();
  } 
  else if (value>=0) {
    middleColumnCount=value;
  }
}

function keyPressed(){     // Key pressed functions for interpolation % center
  if(keyCode===LEFT_ARROW){
    interpPercent=Math.max(0,interpPercent-10);
    blendCenterInput.value(String(interpPercent));
  }
  if(keyCode===RIGHT_ARROW){
    if(interpPercent===100){
      return;
    }
    interpPercent=Math.max(0,interpPercent+10);
    blendCenterInput.value(String(interpPercent));
  }
}

function draw(){
  if(!structures){
    return;
  }

  if (helpText && helpText.html().includes("loading")) {
    let names = Object.keys(structures.patterns).join(", ");
    helpText.html("Possible patterns: " + names);
  }

  background(215);

  let patternAOrg=structures.patterns[currentPatternA];
  let patternBOrg=structures.patterns[currentPatternB];
  let commonW=lcm(patternAOrg[0].length,patternBOrg[0].length);
  let commonH=lcm(patternAOrg.length,patternBOrg.length);
  let patternA=repeatPatternToSize(patternAOrg,commonH,commonW);
  let patternB=repeatPatternToSize(patternBOrg,commonH,commonW);
  let patternBStart=cols-commonW;
  let middleLength=patternBStart-commonW;
  let fullTileCount=Math.floor(middleLength/commonW);
  let remainderStart=fullTileCount*commonW;
  let center=(interpPercent/100)*(fullTileCount - 1);

  for(let i=0;i<rows;i++){
    for(let j=0;j<cols;j++){
      let cellValue=0;

      if (i<patternA.length && j<commonW){
        cellValue=patternA[i][j];
      }
      else if (i<patternB.length && j>=patternBStart){
        let patternBCol=j-patternBStart;
        cellValue=patternB[i][patternBCol];
      }
      else if (j>=commonW && j<patternBStart){
        let middleCol=j-commonW;
        let colInTile=middleCol%commonW;
        let usePatternA=false;

        if(middleCol>=remainderStart){
          // For remainder columns, alternate A/B until the middle ends.
          let remainderCol=middleCol-remainderStart;
          usePatternA=(remainderCol%2===0);
        }
        else{
          let tileIndex=Math.floor(middleCol/commonW);
          let distance=Math.floor(Math.abs(tileIndex-center));
          let isPatternASide=tileIndex<center;
          let isPatternBSide=tileIndex>center; 
          let stripeSpacing=2+distance;
          let useOpposite=((colInTile+1)%stripeSpacing===0);
          if(!isPatternASide && !isPatternBSide){
            usePatternA=(colInTile%2===0);
          }
          else if(isPatternASide){
            usePatternA=!useOpposite;
          }
          else{
            usePatternA=useOpposite;
          }
        }
        
        if(usePatternA){
          cellValue=patternA[i][colInTile];
        }
        else{
          cellValue=patternB[i][colInTile];
        }
      }
      let orgX=j*cellSize;
      let orgY=i*cellSize;
      let x,y;
      if(!isVertical){
        x=orgX;
        y=orgY;
      }
      else{
        x=orgY;
        y=orgX;
      }
      if(cellValue===1){
        fill(0);
        stroke(255);
      }
      else{
        fill(255);
        stroke(0);
      }
      rect(x,y,cellSize,cellSize);
    }
  }
}
