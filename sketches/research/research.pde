import java.util.Collections; //<>//

int plotSize = 300;
int topMargin = 120;
int leftMargin = 120;
int rightMargin = 40;
int separation = 80;
int bottomMargin = 140;
int WIDTH = leftMargin + plotSize+ separation + plotSize + rightMargin;
int HEIGHT = topMargin + plotSize + bottomMargin;

Table table;
HashMap<String, Country> countries;
Country selCountry0;
Country selCountry;
int selYear;
YearData selData;
SoftFloat selFactor;
SoftFloat selRadius;
float noSelFactor = 0.2;  // Used when nothing is selected
float unSelFactor = 0.07; // Used for the items that outside of current selection
float mxSelFactor = 0.7;  // Used for current selection
float scatterMinRad = 7;
float scatterMaxRad = 10;
float seriesMinRad = 3;
float seriesMaxRad = 7;

ArrayList<SoftFloat> softfs;

PFont font;

int minYear, maxYear;
float minExpRD, maxExpRD;
float minNumRes, maxNumRes;
float minRatio, maxRatio;

ArrayList<Button> secBtns;
SoftFloat minFemTeach, maxFemTeach;

SoftFloat ratioPos;

int lastMovement;

int selColor = #278DD2;
int countryColor = #9DCFF0;
int buttonColor = 180;

int color0 = #278DD2;
int color1 = #C0E2F7;

void setup() {
  size(WIDTH, HEIGHT, P2D);
  smooth(4);

  countries = new HashMap<String, Country>();

  minYear = 10000;
  maxYear = 0;
  minExpRD = 10000; 
  maxExpRD = 0;
  minNumRes = 10000;
  maxNumRes = 0;
  minRatio = 0; 
  maxRatio = 0; 
  table = loadTable("research.csv", "header");
  for (int i = 0; i < table.getRowCount (); i++) {
    TableRow row = table.getRow(i);
    String name = row.getString("NAME");
    String region = row.getString("REGION");
    int year = row.getInt("YEAR");
    float fsec = row.getFloat("SE.SEC.TCHR.FE.ZS");
    float rdxp = row.getFloat("GB.XPD.RSDV.GD.ZS");
    float nres = row.getFloat("SP.POP.SCIE.RD.P6");
    float ratio = row.getFloat("RATIO");    
    if (Float.isNaN(fsec) ||  Float.isNaN(rdxp) || Float.isNaN(nres) || Float.isNaN(ratio)) continue;
    Country country;
    if (countries.containsKey(name)) {
      country = countries.get(name);
    } else {
      country = new Country(name, region);
      countries.put(name, country);
    }
    country.add(year, fsec, rdxp, nres, ratio);
    minYear = min(minYear, year);
    maxYear = max(maxYear, year);
    minExpRD = min(minExpRD, rdxp); 
    maxExpRD = max(maxExpRD, rdxp);
    minNumRes = min(minNumRes, nres);
    maxNumRes = max(maxNumRes, nres);
    minRatio = min(minRatio, ratio); 
    maxRatio = max(maxRatio, ratio);
  }

  softfs = new ArrayList<SoftFloat>();
  selCountry = null;
  selFactor = new SoftFloat();
  selFactor.set(noSelFactor);
  selFactor.damping = 0.2;
  softfs.add(selFactor);

  selRadius = new SoftFloat();
  selRadius.damping = 0.35; 
  softfs.add(selRadius);

  minFemTeach = new SoftFloat(0);
  softfs.add(minFemTeach);
  maxFemTeach = new SoftFloat(100);
  softfs.add(maxFemTeach);

  font = createFont("Helvetica", 14);
  textFont(font);  
  
  ratioPos = new SoftFloat();
  softfs.add(ratioPos);
  
  selData = null;
  
  createButtons();
}

void draw() {
  background(255);
  for (SoftFloat sf : softfs) sf.update();

  if (selCountry != null) {
    float w = textWidth(selCountry.name);
    pushStyle();
    noStroke();
    fill(red(countryColor), green(countryColor), blue(countryColor), map(selFactor.get(), 0, mxSelFactor, 0, 1) * 255);
    rect(width/2 - w/2 - 10, 10, w + 20, 30);
    
    fill(0, map(selFactor.get(), 0, mxSelFactor, 0, 1) * 255);
    textAlign(CENTER);
    text(selCountry.name, width/2, 30);
    popStyle();
  }

  pushMatrix();
  translate(leftMargin, topMargin);

  PVector p = new PVector();

  for (Country country : countries.values ()) {
    noStroke();
    for (YearData ydat : country.data.values ()) {      
      if (!fillScatter(country, ydat.year)) continue;
      if (!ydat.inRange()) continue;
      ydat.getScatter(p);
      ellipse(p.x, p.y, scatterMinRad, scatterMinRad);
    }
    if (country == selCountry) {
      YearData ydat = country.data.get(selYear); 
      if (ydat != null && ydat.inRange()) {
        ydat.getScatter(p);
        fill(red(selColor), green(selColor), blue(selColor), map(selFactor.get(), 0, mxSelFactor, 0, 1) * 255);
        float r = map(selRadius.get(), 0, 1, scatterMinRad, scatterMaxRad);
        ellipse(p.x, p.y, r, r);
      }
    }
  }

  // Expenditure and Researchers labels
  pushMatrix();
  pushStyle();
  fill(0);
  textAlign(CENTER);
  translate(-80, plotSize/2);
  rotate(-HALF_PI);
  text("Researchers in R&D (per million people)", 0, 0);
  popStyle();
  popMatrix();
  
  pushStyle();
  fill(0);
  textAlign(CENTER);
  text("R&D expenditure (% of GDP)", plotSize/2, plotSize + 60);

  fill(0);
  textAlign(CENTER);
  text("0%", 0, plotSize + 30);
  text(nfc(ceil(maxExpRD)) + "%", plotSize, plotSize + 30);

  textAlign(RIGHT);
  text("0", -20, plotSize + font.getSize()/2);
  text(nfc(ceil(maxNumRes)), -20, font.getSize()/2);
  
  if (selCountry != null && selData != null) {
    float x = map(selData.expRD, minExpRD, maxExpRD, 0, plotSize);
    float y = map(selData.numRes, minNumRes, maxNumRes, plotSize, 0);    
    if (25 < x && x < plotSize - 25) {
      fill(0, selRadius.get() * 255);
      textAlign(CENTER);
      text(nfc(selData.expRD, 1) + "%", x, plotSize + 30);
      stroke(0, selRadius.get() * 120);
      line(x, plotSize + 10, x, plotSize + 15);
    }
    if (font.getSize()/2 < y && y < plotSize - font.getSize()/2) {
      fill(0, selRadius.get() * 255);
      textAlign(RIGHT);
      text(nfc(int(selData.numRes)), -20, y + font.getSize()/2);
      stroke(0, selRadius.get() * 120);
      line(-15, y, -10, y);
    }
  }
  
  stroke(0, 120);
  line(0, plotSize + 10, plotSize, plotSize + 10);
  line(0, plotSize + 10, 0, plotSize + 15);
  line(plotSize, plotSize + 10, plotSize, plotSize + 15);
  line(-10, 0, -10, plotSize);
  line(-15, 0, -10, 0);
  line(-15, plotSize, -10, plotSize);
  line(plotSize, plotSize + 10, plotSize, plotSize + 15);
  
  popStyle();  

  pushMatrix();
  translate(plotSize + separation, 0);
  
  pushMatrix();
  pushStyle();
  fill(0);
  textAlign(LEFT);
  text("Researchers (per million people) per each GDP percent point spent in R&D", 0, -55, plotSize, 40);
  popStyle();
  popMatrix();
    
  for (Country country : countries.values ()) {
    float x0 = 0; 
    float y0 = -1;
    noFill();
    strokeSeries(country);
    beginShape();
    beginContour();
    for (int year : country.years) {
      YearData ydat = country.data.get(year);        
      if (!ydat.inRange()) {
        endContour();
        beginContour();
      } else {
        ydat.getSeries(p);
        if (y0 < 0) curveVertex(p.x, p.y);
        curveVertex(p.x, p.y);        
        x0 = p.x;
        y0 = p.y;
      }
    }
    curveVertex(x0, y0);
    endContour();
    endShape();
    
    noStroke();
    for (int year : country.years) {
      YearData ydat = country.data.get(year);
      if (ydat != null && ydat.inRange()) {
        ydat.getSeries(p);
        if (!fillSeries(country, year)) continue;        
        ellipse(p.x, p.y, 3, 3);
      }
    }    
    pushStyle();
    if (country == selCountry) { 
      YearData ydat = country.data.get(selYear);
      if (ydat != null && ydat.inRange()) {
        ydat.getSeries(p);
        noStroke();
        fill(red(selColor), green(selColor), blue(selColor), map(selFactor.get(), 0, mxSelFactor, 0, 1) * 255);
        float r = map(selRadius.get(), 0, 1, seriesMinRad, seriesMaxRad);
        ellipse(p.x, p.y, r, r);
        
        float ratio = ydat.ratio;
        fill(0, selRadius.get() * 255);
        textAlign(CENTER);
        text(nfc(int(ratio)), p.x, p.y - 10);
      }
    }
    popStyle();
  }

  // Year labels
  pushStyle();  
  fill(0);
  textAlign(CENTER);
  float dy = plotSize / (maxYear - minYear);
  for (int year = minYear; year <= maxYear; year += 2) {
    text(year, (year - minYear) * dy, plotSize + 30);
  }
  stroke(0, 120);
  line(0, plotSize + 10, plotSize, plotSize + 10);
  for (int year = minYear; year <= maxYear; year += 2) {
    line((year - minYear) * dy, plotSize + 10, (year - minYear) * dy, plotSize + 15);
  }
  popStyle();  

  popMatrix();
  popMatrix();
  
  drawButtons();  
  updateSelection();
}

void mouseMoved() {
  lastMovement = millis();
}

void mousePressed() {
  boolean btnPress = false;
  for (int i = 0; i < secBtns.size(); i++) {
    Button btn = secBtns.get(i);
    btnPress |= btn.press();
  }
  
  if (btnPress) {
    Button btn0 = secBtns.get(0);
    Button btn1 = secBtns.get(1);
  
    if (btn0.selected) minFemTeach.target(0); 
    else if (btn1.selected) minFemTeach.target(50);
    else minFemTeach.target(100);
  
    if (btn1.selected) maxFemTeach.target(100);
    else if (btn0.selected) maxFemTeach.target(50);
    else maxFemTeach.target(0);
  } else {
    deselect();
  }  
}

void updateSelection() {
  int time = millis();  
  if (time - lastMovement < 120) return;
  
  if (leftMargin <= mouseX && mouseX <= leftMargin + plotSize &&
    topMargin <= mouseY && mouseY <= topMargin + plotSize) {
    float mx = mouseX - leftMargin; 
    float my = mouseY - topMargin;
    PVector p = new PVector();
    for (Country country : countries.values ()) {
      for (YearData ydat : country.data.values ()) {
        if (!ydat.inRange()) continue;
        ydat.getScatter(p);
        if (dist(mx, my, p.x, p.y) < 10) {
          select(country, ydat);
          return;
        }
      }
    }
  }

  if (leftMargin + plotSize + separation <= mouseX && 
      mouseX <= leftMargin + 2 * plotSize + separation &&
    topMargin <= mouseY && mouseY <= topMargin + plotSize) {
    float mx = mouseX - (leftMargin + plotSize + separation); 
    float my = mouseY - topMargin;
    PVector p1 = new PVector();
    for (Country country : countries.values ()) {
      float x0 = 0; 
      float y0 = -1;
      for (int year : country.years) {
        YearData ydat = country.data.get(year);
        if (!ydat.inRange()) continue;
        ydat.getSeries(p1);
        if (dist(mx, my, p1.x, p1.y) < 10) {
          select(country, ydat);
          return;
        }
        if (0 < y0 && x0 <= mx && mx <= p1.x) {
          // Linearly interpolate
          float t = (mx - x0) / (p1.x - x0);
          float y = y0 + t * (p1.y - y0);          
          if (dist(mx, my, mx, y) < 10) {
            select(country);
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

void select(Country country) {
  select(country, null);
}

void select(Country country, YearData data) {
  if (selCountry != country) {
    selCountry0 = selCountry;
    selCountry = country;    
    selFactor.set(noSelFactor);
    selFactor.target(mxSelFactor);
  }
  if (selCountry != null) {
    selData = data;
    if (data != null && selYear != data.year) {
      selYear = data.year;
      selRadius.set(0);
      selRadius.target(1);
    }
  } else {
    selYear = -1;
  }
}

void deselect() {
  if (selCountry != null) {
    selCountry = null;
    selData = null;
    selYear = -1;
    selFactor.set(unSelFactor);
    selFactor.target(noSelFactor);
  }
}

boolean fillScatter(Country country, int year) {
  if (country == selCountry) {
    if (year == selYear) return false;
    fill(0, selFactor.get() * 255);
  } else {
    if (selCountry == null) {
      fill(0, selFactor.get() * 255);
    } else if (selCountry0 != null && selCountry0 != country) {
      fill(0, unSelFactor * 255);
    } else {
      fill(0, map(selFactor.get(), 0, mxSelFactor, noSelFactor, unSelFactor) * 255);
    }
  }
  return true;
}

void strokeSeries(Country country) {
  if (country == selCountry) {
    stroke(0, selFactor.get() * 255);
  } else {
    if (selCountry == null) {    
      stroke(0, selFactor.get() * 255);
    } else if (selCountry0 != null && selCountry0 != country) {
      stroke(0, unSelFactor * 255);
    } else {
      stroke(0, map(selFactor.get(), 0, mxSelFactor, noSelFactor, unSelFactor) * 255);
    }
  }  
}

boolean fillSeries(Country country, int year) {
  if (country == selCountry) {
    if (year == selYear) return false;
    fill(0, selFactor.get() * 255);
  } else {
    if (selCountry == null) {
      fill(0, noSelFactor * 255);
    } else if (selCountry0 != null && selCountry0 != country) {
      fill(0, unSelFactor * 255);
    } else {
      fill(0, map(selFactor.get(), 0, mxSelFactor, noSelFactor, unSelFactor) * 255);
    }
  }
  return true;  
}

void createButtons() {
  HashMap<Integer, String> secMap;
  secMap = new HashMap<Integer, String>();
  secMap.put(0, "0-50%");
  secMap.put(1, "50-100%");
  
  secBtns = new ArrayList<Button>();
  for (int i = 0; i < secMap.size(); i++) {
    secBtns.add(new Button(secMap.get(i), 220 + 5 + i * 80, height - bottomMargin + 100, 70, 25, true));  
  }  
}

void drawButtons() {
  fill(0);
  text("Female secondary teachers:", 40, height - bottomMargin + 100 + 12 + font.getSize()/2);
  for (Button btns: secBtns) btns.draw();
}

class Country {
  String name;
  String region;
  ArrayList<Integer> years;
  HashMap<Integer, YearData> data;

  Country(String name, String region) {
    this.name = name;
    this.region = region;
    data = new HashMap<Integer, YearData>();
    years = new ArrayList<Integer>();
  }

  void add(int year, float femTeach, float expRD, float numRes, float ratio) {
    data.put(year, new YearData(year, femTeach, expRD, numRes, ratio));
    years.add(year);
    Collections.sort(years);
  }
}

class YearData {
  int year;
  float femTeach;
  float expRD;
  float numRes;
  float ratio;

  YearData(int year, float femTeach, float expRD, float numRes, float ratio) {
    this.year = year;
    this.femTeach = femTeach;
    this.expRD = expRD;
    this.numRes = numRes;
    this.ratio = ratio;
  }

  void getScatter(PVector p) {
    p.x = map(expRD, minExpRD, maxExpRD, 0, plotSize); 
    p.y = map(numRes, minNumRes, maxNumRes, plotSize, 0);
  }

  void getSeries(PVector p) {
    p.x = map(year, minYear, maxYear, 0, plotSize);
    p.y = map(ratio, minRatio, maxRatio, plotSize, 0);
  }
  
  boolean inRange() {
    return minFemTeach.get() <= femTeach && femTeach <= maxFemTeach.get();
  }
}

class Button {
  float x, y, w, h;
  String label;
  boolean selected;
  SoftFloat selFact;
  
  Button(String label, float x, float y, float w, float h, boolean selected) {
    this.label = label;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.selected = selected;
    selFact = new SoftFloat(selected ? 1 : 0.5);
    softfs.add(selFact);
  }
  
  void draw() {
    fill(buttonColor, selFact.get() * 255);
    rect(x, y, w, h);
    
    pushStyle();
    textAlign(CENTER);
    fill(0, selFact.get() * 255);
    text(label, x + w/2, y + h/2 + font.getSize()/2 - 2);
    popStyle();
  }
  
  boolean press() {
    boolean inside = x <= mouseX && mouseX <= x + w &&
                     y <= mouseY && mouseY <= y + h;
    if (inside) {                 
      if (!selected) {
        selFact.target(1);    
        selected = true;        
      } else {
        selFact.target(0.3);
        selected = false;
      }
    }
    return inside;
  }
}
