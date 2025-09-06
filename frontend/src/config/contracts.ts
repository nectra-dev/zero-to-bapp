export type Address = `0x${string}`;

type ContractsPerChain = {
  token: Address;
  vault: Address;
};

export const CONTRACTS: Record<number, ContractsPerChain> = {
  // 5115 = Citrea Testnet
  5115: {
    token: "0xFBaa042Aee4FBFb15cfE71c561dD2F5cFbc04FBa",
    vault: "0xa7a7f3064007f143ce9ae136b2139f1B5E1008e5",
  },
};


