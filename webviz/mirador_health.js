var health = new p5(function(g) {
  // var urlPrefix = "http://fathom.info/wp-content/uploads/2014/11/mirador-health-";
  var urlPrefix = "mirador-health-";

  var leftMargin = 170;
  var rightMargin = 200;
  var plotWidth = 300;
  var plotHeight = 300;
  var topMargin = 40;
  var bottomMargin = 80;
  var separation = 30;
  var WIDTH = leftMargin + plotWidth + separation + rightMargin;
  var HEIGHT = topMargin + plotHeight + bottomMargin;

  var sexMap = [];
  var slsMap = [];
  var sllMap = [];
  var colorMap = [];

  var exMap = [];
  var ghMap = [];

  var probMap = [];
  var selProb = [];
  var selSex = 0;
  var selSal = 0;

  var selEx = -1;
  var selGh = -1;
  var selFact = null;

  var exProb = null;
  var ghProbEx = [];
  var ghProbNex = [];

  var sexBtns = [];
  var salBtns = [];

  var softfs = [];

  var color0 = g.color(40, 142, 209);
  var color1 = g.color(194, 228, 250);
  var labelColor = g.color(194, 228, 250);
  var buttonColor = g.color(180);

  var textName = "Arial";
  var textSize = 14;

  var lastMovement = 0;
  var selEx0 = -1;
  var selGh0 = -1;

  var elapsed = 0; 

  g.setup = function() {
    g.createCanvas(WIDTH, HEIGHT);
    g.initStringMaps();

    var selKy = sexMap[selSex] + "-" + slsMap[selSal];

    elapsed = 2 * 4;
    for (var i = 0; i < 2; i++) {
      for (var j = 0; j < 4; j++) {
        var ky = sexMap[i] + "-" + slsMap[j];
        probMap[ky] = new ProbTable(urlPrefix + ky + ".csv", ky == selKy);
        if (ky == selKy) selProb = probMap[ky];
      }
    }
  
    g.textFont(textName);
    g.textSize(textSize);
  };

  g.draw = function() {
    if (0 < elapsed) {
      g.background(255);
      g.noStroke();
      g.text("Loading...", 0, 20);
      return;
    }

    g.background(255);
    for (var i = 0; i < softfs.length; i++) softfs[i].update();

    var x, y;
    var tw = plotWidth;
    var th = plotHeight;   
  
    g.push();
    g.translate(0, topMargin);
  
    g.push();
    g.translate(leftMargin, 0);
  
    g.noFill();
    g.stroke(0);
    var w0 = tw * exProb.get(); 
    x = 0;
    y = th;
    g.stroke(255);
    for (var i = 0; i < 5; i++) {
      var p = ghProbEx[i].get();
      var h = p * th;     
      g.setFill(0, i);
      g.rect(x, y - h, w0, h);
      y -= h;
    }
  
    x += w0 + separation; 
    y = th;
    for (var i = 0; i < 5; i++) {
      var p = ghProbNex[i].get();
      var h = p * th;
      g.setFill(1, i);
      g.rect(x, y - h, tw - w0, h);
      y -= h;
    }

    // Connectors
    g.stroke(255);
    var x0 = w0;
    var x1 = w0 + separation;
    var y0 = th;
    var y1 = th;
    for (var i = 0; i < 5; i++) {
      var coli = colorMap[i];
      g.fillAlpha(coli, 125);
    
      var p0 = ghProbEx[i].get();
      var p1 = ghProbNex[i].get();
      var h0 = p0 * th;
      var h1 = p1 * th;
      var ny0 = y0 - h0;
      var ny1 = y1 - h1;
    
      g.beginShape();
      g.vertex(x0, ny0);
      g.vertex(x1, ny1);
      g.vertex(x1, y1);
      g.vertex(x0, y0);
      g.endShape(g.CLOSE);
      y0 = ny0;
      y1 = ny1;
    }

    if (selEx != -1 && selGh != -1) {
      g.fill(g.color(0, selFact.get() * 255));
      g.push(); // Style
      g.textAlign(g.CENTER);
      var p = 0;   
      if (selEx == 0) {
        p = ghProbEx[selGh].get();
        x = w0 / 2;
      } else {
        p = ghProbNex[selGh].get();
        x = w0 + separation + (tw - w0) / 2;
      }   
      y = th;
      for (var i = 0; i <= selGh; i++) {
        var pi = selEx == 0 ? ghProbEx[i].get() : ghProbNex[i].get();
        var h = Math.max(pi * th, textSize);
        y += i == selGh ? -h / 2 + textSize/2 : -h;
      }  
      g.noStroke();
      g.text(g.nfc(100 * p, 2) + "%", x, y);
      g.pop(); // Style
    }

    // X labels
    g.push(); // Style
    g.fill(0);
    g.textAlign(g.CENTER);
    g.noStroke();
    var dx = w0/2 + separation + (tw - w0)/2;
    for (var i = 0; i < 2; i++) {
      if (selEx == i) {
        if (selEx0 == i) {
          g.fill(g.color(0, 255))
        } else {
          g.fill(g.color(0, g.map(selFact.get(), 0, 1, 0.2, 1) * 255));
        } 
      } else {
        if (selEx0 == i) {
          g.fill(g.color(0, g.map(selFact.get(), 0, 1, 1, 0.2) * 255));
        } else {
          g.fill(g.color(0, 0.2 * 255));
        }
      }
      g.text(exMap[i], w0/2 + i * dx, th + textSize + 5);    
    }
    g.fill(g.color(0, 100));
    g.textStyle(g.BOLD);
    g.text("Exercise in the past 30 days", (tw + separation) / 2, th + 2 * textSize + 30);
    g.pop(); // Style
  
    g.pop();

    // Y Labels
    g.push(); // Style
    g.fill(g.color(0, 100));
    g.textAlign(g.LEFT);
    g.noStroke();
    g.textStyle(g.BOLD);
    g.text("General health", 20, th/2 - 25, 100, 50);
    g.textStyle(g.NORMAL);    
    g.textAlign(g.RIGHT);
    x = 0;
    y = th;
    for (var i = 0; i < 5; i++) {
      var p = ghProbEx[i].get();
      var h = Math.max(p * th, textSize); 
      g.noStroke();
      if (i == selGh) {
        if (selGh0 == i) {
          g.fill(g.color(0, 255))
        } else {
          g.fill(g.color(0, g.map(selFact.get(), 0, 1, 0.2, 1) * 255));
        }      
      } else {
        if (selGh0 == i) {
          g.fill(g.color(0, g.map(selFact.get(), 0, 1, 1, 0.2) * 255));
        } else {
          g.fill(g.color(0, 0.2 * 255));
        }
      }
      g.text(ghMap[i], leftMargin - 5, y - h / 2 + textSize/2);
      y -= h;
    }
    g.pop(); // Style
    g.pop();

    g.drawButtons();
    g.updateSelection();
  };

  g.mouseMoved = function() {
    if (0 < elapsed) return;

    g.updateSelection();
  }

  g.mousePressed = function() {
    if (0 < elapsed) return;

    var selSex0 = selSex;
    var selSal0 = selSal;  
    var selBtn = false;
  
    for (var i = 0; i < 2; i++) {
      var btn = sexBtns[i];
      if (btn.pressed()) {
        btn.select(sexBtns);
        selSex = i;
        selBtn = true;
        break;
      }
    }

    for (var i = 0; i < 4; i++) {
      var btn = salBtns[i];
      if (btn.pressed()) {
        btn.select(salBtns);
        selSal = i;
        selBtn = true;
        break;      
      }
    }
  
    if (selBtn) {
      if (selSex0 != selSex || selSal0 != selSal) {
        selProb = probMap[sexMap[selSex] + "-" + slsMap[selSal]];
        exProb.setTarget(selProb.getMarginal(0));  
        for (var i = 0; i < 5; i++) {
          ghProbEx[i].setTarget(selProb.getJoint(i, 0));
          ghProbNex[i].setTarget(selProb.getJoint(i, 1));
        }     
      }    
    } else if (!(leftMargin <= g.mouseX && g.mouseX <= g.width - rightMargin &&
                 topMargin <= g.mouseY && g.mouseY <= g.height - bottomMargin)) {
      // Deselect exercise and health when clicking anywhere outside the plot 
      // and the buttons
      selEx = selGh = -1;
      selFact.set(1);
      selFact.setTarget(0);
    }
  };

  g.updateSelection = function() {
    var time = g.millis();
    if (time - lastMovement < 150) return;
  
    selEx0 = selEx;
    selGh0 = selGh;  
  
    var th = g.height - bottomMargin - topMargin;
    var tw = g.width - leftMargin - separation - rightMargin; 
    var w0 = tw * exProb.get(); 
  
    if (leftMargin <= g.mouseX && g.mouseX <= leftMargin + w0 &&
        topMargin <= g.mouseY && g.mouseY <= topMargin + th) {
      selEx = 0;
      var p = 1 - (g.mouseY - topMargin) / th;
      var sump = 0;
      for (var i = 0; i < 5; i++) {
        var p0 = ghProbEx[i].get();
        if (sump <= p && p < sump + p0) {
          selGh = i;
          break;
        }
        sump += p0;
      }  
    }
  
    if (leftMargin + w0 + separation <= g.mouseX && g.mouseX <= g.width - rightMargin &&
        topMargin <= g.mouseY && g.mouseY <= topMargin + th) {
      selEx = 1;
      var p = 1 - (g.mouseY - topMargin) / th;
      var sump = 0;
      for (var i = 0; i < 5; i++) {
        var p1 = ghProbNex[i].get();
        if (sump <= p && p < sump + p1) {
          selGh = i;
          break;
        }
        sump += p1;
      }  
    }
  
    lastMovement = time;
    if (selEx == -1 || selGh == -1) return;  
    if (selEx != selEx0 || selGh != selGh0) {
      selFact.set(0);
      selFact.setTarget(1);
    }  
  }

  g.setFill = function(ex, gh) {
    var scol = colorMap[gh];
  
    if (selEx == -1 || selGh == -1) {
      g.fillAlpha(scol, g.map(selFact.get(), 1, 0, 125, 255));
      return;
    }
  
    if (ex == selEx && gh == selGh) {
      g.fillAlpha(scol, g.map(selFact.get(), 0, 1, 125, 255));
    } else {      
      if (ex != selEx0 || gh != selGh0) {
        g.fillAlpha(scol, 125);
      } else {
        g.fillAlpha(scol, g.map(selFact.get(), 0, 1, 255, 125));
      }
    }
  }  

  g.initStringMaps = function() {
    sexMap[0] = "Male";
    sexMap[1] = "Female";

    // Short salary strings
    slsMap[0] = "15k";
    slsMap[1] = "25k";
    slsMap[2] = "50k";
    slsMap[3] = "50k+";

    // Long salary strings
    sllMap[0] = "Less than $15,000";
    sllMap[1] = "$15,000 - $25,000";
    sllMap[2] = "$25,000 - $50,000";
    sllMap[3] = "More than $50,000";
    
    exMap[0] = "Yes";
    exMap[1] = "No";
  
    ghMap[0] = "Excellent";
    ghMap[1] = "Very good";
    ghMap[2] = "Good";
    ghMap[3] = "Fair";
    ghMap[4] = "Poor";

    for (var i = 0; i < 5; i++) {
      var t = i / 4.0;
      var colort = g.lerpColor(color0, color1, t);
      colorMap[i] = colort;
    }
  }

  g.createButtons = function() {
    var x0 = leftMargin + plotWidth + separation + 40;
    for (var i = 0; i < 2; i++) {
      sexBtns.push(new Button(sexMap[i], x0 + i * 73, topMargin + 25, 67, 25, i == selSex));  
    }

    for (var i = 0; i < 4; i++) {
      salBtns.push(new Button(sllMap[i], x0, topMargin + 105 + i * 30, 140, 25, i == selSal));  
    }
  }

  g.drawButtons = function() {
    var x0 = leftMargin + plotWidth + separation + 40;
  
    g.push(); // Style
    g.fill(0);
    g.textAlign(g.LEFT);
    g.noStroke();
    g.text("Sex", x0, topMargin + 15);
    g.text("Annual income", x0, topMargin + 95);
    g.pop(); // Style
    for (var i = 0; i < sexBtns.length; i++) sexBtns[i].draw();
    for (var i = 0; i < salBtns.length; i++) salBtns[i].draw();
  }

  g.fillAlpha = function(col, alp) {
    g.fill(g.red(col), g.green(col), g.blue(col), alp);
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // ProbTable class definition

  function ProbTable(filename, initSel) {
    this.pex = [];
    for (var i = 0; i < 2; i++) this.pex[i] = 0;
    this.phex = [[]];  
    for (var j = 0; j < 5; j++) {
      var a = [];
      for (var i = 0; i < 2; i++) a[i] = 0;
      this.phex[j] = a;
    }
    this.totCount = 0;
    this.initSel = initSel;

    this.table = [];    
    // Wrapping the callback function so it is has the right context when it is called
    // wen the loading is completed:
    // http://stackoverflow.com/questions/10766407/javascript-callbacks-losing-this
    var myself = this; // Save the context for the object
    g.loadTable(filename, "header", "csv", function(results) { return myself.completed(results); });
    this.ready = false;
  }

  ProbTable.prototype.completed = function(results) {
    this.table = results;
    
    for (var i = 0; i < this.table.rows.length; i++) {
      var ex = parseInt(this.table.rows[i].getString("EXERANY2"));
      var gh = parseInt(this.table.rows[i].getString("GENHLTH"));
      var count = parseInt(this.table.rows[i].getString("COUNT"));
      this.pex[ex - 1] += count;
      this.phex[gh - 1][ex - 1] += count;
      this.totCount += count;
    }

    // Normalizing probabilities
    for (var j = 0; j < 5; j++) {
      for (var i = 0; i < 2; i++) {
        this.phex[j][i] /= this.pex[i];
      }
    }
    for (var i = 0; i < 2; i++) {
      this.pex[i] /= this.totCount;
    }

    if (this.initSel) {
      // Finish initalization
      exProb = new SoftFloat(this.getMarginal(0));
      softfs.push(exProb);
      for (var i = 0; i < 5; i++) {
        ghProbEx[i] = new SoftFloat(this.getJoint(i, 0));
        softfs.push(ghProbEx[i]);
        ghProbNex[i] = new SoftFloat(this.getJoint(i, 1));
        softfs.push(ghProbNex[i]);
      }
  
      selFact = new SoftFloat(0);
      selFact.damping = 0.4;
      softfs.push(selFact);
      selEx = -1;
      selGh = -1;

      g.createButtons();
    }
    elapsed--;
    this.ready = true;
  }  

  // health (General health) = 0:Excellent, 1:Very good, 2:Good, 3:Fair, 4:Poor
  // exercise (Exercise in past 30 days) = 0:yes, 1:no
  ProbTable.prototype.getJoint = function(health, exercise) {
    return this.phex[health][exercise];
  }
  
  ProbTable.prototype.getMarginal = function(exercise) {
    return this.pex[exercise];
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Button class definition

  function Button(label, x, y, w, h, selected) {
    this.label = label;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.selected = selected;
    this.selFact = new SoftFloat(selected ? 1 : 0.5);
    softfs.push(this.selFact);  
  }
  
  Button.prototype.draw = function() {
    g.noStroke();
    g.fillAlpha(buttonColor, this.selFact.get() * 255);
    g.rect(this.x, this.y, this.w, this.h);
            
    g.push(); // Style
    g.textAlign(g.CENTER);
    g.fill(g.color(0, this.selFact.get() * 255));
    g.noStroke();
    g.text(this.label, this.x + this.w/2, this.y + this.h/2 + textSize/2 - 2);
    g.pop(); // Style
  }
  
  Button.prototype.pressed = function() {
    return this.x <= g.mouseX && g.mouseX <= this.x + this.w &&
           this.y <= g.mouseY && g.mouseY <= this.y + this.h;
  }
  
  Button.prototype.select = function(all) {
    if (!this.selected) {
      this.selFact.setTarget(1);
      for (var i = 0; i < all.length; i++) {
        var btn = all[i];
        if (btn != this) btn.deselect();
      }
      this.selected = true;
    }    
  }
  
  Button.prototype.deselect = function() {
    if (this.selected) {
      this.selFact.setTarget(0.5);
      this.selected = false;      
    }
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