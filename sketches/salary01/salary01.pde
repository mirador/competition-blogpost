int topMargin = 50;
int bottomMargin = 20;
int leftMargin = 10;
int rightMargin = 50;
int monthSpacing = 30;
int monthWidth = 150;
int curveWidth = 100;
int curveSpacing = 80; 

int WIDTH = monthWidth + 3 * curveWidth + 2 * curveSpacing + rightMargin;
int HEIGHT = topMargin + 12 * monthSpacing + bottomMargin;

Table table;
int count;
float minSalary, maxSalary;
float minCount, maxCount;
float minCountNonUS, maxCountNonUS;
String[] months;
float[] salaries;
float[] counts;
float[] countsNonUS;

int selected = 6;
SoftFloat selFact;

ArrayList<SoftFloat> softfs;

PFont font;
int selColor = #278DD2;
int monthColor = #9DCFF0;

void setup() {
  size(WIDTH, HEIGHT, P2D);
  smooth(4);
  
  table = loadTable("salary.csv", "header");
  
  count = table.getRowCount();
  months = new String[count];
  salaries = new float[count];
  counts = new float[count];
  countsNonUS = new float[count];
  minSalary = 0;
  maxSalary = 0;
  minCount = 0;
  maxCount = 0;
  minCountNonUS = 0; 
  maxCountNonUS = 0;
  for (int i = 0; i < count; i++) {
    TableRow row = table.getRow(i);
    months[i] = row.getString("Month");    
    salaries[i] = row.getFloat("Median");
    counts[i] = row.getInt("Count");
    countsNonUS[i] = row.getInt("Count non-US");
    minSalary = min(minSalary, salaries[i]);
    maxSalary = max(maxSalary, salaries[i]);    
    minCount = min(minCount, counts[i]);
    maxCount = max(maxCount, counts[i]);    
    minCountNonUS = min(minCountNonUS, countsNonUS[i]);
    maxCountNonUS = max(maxCountNonUS, countsNonUS[i]);    
  }
  
  for (int i = 0; i < count; i++) {
    salaries[i] = map(salaries[i], minSalary, maxSalary, 0, 1);
    counts[i] = map(counts[i], minCount, maxCount, 0, 1);
    countsNonUS[i] = map(countsNonUS[i], minCountNonUS, maxCountNonUS, 0, 1);
  }
  
  font = createFont("Helvetica", 14);
  textFont(font);
  
  softfs = new ArrayList<SoftFloat>();
  selFact = new SoftFloat(1);
  softfs.add(selFact);
  selFact.damping = 0.2;
}

void draw() {
  background(255);
  for (SoftFloat sf: softfs) sf.update();

  fill(0, 120);
  text("Month", leftMargin, topMargin - 20);
  pushStyle();
  textAlign(CENTER);
  text("Median salary", monthWidth + (curveWidth + 10)/2, topMargin - 20);
  text("US-born players", monthWidth + curveWidth + curveSpacing + (curveWidth + 10)/2, topMargin - 20);
  text("Non US-born players", monthWidth + 2 * curveWidth + 2 * curveSpacing + (curveWidth + 10)/2, topMargin - 20);
  popStyle();
  
  float my = topMargin;
  for (int i = 0; i < count; i++) {
    fill(0);
    float y0 = my + monthSpacing - font.getSize() / 2;
    if (i == selected) {
      noStroke();
      fill(red(monthColor), green(monthColor), blue(monthColor), selFact.get() * 255);
      rect(0, my, monthWidth, monthSpacing);
      fill(255); 
    } else {
      fill(0);
    }
    text(months[i], leftMargin, y0);
    my += monthSpacing;
  }
  
  drawCurve(salaries, monthWidth);
  drawCurve(counts, monthWidth + curveWidth + curveSpacing);
  drawCurve(countsNonUS, monthWidth + 2 * curveWidth + 2 * curveSpacing);

  fill(0, 255 * selFact.get());
  float vx = monthWidth;
  float vy = topMargin + (selected + 1) * monthSpacing - font.getSize()/2;
  float salary = map(salaries[selected], 0, 1, minSalary, maxSalary);
  text("$" + nfc(int(salary), 0), vx + curveWidth * salaries[selected] + 10, vy);
  vx += curveWidth + curveSpacing;
  float count = map(counts[selected], 0, 1, minCount, maxCount);
  text(nfc(int(count), 0), vx + curveWidth * counts[selected] + 10, vy);  
  vx += curveWidth + curveSpacing;
  float countNonUS = map(countsNonUS[selected], 0, 1, minCountNonUS, maxCountNonUS);
  text(nfc(int(countNonUS), 0), vx + curveWidth * countsNonUS[selected] + 10, vy);   
}

void drawCurve(float[] values, float x0) {
  float th = count * monthSpacing; 
  
  noStroke();
  fill(230);
  rect(x0, topMargin, curveWidth + 10, th);
  
  float y = topMargin;
  noFill();
  stroke(0);
  beginShape();  
  curveVertex(x0 + curveWidth * values[0], y + monthSpacing/2);  
  for (int i = 0; i < count; i++) {
    curveVertex(x0 + curveWidth * values[i], y + monthSpacing/2);
    y += monthSpacing;
  }
  curveVertex(x0 + curveWidth * values[count - 1], y - monthSpacing/2);
  endShape();
    
  y = topMargin;
  noStroke();
  for (int i = 0; i < count; i++) {
    float r = 5;
    if (i == selected) {
      fill(selColor);
      r = map(selFact.get(), 0, 1, 5, 10);
    } else {
      fill(0);
    }
    ellipse(x0 + curveWidth * values[i], y + monthSpacing/2, r, r);
    y += monthSpacing;
  }   
}

void mouseMoved() {
  int selected0 = selected;  
  
  for (int i = 0; i < count; i++) {
    float y1 = topMargin + i * monthSpacing + font.getSize()/2;
    float y0 = 0 < i ? y1 - monthSpacing : y1 - font.getSize()/2;
    if (y0 <= mouseY && mouseY <= y1) {
      selected = i;
      break;
    }     
  }
  
  float y = topMargin;
  for (int i = 0; i < count; i++) {
    if (y <= mouseY && mouseY <= y + monthSpacing) {
      selected = i;
      break;
    }
    y += monthSpacing;
  }
  
  if (selected != -1 && selected0 != selected) {
    selFact.set(0);
    selFact.target(1);
  }
}
