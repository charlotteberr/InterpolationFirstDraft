let rows=6;
let cols=30;
let cellSize=20;

let structures;
let currentLeftPattern="random";
let currentRightPattern="random";

let choiceGrid=[];
let copyGrid=[];

let leftLabel, rightLabel, middleLabel, interpLabel;
let leftInput, rightInput, middleInput, interpInput, whiteSmoothCheckbox, blackSmoothCheckbox, helpText;
let middleTileCount=3; // default number of middle tiles
let interpPercent=50;
let smoothInterp=false;
let whiteSmooth=false;
let blackSmooth=false;

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
  buildChoiceGrid();
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
  let out=[];
  for(let i=0;i<targetH;i++){
    out[i]=[];
    for(let j=0;j<targetW;j++){
      out[i][j]=pattern[i%patternH][j%patternW];
    }
  }
  return out;
}

function buildChoiceGrid(){
  choiceGrid=[];
  for(let i=0;i<rows;i++){
    choiceGrid[i]=[];
    for(let j=0;j<cols;j++){
      choiceGrid[i][j]=Math.random();
    }
  }
}

function buildCopyGrid(){
  copyGrid=[];
  for(let i=0;i<rows;i++){
    copyGrid[i]=[];
    for(let j=0;j<cols;j++){
      copyGrid[i][j]=0;
    }
  }
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
  let v=Math.floor(Number(middleInput.value()));
  if (structures){
    let leftPattern=structures.patterns[currentLeftPattern];
    let rightPattern=structures.patterns[currentRightPattern];
    let commonW=lcm(leftPattern[0].length,rightPattern[0].length);
    let commonH=lcm(leftPattern.length,rightPattern.length);
    if (Number.isNaN(v) || v<1){
      v=1;
    }
    middleTileCount=v;
    middleInput.value(String(middleTileCount));
    rows=commonH;
    cols=commonW+commonW+(middleTileCount*commonW);
    resizeCanvas(cols*cellSize, rows*cellSize);
    updateControlPositions();
    buildChoiceGrid();
  } else if (v>=1) {
    middleTileCount=v;
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

  let leftPatternRaw=structures.patterns[currentLeftPattern];
  let rightPatternRaw=structures.patterns[currentRightPattern];
  let commonW=lcm(leftPatternRaw[0].length,rightPatternRaw[0].length);
  let commonH=lcm(leftPatternRaw.length,rightPatternRaw.length);
  let leftPattern=repeatPatternToSize(leftPatternRaw,commonH,commonW);
  let rightPattern=repeatPatternToSize(rightPatternRaw,commonH,commonW);

  let rightStart=cols-commonW;
  let tileCount=Math.floor((rightStart-commonW)/commonW);
  let center = (interpPercent / 100) * (tileCount - 1);


  buildCopyGrid();

  for(let i=0;i<rows;i++){
    for(let j=0;j<cols;j++){
      let cellValue=0;

      if (i<leftPattern.length && j<commonW){
        cellValue=leftPattern[i][j];
        copyGrid[i][j]=cellValue;
      }
      else if (i<rightPattern.length && j>=rightStart){
        let rightCol=j-rightStart;
        cellValue=rightPattern[i][rightCol];
        copyGrid[i][j]=cellValue;
      }
      else if (j>=commonW && j<rightStart){
        let middleCol=j-commonW;
        let tileIndex=Math.floor(middleCol/commonW);
        let colInTile=middleCol%commonW;

        let dist=Math.floor(Math.abs(tileIndex-center));
        let isLeftSide=tileIndex<center;
        let isRightSide=tileIndex>center;
        
        let k=2+dist;
        let useOpposite=((colInTile+1)%k===0);

        let useLeftPattern=false;
        if (!isLeftSide && !isRightSide){
          useLeftPattern=(colInTile%2===0);
        } else if (isLeftSide){
          useLeftPattern=!useOpposite;
        } else {
          useLeftPattern=useOpposite;
        }

        if (useLeftPattern){
          cellValue=leftPattern[i][colInTile];
        } else {
          cellValue=rightPattern[i][colInTile];
        }
        copyGrid[i][j]=cellValue;
      }
    }
  }

  for(let i=0;i<rows;i++){
    for(let j=0;j<cols;j++){
      let x=j*cellSize;
      let y=i*cellSize;
      if (copyGrid[i][j]===1){
        fill(0);
        stroke(255);
      }
      else {
        fill(255);
        stroke(0);
      }
      rect(x,y,cellSize,cellSize);
    }
  }
}
