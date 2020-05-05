//Return a vector of the average amplitudes of "low", "med" and "high" frequencies
function getAmplitudes(){
  //Only use frequencies in the vocal range (100-2000 Hz)
  let min_freq = 100; //Min frequency to analyze
  let med1_freq = 385; //partition between low and med ranges
  let med2_freq = 1000; // partition between med and high ranges
  let max_freq = 2000; //Max frequency to analaze

  let spectrum = fft.analyze();
  //getEnergy gives amplitude of the frequency rangep; value is 0-255
  let low = fft.getEnergy(min_freq, med1_freq);
  let med = fft.getEnergy(med1_freq, med2_freq);
  let high = fft.getEnergy(med2_freq, max_freq);

  return createVector(low,med,high);
}
