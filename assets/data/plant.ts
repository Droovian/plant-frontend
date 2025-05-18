import { Fertilizer, Crop, compatibilityInfo } from "@/types/plant";
import { plantImages } from "@/constants";
import { IndianState } from "@/types/plant";
import { RegionalFertilizer } from "@/types/plant";

const indianStates: IndianState[] = [
  { id: "s1", name: "Andhra Pradesh", region: "South" },
  { id: "s2", name: "Bihar", region: "East" },
  { id: "s3", name: "Gujarat", region: "West" },
  { id: "s4", name: "Haryana", region: "North" },
  { id: "s5", name: "Karnataka", region: "South" },
  { id: "s6", name: "Kerala", region: "South" },
  { id: "s7", name: "Madhya Pradesh", region: "Central" },
  { id: "s8", name: "Maharashtra", region: "West" },
  { id: "s9", name: "Punjab", region: "North" },
  { id: "s10", name: "Rajasthan", region: "North" },
  { id: "s11", name: "Tamil Nadu", region: "South" },
  { id: "s12", name: "Telangana", region: "South" },
  { id: "s13", name: "Uttar Pradesh", region: "North" },
  { id: "s14", name: "West Bengal", region: "East" },
  { id: "s15", name: "Assam", region: "Northeast" },
  { id: "s16", name: "Odisha", region: "East" },
  { id: "s17", name: "Chhattisgarh", region: "Central" },
  { id: "s18", name: "Jharkhand", region: "East" },
  {id: "s19", name: "Goa", region: "South"},
]

 const crops: Crop[] = [
  {
    id: "c101",
    name: "Rice (Paddy)",
    npkRequirement: { N: 120, P: 60, K: 60 },
    description: "Staple food crop grown extensively across India"
  },
  {
    id: "c102",
    name: "Wheat",
    npkRequirement: { N: 120, P: 60, K: 40 },
    description: "Primary rabi season crop in North India"
  },
  {
    id: "c103",
    name: "Cotton",
    npkRequirement: { N: 150, P: 60, K: 90 },
    description: "Important commercial crop in Gujarat, Maharashtra and Punjab"
  },
  {
    id: "c104",
    name: "Sugarcane",
    npkRequirement: { N: 250, P: 100, K: 100 },
    description: "Major cash crop in UP, Maharashtra and Karnataka"
  },
  {
    id: "c105",
    name: "Maize",
    npkRequirement: { N: 120, P: 60, K: 40 },
    description: "Growing importance as feed and industrial crop"
  },
  {
    id: "c106",
    name: "Groundnut",
    npkRequirement: { N: 25, P: 50, K: 75 },
    description: "Major oilseed crop in South and Western India"
  },
  {
    id: "c107",
    name: "Mustard",
    npkRequirement: { N: 80, P: 40, K: 40 },
    description: "Important oilseed crop in North India"
  },
  {
    id: "c108",
    name: "Potato",
    npkRequirement: { N: 120, P: 80, K: 100 },
    description: "Major vegetable crop across India"
  },
  {
    id: "c109",
    name: "Brinjal (Eggplant)",
    npkRequirement: { N: 300, P: 50, K: 90 },
    description: "Widely grown vegetable, thrives in warm climates; staple in Indian cuisine"
  }, // [1]
  {
    id: "c110",
    name: "Okra (Lady's Finger)",
    npkRequirement: { N: 120, P: 60, K: 60 },
    description: "Popular summer vegetable, valued for its tender pods"
  }, // [2] (M5 in study had highest yield, common Indian recommendation is 120:60:60)
  {
    id: "c111",
    name: "Tomato",
    npkRequirement: { N: 120, P: 60, K: 60 },
    description: "Major vegetable crop, grown year-round for fresh and processed use"
  }, // [3] (balanced NPK such as 10-10-10 recommended; typical Indian practice is 120:60:60)
  {
    id: "c112",
    name: "Onion",
    npkRequirement: { N: 125, P: 100, K: 100 },
    description: "Essential bulb crop, grown in all seasons across India"
  }, // [4]
  {
    id: "c113",
    name: "Red Amaranth",
    npkRequirement: { N: 400, P: 120, K: 120 },
    description: "Leafy vegetable rich in iron and vitamins, grown for tender leaves"
  }, // [5] (40 g/m² ≈ 400 kg/ha; P and K at 120 kg/ha based on proportional application)
  {
    id: "c114",
    name: "Cucumber",
    npkRequirement: { N: 150, P: 75, K: 75 },
    description: "Warm season vine crop, grown for fresh and salad use"
  }, // [6]
  {
    id: "c115",
    name: "Colocasia (Taro)",
    npkRequirement: { N: 80, P: 60, K: 80 },
    description: "Tuber crop grown for edible corms and leaves"
  }, // (Standard Indian recommendation; direct source not found, but aligns with typical extension guidelines)
  {
    id: "c116",
    name: "Tendli (Ivy Gourd)",
    npkRequirement: { N: 60, P: 50, K: 50 },
    description: "Perennial climber, popular in South and Western India"
  }, // [7] (No direct NPK, but standard for gourds is 60:50:50)
  {
    id: "c117",
    name: "Bitter Gourd",
    npkRequirement: { N: 100, P: 50, K: 50 },
    description: "Climbing vine, valued for its medicinal and nutritional properties"
  }, // [8] (10-10-15 kg/250m² ≈ 100:50:75; rounded to common field practice)
  {
    id: "c118",
    name: "Radish",
    npkRequirement: { N: 200, P: 100, K: 50 },
    description: "Fast-growing root vegetable, widely consumed raw or cooked"
  }, // [9]
  {
    id: "c119",
    name: "Basil",
    npkRequirement: { N: 60, P: 40, K: 40 },
    description: "Aromatic herb, grown for leaves used in culinary and medicinal applications"
  }, // [10] (100–150 ppm N ≈ 60 kg/ha; P, K estimated based on low fertility requirement)
  {
    id: "c120",
    name: "Pepper (Capsicum/Chili)",
    npkRequirement: { N: 150, P: 60, K: 60 },
    description: "Fruit vegetable, grown for fresh and dried spice markets"
  }, // (Standard Indian recommendation; direct source not found, but aligns with extension guidelines)
  {
    id: "c121",
    name: "Sweet Potato",
    npkRequirement: { N: 60, P: 50, K: 50 },
    description: "Tuber crop, rich in starch and vitamins, grown in tropical regions"
  }, // (Standard Indian recommendation; direct source not found)
  {
    id: "c122",
    name: "Corn (Sweet Corn)",
    npkRequirement: { N: 120, P: 60, K: 40 },
    description: "Warm-season cereal crop, grown for fresh cobs and processed products"
  }, // (Same as Maize; [your data])
  {
    id: "c123",
    name: "Cabbage",
    npkRequirement: { N: 150, P: 75, K: 75 },
    description: "Leafy vegetable, grown for dense heads, popular in cool seasons"
  }, // (Standard Indian recommendation; direct source not found)
  {
    id: "c124",
    name: "Carrot",
    npkRequirement: { N: 100, P: 60, K: 50 },
    description: "Root vegetable, rich in beta-carotene, grown in winter and spring"
  }, // (Standard Indian recommendation; direct source not found)
  {
    id: "c125",
    name: "Cowpea",
    npkRequirement: { N: 25, P: 50, K: 25 },
    description: "Legume crop, grown for edible pods and seeds, fixes atmospheric nitrogen"
  }, // (Standard Indian recommendation; direct source not found)
]
  
  const vegetables = [
    {
        name: "Okra",
        image: plantImages.okra,
        color: "#A8E6CE",
        noOfSquares: 1,
        noCount: 1, // Okra typically requires more space, so it's usually 1 plant per square foot.
        spacingFeet: 3, // Traditional spacing is about 3 feet apart.
        soilPH: [5.8, 7.0],
        sunlight: "Full Sun",
        soilType: ["Loamy", "Sandy"],
        nutrientLevel: "Moderate",
    },
    {
        name: "Tomato",
        image: plantImages.tomato,
        color: "#FFB3B3",
        noOfSquares: 1,
        noCount: 1, // Indeterminate tomatoes need about 1 square foot each.
        spacingFeet: 2, // Traditional spacing is about 2 feet apart.
        soilPH: [6.0, 6.8],
        sunlight: "Full Sun",
        soilType: ["Loamy", "Sandy"],
        nutrientLevel: "High",
    },
    {
        name: "Chilli",
        image: plantImages.chilli,
        color: "#FFDBA4",
        noOfSquares: 1,
        noCount: 4, // Chilli peppers can be planted closer together.
        spacingFeet: 1, // Traditional spacing is about 1 foot apart.
        soilPH: [5.5, 7.0],
        sunlight: "Full Sun",
        soilType: ["Loamy", "Sandy"],
        nutrientLevel: "Moderate",
    },
    {
        name: "Drumstick",
        image: plantImages.Drumstick,
        color: "#8BC34A",
        noOfSquares: 1,
        noCount: 1, // Typically one plant per square foot.
        spacingFeet: 6, // Traditional spacing is about 6 feet apart.
        soilPH: [6.0, 7.0],
        sunlight: "Full Sun",
        soilType: ["Well-drained"],
        nutrientLevel: "Moderate",
    },
    {
        name: "Pumpkin",
        image: plantImages.Pumpkin,
        color: "#FFC107",
        noOfSquares: 4, // Requires more space due to spreading vines.
        noCount: 1, // Typically one plant per planting area.
        spacingFeet: 5, // Traditional spacing is about 5 feet apart.
        soilPH: [6.0, 6.8],
        sunlight: "Full Sun",
        soilType: ["Well-drained"],
        nutrientLevel: "High",
    },
    {
        name: "Breadfruit",
        image: plantImages.Breadfruit,
        color: "#F7DC6F",
        noOfSquares: 4, // Requires more space due to tree size.
        noCount: 1, // Typically one tree per planting area.
        spacingFeet: 20, // Traditional spacing is about 20 feet apart.
        soilPH: [5.5, 7.0],
        sunlight: "Full Sun",
        soilType: ["Well-drained"],
        nutrientLevel: "Moderate",
    },
    {
        name: "Radish",
        image: plantImages.Radish,
        color: "#FF69B4",
        noOfSquares: 1,
        noCount: 16, // Can be densely planted.
        spacingFeet: 0.5, // Traditional spacing is about 0.5 feet apart.
        soilPH: [6.0, 7.0],
        sunlight: "Full Sun to Partial Shade",
        soilType: ["Well-drained"],
        nutrientLevel: "Moderate",
    },
    {
        name: "Eggplant",
        image: plantImages.Eggplant,
        color: "#D4B8E2",
        noOfSquares: 1,
        noCount: 1, // Eggplant typically requires about 1 square foot per plant.
        spacingFeet: 2, // Traditional spacing is about 2 feet apart.
        soilPH: [5.5, 6.5],
        sunlight: "Full Sun",
        soilType: ["Loamy", "Sandy"],
        nutrientLevel: "Moderate",
    },
    {
        name: "Potato",
        image: plantImages.Potato,
        color: "#F0D9FF",
        noOfSquares: 1,
        noCount: 4, // Potatoes can be planted with multiple seed potatoes per square foot.
        spacingFeet: 1, // Traditional spacing is about 1 foot apart.
        soilPH: [4.8, 6.5],
        sunlight: "Full Sun",
        soilType: ["Loamy", "Sandy"],
        nutrientLevel: "High",
    },
    {
        name: "Asparagus",
        image: plantImages.Asparagus,
        color: "#C4E17F",
        noOfSquares: 2, // Asparagus requires more space due to its spread.
        noCount: 1, // Typically one crown per planting area.
        spacingFeet: 1.5, // Traditional spacing is about 1.5 feet apart.
        soilPH: [6.5, 7.5],
        sunlight: "Full Sun",
        soilType: ["Loamy", "Sandy"],
        nutrientLevel: "High",
    },
    {
        name: "Beet",
        image: plantImages.Beet,
        color: "#E57373",
        noOfSquares: 1,
        noCount: 16, // Beets can be densely planted.
        spacingFeet: 0.5, // Traditional spacing is about 0.5 feet apart.
        soilPH: [6.0, 7.5],
        sunlight: "Full Sun",
        soilType: ["Loamy", "Sandy"],
        nutrientLevel: "Moderate",
    },
    {
        name: "Spinach",
        image: plantImages.Spinach,
        color: "#AED581",
        noOfSquares: 1,
        noCount: 9, // Spinach can be densely planted.
        spacingFeet: 0.5, // Traditional spacing is about 0.5 feet apart.
        soilPH: [6.0, 7.5],
        sunlight: "Full Sun to Partial Shade",
        soilType: ["Loamy", "Sandy"],
        nutrientLevel: "Moderate",
    },
    {
        name: "Corn",
        image: plantImages.Corn,
        color: "#FFF176",
        noOfSquares: 1,
        noCount: 1, // Corn typically requires about 1 square foot per plant.
        spacingFeet: 1, // Traditional spacing is about 1 foot apart in blocks.
        soilPH: [5.8, 7.0],
        sunlight: "Full Sun",
        soilType: ["Loamy", "Sandy"],
        nutrientLevel: "High",
    },
    {
        name: "Cucumber",
        image: plantImages.Cucumber,
        color: "#81C784",
        noOfSquares: 1,
        noCount: 2, // Cucumbers can be planted with two per square foot if trellised.
        spacingFeet: 1, // Traditional spacing is about 1 foot apart.
        soilPH: [5.5, 7.0],
        sunlight: "Full Sun",
        soilType: ["Loamy", "Sandy"],
        nutrientLevel: "High",
    },
    {
        name: "Onion",
        image: plantImages.Onion,
        color: "#FFD54F",
        noOfSquares: 1,
        noCount: 9, // Onions can be densely planted.
        spacingFeet: 0.5, // Traditional spacing is about 0.5 feet apart.
        soilPH: [6.0, 7.0],
        sunlight: "Full Sun",
        soilType: ["Loamy", "Sandy"],
        nutrientLevel: "Moderate",
    },
    {
        name: "Cowpea",
        image: plantImages.Cowpea,
        color: "#A1887F",
        noOfSquares: 1,
        noCount: 9, // Cowpeas can be densely planted.
        spacingFeet: 0.5, // Traditional spacing is about 0.5 feet apart.
        soilPH: [5.5, 6.5],
        sunlight: "Full Sun",
        soilType: ["Loamy", "Sandy"],
        nutrientLevel: "Low",
    },
    {
        name: "Lettuce",
        image: plantImages.Lettuce,
        color: "#C5E1A5",
        noOfSquares: 1, // Lettuce typically requires about 1 square foot.
        noCount: 4, // Lettuce can be densely planted.
        spacingFeet: 0.5, // Traditional spacing is about 0.5 feet apart.
        soilPH: [6.0, 6.8],
        sunlight: "Full Sun to Partial Shade",
        soilType: ["Loamy", "Sandy"],
        nutrientLevel: "Moderate",
    },
];

  

  const compatibility: compatibilityInfo[] = [
    {
      "Asparagus": {
        "companions": ["Tomato", "Parsley", "Basil", "Nasturtium"],
        "avoid": ["Garlic", "Onion", "Potato"]
      },
      "Bean": {
        "companions": ["Carrot", "Corn", "Cucumber", "Pea", "Radish", "Cabbage", "Cauliflower"],
        "avoid": ["Garlic", "Onion", "Chive", "Leek"]
      },
      "Beet": {
        "companions": ["Bush Bean", "Lettuce", "Onion", "Sage", "Brassica"],
        "avoid": ["Pole Bean"]
      },
      "Cabbage": {
        "companions": ["Celery", "Dill", "Onion", "Potato", "Beet", "Sage"],
        "avoid": ["Strawberry", "Tomato"]
      },
      "Carrot": {
        "companions": ["Bean", "Lettuce", "Onion", "Pea", "Radish", "Tomato"],
        "avoid": ["Dill"]
      },
      "Corn": {
        "companions": ["Bean", "Cucumber", "Pea", "Pumpkin", "Squash"],
        "avoid": ["Tomato"]
      },
      "Cucumber": {
        "companions": ["Bean", "Corn", "Pea", "Radish"],
        "avoid": ["Aromatic Herb", "Potato"]
      },
      "Lettuce": {
        "companions": ["Carrot", "Cucumber", "Radish", "Strawberry"],
        "avoid": ["Broccoli", "Cabbage"]
      },
      "Onion": {
        "companions": ["Beet", "Carrot", "Lettuce", "Strawberry", "Tomato"],
        "avoid": ["Bean", "Pea"]
      },
      "Pea": {
        "companions": ["Carrot", "Corn", "Cucumber", "Radish"],
        "avoid": ["Garlic", "Onion"]
      },
      "Potato": {
        "companions": ["Bean", "Cabbage", "Corn", "Pea"],
        "avoid": ["Cucumber", "Tomato"]
      },
      "Radish": {
        "companions": ["Carrot", "Cucumber", "Lettuce", "Pea", "Spinach"],
        "avoid": ["Hyssop"]
      },
      "Spinach": {
        "companions": ["Bean", "Carrot", "Strawberry"]
      },
      "Tomato": {
        "companions": ["Basil", "Carrot", "Onion", "Parsley"],
        "avoid": ["Cabbage", "Corn", "Potato"]
      },
      "Okra": {
        "companions": ["Pepper", "Cucumber", "Melon", "Eggplant"]
      },
      "Cauliflower": {
        "companions": ["Bean", "Celery", "Onion"],
        "avoid": ["Strawberry", "Tomato"]
      },
      "Pumpkin": {
        "companions": ["Corn", "Bean"],
        "avoid": ["Potato"]
      },
      "Chilli": {
        "companions": ["Basil", "Carrot", "Onion", "Parsley"],
        "avoid": ["Cabbage", "Fennel", "Okra"]
      },
      "Cowpea": {
        "companions": ["Corn", "Sorghum"]
      },
      "Basil": {
        "companions": ["Tomato", "Pepper", "Oregano", "Asparagus"],
        "avoid": ["Rue"]
      },
      "Broccoli": {
        "companions": ["Celery", "Onion", "Potato", "Dill"],
        "avoid": ["Strawberry", "Tomato"]
      },
      "Brussels Sprout": {
        "companions": ["Celery", "Onion", "Potato", "Dill"],
        "avoid": ["Strawberry", "Tomato"]
      },
      "Celery": {
        "companions": ["Bean", "Leek", "Cabbage", "Tomato"],
        "avoid": ["Corn"]
      },
      "Chive": {
        "companions": ["Carrot", "Tomato", "Rose", "Grape"],
        "avoid": ["Bean", "Pea"]
      },
      "Eggplant": {
        "companions": ["Bean", "Pepper", "Potato", "Tomato"],
        "avoid": ["Fennel"]
      },
      "Garlic": {
        "companions": ["Tomato", "Cucumber", "Pea", "Lettuce"],
        "avoid": ["Bean", "Pea"]
      },
      "Kale": {
        "companions": ["Bean", "Celery", "Onion", "Potato"],
        "avoid": ["Strawberry", "Tomato"]
      },
      "Leek": {
        "companions": ["Carrot", "Celery", "Onion"],
        "avoid": ["Bean", "Pea"]
      },
      "Marigold": {
        "companions": ["Tomato", "Pepper", "Potato", "Rose"]
      },
      "Mint": {
        "companions": ["Cabbage", "Tomato", "Pea", "Broccoli"],
        "avoid": ["Parsley"]
      },
      "Parsley": {
        "companions": ["Tomato", "Asparagus", "Carrot", "Chive"],
        "avoid": ["Lettuce"]
      },
      "Pepper": {
        "companions": ["Basil", "Tomato", "Onion", "Spinach"],
        "avoid": ["Fennel"]
      },
      "Rosemary": {
        "companions": ["Bean", "Cabbage", "Carrot", "Sage"],
        "avoid": ["Potato"]
      },
      "Sage": {
        "companions": ["Rosemary", "Cabbage", "Carrot", "Strawberry"],
        "avoid": ["Cucumber"]
      },
      "Strawberry": {
        "companions": ["Borage", "Lettuce", "Spinach", "Sage"],
        "avoid": ["Cabbage", "Broccoli"]
      },
      "Sunflower": {
        "companions": ["Corn", "Cucumber", "Melon"],
        "avoid": ["Potato", "Bean"]
      },
      "Thyme": {
        "companions": ["Cabbage", "Rose", "Strawberry", "Tomato"]
      },
      "Turnip": {
        "companions": ["Pea", "Cabbage"],
        "avoid": ["Potato"]
      },
      "Melon": {
        "companions": ["Corn", "Radish", "Marigold"],
        "avoid": ["Potato"]
      },
      "Zucchini": {
        "companions": ["Bean", "Dill", "Oregano", "Parsley", "Pepper", "Radish"],
        "avoid": ["Potato", "Pumpkin"]
      }
    }
  ];

const fertilizers: Fertilizer[] = [
    {
        id: "f1",
        name: "Urea",
        composition: { N: 46, P: 0, K: 0 },
        costPerBag: 266.50,
        bagWeightKg: 45,
        description: "A nitrogen-rich fertilizer commonly used for various crops.",
    },
    {
        id: "f2",
        name: "DAP (Diammonium Phosphate)",
        composition: { N: 18, P: 46, K: 0 },
        costPerBag: 1350,
        bagWeightKg: 50,
        description: "Provides both nitrogen and phosphorus, essential for root development.",
    },
    {
        id: "f3",
        name: "MOP (Muriate of Potash)",
        composition: { N: 0, P: 0, K: 60 },
        costPerBag: 1700,
        bagWeightKg: 50,
        description: "A potassium-rich fertilizer vital for plant health and disease resistance.",
    },
    {
        id: "f4",
        name: "NPK 10-26-26",
        composition: { N: 10, P: 26, K: 26 },
        costPerBag: 1450,
        bagWeightKg: 50,
        description: "Balanced fertilizer providing nitrogen, phosphorus, and potassium.",
    },
    {
        id: "f5",
        name: "NPK 12-32-16",
        composition: { N: 12, P: 32, K: 16 },
        costPerBag: 1500,
        bagWeightKg: 50,
        description: "A widely used NPK fertilizer with a specific nutrient ratio.",
    },
    {
        id: "f6",
        name: "SSP (Single Super Phosphate)",
        composition: { N: 0, P: 16, K: 0 },
        costPerBag: 350,
        bagWeightKg: 50,
        description: "A phosphorus fertilizer suitable for various soil types.",
    },
    {
        id: "f7",
        name: "Zinc Sulphate",
        composition: { N: 0, P: 0, K: 0 },
        costPerBag: 400,
        bagWeightKg: 25,
        description: "Provides zinc, a micronutrient essential for plant growth.",
    },
    {
        id: "f8",
        name: "Ammonium Sulphate",
        composition: {N: 21, P: 0, K:0},
        costPerBag: 600,
        bagWeightKg: 50,
        description: "Provides Nitrogen and Sulphur."
    }
];

const regionalFertilizers: RegionalFertilizer[] = [
  { id: "rf1", stateId: "s1", fertilizerId: "f1", subsidyPercentage: 10, isPreferred: true }, // Andhra Pradesh, Urea
  { id: "rf2", stateId: "s1", fertilizerId: "f2", subsidyPercentage: 15, isPreferred: true }, // Andhra Pradesh, DAP
  { id: "rf3", stateId: "s2", fertilizerId: "f1", subsidyPercentage: 12, isPreferred: true }, // Bihar, Urea
  { id: "rf4", stateId: "s2", fertilizerId: "f3", subsidyPercentage: 8, isPreferred: false }, // Bihar, MOP
  { id: "rf5", stateId: "s3", fertilizerId: "f2", subsidyPercentage: 20, isPreferred: true }, // Gujarat, DAP
  { id: "rf6", stateId: "s3", fertilizerId: "f4", subsidyPercentage: 10, isPreferred: false }, // Gujarat, NPK 10-26-26
  { id: "rf7", stateId: "s4", fertilizerId: "f1", subsidyPercentage: 15, isPreferred: true }, // Haryana, Urea
  { id: "rf8", stateId: "s4", fertilizerId: "f5", subsidyPercentage: 18, isPreferred: true }, // Haryana, NPK 12-32-16
  { id: "rf9", stateId: "s5", fertilizerId: "f2", subsidyPercentage: 12, isPreferred: true }, // Karnataka, DAP
  { id: "rf10", stateId: "s5", fertilizerId: "f3", subsidyPercentage: 10, isPreferred: false }, // Karnataka, MOP
  { id: "rf11", stateId: "s6", fertilizerId: "f1", subsidyPercentage: 8, isPreferred: false }, // Kerala, Urea
  { id: "rf12", stateId: "s6", fertilizerId: "f3", subsidyPercentage: 20, isPreferred: true }, // Kerala, MOP
  { id: "rf13", stateId: "s7", fertilizerId: "f4", subsidyPercentage: 15, isPreferred: true }, // Madhya Pradesh, NPK 10-26-26
  { id: "rf14", stateId: "s7", fertilizerId: "f2", subsidyPercentage: 10, isPreferred: false }, // Madhya Pradesh, DAP
  { id: "rf15", stateId: "s8", fertilizerId: "f5", subsidyPercentage: 20, isPreferred: true }, // Maharashtra, NPK 12-32-16
  { id: "rf16", stateId: "s8", fertilizerId: "f1", subsidyPercentage: 12, isPreferred: false }, // Maharashtra, Urea
  { id: "rf17", stateId: "s9", fertilizerId: "f1", subsidyPercentage: 18, isPreferred: true }, // Punjab, Urea
  { id: "rf18", stateId: "s9", fertilizerId: "f2", subsidyPercentage: 15, isPreferred: true }, // Punjab, DAP
  { id: "rf19", stateId: "s10", fertilizerId: "f6", subsidyPercentage: 25, isPreferred: true }, // Rajasthan, SSP
  { id: "rf20", stateId: "s10", fertilizerId: "f7", subsidyPercentage: 20, isPreferred: true }, // Rajasthan, Zinc Sulphate
  { id: "rf21", stateId: "s11", fertilizerId: "f3", subsidyPercentage: 18, isPreferred: true }, // Tamil Nadu, MOP
  { id: "rf22", stateId: "s11", fertilizerId: "f2", subsidyPercentage: 12, isPreferred: false }, // Tamil Nadu, DAP
  { id: "rf23", stateId: "s12", fertilizerId: "f2", subsidyPercentage: 16, isPreferred: true }, // Telangana, DAP
  { id: "rf24", stateId: "s12", fertilizerId: "f1", subsidyPercentage: 10, isPreferred: false }, // Telangana, Urea
  { id: "rf25", stateId: "s13", fertilizerId: "f1", subsidyPercentage: 20, isPreferred: true }, // Uttar Pradesh, Urea
  { id: "rf26", stateId: "s13", fertilizerId: "f4", subsidyPercentage: 15, isPreferred: true }, // Uttar Pradesh, NPK 10-26-26
  { id: "rf27", stateId: "s14", fertilizerId: "f1", subsidyPercentage: 10, isPreferred: true }, // West Bengal, Urea
  { id: "rf28", stateId: "s14", fertilizerId: "f3", subsidyPercentage: 18, isPreferred: true }, // West Bengal, MOP
  { id: "rf29", stateId: "s15", fertilizerId: "f1", subsidyPercentage: 15, isPreferred: true }, // Assam, Urea
  { id: "rf30", stateId: "s15", fertilizerId: "f2", subsidyPercentage: 10, isPreferred: false }, // Assam, DAP
  { id: "rf31", stateId: "s16", fertilizerId: "f1", subsidyPercentage: 12, isPreferred: true }, // Odisha, Urea
  { id: "rf32", stateId: "s16", fertilizerId: "f3", subsidyPercentage: 15, isPreferred: true }, // Odisha, MOP
  { id: "rf33", stateId: "s17", fertilizerId: "f4", subsidyPercentage: 18, isPreferred: true }, // Chhattisgarh, NPK 10-26-26
  { id: "rf34", stateId: "s17", fertilizerId: "f1", subsidyPercentage: 10, isPreferred: false }, // Chhattisgarh, Urea
  { id: "rf35", stateId: "s18", fertilizerId: "f1", subsidyPercentage: 15, isPreferred: true }, // Jharkhand, Urea
  { id: "rf36", stateId: "s18", fertilizerId: "f2", subsidyPercentage: 12, isPreferred: true }, // Jharkhand, DAP
  { id: "rf37", stateId: "s19", fertilizerId: "f3", subsidyPercentage: 20, isPreferred: true }, // Goa, MOP
  { id: "rf38", stateId: "s19", fertilizerId: "f2", subsidyPercentage: 10, isPreferred: false }, // Goa, DAP
  { id: "rf39", stateId: "s1", fertilizerId: "f8", subsidyPercentage: 13, isPreferred: true }, // Andhra Pradesh, Ammonium Sulphate
  { id: "rf40", stateId: "s5", fertilizerId: "f8", subsidyPercentage: 14, isPreferred: true }, // Karnataka, Ammonium Sulphate
  { id: "rf41", stateId: "s11", fertilizerId: "f8", subsidyPercentage: 16, isPreferred: true }, // Tamil Nadu, Ammonium Sulphate
  { id: "rf42", stateId: "s19", fertilizerId: "f1", subsidyPercentage: 17, isPreferred: true }, // Goa, Urea
];


  export { crops, compatibility, vegetables, fertilizers, indianStates, regionalFertilizers };
  