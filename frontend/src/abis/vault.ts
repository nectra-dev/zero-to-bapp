export const vaultAbi = [
  {
    type: "function",
    stateMutability: "view",
    name: "getPosition",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "collateral", type: "uint256" },
      { name: "debt", type: "uint256" },
    ],
  },
  {
    type: "function",
    stateMutability: "payable",
    name: "deposit",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "getPrice",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;


