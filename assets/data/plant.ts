import { Fertilizer, Crop, compatibilityInfo } from "@/types/plant";
import { plantImages } from "@/constants";

const fertilizers: Fertilizer[] = [
    {
      id: "urea",
      name: "Urea",
      composition: { N: 46, P: 0, K: 0 },
      costPerBag: 276.12,
      bagWeightKg: 50
    },
    {
      id: "dap",
      name: "Di-Ammonium Phosphate (DAP)",
      composition: { N: 18, P: 46, K: 0 },
      costPerBag: 1125.00,
      bagWeightKg: 50
    },
    {
      id: "ssp",
      name: "Single Super Phosphate (SSP)",
      composition: { N: 0, P: 16, K: 0 },
      costPerBag: 375.00,
      bagWeightKg: 50
    },
    {
      id: "mop",
      name: "Muriate of Potash (MOP)",
      composition: { N: 0, P: 0, K: 60 },
      costPerBag: 800.00,
      bagWeightKg: 50
    },
    {
      id: "sop",
      name: "Sulphate of Potash (SOP)",
      composition: { N: 0, P: 0, K: 50 },
      costPerBag: 1200.00,
      bagWeightKg: 50
    }
  ];
  
  const crops: Crop[] = [
    {
      id: "wheat",
      name: "Wheat",
      npkRequirement: { N: 120, P: 60, K: 40 }
    },
    {
      id: "rice",
      name: "Rice",
      npkRequirement: { N: 100, P: 50, K: 50 }
    },
    {
      id: "maize",
      name: "Maize",
      npkRequirement: { N: 150, P: 75, K: 50 }
    },
    {
        id: "tomato",
        name: "Tomato",
        npkRequirement: { N: 90, P: 45, K: 60 }
      },
      {
        id: "potato",
        name: "Potato",
        npkRequirement: { N: 120, P: 50, K: 150 }
      }
  ];
  
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



  export { fertilizers, crops, compatibility, vegetables };
  