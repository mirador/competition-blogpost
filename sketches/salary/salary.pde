int WIDTH = 600;
int HEIGHT = 400;
float right = 10;
float top = 50;
float spacing = 30;

Table table;
int count;
float minSalary, maxSalary;
String[] months;
float[] salaries;

float offset;

int selected = 0;
SoftFloat sely;
SoftFloat selx0, selx1;
SoftFloat selFact;

ArrayList<SoftFloat> softfs;

void setup() {
  size(WIDTH, HEIGHT, P2D);
  table = loadTable("salary.csv", "header");
  
  count = table.getRowCount();
  months = new String[count];
  salaries = new float[count];
  minSalary = 10000;
  maxSalary = 0;
  for (int i = 0; i < count; i++) {
    TableRow row = table.getRow(i);
    months[i] = row.getString("Month");    
    salaries[i] = row.getFloat("Median");
    minSalary = min(minSalary, salaries[i]);
    maxSalary = max(maxSalary, salaries[i]);  
  }
  
  for (int i = 0; i < count; i++) {
    salaries[i] = map(salaries[i], minSalary, maxSalary, 0, 1);
  }
  
  PFont font = createFont("Helvetica", 14);
  textFont(font);
  offset = -font.getSize() / 2;
  
  softfs = new ArrayList<SoftFloat>();
  sely = new SoftFloat(top + selected * spacing + offset);
  softfs.add(sely);
  selx0 = new SoftFloat(right + textWidth(months[selected]) + 10); 
  softfs.add(selx0);
  selx1 = new SoftFloat(right + 90 + 100 * salaries[selected]);
  softfs.add(selx1);
  selFact = new SoftFloat(1);
  softfs.add(selFact);
  selFact.damping = 0.2;
}

void draw() {
  background(0);
  for (SoftFloat sf: softfs) sf.update();

  fill(255);
  text("Month", right, top - 30);
  text("Median salary", right + 120 , top - 30);
  for (int i = 0; i < count; i++) {
    text(months[i], right, top + i * spacing); 
  }
  
  noFill();
  stroke(255);
  beginShape();
  
  curveVertex(right + 90 + 100 * salaries[0], top + offset);
  for (int i = 0; i < count; i++) {
    curveVertex(right + 90 + 100 * salaries[i], top + i * spacing + offset);
  }
  curveVertex(right + 90 + 100 * salaries[count - 1], top + (count - 1) * spacing + offset);
  endShape();
  
  fill(255);
  for (int i = 0; i < count; i++) {
    ellipse(right + 90 + 100 * salaries[i], top + i * spacing + offset, 5, 5);
  }

  fill(255 * selFact.get());
  float value = map(salaries[selected], 0, 1, minSalary, maxSalary);
  text("$" + nfc(int(value), 0), right + 90 + 100 * salaries[selected] + 10, top + selected * spacing);
    
  stroke(255, 100);
  line(selx0.get(), sely.get(), selx1.get(), sely.get());
}

void mouseMoved() {
  int selected0 = selected;  
  
  if (mouseX < right + 90) {
    for (int i = 0; i < count; i++) {
      float w = textWidth(months[i]);
      float y1 = top + i * spacing;
      float y0 = 0 < i ? y1 - spacing : y1 + 2 * offset;
      if (right <= mouseX && mouseX <= right + w &&
          y0 <= mouseY && mouseY <= y1) {
        selected = i;
        break;
      }     
    }    
  } else {
    for (int i = 0; i < count; i++) {
      float x = right + 90 + 100 * salaries[i];
      float y = top + i * spacing + offset;
      if (dist(mouseX, mouseY, x, y) < 10) {
        selected = i;
        break;
      }
    }    
  }
  
  if (selected != -1 && selected0 != selected) {
    sely.target(top + selected * spacing + offset);
    selx0.target(right + textWidth(months[selected]) + 10); 
    selx1.target(right + 90 + 100 * salaries[selected]);    
    selFact.set(0);
    selFact.target(1);
  }
}
