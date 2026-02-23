let rows=6;
let cols=30;
let cellSize=20;

let structures;
let currentLeftPattern="random";
let currentRightPattern="random";

let leftLabel, rightLabel, middleLabel, interpLabel;
let leftInput, rightInput, middleInput, interpInput, helpText;
let middleTileCount=3;
let interpPercent=50;

function setup(){
  createCanvas(cols*cellSize,rows*cellSize);

  leftLabel=createP("Left pattern:");
  leftInput = createInput(currentLeftPattern);
  leftInput.input(updatePatterns);

  rightLabel=createP("Right pattern:");
  rightInput = createInput(currentRightPattern);
  rightInput.input(updatePatterns);

  middleLabel=createP("Add middle tiles:");
  middleInput = createInput(String(middleTileCount));
  middleInput.input(updateMiddleLength);

  interpLabel=createP("Interpolation %:");
  interpInput = createInput(String(interpPercent));
  interpInput.input(updateInterpolation);

  helpText = createP("Possible patterns: (loading...)");

  updateControlPositions();
  updateMiddleLength();
}

function updateControlPositions(){
  leftLabel.position(10, height + 5);
  leftInput.position(10, height + 40);

  rightLabel.position(200, height + 5);
  rightInput.position(200, height + 40);

  middleLabel.position(390, height + 5);
  middleInput.position(390, height + 40);

  interpLabel.position(600, height + 5);
  interpInput.position(600, height + 40);

  helpText.position(10, height + 70);
}

function gcd(a,b){
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

function repeatPatternToSize(pattern,targetH,targetW){
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

function updatePatterns(){
  let leftName=leftInput.value().trim();
  let rightName=rightInput.value().trim();
  if (structures && structures.patterns[leftName]) {
    currentLeftPattern=leftName;
  }
  if (structures && structures.patterns[rightName]) {
    currentRightPattern=rightName;
  }
  updateMiddleLength();
}

function updateInterpolation(){
  let v=Math.floor(Number(interpInput.value()));
  if(v<0){
    v=0;
  }
  if(v>100){
    v=100;
  }
  else{
    interpPercent=v;
  }
}

function updateMiddleLength(){
  let value=Math.floor(Number(middleInput.value()));
  if (structures){
    let leftPattern=structures.patterns[currentLeftPattern];
    let rightPattern=structures.patterns[currentRightPattern];
    let commonW=lcm(leftPattern[0].length,rightPattern[0].length);
    let commonH=lcm(leftPattern.length,rightPattern.length);
    if(Number.isNaN(value) || value<1){
      value=1;
    }
    middleTileCount=value;
    middleInput.value(String(middleTileCount));
    rows=commonH;
    cols=commonW+commonW+(middleTileCount*commonW);
    resizeCanvas(cols*cellSize, rows*cellSize);
    updateControlPositions();
  } 
  else if (value>=1) {
    middleTileCount=value;
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

  let leftPatternOrg=structures.patterns[currentLeftPattern];
  let rightPatternOrg=structures.patterns[currentRightPattern];
  let commonW=lcm(leftPatternOrg[0].length,rightPatternOrg[0].length);
  let commonH=lcm(leftPatternOrg.length,rightPatternOrg.length);
  let leftPattern=repeatPatternToSize(leftPatternOrg,commonH,commonW);
  let rightPattern=repeatPatternToSize(rightPatternOrg,commonH,commonW);
  let rightStart=cols-commonW;
  let tileCount=Math.floor((rightStart-commonW)/commonW);
  let center=(interpPercent/100)*(tileCount - 1);

  for(let i=0;i<rows;i++){
    for(let j=0;j<cols;j++){
      let cellValue=0;

      if (i<leftPattern.length && j<commonW){
        cellValue=leftPattern[i][j];
      }
      else if (i<rightPattern.length && j>=rightStart){
        let rightCol=j-rightStart;
        cellValue=rightPattern[i][rightCol];
      }
      else if (j>=commonW && j<rightStart){
        let middleCol=j-commonW;
        let tileIndex=Math.floor(middleCol/commonW);
        let colInTile=middleCol%commonW;
        let distance=Math.floor(Math.abs(tileIndex-center));
        let isLeftSide=tileIndex<center;
        let isRightSide=tileIndex>center; 
        let stripeSpacing=2+distance;
        let useOpposite=((colInTile+1)%stripeSpacing===0);

        let useLeftPattern=false;
        if(!isLeftSide && !isRightSide){
          useLeftPattern=(colInTile%2===0);
        }
        else if(isLeftSide){
          useLeftPattern=!useOpposite;
        }
        else{
          useLeftPattern=useOpposite;
        }

        if(useLeftPattern){
          cellValue=leftPattern[i][colInTile];
        }
        else{
          cellValue=rightPattern[i][colInTile];
        }
      }

      let x=j*cellSize;
      let y=i*cellSize;
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
