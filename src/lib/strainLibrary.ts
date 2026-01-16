/**
 * CANONICAL STRAIN LIBRARY
 * Version: 1.0.0
 * 
 * Authoritative reference for GO Calculator application.
 * Contains 60 real, commonly known cannabis cultivars.
 * 
 * CONSTRAINTS:
 * - No chemical data (THC/CBD/terpenes belong in COA inventory)
 * - IDs are immutable references for engine + UI binding
 * - cultivarType and vibeTags reflect established user knowledge
 * - New strains append only; existing entries never modify
 */

export type Strain = {
  id: string;
  name: string;
  cultivarType: "indica" | "sativa" | "hybrid";
  vibeTags: string[];
};

export const STRAIN_LIBRARY: Strain[] = [
  {
    id: "strain_001",
    name: "Blue Dream",
    cultivarType: "hybrid",
    vibeTags: ["uplifting", "creative", "balanced", "euphoric", "daytime", "social"]
  },
  {
    id: "strain_002",
    name: "Sour Diesel",
    cultivarType: "sativa",
    vibeTags: ["energetic", "cerebral", "focused", "pungent", "motivating", "daytime"]
  },
  {
    id: "strain_003",
    name: "OG Kush",
    cultivarType: "hybrid",
    vibeTags: ["euphoric", "relaxed", "earthy", "stress-relief", "classic", "evening"]
  },
  {
    id: "strain_004",
    name: "Granddaddy Purple",
    cultivarType: "indica",
    vibeTags: ["sedating", "body-heavy", "sleepy", "grape", "nighttime", "couch-lock"]
  },
  {
    id: "strain_005",
    name: "Green Crack",
    cultivarType: "sativa",
    vibeTags: ["energizing", "sharp", "focused", "fruity", "productive", "morning"]
  },
  {
    id: "strain_006",
    name: "Girl Scout Cookies",
    cultivarType: "hybrid",
    vibeTags: ["euphoric", "relaxing", "sweet", "dessert", "happy", "balanced"]
  },
  {
    id: "strain_007",
    name: "Bubba Kush",
    cultivarType: "indica",
    vibeTags: ["tranquil", "heavy", "sleepy", "chocolate", "nighttime", "sedating"]
  },
  {
    id: "strain_008",
    name: "Jack Herer",
    cultivarType: "sativa",
    vibeTags: ["clear-headed", "creative", "uplifting", "pine", "energetic", "legendary"]
  },
  {
    id: "strain_009",
    name: "Northern Lights",
    cultivarType: "indica",
    vibeTags: ["peaceful", "body-focused", "sleepy", "sweet", "classic", "relaxing"]
  },
  {
    id: "strain_010",
    name: "Durban Poison",
    cultivarType: "sativa",
    vibeTags: ["energetic", "clear", "focused", "sweet", "daytime", "pure-sativa"]
  },
  {
    id: "strain_011",
    name: "Wedding Cake",
    cultivarType: "hybrid",
    vibeTags: ["relaxing", "euphoric", "vanilla", "dessert", "calming", "evening"]
  },
  {
    id: "strain_012",
    name: "Gorilla Glue #4",
    cultivarType: "hybrid",
    vibeTags: ["heavy", "couch-lock", "euphoric", "earthy", "potent", "nighttime"]
  },
  {
    id: "strain_013",
    name: "Pineapple Express",
    cultivarType: "hybrid",
    vibeTags: ["uplifting", "energetic", "tropical", "cedar", "happy", "daytime"]
  },
  {
    id: "strain_014",
    name: "Strawberry Cough",
    cultivarType: "sativa",
    vibeTags: ["uplifting", "social", "berry", "cerebral", "energetic", "expansive"]
  },
  {
    id: "strain_015",
    name: "Purple Punch",
    cultivarType: "indica",
    vibeTags: ["sedating", "grape", "sleepy", "dessert", "body-heavy", "nighttime"]
  },
  {
    id: "strain_016",
    name: "White Widow",
    cultivarType: "hybrid",
    vibeTags: ["balanced", "energetic", "euphoric", "earthy", "classic", "social"]
  },
  {
    id: "strain_017",
    name: "AK-47",
    cultivarType: "hybrid",
    vibeTags: ["alert", "creative", "long-lasting", "earthy", "cerebral", "daytime"]
  },
  {
    id: "strain_018",
    name: "Super Lemon Haze",
    cultivarType: "sativa",
    vibeTags: ["citrus", "energetic", "uplifting", "zesty", "creative", "award-winner"]
  },
  {
    id: "strain_019",
    name: "Gelato",
    cultivarType: "hybrid",
    vibeTags: ["euphoric", "balanced", "dessert", "berry", "relaxing", "smooth"]
  },
  {
    id: "strain_020",
    name: "Skywalker OG",
    cultivarType: "indica",
    vibeTags: ["relaxing", "body-focused", "spicy", "sleepy", "spacey", "nighttime"]
  },
  {
    id: "strain_021",
    name: "Trainwreck",
    cultivarType: "hybrid",
    vibeTags: ["energetic", "creative", "euphoric", "lemon", "cerebral", "intense"]
  },
  {
    id: "strain_022",
    name: "Cherry Pie",
    cultivarType: "hybrid",
    vibeTags: ["relaxing", "sweet", "balanced", "cherry", "euphoric", "evening"]
  },
  {
    id: "strain_023",
    name: "Zkittlez",
    cultivarType: "indica",
    vibeTags: ["fruity", "relaxing", "calming", "tropical", "grape", "mellow"]
  },
  {
    id: "strain_024",
    name: "Maui Wowie",
    cultivarType: "sativa",
    vibeTags: ["tropical", "energizing", "creative", "pineapple", "uplifting", "classic"]
  },
  {
    id: "strain_025",
    name: "Chemdawg",
    cultivarType: "hybrid",
    vibeTags: ["cerebral", "diesel", "potent", "pungent", "creative", "legendary"]
  },
  {
    id: "strain_026",
    name: "LA Confidential",
    cultivarType: "indica",
    vibeTags: ["sedating", "smooth", "pine", "sleepy", "body-heavy", "award-winner"]
  },
  {
    id: "strain_027",
    name: "Tangie",
    cultivarType: "sativa",
    vibeTags: ["citrus", "uplifting", "energetic", "tangerine", "creative", "happy"]
  },
  {
    id: "strain_028",
    name: "Do-Si-Dos",
    cultivarType: "indica",
    vibeTags: ["relaxing", "earthy", "calming", "sweet", "dessert", "heavy"]
  },
  {
    id: "strain_029",
    name: "Harlequin",
    cultivarType: "sativa",
    vibeTags: ["clear-headed", "functional", "mellow", "earthy", "therapeutic", "balanced"]
  },
  {
    id: "strain_030",
    name: "Sunset Sherbet",
    cultivarType: "indica",
    vibeTags: ["euphoric", "relaxing", "fruity", "berry", "dessert", "calming"]
  },
  {
    id: "strain_031",
    name: "Bruce Banner",
    cultivarType: "hybrid",
    vibeTags: ["potent", "euphoric", "energetic", "diesel", "creative", "intense"]
  },
  {
    id: "strain_032",
    name: "Purple Haze",
    cultivarType: "sativa",
    vibeTags: ["psychedelic", "creative", "berry", "euphoric", "cerebral", "classic"]
  },
  {
    id: "strain_033",
    name: "Blueberry",
    cultivarType: "indica",
    vibeTags: ["fruity", "relaxing", "berry", "sleepy", "sweet", "classic"]
  },
  {
    id: "strain_034",
    name: "Amnesia Haze",
    cultivarType: "sativa",
    vibeTags: ["uplifting", "cerebral", "energetic", "citrus", "earthy", "award-winner"]
  },
  {
    id: "strain_035",
    name: "Runtz",
    cultivarType: "hybrid",
    vibeTags: ["balanced", "candy", "fruity", "euphoric", "smooth", "tropical"]
  },
  {
    id: "strain_036",
    name: "Critical Kush",
    cultivarType: "indica",
    vibeTags: ["heavy", "sedating", "earthy", "sleepy", "body-focused", "potent"]
  },
  {
    id: "strain_037",
    name: "Mango Kush",
    cultivarType: "hybrid",
    vibeTags: ["tropical", "happy", "relaxing", "mango", "euphoric", "sweet"]
  },
  {
    id: "strain_038",
    name: "Death Star",
    cultivarType: "indica",
    vibeTags: ["sedating", "diesel", "heavy", "earthy", "sleepy", "nighttime"]
  },
  {
    id: "strain_039",
    name: "Candyland",
    cultivarType: "sativa",
    vibeTags: ["uplifting", "energetic", "sweet", "berry", "cerebral", "stimulating"]
  },
  {
    id: "strain_040",
    name: "Headband",
    cultivarType: "hybrid",
    vibeTags: ["cerebral", "relaxing", "lemon", "diesel", "pressure", "creative"]
  },
  {
    id: "strain_041",
    name: "Mimosa",
    cultivarType: "sativa",
    vibeTags: ["uplifting", "citrus", "happy", "energetic", "tropical", "morning"]
  },
  {
    id: "strain_042",
    name: "Animal Cookies",
    cultivarType: "hybrid",
    vibeTags: ["sedating", "sweet", "potent", "vanilla", "dessert", "relaxing"]
  },
  {
    id: "strain_043",
    name: "Tahoe OG",
    cultivarType: "hybrid",
    vibeTags: ["relaxing", "earthy", "lemon", "body-focused", "potent", "evening"]
  },
  {
    id: "strain_044",
    name: "Acapulco Gold",
    cultivarType: "sativa",
    vibeTags: ["euphoric", "energizing", "coffee", "motivating", "legendary", "uplifting"]
  },
  {
    id: "strain_045",
    name: "Lemon Haze",
    cultivarType: "sativa",
    vibeTags: ["citrus", "uplifting", "energetic", "lemon", "creative", "clean"]
  },
  {
    id: "strain_046",
    name: "Cookies and Cream",
    cultivarType: "hybrid",
    vibeTags: ["balanced", "dessert", "euphoric", "vanilla", "relaxing", "smooth"]
  },
  {
    id: "strain_047",
    name: "Master Kush",
    cultivarType: "indica",
    vibeTags: ["relaxing", "earthy", "body-focused", "citrus", "calming", "classic"]
  },
  {
    id: "strain_048",
    name: "Chem Dawg #4",
    cultivarType: "hybrid",
    vibeTags: ["cerebral", "diesel", "intense", "pungent", "creative", "potent"]
  },
  {
    id: "strain_049",
    name: "Biscotti",
    cultivarType: "hybrid",
    vibeTags: ["relaxing", "dessert", "sweet", "cookie", "calming", "smooth"]
  },
  {
    id: "strain_050",
    name: "Forbidden Fruit",
    cultivarType: "indica",
    vibeTags: ["relaxing", "fruity", "tropical", "cherry", "sleepy", "sweet"]
  },
  {
    id: "strain_051",
    name: "Clementine",
    cultivarType: "sativa",
    vibeTags: ["citrus", "uplifting", "energetic", "orange", "happy", "creative"]
  },
  {
    id: "strain_052",
    name: "Slurricane",
    cultivarType: "indica",
    vibeTags: ["sedating", "fruity", "heavy", "grape", "dessert", "sleepy"]
  },
  {
    id: "strain_053",
    name: "Sour Tangie",
    cultivarType: "sativa",
    vibeTags: ["citrus", "energetic", "uplifting", "tangerine", "diesel", "creative"]
  },
  {
    id: "strain_054",
    name: "MAC",
    cultivarType: "hybrid",
    vibeTags: ["euphoric", "balanced", "citrus", "diesel", "creative", "smooth"]
  },
  {
    id: "strain_055",
    name: "Ice Cream Cake",
    cultivarType: "indica",
    vibeTags: ["sedating", "dessert", "vanilla", "body-heavy", "sweet", "sleepy"]
  },
  {
    id: "strain_056",
    name: "Strawberry Banana",
    cultivarType: "hybrid",
    vibeTags: ["relaxing", "fruity", "berry", "tropical", "smooth", "balanced"]
  },
  {
    id: "strain_057",
    name: "Platinum OG",
    cultivarType: "indica",
    vibeTags: ["relaxing", "body-focused", "diesel", "pine", "potent", "sedating"]
  },
  {
    id: "strain_058",
    name: "Lemon Kush",
    cultivarType: "hybrid",
    vibeTags: ["uplifting", "citrus", "balanced", "lemon", "refreshing", "happy"]
  },
  {
    id: "strain_059",
    name: "Pink Kush",
    cultivarType: "indica",
    vibeTags: ["sedating", "body-heavy", "floral", "vanilla", "sleepy", "potent"]
  },
  {
    id: "strain_060",
    name: "Chiesel",
    cultivarType: "sativa",
    vibeTags: ["energetic", "cerebral", "diesel", "cheese", "focused", "creative"]
  }
];

/**
 * STRAIN INDEX BY CULTIVAR TYPE
 * Pre-computed for efficient filtering
 */
export const STRAIN_INDEX = {
  sativa: STRAIN_LIBRARY.filter(s => s.cultivarType === "sativa"),
  indica: STRAIN_LIBRARY.filter(s => s.cultivarType === "indica"),
  hybrid: STRAIN_LIBRARY.filter(s => s.cultivarType === "hybrid")
} as const;

/**
 * STRAIN LOOKUP BY ID
 * O(1) access for engine output resolution
 */
export const STRAIN_BY_ID = new Map(
  STRAIN_LIBRARY.map(strain => [strain.id, strain])
);

/**
 * LOOKUP HELPERS
 */
export function getStrainById(id: string): Strain | undefined {
  return STRAIN_BY_ID.get(id);
}

export function getStrainsByType(type: "indica" | "sativa" | "hybrid"): Strain[] {
  return STRAIN_INDEX[type];
}

/**
 * LIBRARY METADATA
 */
export const LIBRARY_METADATA = {
  version: "1.0.0",
  strainCount: STRAIN_LIBRARY.length,
  sativaCount: STRAIN_INDEX.sativa.length,
  indicaCount: STRAIN_INDEX.indica.length,
  hybridCount: STRAIN_INDEX.hybrid.length
} as const;
