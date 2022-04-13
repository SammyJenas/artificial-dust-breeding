// Artificial Dust Breeding
// Sammy Jenas
// April 2022
// Beta 1.0

let img;
let imgW = 1200;
let imgH = 600;
let cols;
let rows;
let cell;
let cellSize = 4;
let pix;
let alph;
let swept;
let plaster;
let CPU;
let counter;
let counterCheck;
let font1;
let ready = false;
let dust;
let caption = 'DUST TO DUST - ';

function preload() {
  plaster = loadImage('images/Rough_plaster_v3.png');
  CPU = loadImage('images/486_CPU_bw_v2.png');
}

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  dust.restart();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noCursor();
  img = createImage(imgW, imgH);
  plaster.resize(imgW, imgH);
  CPU.resize(imgW, imgH);
  plaster.loadPixels();
  CPU.loadPixels();
  font1 = loadFont('AcPlus_IBM_VGA_8x16.ttf', ready = true);
  textFont(font1);
  cols = imgW / cellSize;
  rows = imgH / cellSize;
  dust = new Cell();
  pix = new Array(imgW * imgH);
  alph = new Array(imgW * imgH);
  counter = 0;
}

function draw() {

  dust.config();

  img.loadPixels();
  for (let x = 0; x < imgW; x++) {
    for (let y = 0; y < imgH; y++) {
      let indexPix = x + y * imgW;
      let index = (x + y * imgW) * 4;
      if (pix[indexPix] == 1) {
        // set pixels for living cells
        img.pixels[index] = plaster.pixels[index];
        img.pixels[index + 1] = plaster.pixels[index + 1];
        img.pixels[index + 2] = plaster.pixels[index + 2];
        img.pixels[index + 3] = alph[indexPix];
      } else if (pix[indexPix] == 0) {
        // set pixels for dead cells
        img.pixels[index] = CPU.pixels[index];
        img.pixels[index + 1] = CPU.pixels[index + 1];
        img.pixels[index + 2] = CPU.pixels[index + 2];
        img.pixels[index + 3] = alph[indexPix];
      }  
    }
  }
  img.updatePixels();

  imageMode(CENTER);
  if (frameCount < 10) {
    image(CPU, width / 2, height / 2);
    dust.restart();
  } else {
    image(img, width / 2, height / 2);
  }

  counterCheck = counter;

  dust.generation();
  dust.borders();

  // death check
  if (counterCheck == counter) {
    dust.restart();
  }

  // canvas borders
  fill(0);
  noStroke(0);
  // top horizontal
  rect(0, 0, width, height / 2 - imgH / 2);
  // bottom horizontal
   rect(0, height / 2 + imgH / 2, width, height / 2 - imgH / 2);
  // left vertical
  rect(0, 0, width / 2 - imgW / 2, height);
  // right vertical
  rect(width / 2 + imgW / 2, 0, width / 2 - imgW / 2, height);

  // text
  if (ready){
  fill(255);
  textSize(20);
  textAlign(LEFT);
  text(caption, width / 2 - imgW / 2 + 4, height / 2 + imgH /2 + 50);
  text(counter, width / 2 - imgW / 2 + 4 + textWidth(caption), height / 2 + imgH /2 + 50);
  }
}


class Cell {

  constructor() {
    // build the initial grid with random 1s and 0s 
    this.current = make2DArray(cols, rows);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        this.current[i][j] = floor(random(2));
      }
    }
    // build the duration grid
    this.duration = make2DArray(cols, rows);

    // build the previous grid
    this.previous = make2DArray(cols, rows);
  }

  config() {
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        // use current to calculate next generation
        this.previous[x][y] = this.current[x][y];
        if (this.current[x][y] == 1) {
          // for the living cells 
          let cornerX = x * cellSize;
          let cornerY = y * cellSize;
          for (let i = cornerX; i < cornerX + cellSize; i++) {
            for (let j = cornerY; j < cornerY + cellSize; j++) {
              let index = i + j * imgW;
              pix[index] = 1;
              alph[index] = 255 - this.duration[x][y];
            }
          }
        } else {
          // for the dead cells
          let cornerX = x * cellSize;
          let cornerY = y * cellSize;
          for (let i = cornerX; i < cornerX + cellSize; i++) {
            for (let j = cornerY; j < cornerY + cellSize; j++) {
              let index = i + j * imgW;
              pix[index] = 0;
              alph[index] = this.duration[x][y];
            }
          }
        }
      }
    }
  }

  generation() {
    // calculate neighbours for the current generation
    // skipping edge cells (could replace with wrap-around?)
    for (let x = 1; x < cols - 1; x++) {
      for (let y = 1; y < rows - 1; y++) {
        // neighbour counter
        let neighbours = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            // add up all neighbours
            neighbours += this.previous[x + i][y + j];
          }
        }
        // subtract the cell's own state
        neighbours -= this.previous[x][y];
        // implement the rules of Life
        if (this.previous[x][y] == 1) {
          // for all living cells
          if (neighbours < 2 | neighbours > 3) {
            // cell is dead & reset duration to 0
            this.current[x][y] = 0;
            this.duration[x][y] = 0;
            counter ++;
          } else {
            // counting duration of life
            // stasis cells not changed (previous = current above)
            if (this.duration[x][y] < 255) {
              // increase counter for cells continuing in life
              this.duration[x][y]++;
            }
          }
        } else {
          // for all dead cells
          if (neighbours == 3) {
            // cell is reborn & reset duration to 0
            this.current[x][y] = 1;
            this.duration[x][y] = 0;
          } else {
            // increase duration for all cells continuing in death
            // what is this doing?
            if (this.duration[x][y] < 255) {
              this.duration[x][y]++;
            }
          }
        }
      }
    }

  }

  borders() {
    // black borders for the edges
    let imgX = width / 2 - imgW / 2;
    let imgY = height / 2 - imgH / 2;
    fill(0);
    // noStroke();
    stroke(1);
    // top horizontal
    rect(imgX, imgY, imgW, cellSize);
    // bottom horizontal
    rect(imgX, imgY + imgH - cellSize, imgW, cellSize);
    // left vertical
    rect(imgX, imgY, cellSize, imgH);
    // right vertical
    rect(imgX + imgW - cellSize, imgY, cellSize, imgH);
  }

  restart() {
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        this.duration[x][y] = 0;
        this.current[x][y] = floor(random(2));
      }
    }

  }

}
