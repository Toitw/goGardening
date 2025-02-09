export type PlantSummary = {
  id: string;
  name: string;
  category: string;
  image: string;
};

export const plantCategories: { [category: string]: PlantSummary[] } = {
  Alliums: [
    {
      id: "1",
      name: "Chives",
      category: "Alliums",
      image: "/images/alliums/chives.jpg",
    },
    {
      id: "2",
      name: "Garlic",
      category: "Alliums",
      image: "/images/alliums/garlic.jpg",
    },
    {
      id: "3",
      name: "Leeks",
      category: "Alliums",
      image: "/images/alliums/leeks.jpg",
    },
    {
      id: "4",
      name: "Onions",
      category: "Alliums",
      image: "/images/alliums/onions.jpg",
    },
    {
      id: "5",
      name: "Shallot",
      category: "Alliums",
      image: "/images/alliums/shallot.jpg",
    },
  ],
  "Cole Crops": [
    {
      id: "6",
      name: "Bok Choy",
      category: "Cole Crops",
      image: "/images/cole/bokchoy.jpg",
    },
    {
      id: "7",
      name: "Broccoli",
      category: "Cole Crops",
      image: "/images/cole/broccoli.jpg",
    },
    {
      id: "8",
      name: "Brussels Sprouts",
      category: "Cole Crops",
      image: "/images/cole/brusselssprouts.jpg",
    },
    {
      id: "9",
      name: "Cabbage",
      category: "Cole Crops",
      image: "/images/cole/cabbage.jpg",
    },
    {
      id: "10",
      name: "Cauliflower",
      category: "Cole Crops",
      image: "/images/cole/cauliflower.jpg",
    },
  ],
  Flowers: [
    {
      id: "11",
      name: "Rose",
      category: "Flowers",
      image: "/images/flowers/rose.jpg",
    },
    {
      id: "12",
      name: "Tulip",
      category: "Flowers",
      image: "/images/flowers/tulip.jpg",
    },
    {
      id: "13",
      name: "Daisy",
      category: "Flowers",
      image: "/images/flowers/daisy.jpg",
    },
    {
      id: "14",
      name: "Sunflower",
      category: "Flowers",
      image: "/images/flowers/sunflower.jpg",
    },
    {
      id: "15",
      name: "Orchid",
      category: "Flowers",
      image: "/images/flowers/orchid.jpg",
    },
  ],
  Fruit: [
    {
      id: "16",
      name: "Apple",
      category: "Fruit",
      image: "/images/fruit/apple.jpg",
    },
    {
      id: "17",
      name: "Banana",
      category: "Fruit",
      image: "/images/fruit/banana.jpg",
    },
    {
      id: "18",
      name: "Orange",
      category: "Fruit",
      image: "/images/fruit/orange.jpg",
    },
    {
      id: "19",
      name: "Strawberry",
      category: "Fruit",
      image: "/images/fruit/strawberry.jpg",
    },
    {
      id: "20",
      name: "Grape",
      category: "Fruit",
      image: "/images/fruit/grape.jpg",
    },
  ],
  Grains: [
    {
      id: "21",
      name: "Wheat",
      category: "Grains",
      image: "/images/grains/wheat.jpg",
    },
    {
      id: "22",
      name: "Rice",
      category: "Grains",
      image: "/images/grains/rice.jpg",
    },
    {
      id: "23",
      name: "Corn",
      category: "Grains",
      image: "/images/grains/corn.jpg",
    },
    {
      id: "24",
      name: "Barley",
      category: "Grains",
      image: "/images/grains/barley.jpg",
    },
    {
      id: "25",
      name: "Oats",
      category: "Grains",
      image: "/images/grains/oats.jpg",
    },
  ],
  Greens: [
    {
      id: "26",
      name: "Spinach",
      category: "Greens",
      image: "/images/greens/spinach.jpg",
    },
    {
      id: "27",
      name: "Kale",
      category: "Greens",
      image: "/images/greens/kale.jpg",
    },
    {
      id: "28",
      name: "Swiss Chard",
      category: "Greens",
      image: "/images/greens/swisschard.jpg",
    },
    {
      id: "29",
      name: "Arugula",
      category: "Greens",
      image: "/images/greens/arugula.jpg",
    },
    {
      id: "30",
      name: "Lettuce",
      category: "Greens",
      image: "/images/greens/lettuce.jpg",
    },
  ],
  Herbs: [
    {
      id: "31",
      name: "Basil",
      category: "Herbs",
      image: "/images/herbs/basil.jpg",
    },
    {
      id: "32",
      name: "Rosemary",
      category: "Herbs",
      image: "/images/herbs/rosemary.jpg",
    },
    {
      id: "33",
      name: "Thyme",
      category: "Herbs",
      image: "/images/herbs/thyme.jpg",
    },
    {
      id: "34",
      name: "Mint",
      category: "Herbs",
      image: "/images/herbs/mint.jpg",
    },
    {
      id: "35",
      name: "Oregano",
      category: "Herbs",
      image: "/images/herbs/oregano.jpg",
    },
  ],
  Legumes: [
    {
      id: "36",
      name: "Peas",
      category: "Legumes",
      image: "/images/legumes/peas.jpg",
    },
    {
      id: "37",
      name: "Beans",
      category: "Legumes",
      image: "/images/legumes/beans.jpg",
    },
    {
      id: "38",
      name: "Lentils",
      category: "Legumes",
      image: "/images/legumes/lentils.jpg",
    },
    {
      id: "39",
      name: "Chickpeas",
      category: "Legumes",
      image: "/images/legumes/chickpeas.jpg",
    },
    {
      id: "40",
      name: "Soybeans",
      category: "Legumes",
      image: "/images/legumes/soybeans.jpg",
    },
  ],
  Nightshades: [
    {
      id: "41",
      name: "Tomato",
      category: "Nightshades",
      image: "/images/nightshades/tomato.jpg",
    },
    {
      id: "42",
      name: "Eggplant",
      category: "Nightshades",
      image: "/images/nightshades/eggplant.jpg",
    },
    {
      id: "43",
      name: "Bell Pepper",
      category: "Nightshades",
      image: "/images/nightshades/bellpepper.jpg",
    },
    {
      id: "44",
      name: "Chili Pepper",
      category: "Nightshades",
      image: "/images/nightshades/chilipepper.jpg",
    },
    {
      id: "45",
      name: "Potato",
      category: "Nightshades",
      image: "/images/nightshades/potato.jpg",
    },
  ],
  "Other vegetable": [
    {
      id: "46",
      name: "Zucchini",
      category: "Other vegetable",
      image: "/images/other/zucchini.jpg",
    },
    {
      id: "47",
      name: "Cucumber",
      category: "Other vegetable",
      image: "/images/other/cucumber.jpg",
    },
    {
      id: "48",
      name: "Pumpkin",
      category: "Other vegetable",
      image: "/images/other/pumpkin.jpg",
    },
    {
      id: "49",
      name: "Squash",
      category: "Other vegetable",
      image: "/images/other/squash.jpg",
    },
    {
      id: "50",
      name: "Okra",
      category: "Other vegetable",
      image: "/images/other/okra.jpg",
    },
  ],
  Roots: [
    {
      id: "51",
      name: "Carrot",
      category: "Roots",
      image: "/images/roots/carrot.jpg",
    },
    {
      id: "52",
      name: "Beet",
      category: "Roots",
      image: "/images/roots/beet.jpg",
    },
    {
      id: "53",
      name: "Radish",
      category: "Roots",
      image: "/images/roots/radish.jpg",
    },
    {
      id: "54",
      name: "Turnip",
      category: "Roots",
      image: "/images/roots/turnip.jpg",
    },
    {
      id: "55",
      name: "Parsnip",
      category: "Roots",
      image: "/images/roots/parsnip.jpg",
    },
  ],
};
