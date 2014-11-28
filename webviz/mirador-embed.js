var sketch;

function lessThanHalf() {
  if (!sketch) searchSketch();
  sketch.setFemTeachers(0, 50);
}

function moreThanHalf() {
  if (!sketch) searchSketch();
  sketch.setFemTeachers(50, 100);
}

function anyPercentage() {
  if (!sketch) searchSketch();
  sketch.setFemTeachers(0, 100);
}

function searchSketch() {
  var frames = document.getElementsByTagName('iframe');
  for (var i = 0; i < frames.length; i++) {
  	var frame = frames[i];
  	if (frame.contentWindow.health) {
  	  sketch = frame.contentWindow.health;
  	  break;
  	}
  }
}