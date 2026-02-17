let rows=6;
let cols=30;
let cellSize=20;

let structures;
let currentLeftPattern="random";
let currentRightPattern="random"; 

let choiceGrid=[];
let copyGrid=[];

let leftInput, rightInput, middleInput, interpInput, whiteSmoothCheckbox, blackSmoothCheckbox, helpText;
let middleLengthValue=18; // default middle area width in columns
let interpPercent=50;
let smoothInterp=false;
let whiteSmooth=false;
let blackSmooth=false;

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

  createP("Middle length (columns):").position(390, height + 5); // middle length input
  middleInput = createInput(String(middleLengthValue));
  middleInput.position(390, height + 40);
  middleInput.input(updateMiddleLength);

  createP("Interpolation %:").position(600, height + 5); // interoplation zone input
  interpInput = createInput(String(interpPercent));
  interpInput.position(600, height + 40);
  interpInput.input(updateInterpolation);

  createP("Smooth Interpolation").position(820, height + 5);
  whiteSmoothCheckbox = createCheckbox("White", whiteSmooth);
  whiteSmoothCheckbox.position(820, height + 35);
  whiteSmoothCheckbox.changed(updateSmoothGradient);
  blackSmoothCheckbox = createCheckbox("Black", blackSmooth);
  blackSmoothCheckbox.position(900, height + 35);
  blackSmoothCheckbox.changed(updateSmoothGradient);

  helpText = createP("Possible patterns: (loading...)"); // list of pattern names
  helpText.position(10, height + 70);


  buildChoiceGrid();
}

function buildChoiceGrid(){     // creates a 2D array the same size as canvas
  choiceGrid=[];               // each "cell" has a probability r from 0-1
  for(let i=0;i<rows;i++){
    choiceGrid[i]=[];
    for(let j=0;j<cols;j++){
      choiceGrid[i][j]=Math.random();
    }
  }
}

function buildCopyGrid(){  // copy of filled canvas of 0 and 1
  copyGrid=[];
  for(let i=0;i<rows;i++){
    copyGrid[i]=[];
    for(let j=0;j<cols;j++){
      copyGrid[i][j]=0;
    }
  }
}

function editCopyGrid(leftW, rightStart){
  let newGrid=[];
  for(let i=0;i<rows;i++){
    newGrid[i]=[];
    for(let j=0;j<cols;j++){
      newGrid[i][j]=copyGrid[i][j];
    }
  }
  for(let i=0;i<rows;i++){
    for(let j=0;j<cols;j++){
      let topLeft=0;
      let topMiddle=0;
      let topRight=0;
      let middleLeft=0;
      let middleRight=0;
      let bottomLeft=0; 
      let bottomMiddle=0;
      let bottomRight=0;
      let totalCells=0;
      if(i-1>=0 && j-1>=0){
        topLeft=copyGrid[i-1][j-1];
        totalCells++;
      }
      if(i-1>=0){
        topMiddle=copyGrid[i-1][j];
        totalCells++;
      }
      if(i-1>=0 && j+1<cols){
        topRight=copyGrid[i-1][j+1];
        totalCells++;
      }
      if(j-1>=0){
        middleLeft=copyGrid[i][j-1];
        totalCells++;
      }
      if(j+1<cols){
        middleRight=copyGrid[i][j+1];
        totalCells++;
      }
      if(i+1<rows && j-1>=0){
        bottomLeft=copyGrid[i+1][j-1];
        totalCells++;
      }
      if(i+1<rows){
        bottomMiddle=copyGrid[i+1][j];
        totalCells++;
      }
      if(i+1<rows && j+1<cols){
        bottomRight=copyGrid[i+1][j+1];
        totalCells++;
      }
      let blackCount=topLeft+topMiddle+topRight+middleLeft+middleRight+bottomLeft+bottomMiddle+bottomRight;
      let whiteCount=totalCells-blackCount;
      if(totalCells>=6 && j>=leftW && j<rightStart){
        if(copyGrid[i][j]===0 && blackCount>=6 && blackSmooth){
          newGrid[i][j]=1;
        }
        if(copyGrid[i][j]===1 && whiteCount>=6 && whiteSmooth){  
          newGrid[i][j]=0;
        }
      }
    }
  }
  copyGrid=newGrid;
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

function updateSmoothGradient(){
  whiteSmooth = whiteSmoothCheckbox.checked();
  blackSmooth = blackSmoothCheckbox.checked();
  smoothInterp = whiteSmooth || blackSmooth;
}

function updateMiddleLength(){
  let v=Math.floor(Number(middleInput.value()));
  if (v>=0) {
    middleLengthValue=v;
  }
  if (structures){
    let leftW=structures.patterns[currentLeftPattern][0].length;
    let rightW=structures.patterns[currentRightPattern][0].length;
    cols=leftW+rightW+middleLengthValue;
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
  
  buildCopyGrid();
  
  for(let i=0;i<rows;i++){
    for(let j=0;j<cols;j++){
      let cellValue=0; // start cell as white
      let r=choiceGrid[i][j];

      let middleLength=rightStart-leftW;
      let tileW=leftW;
      let fullTileCount=Math.floor(middleLength/tileW);     // full count of tiles between left and right patterns
      let leftTileCount=Math.round(fullTileCount*(interpPercent/100));   // left FULL tiles before remainder
      // uses interpPercent to make left tiles go that percent through middle before reaching remainder
      // remainder starts right after left tiles
      let rightTileCount=fullTileCount-leftTileCount;  // right FULL tiles after remainder
      let remainder=middleLength%tileW;   // remainder left (not able to make a full tile)
      let remainderStart=leftW+(leftTileCount*tileW);  // calculate remainder start and end
      let remainderEnd=remainderStart+remainder;

      if (i<leftPattern.length && j<leftW){  // left pattern
        cellValue=leftPattern[i][j];
        copyGrid[i][j]=cellValue;
      } 
      else if (i<rightPattern.length && j>=rightStart){ // right pattern
        let rightCol=j-rightStart;
        cellValue=rightPattern[i][rightCol];
        copyGrid[i][j]=cellValue;
      }
      else if (j>=leftW && j<rightStart){ 
        if(i<leftPattern.length && j<remainderStart && leftTileCount>0){  // left tiles before remainder
          let leftTileIndex=Math.floor((j-leftW)/tileW);  // gives which left tile your in, ex. tiles are 6 columns wide, if youre 8 columns in youre in 2nd left tile, index 1
          let leftProb=0.9;
          if(interpPercent>=60 && leftTileCount>=2){  // Left tiles broken up into 70/30 to make probability grow at different rates to show zones better
            let left1Count=Math.round(leftTileCount*0.7);
            let left2Count=leftTileCount-left1Count;
            if(leftTileIndex<left1Count){
              if(left1Count>1){
                leftProb=0.9-((leftTileIndex/(left1Count-1))*0.2); // 0.9 to 0.7
                // leftTileIndex-(left1Count-1) gives number from 0-1
                // multiplied by 0.2 then subtracted from 0.9 gives probability from 90% to 70% of left pattern before remainder
                // every tile has its own probability, but each cell in that tile is evaluated seperatly running that probabilty again
              }
              else{
                leftProb=0.8;
              }
            }
            else{
              let secondIndex=leftTileIndex-left1Count;
              if(left2Count>1){
                leftProb=0.7-((secondIndex/(left2Count-1))*0.2); // 0.7 to 0.5
              }
              else{
                leftProb=0.6;
              }
            }
          }
          else{
            if(leftTileCount===1){
              leftProb=0.5;
            }
            else{
              leftProb=0.9-((leftTileIndex/(leftTileCount-1))*0.4); // 0.9 to 0.5
            }
          }
          let tileCol=j-(leftW+(leftTileIndex*tileW)); // map to pattern column
          if(r<leftProb){
            cellValue=leftPattern[i][tileCol];
            copyGrid[i][j]=cellValue;
          }
          else{
            cellValue=rightPattern[i][tileCol];
            copyGrid[i][j]=cellValue;
          }
        }
        else if(remainder>0 && i<leftPattern.length && j>=remainderStart && j<remainderEnd){ // remainder, always 50/50 chance
          let tileCol=j-remainderStart;
          if(r<0.5){
            cellValue=leftPattern[i][tileCol];
            copyGrid[i][j]=cellValue;
          }
          else{
            cellValue=rightPattern[i][tileCol];
            copyGrid[i][j]=cellValue;
          }
        }
        else if(i<leftPattern.length && j>=remainderEnd && rightTileCount>0){ // right tiles, works the same as left but probability goes 50% to 10% chance of left pattern
          let rightSideStart=remainderEnd;
          let rightTileIndex=Math.floor((j-rightSideStart)/tileW);
          let rightProb=0.1;
          if(interpPercent<=40 && rightTileCount>=2){
            let right2Count=Math.round(rightTileCount*0.7);
            let right1Count=rightTileCount-right2Count;
            if(rightTileIndex<right1Count){
              if(right1Count>1){
                rightProb=0.5-((rightTileIndex/(right1Count-1))*0.2); // 0.5 to 0.3
              }
              else{
                rightProb=0.4;
              }
            }
            else{
              let secondIndex=rightTileIndex-right1Count;
              if(right2Count>1){
                rightProb=0.3-((secondIndex/(right2Count-1))*0.2); // 0.3 to 0.1
              }
              else{
                rightProb=0.2;
              }
            }
          }
          else{
            if(rightTileCount===1){
              rightProb=0.5;
            }
            else{
              rightProb=0.5-((rightTileIndex/(rightTileCount-1))*0.4); // 0.5 to 0.1
            }
          }
          let tileCol=j-(rightSideStart+(rightTileIndex*tileW));
          if(r<rightProb){
            cellValue=leftPattern[i][tileCol];
            copyGrid[i][j]=cellValue;
          }
          else{
            cellValue=rightPattern[i][tileCol];
            copyGrid[i][j]=cellValue;
          }
        }
      }
    }
  }
  if(smoothInterp){
    editCopyGrid(leftW, rightStart);
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
  else{
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
}
