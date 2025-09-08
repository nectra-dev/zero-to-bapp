export type Address = `0x${string}`;

type ContractsPerChain = {
  token: Address;
  vault: Address;
};

export const CONTRACTS: Record<number, ContractsPerChain> = {
  // 5115 = Citrea Testnet
  5115: {
    token: "0x4bA6EfF278d533C1b9c3B35983C169B499a3E5c7",
    vault: "0xEA5C99E6B318Fe95119357bCe65a6879C4695fcE",
  },
};


