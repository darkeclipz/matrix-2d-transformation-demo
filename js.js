var canvas, context, width, height, baseX, baseY, grid;

function initCanvas() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
    console.log('Canvas initialized.');
}

function setCanvasSize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    baseX = width/2;
    baseY = height/2;
    grid = 32;
    console.log('Canvas size set to width: ' + width + ' and height: ' + height);
}

function drawPoint(x, y) {
    context.fillRect(x, y, 1, 1);
}

function drawLine(ax, ay, bx, by) {
    context.beginPath();
    context.moveTo(ax, ay);
    context.lineTo(bx, by);
    context.lineWidth = 1;
    context.stroke();
}

function drawVect(v) {
    drawLine(baseX, baseY, Math.round(baseX + v.x * grid), Math.round(baseY - v.y * grid));
    drawText(baseX + v.x * grid + 10, baseY - v.y * grid + 10, '(' + Math.round(v.x) + ', ' + Math.round(v.y) + ')');
}

function drawText(x, y, text) {
    context.fillText(text, x, y);
}

function setColor(color) {
    context.strokeStyle = color;
    context.fillStyle = color;
}

function setFont(font) {
    context.font = font;
}

function plotAll(vectors) {
    for(var i=0;i<vectors.length;i++)
    {
        drawPoint(vectors[i].x, vectors[i].y);
    }
}

function drawGrid() {
    drawLine(baseX,0,baseX,height);
    drawLine(0,baseY,width,baseY);
    drawText(baseX+5,baseY-5,"(0,0)");
}

function drawCopyright() {
    setColor('white');
    drawText(15, 25, "Linear Algebra - 2D Transformation Demo");
    drawText(17, height-20, "© Darky (2017)");
}

function clear() {
    var color = context.fillStyle;
    context.fillStyle = 'black';
    context.fillRect(0,0,width,height);
    context.fillStyle = color;
}

$(document).ready(function() {
    // Init
    initCanvas();
    setCanvasSize();
    setFont('9px Arial');

    // Generate 400 vectors
    var m = new Matrix([]);
    for(var i=-10;i<=10;i++) {
        for(var j=-10;j<=10;j++) {
            m.entries.push(new Vec2(i,j));
        }
    }

    // Animation settings
    var fps = 60;
    var animateFrame = 1;
    draw();

    function draw() {
        // Change the transformation matrix each time the screen is drawn based on animateFrame.
        // It will oscillate around the sin/cos functions; it are just some random numbers 
        // to change the oscillation speed and amplitude to get a nice effect. (And yes, they are mixed up)
        var transform = new Matrix([new Vec2(1 + Math.sin(animateFrame/200) * 2 / 3, Math.cos(animateFrame/100))
                                    , new Vec2(Math.sin(animateFrame/1000)           , 1 + Math.cos(animateFrame/200) / 3)]);
        
        // Apply linear transformation 
        m2 = m.multiply(transform);

        // Reset it
        clear();
        drawCopyright();
        drawGrid();

        // Draw all the transformed vectors in m2
        for(var i=0; i<m2.entries.length; i++)
        {
            var intensity = i / m2.entries.length * 200 + 55;
            setColor('rgb(0,'+ Math.round(intensity) +',255)');
            drawVect(m2.entries[i].scale(1.5));
        }
        
        // Draw transformation vectors
        setColor('yellow');
        drawVect(transform.entries[0]);
        drawVect(transform.entries[1]);

        // Next animation
        animateFrame++;
        setTimeout(draw, 1000/fps);
    }
});

function Vec2(x, y) {
    this.x = x;
    this.y = y;
    this.add = function(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }
    this.subtract = function(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }
    this.scale = function(scalar) {
        return new Vec2(this.x * scalar, this.y * scalar);
    }
    this.multiply = function(v) {
        return new Vec2(this.x * v.x, this.y * v.y);
    }
}

function Matrix(entries) {
    this.entries = entries;
    this.add = function(vec) {
        var m = new Matrix([]);
        for(var i=0; i < this.entries.length; i++) {
            m.entries.push(new Vec2(this.entries[i].x + vec.x, this.entries[i].y + vec.y));
        }
        return m;
    }
    this.subtract = function(vec) {
        return this.add(new Vec(vec.x * -1, vec.y * -1));
    }
    this.multiply = function(matrix) {
        var m = new Matrix([]);
        for(var i=0; i < this.entries.length;i++) {
            var v = new Vec2(matrix.entries[0].x * this.entries[i].x + matrix.entries[1].x * this.entries[i].y, 
                                matrix.entries[0].y * this.entries[i].x + matrix.entries[1].y * this.entries[i].y);

            m.entries.push(v);
        }
        return m;
    }
    this.scale = function(scalar) {
        var m = new Matrix([]);
        for(var i=0; i < this.entries.length; i++) {
            m.entries.push(new Vec2(this.entries[i].x * scalar, this.entries[i].y * scalar));
        }
        return m;
    };
}