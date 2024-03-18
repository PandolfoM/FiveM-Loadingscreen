/* ========== Prepare the Canvas ========== */
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
$(window).on("resize", function () {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
});

// ========== Default ========== \\
particles = [];
num_particles = 150;
distance = 100;
speed = 0.15;
radius = 3;
lineWidth = 1;
particleColor = "#bb9af7";
lineColor = "#777777";
backgroundColor = "#000";
// ========== Default END ========== \\

// ========== Controls Menu ========== \\
toggle = 1;
// ========== Controls Menu END ========== \\

document.getElementById("canvas").style.backgroundColor = backgroundColor;

// ========== Color Functions ========== \\
// Random Color Function
function GetRandomColor() {
  var r = 0,
    g = 0,
    b = 0;
  while (r < 100 && g < 100 && b < 100) {
    r = Math.floor(Math.random() * 256);
    g = Math.floor(Math.random() * 256);
    b = Math.floor(Math.random() * 256);
  }
  return "rgb(" + r + "," + g + "," + b + ")";
}

// Convert Hex to RGB Values
function hexToRGB(hex) {
  var hashed = hex.charAt(0) == "#" ? hex.substring(1, 7) : hex;
  var R = parseInt(hashed.substring(0, 2), 16);
  var G = parseInt(hashed.substring(2, 4), 16);
  var B = parseInt(hashed.substring(4, 6), 16);
  var RGB = `rgb(${R}, ${G}, ${B})`;
  // I used a array here to return the Color Values separated.
  // Original Function: https://codepen.io/Tibixx/pen/RJbjBE
  return [R, G, B]; //RGB;
}
// ========== Color Functions END ========== \\

// ========== Particles ========== \\
// Particle Properties
Particle = function () {
  this.x = ctx.canvas.width * Math.random();
  this.y = ctx.canvas.height * Math.random();
  this.vx = speed * 2 * Math.random() - speed;
  this.vy = speed * 2 * Math.random() - speed;
  if (particleColor == "") {
    this.Color = GetRandomColor();
  } else {
    this.Color = particleColor;
  }
};

// Draw the Particle
Particle.prototype.Draw = function (ctx) {
  ctx.fillStyle = this.Color;
  ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
  ctx.fill();
};

// Canvas Collision
Particle.prototype.Update = function () {
  this.x += this.vx;
  this.y += this.vy;

  if (this.x < 0 + radius || this.x + radius > canvas.width) this.vx = -this.vx;

  if (this.y - radius < 0 || this.y + radius > canvas.height)
    this.vy = -this.vy;
};
// ========== Particles END ========== \\

// Function to get the Distance between Particles
function dist(x1, x2, y1, y2) {
  var a = x1 - x2;
  var b = y1 - y2;

  var c = Math.sqrt(a * a + b * b);
  return c;
}

// The Animation Loop
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < num_particles; i++) {
    //console.log(i+" "+particles[i].x)
    for (var j = 0; j < num_particles; j++) {
      // For each Particle get the Distance between all other Particles
      eachPartDist = dist(
        particles[j].x,
        particles[i].x,
        particles[j].y,
        particles[i].y
      );
      // Check the Distance between all Particles
      if (eachPartDist <= distance) {
        // Calculate the percentage Distance between Particles (Used for the Opacity of the Connectors)
        proDist = 100 / distance;
        opacity = 1 - (eachPartDist * proDist) / 100;

        // Call the hexToRGB Function (The R,G,B Values are used later on for the strokeStyle)
        var rgb_col = hexToRGB(lineColor);
        r_col = rgb_col[0];
        g_col = rgb_col[1];
        b_col = rgb_col[2];

        // Start drawing the Connectors!
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.strokeStyle = `rgba(${r_col}, ${g_col}, ${b_col}, ${opacity})`;
        ctx.lineWidth = lineWidth;
        ctx.lineTo(
          particles[j].x,
          particles[j].y,
          particles[i].x,
          particles[i].y
        );
        ctx.stroke();
        ctx.closePath();
      }
    }
    particles[i].Update();
    particles[i].Draw(ctx);
  }
  requestAnimationFrame(loop);
}

for (var i = 0; i < num_particles; i++) {
  particles.push(new Particle());
}

loop();
