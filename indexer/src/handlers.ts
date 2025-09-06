import { Vault } from "generated";

Vault.Deposited.handler(async ({ event, context }) => {
  await context.Deposit.set({
    id: event.transaction.hash + "-" + event.block.timestamp.toString(),
    user: event.params.user,
    amount: event.params.amount,
    timestamp: event.block.timestamp,
    transactionHash: event.transaction.hash,
  });
});
