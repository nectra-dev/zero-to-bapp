import React, { useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useBalance,
  useChainId,
  useConfig,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { formatUnits } from "viem";
import {
  getAddresses,
  buildDepositParams,
  buildBalanceOfParams,
  buildGetPositionParams,
  buildGetPriceParams,
} from "../lib/contracts";
import { toast } from "sonner";
import { getDeposits, type DepositEvent } from "../lib/indexer";

export default function MainBapp() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const chainId = useChainId() ?? 5115;
  const publicClient = usePublicClient();
  const wagmiConfig = useConfig();
  const explorerBase = wagmiConfig.chains.find((c) => c.id === chainId)?.blockExplorers?.default.url || "https://explorer.testnet.citrea.xyz";
  const explorerTx = (hash: `0x${string}`) => `${explorerBase}/tx/${hash}`;

  const [amount, setAmount] = useState<string>("0.0001");

  const { token, vault } = getAddresses(chainId);
  const isConfigured = token !== "0x0000000000000000000000000000000000000000" &&
    vault !== "0x0000000000000000000000000000000000000000";

  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    ...buildBalanceOfParams(isConfigured && address ? token : undefined as any, address as any),
    query: { enabled: Boolean(isConnected && isConfigured && address) },
  });

  const { data: position, refetch: refetchPosition } = useReadContract({
    ...buildGetPositionParams(isConfigured && address ? vault : undefined as any, address as any),
    query: { enabled: Boolean(isConnected && isConfigured && address) },
  });

  const { data: price } = useReadContract({
    ...buildGetPriceParams(isConfigured ? vault : undefined as any),
    query: { enabled: Boolean(isConfigured) },
  });

  const { data: nativeBal, refetch: refetchNative } = useBalance({
    address,
    query: { enabled: Boolean(isConnected && address) },
  });

  const priceBI = (price as bigint | undefined);
  const nativeDecimals = nativeBal?.decimals ?? 18;
  const clampDecimals = (v: string, d: number) => {
    if (!v) return v;
    const [i, f = ""] = v.replace(/[^0-9.]/g, "").split(".");
    return f ? `${i}.${f.slice(0, d)}` : i;
  };
  const formatBtc = (wei: bigint, decimals: number) => Number(formatUnits(wei, decimals)).toFixed(5);
  const formatUsd = (wei18: bigint) => Number(formatUnits(wei18, 18)).toFixed(2);
  const walletUsdValue = useMemo(() => {
    if (!priceBI || !nativeBal) return undefined;
    return (nativeBal.value * priceBI) / (10n ** BigInt(nativeDecimals));
  }, [priceBI, nativeBal, nativeDecimals]);

  const collateralBI = (position?.[0] as bigint | undefined);
  const debtBI = (position?.[1] as bigint | undefined);
  const depositUsdValue = useMemo(() => {
    if (!collateralBI || !priceBI) return undefined;
    return (collateralBI * priceBI) / (10n ** BigInt(nativeDecimals));
  }, [collateralBI, priceBI, nativeDecimals]);

  const depositBtcWei = useMemo(() => collateralBI, [collateralBI]);

  const [deposits, setDeposits] = useState<DepositEvent[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState<boolean>(false);

  async function refetchDeposits() {
    try {
      setLoadingDeposits(true);
      const { deposits } = await getDeposits();
      setDeposits(deposits);
    } catch (e) {
      // noop
    } finally {
      setLoadingDeposits(false);
    }
  }

  useEffect(() => {
    refetchDeposits();
  }, []);

  async function handleDeposit() {
    if (!isConfigured) return;
    if (!publicClient) return;
    const safeAmount = clampDecimals(amount, 5);
    const depositTx = await writeContractAsync(buildDepositParams(vault, safeAmount));
    toast.info(
      <span>
        Deposit submitted in <a className="underline" href={explorerTx(depositTx)} target="_blank" rel="noreferrer">TX</a>.
      </span>
    );
    await publicClient.waitForTransactionReceipt({ hash: depositTx });
    toast.success(
      <span>
        Deposit confirmed in <a className="underline" href={explorerTx(depositTx)} target="_blank" rel="noreferrer">TX</a>.
      </span>
    );
    await Promise.all([refetchTokenBalance(), refetchPosition(), refetchNative()]);
    await refetchDeposits();
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen gap-6 p-6">
      <div className="w-full max-w-4xl flex items-center justify-between">
        <h1 className="text-3xl font-bold">Zero to BApp</h1>
        <ConnectButton showBalance={false} />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wallet block */}
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Wallet</div>
          <div className="text-xl font-semibold">
            {nativeBal?.value !== undefined ? `${formatBtc(nativeBal.value, nativeDecimals)} cBTC` : "-"}
          </div>
          <div className="text-sm text-gray-500">
            {walletUsdValue !== undefined ? `$${formatUsd(walletUsdValue as bigint)}` : ""}
          </div>
          <div className="mt-3 text-xl font-semibold">
            {tokenBalance !== undefined ? `${Number(formatUnits(tokenBalance as bigint, 18)).toFixed(2)} dUSD` : "-"}
          </div>
        </div>

        {/* Vault position block */}
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Vault Position</div>
          <div className="text-xl font-semibold">
            {depositBtcWei !== undefined ? `${formatBtc(depositBtcWei as bigint, nativeDecimals)} cBTC` : "-"}
          </div>
          <div className="text-sm text-gray-500">
            {depositUsdValue !== undefined ? `$${formatUsd(depositUsdValue as bigint)}` : ""}
          </div>
          <div className="mt-3 text-xl font-semibold">
            {debtBI !== undefined ? `$${formatUsd(debtBI as bigint)} debt` : "-"}
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 gap-4">
        {!isConfigured && (
          <div className="text-red-600 text-sm">
            Update contract addresses in src/config/contracts.ts for chain {chainId}.
          </div>
        )}
        {/* Amount input + Deposit button in a row */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-sm">Amount (cBTC)</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="0.0"
              inputMode="decimal"
              step="0.00001"
              value={amount}
              onChange={(e) => setAmount(clampDecimals(e.target.value, 5))}
            />
          </div>
          <button
            onClick={handleDeposit}
            disabled={!isConnected || !isConfigured || isPending}
            className="bg-black text-white px-3 py-2 rounded-lg disabled:opacity-50"
          >
            Deposit
          </button>
        </div>

        {/* Deposits table */}
        <div className="mt-2">
          <div className="text-sm font-semibold mb-2">Deposit History</div>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Tx</th>
                  <th className="text-left px-3 py-2">Amount (cBTC)</th>
                  <th className="text-left px-3 py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {loadingDeposits && (
                  <tr><td className="px-3 py-2" colSpan={3}>Loading...</td></tr>
                )}
                {!loadingDeposits && deposits.length === 0 && (
                  <tr><td className="px-3 py-2" colSpan={3}>No deposits yet</td></tr>
                )}
                {!loadingDeposits && deposits.map((d) => {
                  const short = `${d.transactionHash.slice(0, 6)}...${d.transactionHash.slice(-3)}`;
                  const amt = Number(formatUnits(BigInt(d.amount), 18)).toFixed(5);
                  const time = new Date(d.timestamp * 1000).toLocaleString();
                  return (
                    <tr key={d.transactionHash} className="border-t">
                      <td className="px-3 py-2"><a className="underline" href={`${explorerBase}/tx/${d.transactionHash}`} target="_blank" rel="noreferrer">{short}</a></td>
                      <td className="px-3 py-2">{amt}</td>
                      <td className="px-3 py-2">{time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


