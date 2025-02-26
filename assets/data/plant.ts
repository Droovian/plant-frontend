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
        noCount: 4,
        spacingFeet: 2,
        soilPH: [6.0, 7.0],
        sunlight: "Full Sun",
        soilType: ["Loamy"],
        nutrientLevel: "Moderate",
      },
      {
        name: "Tomato",
        image: plantImages.tomato,
        color: "#FFB3B3",
        noOfSquares: 1,
        noCount: 1,
        spacingFeet: 3,
        soilPH: [6.0, 6.8],
        sunlight: "Full Sun",
        soilType: ["Loamy", "Sandy"],
        nutrientLevel: "High",
      },
      {
        name: "Chilli",
        image: plantImages.chilli,
        color: "#FFDBA4",
        noOfSquares: 4,
        noCount: 4,
        spacingFeet: 1,
        soilPH: [5.5, 7.0],
        sunlight: "Full Sun",
        soilType: ["Loamy", "Sandy"],
        nutrientLevel: "Moderate",
      },
      {
        name: "Eggplant",
        image: plantImages.Eggplant,
        color: "#D4B8E2",
        noOfSquares: 1,
        noCount: 3,
        spacingFeet: 2,
        soilPH: [5.5, 6.5],
        sunlight: "Full Sun",
        soilType: ["Loamy"],
        nutrientLevel: "Moderate",
      },
  ]

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
  