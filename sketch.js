let rows=6;
let cols=30;
let cellSize=20;

let structures;
let currentLeftPattern="random";
let currentRightPattern="random"; //pick from structures
// set left or right tile with name

let choiceGrid=[];

let leftInput, rightInput, helpText;

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

  helpText = createP("Possible patterns: (loading...)"); // list of pattern names
  helpText.position(10, height + 60);


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
  
  for(let i=0;i<rows;i++){
    for(let j=0;j<cols;j++){
      let x=j*cellSize;
      let y=i*cellSize;
      let cellValue=0; // start cell as white
      let r=choiceGrid[i][j];

      if (i<leftPattern.length && j<leftW) { // generate left pattern
        cellValue=leftPattern[i][j];
      }
      let rightStart=cols-rightW; // generate right pattern
      if (i<rightPattern.length && j>=rightStart) {
        let rightCol=j-rightStart;
        cellValue=rightPattern[i][rightCol];
      }
      let middleLength=rightStart-leftW;
      let tileW=Math.floor(middleLength/3);
      let t1Start=leftW;
      let t2Start=leftW+tileW;
      let t3Start=leftW+2*tileW;
      if(i<leftPattern.length && j>=t1Start && j<t2Start){ // generate tile 1 pattern
        let tile1Col=j-t1Start;
        if(r<0.75){
          cellValue=leftPattern[i][tile1Col];
        }
        else{
          cellValue=rightPattern[i][tile1Col];
        }
      }
      if(i<leftPattern.length && j>=t2Start && j<t3Start){ // generate tile 2 pattern
        let tile2Col=j-t2Start;
        if(r<0.5){
          cellValue=leftPattern[i][tile2Col];
        }
        else{
          cellValue=rightPattern[i][tile2Col];
        }
      }
      if(i<leftPattern.length && j>=t3Start && j<rightStart){ // generate tile 3 pattern
        let tile3Col=j-t3Start;
        if(r<0.25){
          cellValue=leftPattern[i][tile3Col];
        }
        else{
          cellValue=rightPattern[i][tile3Col];
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
