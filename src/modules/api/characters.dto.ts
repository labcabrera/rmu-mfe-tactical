export type Character = {
  id: string;
  name: string;
  attacks: CharacterAttack[];
  imageUrl: string | undefined;
  //TODO map properties
  [key: string]: any;
};

export type CharacterAttack = {
  attackName: string;
  attackTable: string;
  sizeAdjustment: number;
  fumbleTable: string;
  fumble: number;
  bo: number;
};
