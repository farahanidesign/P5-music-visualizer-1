// Created by Mehdi Farahani / 2023
// A music visualizer based on the Persian calligraphy & Persian music


var song;
var fft;
var particles = [];
var img;
var noonImage;
var imgWidth = 90;
var imgHeight = 90;
var isPlaying = false;
var currentMovement = 0;
var movementPatterns = [];
var noonFrame = -1;
var lastColorChangeTime = 0;
var colors = []; 
var currentColorIndex = 4;

function preload() {
  song = loadSound('parviz.mp3');
  img = loadImage('2-0.png');
  noonImage = loadImage('noon.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);
  rectMode(CENTER);
  fft = new p5.FFT();
  song.onended(songEnded);

  // Define colors using the color() function and store them in the colors array
  colors.push(color(255, 0, 0)); // Red
  colors.push(color(0, 255, 0)); // Green

  movementPatterns.push({
    update: function(particle) {
      particle.target = createVector(random(-width / 2, width / 2), random(-height / 2, height / 2));
      particle.update();
    }
  });

  movementPatterns.push({
    update: function(particle) {
      var angle = map(particle.index, 0, particles.length, 0, 360);
      var radius = width / 2;
      var x = radius * cos(angle);
      var y = radius * sin(angle);
      var z = sin(frameCount * 2 + particle.index) * width / 4;
      particle.target = createVector(x, y, z);
      particle.update();
    }
  });

  setMovementPattern();
  setInterval(setMovementPattern, 3000);

  for (var i = 0; i < 1000; i++) {
    particles.push(new Particle(i));
  }
}

function draw() {
  background(0); // Set background color to black

  fft.analyze();
  var volume = fft.getEnergy(70, 70);

  for (var i = 0; i < particles.length; i++) {
    var particle = particles[i];
    movementPatterns[currentMovement].update(particle);
    particle.updateColor(volume);
    particle.display();
  }

  // Check if it's time to display the "noon" image
  if (frameCount == 5 * 60) { // Assuming 60 frames per second
    noonFrame = frameCount;
  }

  // Display the "noon" image and make it rotate
  if (noonFrame >= 0) {
    push();
    translate(0, 0, 0); // Center of the canvas
    rotateX(frameCount * 2.2); // Rotate around X-axis
    rotateY(frameCount * 2.2); // Rotate around Y-axis
    rotateZ(frameCount * 2.2); // Rotate around Z-axis
    tint(255, map(volume, 0, 100, 0, 100)); // Change tint based on music tempo
    var noonSize = 120; // Set the desired size of the "noon" image
  scale(noonSize / imgWidth); // Adjust the scale based on the desired size
    image(noonImage, -imgWidth / 5, -imgHeight / 5, imgWidth, imgHeight);
    pop();
  }
}

function mouseClicked() {
  if (isPlaying) {
    song.pause();
    noLoop();
    isPlaying = false;
  } else {
    song.play();
    loop();
    isPlaying = true;
  }
}

function songEnded() {
  song.stop();
  noLoop();
  isPlaying = false;
}

function setMovementPattern() {
  currentMovement = floor(random(movementPatterns.length));
}

class Particle {
  constructor(index) {
    this.index = index;
    this.position = createVector(random(-width / 2, width / 2), random(-height / 2, height / 2));
    this.target = createVector(0, 0, 0);
    this.velocity = createVector(0, 0, 0);
    this.acceleration = createVector(0, 0, 0);
    this.maxForce = 0.05;
    this.maxSpeed = 2;
    this.originalColor = color(random(600), random(0), random(50));
    this.color = this.originalColor;
    this.scale = 1;
  }

  update() {
    var desired = p5.Vector.sub(this.target, this.position);
    var distance = desired.mag();
    var speed = this.maxSpeed;
    if (distance < 100) {
      speed = map(distance, 0, 100, 0, this.maxSpeed);
    }
    desired.setMag(speed);
    var steering = p5.Vector.sub(desired, this.velocity);
    steering.limit(this.maxForce);
    this.acceleration.add(steering);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  updateColor(volume) {
    var c;
    if (volume > 200) {
      c = color(0, random(255), random(255)); // Set color to a random mix of blue and green
    } else {
      c = this.originalColor; // Set color to the original random color
    }
    this.color = c;
  }

  display() {
    push();
    translate(this.position.x, this.position.y, this.position.z);
    rotateX(frameCount * 5.5 + this.index * 0.1);
    rotateY(frameCount * 0.3 + this.index * 0.1);
    rotateZ(frameCount * 0.3 + this.index * 0.1);
    scale(this.scale);
    noStroke();
    tint(this.color);
    image(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
    pop();
  }
}
