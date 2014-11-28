class SoftFloat {
  float attraction = 0.1;
  float damping = 0.5;

  float value;
  float velocity;
  float acceleration;
  
  boolean targeting;
  float target;

  SoftFloat() {
    this(0);
  }

  SoftFloat(float v) {
    value = target = v;
  }
  
  boolean update() {
    if (targeting) {
      acceleration += attraction * (target - value);
      velocity = (velocity + acceleration) * damping;
      value += velocity;
      acceleration = 0;
      if (abs(velocity) > 0.0001 && abs(target - value) >= 0) {
        return true; // still updating
      }
      
      value = target; // arrived, set it to the target value to prevent rounding error
      targeting = false;
    }
    return false;
  }

  void target(float t) {
    targeting = true;
    target = t;
  }
  
  void set(float v) {
    value = v;
  }
  
  float get() {
    return value;
  }
}
