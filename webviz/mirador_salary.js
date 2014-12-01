var salary = new p5(function(g) {
  // var dataFileURL = "http://fathom.info/wp-content/uploads/2014/12/mirador-salary.csv";
  var dataFileURL = "mirador-salary.csv";

  var topMargin = 50;
  var bottomMargin = 20;
  var leftMargin = 10;
  var rightMargin = 40;
  var monthSpacing = 30;
  var monthWidth = 150;
  var curveWidth = 120;
  var curveSpacing = 75; 

  var WIDTH = monthWidth + 3 * curveWidth + 2 * curveSpacing + rightMargin;
  var HEIGHT = topMargin + 12 * monthSpacing + bottomMargin;

  var table = null;
  var count = 0;
  var minSalary = 0, maxSalary = 0;
  var minCount = 0, maxCount = 0;
  var minCountNonUS = 0, maxCountNonUS = 0;
  var months = [];
  var salaries = [];
  var counts = [];
  var countsNonUS = [];

  var selected0 = -1;
  var selected = 6;
  var selFact = null;

  var softfs = [];

  var textName = "Arial";
  var textSize = 14;

  var minRadius = 5; 
  var maxRadius = 8;

  var selColor = g.color(39, 141, 210);
  var monthColor = g.color(157, 207, 240);

  var ready = false;

  g.setup = function() {
    g.createCanvas(WIDTH, HEIGHT);
    g.loadTable(dataFileURL, "header", "csv", g.completed);

    g.textFont(textName);
    g.textSize(textSize);
   
    selFact = new SoftFloat(1);
    softfs.push(selFact);
    selFact.damping = 0.3;
  };

  // This function runs when the (async) table loads concludes.
  g.completed = function(results) {
    table = results;

    count = table.rows.length;
    for (var i = 0; i < count; i++) {
      months[i] = table.rows[i].getString("Month");
      salaries[i] = parseFloat(table.rows[i].getString("Median"));
      counts[i] = parseInt(table.rows[i].getString("Count"));
      countsNonUS[i] = parseInt(table.rows[i].getString("Count non-US"));
      minSalary = Math.min(minSalary, salaries[i]);
      maxSalary = Math.max(maxSalary, salaries[i]);    
      minCount = Math.min(minCount, counts[i]);
      maxCount = Math.max(maxCount, counts[i]);    
      minCountNonUS = Math.min(minCountNonUS, countsNonUS[i]);
      maxCountNonUS = Math.max(maxCountNonUS, countsNonUS[i]);  
    }
  
    for (var i = 0; i < count; i++) {
      salaries[i] = g.map(salaries[i], minSalary, maxSalary, 0, 1);
      counts[i] = g.map(counts[i], minCount, maxCount, 0, 1);
      countsNonUS[i] = g.map(countsNonUS[i], minCountNonUS, maxCountNonUS, 0, 1);
    }

    ready = true;
  }

  g.draw = function() {
    if (!ready) {
      g.background(255);
      g.noStroke();
      g.text("Loading...", 0, 20);
      return;
    }

    g.background(255);
    for (var i = 0; i < softfs.length; i++) softfs[i].update();
    
    g.push();
    g.fill(0, 0, 0, 100);
    g.textStyle(g.BOLD);
    g.noStroke();
    g.text("Month", leftMargin, topMargin - 20);
    g.text("Median salary", monthWidth, topMargin - 20);
    g.text("U.S. born players", monthWidth + curveWidth + curveSpacing, topMargin - 20);
    g.text("Non-U.S. born players", monthWidth + 2 * curveWidth + 2 * curveSpacing, topMargin - 20);
    g.textStyle(g.NORMAL);
    g.pop();
  
    g.noStroke();
    var my = topMargin;    
    for (var i = 0; i < count; i++) {
      if (i % 2 == 0) {
        g.fill(242);
      } else {
        g.fill(255);
      }
      g.rect(0, my, monthWidth - 30, monthSpacing);
      my += monthSpacing;
    }

    my = topMargin;    
    for (var i = 0; i < count; i++) {      
      var y0 = my + monthSpacing - textSize/2;
      if (i == selected) {
        g.fill(0, g.map(selFact.get(), 0, 1, 0.2, 1) * 255);
      } else {
        g.fill(0, 0.2 * 255);
      }      
      g.text(months[i], leftMargin, y0 - 2);
      my += monthSpacing;
    }

    g.drawCurve(salaries, monthWidth);
    g.drawCurve(counts, monthWidth + curveWidth + curveSpacing);
    g.drawCurve(countsNonUS, monthWidth + 2 * curveWidth + 2 * curveSpacing);

    g.push();
    g.noStroke();
    g.fill(0, 0, 0, 255 * selFact.get());
    var vx = monthWidth;
    var vy = topMargin + (selected + 1) * monthSpacing - textSize/2;
    var salary = g.map(salaries[selected], 0, 1, minSalary, maxSalary);
    g.text("$" + g.nfc(parseInt(salary), 0), vx + curveWidth * salaries[selected] + 7, vy - 2);
    vx += curveWidth + curveSpacing;
    var countUS = g.map(counts[selected], 0, 1, minCount, maxCount);
    g.text(g.nfc(parseInt(countUS), 0), vx + curveWidth * counts[selected] + 7, vy - 2);
    vx += curveWidth + curveSpacing;
    var countNonUS = g.map(countsNonUS[selected], 0, 1, minCountNonUS, maxCountNonUS);
    g.text(g.nfc(parseInt(countNonUS), 0), vx + curveWidth * countsNonUS[selected] + 7, vy - 2);
    g.pop();
  };

  g.mouseMoved = function() {
    selected0 = selected;  
  
    for (var i = 0; i < count; i++) {
      var y1 = topMargin + i * monthSpacing + textSize/2;
      var y0 = 0 < i ? y1 - monthSpacing : y1 - textSize/2;
      if (y0 <= g.mouseY && g.mouseY <= y1) {
        selected = i;
        break;
      }
    }
  
    var y = topMargin;
    for (var i = 0; i < count; i++) {
      if (y <= g.mouseY && g.mouseY <= y + monthSpacing) {
        selected = i;
        break;
      }
      y += monthSpacing;
    }
  
    if (selected != -1 && selected0 != selected) {
      selFact.set(0);
      selFact.setTarget(1);
    }
  }

  g.drawCurve = function(values, x0) {
    var th = count * monthSpacing; 

    g.noStroke();
    var y = topMargin;
    for (var i = 0; i < count; i++) {
      if (i % 2 == 0) {
        g.fill(242);
      } else {
        g.fill(255);
      }
      g.rect(x0, y, curveWidth + 20, monthSpacing);
      y += monthSpacing;
    }
      
    y = topMargin;
    g.noFill();
    g.stroke(150);
    g.beginShape();  
    g.curveVertex(x0 + curveWidth * values[0], y + monthSpacing/2);  
    for (var i = 0; i < count; i++) {
      g.curveVertex(x0 + curveWidth * values[i], y + monthSpacing/2);
      y += monthSpacing;
    }
    g.curveVertex(x0 + curveWidth * values[count - 1], y - monthSpacing/2);
    g.endShape();
    
    y = topMargin;
    g.noStroke();
    for (var i = 0; i < count; i++) {
      var r = 5;
      if (i == selected) {
        g.fill(selColor);
        r = g.map(selFact.get(), 0, 1, minRadius, maxRadius);
      } else {
        g.fill(150);
      }
      g.ellipse(x0 + curveWidth * values[i], y + monthSpacing/2, r, r);
      y += monthSpacing;
    } 
  }

  // g.drawSelection = function() {
  //   g.fill(220, selFact.get() * 180);
  //   g.rect(0, topMargin + selected * monthSpacing, g.width, monthSpacing);    
  // }

  g.empty = function(x) {
    return x === undefined || x === null;
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // SoftFloat class definition

  function SoftFloat(v) {
    this.attraction = 0.1;
    this.damping = 0.5;

    this.value = v;
    this.velocity = 0;
    this.acceleration = 0;
  
    this.targeting = false;
    this.target = v;
  }
  
  SoftFloat.prototype.update = function() {
    if (this.targeting) {
      this.acceleration += this.attraction * (this.target - this.value);
      this.velocity = (this.velocity + this.acceleration) * this.damping;
      this.value += this.velocity;
      this.acceleration = 0;
      if (Math.abs(this.velocity) > 0.0001 && Math.abs(this.target - this.value) >= 0) {
        return true; // still updating
      }    
      this.value = this.target; // arrived, set it to the target value to prevent rounding error
      this.targeting = false;
    }
    return false;
  }

  SoftFloat.prototype.setTarget = function(t) {
    this.targeting = true;
    this.target = t;
  }
  
  SoftFloat.prototype.set = function(v) {
    this.value = v;
  }
  
  SoftFloat.prototype.get = function() {
    return this.value;
  }
});