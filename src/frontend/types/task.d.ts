export interface Nutrients extends Object {
  // find(arg0: (n: any) => any);
  // [key: number]: {
  [index: string]: string | number;
  id: number;
  classification_id: number;
  food_number: number;
  food_name: string;
  disposal_rate: number;
  calories: number;
  water: number;
  protein_due_to_amino_acid_composition: number;
  protain: number;
  fatty_acid_triacylglycerol_equivalent: number;
  cholesterol: number;
  fat: number;
  available_carbohydrates_by_monosaccharide_equivalent: number;
  available_carbohydrates_by_mass_meter: number;
  available_carbohydrates_by_deduction_method: number;
  dietary_fiber: number;
  sugar_alcohol: number;
  carbohydrate: number;
  organic_acid: number;
  ash: number;
  sodium: number;
  potassium: number;
  calcium: number;
  magnesium: number;
  phosphorus: number;
  iron: number;
  zinc: number;
  copper: number;
  manganese: number;
  iodine: number;
  selenium: number;
  chromium: number;
  molybdenum: number;
  retinol: number;
  alpha_carotene: number;
  beta_carotene: number;
  beta_cryptoxanthin: number;
  beta_carotene_equivalent: number;
  retinol_active_equivalent: number;
  vitamin_d: number;
  alpha_tocopherol: number;
  beta_tocopherol: number;
  gamma_tocopherol: number;
  delta_tocopherol: number;
  vitamin_k: number;
  vitamin_b1: number;
  vitamin_b2: number;
  niacin: number;
  niacin_equivalent: number;
  vitamin_b6: number;
  vitamin_b12: number;
  folic_acid: number;
  pantothenic_acid: number;
  biotin: number;
  vitamin_c: number;
  alcohol: number;
  sodium_chloride_equivalent: number;
  // };
}

export interface EstimatedAmountList {
  id: number;
  classificationId: number;
  nutrientId: number;
  foodName: string;
  foodNameTodisplay: string;
  unit: string;
  standardQuantity: number;
  includeDisposal: boolean;
  creeatedAt: date;
  updatedAt: date;
}

export interface CalculatedNutrient {
  [index: string]: number | [] | Nutrients;
  quantity: number;
  estimatedIdList: [];
  nutrient: Nutrients;
}

export interface TotalNutrient {
  [index: string]: number;
  calories: number;
  water: number;
  protein_due_to_amino_acid_composition: number;
  protain: number;
  fatty_acid_triacylglycerol_equivalent: number;
  cholesterol: number;
  fat: number;
  available_carbohydrates_by_monosaccharide_equivalent: number;
  available_carbohydrates_by_mass_meter: number;
  available_carbohydrates_by_deduction_method: number;
  dietary_fiber: number;
  sugar_alcohol: number;
  carbohydrate: number;
  organic_acid: number;
  ash: number;
  sodium: number;
  potassium: number;
  calcium: number;
  magnesium: number;
  phosphorus: number;
  iron: number;
  zinc: number;
  copper: number;
  manganese: number;
  iodine: number;
  selenium: number;
  chromium: number;
  molybdenum: number;
  retinol: number;
  alpha_carotene: number;
  beta_carotene: number;
  beta_cryptoxanthin: number;
  beta_carotene_equivalent: number;
  retinol_active_equivalent: number;
  vitamin_d: number;
  alpha_tocopherol: number;
  beta_tocopherol: number;
  gamma_tocopherol: number;
  delta_tocopherol: number;
  vitamin_k: number;
  vitamin_b1: number;
  vitamin_b2: number;
  niacin: number;
  niacin_equivalent: number;
  vitamin_b6: number;
  vitamin_b12: number;
  folic_acid: number;
  pantothenic_acid: number;
  biotin: number;
  vitamin_c: number;
  alcohol: number;
  sodium_chloride_equivalent: number;
}

export interface Selected {
  [index: string]: string | number;
  label: string;
  unit: string;
  standardQuantity: number;
}

export interface MyData {
  [index: string]: number | string | date;
  savedDataId: number;
  title: string;
  memo: string;
  url: string;
  createdAt: date;
  updatedAt: date;
  myNutrients: Array<{
    savedNutrientsId: number;
    nutrientId: number;
    quantity: number;
  }>;
}

// MyDataDetail??????
export interface DefaultMyData {
  [index: string]: number | string;
  savedDataId: number;
  title: string;
  memo: string;
  url: string;
}
export interface DefaultMyNutrients {
  [index: string]: number | Array<number> | Nutrients;
  savedNutrientsId: number;
  quantity: number;
  estimatedIdList: Array<number>;
  nutrient: Nutrients;
}
export interface EditedMyData {
  isEdited: boolean;
  title: string;
  memo: string;
  url: string;
}
export interface EditedMyNutrients {
  isEdited: boolean;
  editedData: Array<{
    savedNutrientsId: number;
    quantity: number;
  }>;
}
export interface DeletedMyNutrients {
  isDeleted: boolean;
  savedNutrientsId: Array<number>;
}
