var health = new p5(function(g) {
  // var dataFileURL = "http://fathom.info/wp-content/uploads/2014/11/mirador-research.csv";
  var dataFileURL = "mirador-research.csv";

  var plotSize = 265;
  var topMargin = 110;
  var leftMargin = 63;
  var rightMargin = 27;
  var separation = 80;
  var bottomMargin = 100;
  var WIDTH = leftMargin + plotSize+ separation + plotSize + rightMargin;
  var HEIGHT = topMargin + plotSize + bottomMargin;

  var table = null;
  var countries = {};
  var selCountry0 = null;
  var selCountry = null;
  var selYear = -1;
  var selData = null;
  var selFactor = null;
  var selRadius = null;
  var noSelFactor = 0.2;  // Used when nothing is selected
  var unSelFactor = 0.07; // Used for the items that outside of current selection
  var mxSelFactor = 0.7;  // Used for current selection
  var scatterMinRad = 6;
  var scatterMaxRad = 9;
  var seriesMinRad = 3;
  var seriesMaxRad = 7;
  var countryChanged = false;

  var softfs = [];

  var textName = "Arial";
  var textSize = 14;

  var minYear = 10000, maxYear = 0;
  var minExpRD = 10000, maxExpRD = 0;
  var minNumRes = 10000, maxNumRes = 0;
  var minRatio = 0, maxRatio = 0;

  var minFemTeach = null, maxFemTeach = null;
  var ratioPos = null;

  var lastMovement = 0;

  var selColor = g.color(39, 141, 210);

  var ready = false;

  g.setup = function() {
    g.createCanvas(WIDTH, HEIGHT);
    g.loadTable(dataFileURL, "header", "csv", g.completed);

    selCountry = null;
    selFactor = new SoftFloat(0);
    selFactor.set(noSelFactor);
    selFactor.damping = 0.4;
    softfs.push(selFactor);

    selRadius = new SoftFloat(0);
    selRadius.damping = 0.4; 
    softfs.push(selRadius);

    minFemTeach = new SoftFloat(0);
    softfs.push(minFemTeach);
    maxFemTeach = new SoftFloat(100);
    softfs.push(maxFemTeach);

    g.textFont(textName);
    g.textSize(textSize);
   
    ratioPos = new SoftFloat();
    softfs.push(ratioPos);
  };

  // This function runs when the (async) table loads concludes.
  g.completed = function(results) {
    table = results;

    for (var i = 0; i < table.rows.length; i++) {
      var name = table.rows[i].getString("NAME");
      var region = table.rows[i].getString("REGION");
      var year = parseInt(table.rows[i].getString("YEAR"));
      var fsec = parseFloat(table.rows[i].getString("SE.SEC.TCHR.FE.ZS"));
      var rdxp = parseFloat(table.rows[i].getString("GB.XPD.RSDV.GD.ZS"));
      var nres = parseFloat(table.rows[i].getString("SP.POP.SCIE.RD.P6"));
      var ratio = parseFloat(table.rows[i].getString("RATIO"));
      if (isNaN(fsec) || isNaN(rdxp) || isNaN(nres) || isNaN(ratio)) continue;
      var country;
      if (countries[name]) {
        country = countries[name];
      } else {
        country = new Country(name, region);
        countries[name] = country;
      }
      country.add(year, fsec, rdxp, nres, ratio);
      minYear = Math.min(minYear, year);
      maxYear = Math.max(maxYear, year);
      minExpRD = Math.min(minExpRD, rdxp); 
      maxExpRD = Math.max(maxExpRD, rdxp);
      minNumRes = Math.min(minNumRes, nres);
      maxNumRes = Math.max(maxNumRes, nres);
      minRatio = Math.min(minRatio, ratio); 
      maxRatio = Math.max(maxRatio, ratio);
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
    g.translate(leftMargin, topMargin);

    if (selCountry) {
      var w = g.textWidth(selCountry.name);
      g.push();
      g.noStroke();
      g.fill(g.red(selColor), g.green(selColor), g.blue(selColor), g.map(selFactor.get(), 0, mxSelFactor, 0, 1) * 255);
      g.textAlign(g.LEFT);
      g.textSize(24);
      g.text(selCountry.name, -55, -80);
      g.textSize(14);
      g.pop();
    }

    var p = g.createVector();

    for (var name in countries) {
      var country = countries[name];
      g.noStroke();
      for (var i in country.years) {
        var ydat = country.data[country.years[i]];
        if (g.empty(ydat)) continue;
        if (!g.fillScatter(country, ydat.year)) continue;        
        if (!ydat.inRange()) continue;
        ydat.getScatter(p);
        g.ellipse(p.x, p.y, scatterMinRad, scatterMinRad);
      }
      if (country === selCountry) {
        var ydat = country.data[selYear];
        if (g.empty(ydat)) continue;
        if (ydat.inRange()) {
          ydat.getScatter(p);
          g.fill(g.red(selColor), g.green(selColor), g.blue(selColor), g.map(selFactor.get(), 0, mxSelFactor, 0, 1) * 255);
          var r = g.map(selRadius.get(), 0, 1, scatterMinRad, scatterMaxRad);
          g.ellipse(p.x, p.y, r, r);
        }
      }
    }

    // Expenditure and Researchers labels
    g.push();
    g.noStroke();
    g.fill(0, 100);
    g.textStyle(g.BOLD);
    g.textAlign(g.LEFT);
    g.text("Researchers in R&D (per million)", -55, -60, plotSize/2, 80);
    g.pop();
  
    g.push();
    g.fill(0, 100);
    g.textStyle(g.BOLD);
    g.textAlign(g.CENTER);
    g.text("R&D expenditure (% of GDP)", plotSize/2, plotSize + 70);

    g.fill(0);
    g.textStyle(g.NORMAL);
    g.textAlign(g.CENTER);
    g.text("0%", 0, plotSize + 30);
    g.text(g.nfc(Math.ceil(maxExpRD)) + "%", plotSize, plotSize + 30);

    g.textAlign(g.RIGHT);
    g.text("0", -20, plotSize + textSize/2 - 2);
    g.text(g.nfc(Math.ceil(10 * parseInt(maxNumRes/10))), -20, textSize/2 - 2);

    if (!g.empty(selCountry) && !g.empty(selData)) {
      var x = g.map(selData.expRD, minExpRD, maxExpRD, 0, plotSize);
      var y = g.map(selData.numRes, minNumRes, maxNumRes, plotSize, 0);
      if (25 < x && x < plotSize - 25) {        
        g.textAlign(g.CENTER);
        g.fill(0, selRadius.get() * 255);
        g.noStroke();
        g.text(g.nfc(selData.expRD, 1) + "%", x, plotSize + 30);
        g.stroke(0, selRadius.get() * 120);
        g.line(x, plotSize + 10, x, plotSize + 15);
      }
      if (textSize/2 + 5 < y && y < plotSize - textSize/2 - 5) {        
        g.textAlign(g.RIGHT);
        g.fill(0, selRadius.get() * 255);
        g.noStroke();
        g.text(g.nfc(parseInt(selData.numRes)), -20, y + textSize/2 - 2);
        g.stroke(0, selRadius.get() * 120);
        g.line(-15, y, -10, y);
      }
    }
  
    g.stroke(0, 0, 0, 120);
    g.line(0, plotSize + 10, plotSize, plotSize + 10);
    g.line(0, plotSize + 10, 0, plotSize + 15);
    g.line(plotSize, plotSize + 10, plotSize, plotSize + 15);
    g.line(-10, 0, -10, plotSize);
    g.line(-15, 0, -10, 0);
    g.line(-15, plotSize, -10, plotSize);
  
    g.pop();

    g.push();
    g.translate(plotSize + separation, 0);
  
    g.push();
    g.fill(0, 100);
    g.textStyle(g.BOLD);
    g.textAlign(g.LEFT);
    g.text("Researchers (per million) per each GDP percentage spent in R&D", -55, -60, plotSize + 85, 80);
    g.pop();
    
    for (var name in countries) {
      var country = countries[name];
      var x0 = 0; 
      var y0 = -1;
      g.noFill();
      g.strokeSeries(country);
      g.beginShape();
      for (var i in country.years) {
        var ydat = country.data[country.years[i]];
        if (g.empty(ydat)) continue;
        if (!ydat.inRange()) {
          g.curveVertex(x0, y0);
          g.endShape();
          g.beginShape();
        } else {
          ydat.getSeries(p);
          if (y0 < 0) g.curveVertex(p.x, p.y);
          g.curveVertex(p.x, p.y);        
          x0 = p.x;
          y0 = p.y;
        }
      }
      g.curveVertex(x0, y0);
      g.endShape();

      g.noStroke();
      for (var i in country.years) {
        var ydat = country.data[country.years[i]];
        if (g.empty(ydat)) continue;
        if (ydat.inRange()) {
          ydat.getSeries(p);
          if (!g.fillSeries(country, year)) continue;
          var r;
          if (country === selCountry) {
            if (countryChanged) {
              r = g.map(selRadius.get(), 0, 1, seriesMinRad, 0.5 * (seriesMaxRad - seriesMinRad) + seriesMinRad);  
            } else {
              r = 0.5 * (seriesMaxRad - seriesMinRad) + seriesMinRad;
            }            
          } else {
            r = seriesMinRad;
          }
          g.ellipse(p.x, p.y, r, r);
        }
      }    
      g.push();
      if (country === selCountry) {
        var ydat = country.data[selYear];
        if (g.empty(ydat)) continue;
        if (ydat.inRange()) {
          ydat.getSeries(p);
          g.noStroke();
          g.fill(g.red(selColor), g.green(selColor), g.blue(selColor), g.map(selFactor.get(), 0, mxSelFactor, 0, 1) * 255);
          var r = g.map(selRadius.get(), 0, 1, seriesMinRad, seriesMaxRad);
          g.ellipse(p.x, p.y, r, r);        
          var ratio = ydat.ratio;
          var y = g.map(ratio, minRatio, maxRatio, plotSize, 0);
          if (textSize/2 + 5 < y && y < plotSize - textSize/2 - 5) {     
            g.push();
            g.textAlign(g.RIGHT);
            g.fill(0, selRadius.get() * 255);          
            g.noStroke();
            g.textStyle(g.NORMAL);
            g.text(g.nfc(parseInt(ratio)), -20, y + textSize/2 - 2);
            g.stroke(0, selRadius.get() * 120);
            g.line(-15, y, -10, y);
            g.pop();
          }
        }
      }
      g.pop();
    }

    // Year labels
    g.push();
    g.textAlign(g.CENTER);
    g.noStroke();
    g.textStyle(g.NORMAL);
    g.fill(0);
    var dy = plotSize / (maxYear - minYear);
    for (var year = minYear; year <= maxYear; year += 2) {      
      g.text(year, (year - minYear) * dy, plotSize + 30);
    }
  
    g.fill(0, 100);
    g.textStyle(g.BOLD);
    g.text("Year", plotSize/2, plotSize + 70);

    g.textStyle(g.NORMAL);
    g.textAlign(g.RIGHT);
    g.fill(0);
    g.text("0", -20, plotSize + textSize/2 - 2);
    g.text(g.nfc(Math.ceil(100*parseInt(maxRatio/100))), -20, textSize/2 - 2);

    g.stroke(0, 0, 0, 120);
    g.line(0, plotSize + 10, plotSize, plotSize + 10);
    for (var year = minYear; year <= maxYear; year += 1) {
      var l = 3;
      if (year % 2 == 0) l = 5
      g.line((year - minYear) * dy, plotSize + 10, (year - minYear) * dy, plotSize + 10 + l);
    }
  
    g.line(-10, 0, -10, plotSize);
    g.line(-15, 0, -10, 0);
    g.line(-15, plotSize, -10, plotSize);
    
    g.pop();  

    g.pop();
    g.pop();

    g.updateSelection();
  };

  g.mouseMoved = function() {
    lastMovement = g.millis();
  }

  g.mousePressed = function() {
    g.deselect();
  }

  g.setFemTeachers = function(mint, maxt) {
    minFemTeach.setTarget(mint);
    maxFemTeach.setTarget(maxt);      
  }  

  g.updateSelection = function() {
    var time = g.millis();
    if (time - lastMovement < 100) return;
  
    if (leftMargin <= g.mouseX && g.mouseX <= leftMargin + plotSize &&
        topMargin <= g.mouseY && g.mouseY <= topMargin + plotSize) {
      var mx = g.mouseX - leftMargin; 
      var my = g.mouseY - topMargin;
      var p = g.createVector();

      for (var name in countries) {
        var country = countries[name];
        for (var i in country.years) {
          var ydat = country.data[country.years[i]];
          if (g.empty(ydat)) continue;
          if (!ydat.inRange()) continue;
          ydat.getScatter(p);
          if (g.dist(mx, my, p.x, p.y) < scatterMinRad) {
            g.select(country, ydat);
            return;
          }
        }
      }
    }

    if (leftMargin + plotSize + separation <= g.mouseX && 
        g.mouseX <= leftMargin + 2 * plotSize + separation &&
      topMargin <= g.mouseY && g.mouseY <= topMargin + plotSize) {
      var mx = g.mouseX - (leftMargin + plotSize + separation); 
      var my = g.mouseY - topMargin;
      var p1 = g.createVector();

      for (var name in countries) {
        var country = countries[name];
        var x0 = 0; 
        var y0 = -1;
        for (var i in country.years) {
          var ydat = country.data[country.years[i]];
          if (g.empty(ydat)) continue;
          if (!ydat.inRange()) continue;
          ydat.getSeries(p1);
          if (g.dist(mx, my, p1.x, p1.y) < seriesMinRad) {
            g.select(country, ydat);
            return;
          }
          if (0 < y0 && x0 <= mx && mx <= p1.x) {
            // Linearly interpolate
            var t = (mx - x0) / (p1.x - x0);
            var y = y0 + t * (p1.y - y0);          
            if (g.dist(mx, my, mx, y) < seriesMinRad) {
              g.select(country);
              return;
            }
          }
          x0 = p1.x;
          y0 = p1.y;
        }
      }
    }
  
    lastMovement = time;
  }

  g.select = function() {
    var country = null;
    var data = null;
    if (arguments.length == 0) {
      return;
    } else if (arguments.length >= 1) {
      country = arguments[0];
      if (arguments.length >= 2) {
        data = arguments[1];
      }
    }
    
    countryChanged = selCountry !== country;
    if (countryChanged) {
      selCountry0 = selCountry;
      selCountry = country;    
      selFactor.set(noSelFactor);
      selFactor.setTarget(mxSelFactor);
    }
    if (!g.empty(selCountry) && !g.empty(data)) {
      selData = data;
      if (selYear !== data.year) {        
        selYear = data.year;
        if (countryChanged) {
          selRadius.set(0);
        } else {
          selRadius.set(seriesMinRad / seriesMaxRad);
        }
        selRadius.setTarget(1);
      }
    } else {
      selYear = -1;
    }    
  }

  g.deselect = function() {
    if (selCountry !== null) {
      selCountry = null;
      selData = null;
      selYear = -1;
      selFactor.set(unSelFactor);
      selFactor.setTarget(noSelFactor);
    }
  }

  g.fillScatter = function(country, year) {  
    if (country === selCountry) {
      if (year === selYear) return false;
      g.fill(0, 0, 0, selFactor.get() * 255);
    } else {
      if (selCountry === null) {
        g.fill(0, 0, 0, selFactor.get() * 255);
      } else if (selCountry0 !== null && selCountry0 !== country) {
        g.fill(0, 0, 0, unSelFactor * 255);
      } else {
        g.fill(0, 0, 0, g.map(selFactor.get(), 0, mxSelFactor, noSelFactor, unSelFactor) * 255);
      }
    }
    return true;
  }

  g.strokeSeries = function(country) {
    if (country === selCountry) {
      g.stroke(0, 0, 0, selFactor.get() * 255);
    } else {
      if (selCountry === null) {
        g.stroke(0, 0, 0, selFactor.get() * 255);
      } else if (selCountry0 !== null && selCountry0 !== country) {
        g.stroke(0, 0, 0, unSelFactor * 255);
      } else {
        g.stroke(0, 0, 0, g.map(selFactor.get(), 0, mxSelFactor, noSelFactor, unSelFactor) * 255);
      }
    }
  }

  g.fillSeries = function(country, year) {
    if (country === selCountry) {
      if (year === selYear) return false;
      g.fill(0, 0, 0, selFactor.get() * 255);
    } else {
      if (selCountry === null) {
        g.fill(0, 0, 0, noSelFactor * 255);
      } else if (selCountry0 !== null && selCountry0 !== country) {
        g.fill(0, 0, 0, unSelFactor * 255);
      } else {
        g.fill(0, 0, 0, g.map(selFactor.get(), 0, mxSelFactor, noSelFactor, unSelFactor) * 255);
      }
    }
    return true;  
  }

  g.empty = function(x) {
    return x === undefined || x === null;
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // Country class definition

  function Country(name, region) {
    this.name = name;
    this.region = region;
    this.data = [];
    this.years = [];
  }

  Country.prototype.add = function(year, femTeach, expRD, numRes, ratio) {
    this.data[year] = new YearData(year, femTeach, expRD, numRes, ratio);
    this.years.push(year);
    this.years.sort();
  }

  /////////////////////////////////////////////////////////////////////////////
  //
  // YearData class definition

  function YearData(year, femTeach, expRD, numRes, ratio) {
    this.year = year;
    this.femTeach = femTeach;
    this.expRD = expRD;
    this.numRes = numRes;
    this.ratio = ratio;    
  }

  YearData.prototype.getScatter = function(p) {
    p.x = g.map(this.expRD, minExpRD, maxExpRD, 0, plotSize); 
    p.y = g.map(this.numRes, minNumRes, maxNumRes, plotSize, 0);
  }

  YearData.prototype.getSeries = function(p) {
    p.x = g.map(this.year, minYear, maxYear, 0, plotSize);
    p.y = g.map(this.ratio, minRatio, maxRatio, plotSize, 0);
  }
  
  YearData.prototype.inRange = function() {
    return minFemTeach.get() <= this.femTeach && this.femTeach <= maxFemTeach.get();
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
