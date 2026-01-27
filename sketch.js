let rows=6;
let cols=30;
let cellSize=20;

let structures;
let currentLeftPattern="satin";
let currentRightPattern="tabby"; //pick from structures
// set left or right tile with name

function setup(){
  createCanvas(cols*cellSize,rows*cellSize);
}

function preload(){
  structures=loadJSON("structures.json");
}

function draw(){
  if(!structures){
    return;
  }
  else{
  background(215);
  let leftPattern=structures.patterns[currentLeftPattern];
  let rightPattern=structures.patterns[currentRightPattern];  
  
  for(let i=0;i<rows;i++){
    for(let j=0;j<cols;j++){
      let x=j*cellSize;
      let y=i*cellSize;
      let cellValue=0;
      if (i<leftPattern.length && j<leftPattern[0].length) {
        cellValue=leftPattern[i][j];
      }
      let rightStart=cols-rightPattern[0].length;
      if (i<rightPattern.length && j>=rightStart) {
        let rightCol=j-rightStart;
        cellValue=rightPattern[i][rightCol];
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
}