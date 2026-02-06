let rows=6;
let cols=30;
let cellSize=20;

let structures;
let currentLeftPattern="random";
let currentRightPattern="random"; //pick from structures
// set left or right tile with name

let choiceGrid=[];

let leftInput, rightInput, middleInput, helpText;
let middleLengthValue=18; // default middle area width in columns

function setup(){
  createCanvas(cols*cellSize,rows*cellSize);

  createP("Left pattern:").position(10, height + 5); // left pattern input
  leftInput = createInput(currentLeftPattern);
  leftInput.position(10, height + 40);
  leftInput.input(updatePatterns);

  createP("Right pattern:").position(200, height + 5); // right pattern input
  rightInput = createInput(currentRightPattern);
  rightInput.position(200, height + 40);
  rightInput.input(updatePatterns);

  createP("Middle length (columns):").position(390, height + 5);
  middleInput = createInput(String(middleLengthValue));
  middleInput.position(390, height + 40);
  middleInput.input(updateMiddleLength);

  helpText = createP("Possible patterns: (loading...)"); // list of pattern names
  helpText.position(10, height + 70);


  buildChoiceGrid();
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

function preload(){
  structures=loadJSON("structures.json");
}

function updatePatterns(){
  let leftName = leftInput.value().trim();
  let rightName = rightInput.value().trim();

  if (structures && structures.patterns[leftName]) {
    currentLeftPattern = leftName;
  }
  if (structures && structures.patterns[rightName]) {
    currentRightPattern = rightName;
  }

  if (structures) {
    updateMiddleLength();
  }
}

function updateMiddleLength(){
  let v = parseInt(middleInput.value(), 10);
  if (Number.isFinite(v) && v >= 0) {
    middleLengthValue = v;
  }
  if (structures) {
    let leftW = structures.patterns[currentLeftPattern][0].length;
    let rightW = structures.patterns[currentRightPattern][0].length;
    cols = leftW + rightW + middleLengthValue;
    resizeCanvas(cols*cellSize, rows*cellSize);
    buildChoiceGrid();
  }
}

function draw(){
  if(!structures){
    return;
  }

  if (helpText && helpText.html().includes("loading")) { // reads in pattern names and lists them
    let names = Object.keys(structures.patterns).join(", ");
    helpText.html("Possible patterns: " + names);
  }

  background(215);
  
  let leftPattern=structures.patterns[currentLeftPattern];
  let rightPattern=structures.patterns[currentRightPattern]; 
  let leftW=leftPattern[0].length;
  let rightW=rightPattern[0].length;
  let rightStart=cols-rightW; 
  
  for(let i=0;i<rows;i++){
    for(let j=0;j<cols;j++){
      let x=j*cellSize;
      let y=i*cellSize;
      let cellValue=0; // start cell as white
      let r=choiceGrid[i][j];

      let middleLength=rightStart-leftW;
      let tileW=leftW;
      let tileCount=Math.floor(middleLength/tileW);
      let remainder=middleLength%tileW;
      let remainderStart=leftW+Math.floor((middleLength-remainder)/2);
      let remainderEnd=remainderStart+remainder;

      if (i<leftPattern.length && j<leftW) {
        cellValue=leftPattern[i][j];
      } else if (i<rightPattern.length && j>=rightStart) {
        let rightCol=j-rightStart;
        cellValue=rightPattern[i][rightCol];
      } else if (j>=leftW && j<rightStart) {
        // middle area only
        if(remainder>0 && i<leftPattern.length && j>=remainderStart && j<remainderEnd){
          let tileCol=j-remainderStart;
          if(r<0.5){
            cellValue=leftPattern[i][tileCol];
          }
          else{
            cellValue=rightPattern[i][tileCol];
          }
        }
        else if(tileCount>0 && i<leftPattern.length){
          let tileIndex=Math.floor((j-leftW)/tileW);
          let probLeft=0.5;
          if(tileCount>1){
            probLeft=1-(tileIndex/(tileCount-1));
          }
          probLeft=constrain(probLeft, 0.1, 0.9);
          let tileCol=j-(leftW+tileIndex*tileW);
          if(r<probLeft){
            cellValue=leftPattern[i][tileCol];
          }
          else{
            cellValue=rightPattern[i][tileCol];
          }
        }
      }

      if (cellValue===1){
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
