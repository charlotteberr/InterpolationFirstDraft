let rows=6;
let cols=30;
let cellSize=10;
const uiTop=10;
const canvasTop=165;

let structures;
let currentPatternA="random";
let currentPatternB="random";
let canvasElement;

let patternALabel, patternBLabel, middleLabel, blendCenterLabel, changePatternSizeLabel;
let patternAInput, patternBInput, middleInput, blendCenterInput, changePatternSizeInput, verticalCheckbox, helpText, blendCenterHelpText;
let middleColumnCount=18;
let blendCenterPercent=50;
let isVertical=false;
let changePatternSize=0;

function setup(){
  canvasElement=createCanvas(cols*cellSize,rows*cellSize);

  patternALabel=createP("Pattern A:");
  patternAInput = createInput(currentPatternA);
  patternAInput.input(updatePatternSelection);

  patternBLabel=createP("Pattern B:");
  patternBInput = createInput(currentPatternB);
  patternBInput.input(updatePatternSelection);

  middleLabel=createP("Blend region length (ends):");
  middleInput = createInput(String(middleColumnCount));
  middleInput.input(updateBlendRegionLength);

  blendCenterLabel=createP("Blend center %:");
  blendCenterInput = createInput(String(blendCenterPercent));
  blendCenterInput.input(updateBlendCenter);

  changePatternSizeLabel=createP("Change pattern size:");
  changePatternSizeInput = createInput(String(changePatternSize));
  changePatternSizeInput.input(updatePatternSizeChange);

  verticalCheckbox=createCheckbox("Vertical", isVertical);
  verticalCheckbox.changed(updateVertical);

  blendCenterHelpText=createP("Shift blend center with right and left arrow keys. Change pattern size with up and down.");
  blendCenterHelpText.style("border","1px solid #c8c8c8");
  blendCenterHelpText.style("background","#efefef");
  blendCenterHelpText.style("padding","4px 8px");
  blendCenterHelpText.style("font-weight","400");
  helpText = createP("Possible patterns: (loading...)");

  updateControlPositions();
  updateBlendRegionLength();
}

function applyCanvasSize(){     // make canvas vertical or horizontal based on isVertical bool
  if(!isVertical){
    resizeCanvas(cols*cellSize,rows*cellSize);
  }
  else{
    resizeCanvas(rows*cellSize,cols*cellSize);
  }
  updateControlPositions();
}

function updateControlPositions(){    // put inputs on top of pattern
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

  changePatternSizeLabel.position(780, uiTop + 70);
  changePatternSizeInput.position(780, uiTop + 105);

  verticalCheckbox.position(970, uiTop + 105);

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

function getAdjustedCommonSize(patternA,patternB){    // find LCM and add or subtract the change in pattern size
  let commonW=lcm(patternA[0].length,patternB[0].length);
  let commonH=lcm(patternA.length,patternB.length);
  commonW=commonW+changePatternSize;
  commonH=commonH+changePatternSize;
  commonW=Math.max(1,commonW);
  commonH=Math.max(1,commonH);
  return {commonW,commonH};
}

function repeatPatternToSize(pattern,targetH,targetW){    // Two different sized patterns repeated to fit LCM height and width array
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

function updatePatternSelection(){     // Update patterns with what user picked
  let patternAName=patternAInput.value().trim();
  let patternBName=patternBInput.value().trim();
  if (structures && structures.patterns[patternAName]) {
    currentPatternA=patternAName;
  }
  if (structures && structures.patterns[patternBName]) {
    currentPatternB=patternBName;
  }
  updateBlendRegionLength();
}

function updateBlendCenter(){    // updates blend center % location
  let v=Math.floor(Number(blendCenterInput.value()));
  if(v<0){
    v=0;
  }
  if(v>100){
    v=100;
  }
  else{
    blendCenterPercent=v;
  }
  blendCenterInput.value(String(blendCenterPercent));
}

function updatePatternSizeChange(){
  let raw=changePatternSizeInput.value().trim();
  if(raw==="" || raw==="-"){
    return;
  }
  let v=Math.floor(Number(raw));
  if(Number.isNaN(v)){
    return;
  }
  changePatternSize=v;
  changePatternSizeInput.value(String(changePatternSize));
  updateBlendRegionLength();
}

function updateVertical(){
  isVertical=verticalCheckbox.checked();
  applyCanvasSize();
}

function updateBlendRegionLength(){
  let value=Math.floor(Number(middleInput.value()));
  if (structures){
    let patternA=structures.patterns[currentPatternA];
    let patternB=structures.patterns[currentPatternB];
    let {commonW,commonH}=getAdjustedCommonSize(patternA,patternB);
    if(Number.isNaN(value) || value<0){
      value=0;
    }
    middleColumnCount=value;
    middleInput.value(String(middleColumnCount));
    rows=commonH;
    cols=commonW+commonW+middleColumnCount;
    applyCanvasSize();
  } 
  else if (value>=0) {
    middleColumnCount=value;
  }
}

function keyPressed(){     // left and right for blend location. up and down for size
  if(keyCode===LEFT_ARROW && !isVertical){
    blendCenterPercent=Math.max(0,blendCenterPercent-10);
    blendCenterInput.value(String(blendCenterPercent));
  }
  if(keyCode===RIGHT_ARROW && !isVertical){
    blendCenterPercent=Math.min(100,blendCenterPercent+10);
    blendCenterInput.value(String(blendCenterPercent));
  }
  if(keyCode===UP_ARROW && !isVertical){
    changePatternSize+=1;
    changePatternSizeInput.value(String(changePatternSize));
    updateBlendRegionLength();
  }
  if(keyCode===DOWN_ARROW && !isVertical){
    changePatternSize-=1;
    changePatternSizeInput.value(String(changePatternSize));
    updateBlendRegionLength();
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

  let patternAOrg=structures.patterns[currentPatternA];  //original patterns
  let patternBOrg=structures.patterns[currentPatternB];
  let {commonW,commonH}=getAdjustedCommonSize(patternAOrg,patternBOrg);  // LCM and change pattern size input added
  let patternA=repeatPatternToSize(patternAOrg,commonH,commonW);
  let patternB=repeatPatternToSize(patternBOrg,commonH,commonW);
  let patternBStart=cols-commonW;
  let middleLength=patternBStart-commonW;
  let fullTileCount=Math.floor(middleLength/commonW);   // full tile count and where to put remainder
  let remainder=middleLength%commonW;
  let leftFullTileCount=Math.floor(fullTileCount/2);
  let leftFullWidth=leftFullTileCount*commonW;
  let remainderStart=leftFullWidth;
  let remainderEnd=remainderStart+remainder;
  let center=0;
  if(fullTileCount>0){
    center=(blendCenterPercent/100)*(fullTileCount-1);   // find blend center
  }
  let cellValue=0;

  if(!isVertical){
    for(let i=0;i<rows;i++){
      for(let j=0;j<cols;j++){
        if (j<commonW){    // left pattern
          cellValue=patternA[i][j];
        }
        else if (j>=patternBStart){  // right pattern
          let patternBCol=j-patternBStart;
          cellValue=patternB[i][patternBCol];
        }
        else if (j>=commonW && j<patternBStart){   // blend region
          let middleCol=j-commonW;
          let usePatternA=false;

          if(middleCol>=remainderStart && middleCol<remainderEnd){ // center remainder always A/B alternating
            let remainderCol=middleCol-remainderStart;
            usePatternA=(remainderCol%2===0);
          }
          else{
            let tileIndex=0;
            let colInTile=0;
            if(middleCol<remainderStart){
              tileIndex=Math.floor(middleCol/commonW);
              colInTile=middleCol%commonW;
            }
            else{
              let rightCol=middleCol-remainderEnd;
              tileIndex=leftFullTileCount+Math.floor(rightCol/commonW);
              colInTile=rightCol%commonW;
            }
            let distance=Math.floor(Math.abs(tileIndex-center));  // distance from center
            let isPatternASide=tileIndex<center;
            let isPatternBSide=tileIndex>center; 
            let stripeSpacing=2+distance;    // how far from center determines how often to flip. alternating (2) minimum amount
            let useOpposite=((colInTile+1)%stripeSpacing===0);   // if remainder=0 then switch. dividing by bigger number, less often to switch
            if(!isPatternASide && !isPatternBSide){
              usePatternA=(colInTile%2===0);  // directly center A/B alternating
            }
            else if(isPatternASide){
              usePatternA=!useOpposite;
            }
            else{
              usePatternA=useOpposite;
            }
            if(usePatternA){
              cellValue=patternA[i][colInTile];
            }
            else{
              cellValue=patternB[i][colInTile];
            }
          }
          if(middleCol>=remainderStart && middleCol<remainderEnd){
            let centerCol=(middleCol-remainderStart)%commonW;
            if(usePatternA){
              cellValue=patternA[i][centerCol];
            }
            else{
              cellValue=patternB[i][centerCol];
            }
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
  else{
    for(let i=0;i<cols;i++){
      for(let j=0;j<rows;j++){
        
        if (i<commonW){    // top pattern
          cellValue=patternA[j][i];
        }
        else if (i>=patternBStart){  // bottom pattern
          let patternBCol=i-patternBStart;
          cellValue=patternB[j][patternBCol];
        }
        else if (i>=commonW && i<patternBStart){   // blend region
          let middleCol=i-commonW;
          let usePatternA=false;

          if(middleCol>=remainderStart && middleCol<remainderEnd){ 
            let remainderCol=middleCol-remainderStart;
            usePatternA=(remainderCol%2===0);
          }
          else{
            let tileIndex=0;
            let colInTile=0;
            if(middleCol<remainderStart){
              tileIndex=Math.floor(middleCol/commonW);
              colInTile=middleCol%commonW;
            }
            else{
              let rightCol=middleCol-remainderEnd;
              tileIndex=leftFullTileCount+Math.floor(rightCol/commonW);
              colInTile=rightCol%commonW;
            }
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
            if(usePatternA){
              cellValue=patternA[j][colInTile];
            }
            else{
              cellValue=patternB[j][colInTile];
            }
          }
          if(middleCol>=remainderStart && middleCol<remainderEnd){
            let centerCol=(middleCol-remainderStart)%commonW;
            if(usePatternA){
              cellValue=patternA[j][centerCol];
            }
            else{
              cellValue=patternB[j][centerCol];
            }
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
}
