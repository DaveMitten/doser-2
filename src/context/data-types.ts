export interface Vaporizer {
  name: string;
  type: "portable" | "desktop";
  chamberCapacity: number; // grams
  capsuleOption: boolean;
  dosingCapsuleCapacity: number; // grams
  extractionEfficiency: number; // % THC extraction at 210°C [${DIA-SOURCE}](reddit.com/2l)
}
