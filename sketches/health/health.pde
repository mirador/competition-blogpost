int leftMargin = 220;
int rightMargin = 260;
int plotWidth = 300;
int plotHeight = 300;
int topMargin = 40;
int bottomMargin = 80;
int separation = 30;
int WIDTH = leftMargin + plotWidth + separation + rightMargin;
int HEIGHT = topMargin + plotHeight + bottomMargin;

HashMap<Integer, String> sexMap;
HashMap<Integer, String> slsMap;
HashMap<Integer, String> sllMap;
HashMap<Integer, Integer> colorMap;

HashMap<Integer, String> exMap;
HashMap<Integer, String> ghMap;

HashMap<String, ProbTable> probMap;
ProbTable selProb;
int selSex;
int selSal;

int selEx;
int selGh;
SoftFloat selFact;

SoftFloat exProb;
SoftFloat[] ghProbEx;
SoftFloat[] ghProbNex;

PFont font;

ArrayList<Button> sexBtns;
ArrayList<Button> salBtns;

ArrayList<SoftFloat> softfs;

int color0 = #278DD2;
int color1 = #C2E4FA;
int labelColor = #9DCFF0;
int buttonColor = 180;

int lastMovement;
int selEx0;
int selGh0;

void setup() {
  size(WIDTH, HEIGHT, P2D);
  smooth(4);

  initStringMaps();

  probMap = new HashMap<String, ProbTable>();
  for (int i = 0; i < 2; i++) {
    for (int j = 0; j < 4; j++) {
      String ky = sexMap.get(i) + "-" + slsMap.get(j);      
      probMap.put(ky, new ProbTable("health-" + ky + ".csv"));
    }
  }
  selSex = 0;
  selSal = 0;
  selProb = probMap.get(sexMap.get(selSex) + "-" + slsMap.get(selSal));
  ghProbEx = new SoftFloat[5];
  ghProbNex = new SoftFloat[5];
  
  softfs = new ArrayList<SoftFloat>();
  exProb = new SoftFloat(selProb.get(0));
  softfs.add(exProb);
  for (int i = 0; i < 5; i++) {
    ghProbEx[i] = new SoftFloat(selProb.get(i, 0));
    softfs.add(ghProbEx[i]);
    ghProbNex[i] = new SoftFloat(selProb.get(i, 1));
    softfs.add(ghProbNex[i]);
  }  
  
  selFact = new SoftFloat(0);
  selFact.damping = 0.2;
  softfs.add(selFact);
  selEx = -1;
  selGh = -1;
  
  font = createFont("Helvetica", 14);
  textFont(font);  
  
  createButtons();
}

void draw() {
  background(255);
  for (SoftFloat sf: softfs) sf.update();
    
  float x, y;
  float tw = plotWidth;
  float th = plotHeight;   
  
  pushMatrix();
  translate(0, topMargin);
  
  pushMatrix();
  translate(leftMargin, 0);
  
  noFill();
  stroke(0);
  float w0 = tw * exProb.get(); 
  x = 0;
  y = th;
  stroke(255);
  for (int i = 0; i < 5; i++) {
    float p = ghProbEx[i].get();
    float h = p * th;     
    setFill(0, i);    
    rect(x, y - h, w0, h);
    y -= h;
  }
  
  x += w0 + separation; 
  y = th;
  for (int i = 0; i < 5; i++) {
    float p = ghProbNex[i].get();
    float h = p * th;
    setFill(1, i);
    rect(x, y - h, tw - w0, h);
    y -= h;
  }
  
  // Connectors
  stroke(255);
  float x0 = w0;
  float x1 = w0 + separation;
  float y0 = th;
  float y1 = th;
  for (int i = 0; i < 5; i++) {
    int coli = colorMap.get(i);
    fill(red(coli), green(coli), blue(coli), 125);
    
    float p0 = i < 5 ? ghProbEx[i].get() : 0;
    float p1 = i < 5 ? ghProbNex[i].get() : 0;
    float h0 = p0 * th;
    float h1 = p1 * th;
    float ny0 = y0 - h0;
    float ny1 = y1 - h1;
    
    beginShape(QUADS);
    vertex(x0, ny0);
    vertex(x1, ny1);
    vertex(x1, y1);
    vertex(x0, y0);    
    endShape();
    y0 = ny0;
    y1 = ny1;
  }

  if (selEx != -1 && selGh != -1) {
    fill(0, selFact.get() * 255);
    pushStyle();
    textAlign(CENTER);
    float p = 0;   
    if (selEx == 0) {
      p = ghProbEx[selGh].get();
      x = w0 / 2;
    } else {
      p = ghProbNex[selGh].get();
      x = w0 + separation + (tw - w0) / 2;
    }          
    y = th;
    for (int i = 0; i <= selGh; i++) {
      float pi = selEx == 0 ? ghProbEx[i].get() : ghProbNex[i].get();
      float h = max(pi * th, font.getSize());
      y += i == selGh ? -h / 2 + font.getSize()/2 : -h;
    }  
    text(nfc(100 * p, 2) + "%", x, y);
    popStyle();
  }
  
  // X labels
  pushStyle();
  fill(0);
  textAlign(CENTER);
  text(exMap.get(0), w0 / 2, th + font.getSize() + 5);
  text(exMap.get(1), w0 + separation + (tw - w0) / 2, th + font.getSize() + 5);    
  fill(0, 170);
  text("Exercised in the past 30 days", (tw + separation) / 2, th + 2 * font.getSize() + 30);
  popStyle();
  
  popMatrix();

  // Y Labels
  pushStyle();  
  fill(0, 170);
  textAlign(LEFT);
  text("General health", 20, th/2);
  fill(0);
  textAlign(RIGHT); 
  x = 0;
  y = th;
  for (int i = 0; i < 5; i++) {
    float p = ghProbEx[i].get();
    float h = max(p * th, font.getSize()); 
    text(ghMap.get(i), leftMargin - 5, y - h / 2 + font.getSize()/2);
    y -= h;
  }
  popStyle();
  popMatrix();
  
  drawButtons();
  updateSelection();
}

void mouseMoved() {
  updateSelection();
}

void mousePressed() {
  int selSex0 = selSex;
  int selSal0 = selSal;  
  boolean selBtn = false;
  
  for (int i = 0; i < 2; i++) {
    Button btn = sexBtns.get(i);
    if (btn.pressed()) {
      btn.select(sexBtns);
      selSex = i;
      selBtn = true;
      break;
    }
  }

  for (int i = 0; i < 4; i++) {
    Button btn = salBtns.get(i);
    if (btn.pressed()) {
      btn.select(salBtns);
      selSal = i;
      selBtn = true;
      break;      
    }    
  }
  
  if (selBtn) {
    if (selSex0 != selSex || selSal0 != selSal) {
      selProb = probMap.get(sexMap.get(selSex) + "-" + slsMap.get(selSal));
      exProb.target(selProb.get(0));  
      for (int i = 0; i < 5; i++) {
        ghProbEx[i].target(selProb.get(i, 0));
        ghProbNex[i].target(selProb.get(i, 1));
      }     
    }    
  } else if (!(leftMargin <= mouseX && mouseX <= width - rightMargin &&
               topMargin <= mouseY && mouseY <= height - bottomMargin)) {
    // Deselect exercise and health when clicking anywhere outside the plot 
    // and the buttons
    selEx = selGh = -1;
    selFact.set(1);
    selFact.target(0);
  }
}

void updateSelection() {
  int time = millis();  
  if (time - lastMovement < 150) return;
  
  selEx0 = selEx;
  selGh0 = selGh;  
  
  float th = height - bottomMargin - topMargin;
  float tw = width - leftMargin - separation - rightMargin; 
  float w0 = tw * exProb.get(); 
  
  if (leftMargin <= mouseX && mouseX <= leftMargin + w0 &&
      topMargin <= mouseY && mouseY <= topMargin + th) {
    selEx = 0;
    float p = 1 - (mouseY - topMargin) / th;
    float sump = 0;
    for (int i = 0; i < 5; i++) {
      float p0 = ghProbEx[i].get();
      if (sump <= p && p < sump + p0) {
        selGh = i;
        break;
      }
      sump += p0;
    }  
  }
  
  if (leftMargin + w0 + separation <= mouseX && mouseX <= width - rightMargin &&
      topMargin <= mouseY && mouseY <= topMargin + th) {
    selEx = 1;
    float p = 1 - (mouseY - topMargin) / th;
    float sump = 0;
    for (int i = 0; i < 5; i++) {
      float p1 = ghProbNex[i].get();
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
    selFact.target(1);
  }  
}

void setFill(int ex, int gh) {
  int scol = colorMap.get(gh);
  
  if (selEx == -1 || selGh == -1) {
    fill(scol, map(selFact.get(), 1, 0, 125, 255));
    return;
  }
  
  if (ex == selEx && gh == selGh) {
    fill(scol, map(selFact.get(), 0, 1, 125, 255));
  } else {
    if (ex != selEx0 || gh != selGh0) {
      fill(scol, 125);
    } else {
      fill(scol, map(selFact.get(), 0, 1, 255, 125));
    }
  }
}

void initStringMaps() {
  sexMap = new HashMap<Integer, String>();
  sexMap.put(0, "Male");
  sexMap.put(1, "Female");

  // Short salary strings
  slsMap = new HashMap<Integer, String>();
  slsMap.put(0, "15k");
  slsMap.put(1, "25k");
  slsMap.put(2, "50k");
  slsMap.put(3, "50k+");
  
  // Long salary strings
  sllMap = new HashMap<Integer, String>();
  sllMap.put(0, "Less than $15,000");
  sllMap.put(1, "$15,000 - $25,000");
  sllMap.put(2, "$25,000 - $50,000");
  sllMap.put(3, "More than $50,000");
    
  exMap = new HashMap<Integer, String>();
  exMap.put(0, "Yes");
  exMap.put(1, "No");
  
  ghMap = new HashMap<Integer, String>();
  ghMap.put(0, "Excellent");
  ghMap.put(1, "Very good");
  ghMap.put(2, "Good");
  ghMap.put(3, "Fair");
  ghMap.put(4, "Poor");
    
  colorMode(HSB);
  colorMap = new HashMap<Integer, Integer>();
  for (int i = 0; i < 5; i++) {
    float t = i / 4.0;    
    int colort = color(hue(color0), saturation(color0) * (1 - t) + saturation(color1) * t, 
                                    brightness(color0) * (1 - t) + brightness(color1) * t);                                    
    colorMap.put(i, colort);
  }
  colorMode(RGB);
}

void createButtons() {
  float x0 = leftMargin + plotWidth + separation + 80;
  sexBtns = new ArrayList<Button>();  
  for (int i = 0; i < 2; i++) {
    sexBtns.add(new Button(sexMap.get(i), x0, topMargin + 25 + i * 30, 140, 25, i == selSex));  
  }

  salBtns = new ArrayList<Button>();
  for (int i = 0; i < 4; i++) {
    salBtns.add(new Button(sllMap.get(i), x0, topMargin + 115 + i * 30, 140, 25, i == selSal));  
  }  
}

void drawButtons() {
  float x0 = leftMargin + plotWidth + separation + 80;
  
  pushStyle();
  fill(0);
  textAlign(CENTER);
  text("Sex", x0 + 70, topMargin + 20);
  text("Salary", x0 + 70, topMargin + 110);
  popStyle();
  for (Button btns: sexBtns) btns.draw();
  for (Button btns: salBtns) btns.draw();
}

class ProbTable {
  float[] pex;
  float[][] phex;
  int totCount;

  ProbTable(String filename) {
    Table table = loadTable(filename, "header");
    
    pex = new float[2];
    phex = new float[5][2];
    totCount = 0;
    for (int i = 0; i < table.getRowCount (); i++) {
      TableRow row = table.getRow(i);
      int ex = row.getInt("EXERANY2");
      int gh = row.getInt("GENHLTH");
      int count = row.getInt("COUNT");
      pex[ex - 1] += count;
      phex[gh - 1][ex - 1] += count;
      totCount += count;
    }

    for (int i = 0; i < 5; i++) {
      for (int j = 0; j < 2; j++) {
        phex[i][j] /= pex[j];
      }
    }
  }
  
  // health (General health) = 0:Excellent, 1:Very good, 2:Good, 3:Fair, 4:Poor
  // exercise (Exercise in past 30 days) = 0:yes, 1:no
  float get(int health, int exercise) {
    return phex[health][exercise];
  }
  
  float get(int exercise) {
    return pex[exercise] / totCount;
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
    noStroke();
    fill(buttonColor, selFact.get() * 255);
    rect(x, y, w, h);
            
    pushStyle();
    textAlign(CENTER);
    fill(0, selFact.get() * 255);
    text(label, x + w/2, y + h/2 + font.getSize()/2 - 2);
    popStyle();
  }
  
  boolean pressed() {
    return x <= mouseX && mouseX <= x + w &&
           y <= mouseY && mouseY <= y + h;
  }
  
  void select(ArrayList<Button> all) {
    if (!selected) {
      selFact.target(1);
      for (Button btn: all) {
        if (btn != this) btn.deselect();
      }
      selected = true;
    }    
  }
  
  void deselect() {
    if (selected) {
      selFact.target(0.5);
      selected = false;      
    }
  }
}
