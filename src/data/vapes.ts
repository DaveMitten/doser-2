import { type Vaporizer } from "../context/data-types";

export const dryHerbVaporizers: Vaporizer[] = [
  // Portable vaporizers
  {
    name: "Venty Vaporizer",
    type: "portable",
    chamberCapacity: 0.3, // grams
    capsuleOption: true,
    dosingCapsuleCapacity: 0.15, // grams
    extractionEfficiency: 63, // % THC extraction at 210°C [${DIA-SOURCE}](reddit.com/2l)
  },
  {
    name: "Crafty+ (Plus) Vaporizer",
    type: "portable",
    chamberCapacity: 0.3, // grams
    capsuleOption: true,
    dosingCapsuleCapacity: 0.15, // grams
    extractionEfficiency: 60, // % THC extraction (estimated, similar to Mighty+) [${DIA-SOURCE}](reddit.com/3j)
  },
  {
    name: "Mighty+ (Plus) Vaporizer",
    type: "portable",
    chamberCapacity: 0.3, // grams
    capsuleOption: true,
    dosingCapsuleCapacity: 0.15, // grams
    extractionEfficiency: 72, // % THC extraction at 210°C [${DIA-SOURCE}](reddit.com/2l)
  },
  {
    name: "PAX Plus",
    type: "portable",
    chamberCapacity: 0.25, // grams (adjustable up to 0.5g)
    capsuleOption: true,
    dosingCapsuleCapacity: 0.15, // grams
    extractionEfficiency: 55, // % THC extraction (estimated, similar to DaVinci) [${DIA-SOURCE}](pmc.ncbi.nlm.nih.gov/2r)
  },
  {
    name: "PAX Mini",
    type: "portable",
    chamberCapacity: 0.25, // grams
    capsuleOption: true,
    dosingCapsuleCapacity: 0.15, // grams
    extractionEfficiency: 55, // % THC extraction (estimated, similar to PAX Plus)
  },
  {
    name: "Arizer Solo 3",
    type: "portable",
    chamberCapacity: 0.5, // grams (XL glass tube)
    capsuleOption: true,
    dosingCapsuleCapacity: 0.15, // grams
    extractionEfficiency: 83, // % THC extraction [${DIA-SOURCE}](pmc.ncbi.nlm.nih.gov/2r)
  },
  {
    name: "Tinymight 2",
    type: "portable",
    chamberCapacity: 0,
    capsuleOption: true,
    dosingCapsuleCapacity: 0.15, // grams
    extractionEfficiency: 65, // % THC extraction (estimated, convection portable)
  },
  {
    name: "Angus Vaporizer",
    type: "portable",
    chamberCapacity: 0,
    capsuleOption: true,
    dosingCapsuleCapacity: 0.15, // grams
    extractionEfficiency: 65, // % THC extraction (estimated, convection portable)
  },
  {
    name: "DaVinci IQ3",
    type: "portable",
    chamberCapacity: 0,
    capsuleOption: true,
    dosingCapsuleCapacity: 0.2, // grams
    extractionEfficiency: 55, // % THC extraction [${DIA-SOURCE}](pmc.ncbi.nlm.nih.gov/2r)
  },
  {
    name: "XMax V3 Pro",
    type: "portable",
    chamberCapacity: 0,
    capsuleOption: true,
    dosingCapsuleCapacity: 0.15, // grams
    extractionEfficiency: 60, // % THC extraction (estimated, convection portable)
  },
  {
    name: "DynaVap M7",
    type: "portable",
    chamberCapacity: 0,
    capsuleOption: true,
    dosingCapsuleCapacity: 0.06, // grams
    extractionEfficiency: 60, // % THC extraction (estimated, manual torch)
  },
  // Desktop vaporizers
  {
    name: "Volcano Hybrid",
    type: "desktop",
    chamberCapacity: 0.5, // grams
    capsuleOption: true,
    dosingCapsuleCapacity: 0.15, // grams
    extractionEfficiency: 73, // % THC extraction at 210°C [${DIA-SOURCE}](reddit.com/2l)
  },
  {
    name: "Volcano Classic",
    type: "desktop",
    chamberCapacity: 0.5, // grams
    capsuleOption: true,
    dosingCapsuleCapacity: 0.15, // grams
    extractionEfficiency: 58, // % THC extraction [${DIA-SOURCE}](pmc.ncbi.nlm.nih.gov/2r)
  },
  {
    name: "Arizer Extreme Q",
    type: "desktop",
    chamberCapacity: 0.5, // grams
    capsuleOption: true,
    dosingCapsuleCapacity: 0.15, // grams
    extractionEfficiency: 83, // % THC extraction (same as Arizer Solo) [${DIA-SOURCE}](pmc.ncbi.nlm.nih.gov/2r)
  },
  {
    name: "Plenty Vaporizer",
    type: "desktop",
    chamberCapacity: 1.0, // grams
    capsuleOption: true,
    dosingCapsuleCapacity: 0.15, // grams
    extractionEfficiency: 67, // % THC extraction [${DIA-SOURCE}](pmc.ncbi.nlm.nih.gov/2r)
  },
  {
    name: "Herborizer Ti/XL",
    type: "desktop",
    chamberCapacity: 0.5, // grams
    capsuleOption: false,
    dosingCapsuleCapacity: 0, // grams
    extractionEfficiency: 70, // % THC extraction (estimated, desktop convection)
  },
];
