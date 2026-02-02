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
      let cellValue=0; // start cell as white
      if (i<leftPattern.length && j<leftPattern[0].length) { // 32-34 generate left pattern
        cellValue=leftPattern[i][j];
      }
      let rightStart=cols-rightPattern[0].length; // 35-39 generate right pattern
      if (i<rightPattern.length && j>=rightStart) {
        let rightCol=j-rightStart;
        cellValue=rightPattern[i][rightCol];
      }
      let middleLength=rightStart-leftPattern[0].length;
      let tileLength=middleLength/3;
      if(i<leftPattern.length && j>=tileLength && j<2*tileLength){ // 42-51 generate tile 1 pattern
        let r1=Math.random();
        let tile1Col=j-tileLength;
        if(r1<0.75){
          cellValue=leftPattern[i][tile1Col];
        }
        else{
          cellValue=rightPattern[i][tile1Col];
        }
      }
      if(i<leftPattern.length && j>=2*tileLength && j<3*tileLength){ // 52-61 generate tile 2 pattern
        let r2=Math.random();
        let tile2Col=j-(2*tileLength);
        if(r2<0.5){
          cellValue=leftPattern[i][tile2Col];
        }
        else{
          cellValue=rightPattern[i][tile2Col];
        }
      }
      if(i<leftPattern.length && j>=3*tileLength && j<rightStart){ // 62-71 generate tile 3 pattern
        let r3=Math.random();
        let tile3Col=j-(3*tileLength);
        if(r3<0.25){
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
}