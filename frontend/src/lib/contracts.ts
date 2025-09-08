import { erc20Abi, parseUnits } from "viem";
import { vaultAbi } from "../abis/vault";
import { tokenAbi } from "../abis/token";
import { CONTRACTS, Address } from "../config/contracts";

export function getAddresses(chainId: number) {
  const entry = CONTRACTS[chainId];
  if (!entry) throw new Error(`No contract addresses configured for chain ${chainId}`);
  return entry;
}

export const abis = {
  token: tokenAbi,
  vault: vaultAbi,
  erc20: erc20Abi,
} as const;

export function buildApproveParams(token: Address, spender: Address, amount: string) {
  return {
    address: token,
    abi: erc20Abi,
    functionName: "approve",
    args: [spender, parseUnits(amount, 18)],
  } as const;
}

export function buildDepositParams(vault: Address, amount: string) {
  return {
    address: vault,
    abi: vaultAbi,
    functionName: "deposit",
    args: [parseUnits(amount, 18)],
    value: parseUnits(amount, 18),
  } as const;
}

export function buildFaucetParams(vault: Address, amount: string) {
  // removed
  throw new Error("faucet removed");
}

export function buildBalanceOfParams(token: Address, user: Address) {
  return {
    address: token,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: [user],
  } as const;
}

export function buildGetPositionParams(vault: Address, user: Address) {
  return {
    address: vault,
    abi: vaultAbi,
    functionName: "getPosition",
    args: [user],
  } as const;
}

export function buildGetPriceParams(vault: Address) {
  return {
    address: vault,
    abi: vaultAbi,
    functionName: "getPrice",
  } as const;
}


