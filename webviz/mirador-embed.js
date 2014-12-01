var sketchRes;
var sketchHealth;

function lessThanHalf() {
  if (!sketchRes) searchResSketch();
  sketchRes.setFemTeachers(0, 50);
}

function moreThanHalf() {
  if (!sketchRes) searchResSketch();
  sketchRes.setFemTeachers(50, 100);
}

function anyPercentage() {
  if (!sketchRes) searchResSketch();
  sketchRes.setFemTeachers(0, 100);
}

function lowIncomeFemales() {
  if (!sketchHealth) searchHealthSketch();
  sketchHealth.setCovariates(0, 1);
}

function lowIncomeMales() {
  if (!sketchHealth) searchHealthSketch();
  sketchHealth.setCovariates(0, 0);
}

function highIncomeFemales() {
  if (!sketchHealth) searchHealthSketch();
  sketchHealth.setCovariates(3, 1);
}

function highIncomeMales() {
  if (!sketchHealth) searchHealthSketch();
  sketchHealth.setCovariates(3, 0);
}    

function searchResSketch() {
  var frames = document.getElementsByTagName('iframe');
  for (var i = 0; i < frames.length; i++) {
  	var frame = frames[i];
  	if (frame.contentWindow.research) {
  	  sketchRes = frame.contentWindow.research;
  	  break;
  	}
  }
}

function searchHealthSketch() {
  var frames = document.getElementsByTagName('iframe');
  for (var i = 0; i < frames.length; i++) {
    var frame = frames[i];
    if (frame.contentWindow.health) {
      sketchHealth = frame.contentWindow.health;
      break;
    }
  }
}



