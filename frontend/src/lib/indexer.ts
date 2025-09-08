// Lightweight GraphQL client for Vite + React (no Next.js APIs)

export interface DepositEvent {
  amount: string;
  user: string;
  timestamp: number;
  transactionHash: string;
}

const baseUrl = (import.meta as any).env?.VITE_ENVIO_URL || "";

async function postGraphQL<T>(query: string, operationName: string, variables: Record<string, any>): Promise<T> {
  if (!baseUrl) throw new Error("VITE_ENVIO_URL is not set");

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables, operationName }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Indexer request failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`Indexer GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json.data as T;
}

export async function getDeposits(): Promise<{ deposits: DepositEvent[] }> {
  const operation = `
    query getDeposits {
      Deposit {
        amount
        user
        timestamp
        transactionHash
      }
    }
  `;

  type Response = { Deposit: Array<{ amount: string; user: string; timestamp: string | number; transactionHash: string; }> };

  const data = await postGraphQL<Response>(operation, "getDeposits", {});

  const deposits: DepositEvent[] = (data?.Deposit || []).map((d) => ({
    amount: String(d.amount),
    user: d.user,
    timestamp: typeof d.timestamp === "string" ? Number(d.timestamp) : (d.timestamp || 0),
    transactionHash: d.transactionHash,
  }))
  .filter((d) => Number.isFinite(d.timestamp))
  .sort((a, b) => b.timestamp - a.timestamp);

  return { deposits };
}

 