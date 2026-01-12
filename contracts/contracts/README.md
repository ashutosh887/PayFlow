# PayFlow Smart Contracts

This directory contains the Solidity smart contracts for PayFlow.

## Contracts

### FlowFactory.sol

Factory contract that deploys new PaymentFlow instances.

**Key Functions:**
- `createMilestoneFlow(address _mneeToken, uint256 _initialDeposit)` - Creates a new milestone payment flow
- `createSplitFlow(address _mneeToken, uint256 _initialDeposit)` - Creates a new revenue split flow
- `createRecurringFlow(address _mneeToken, uint256 _initialDeposit)` - Creates a new recurring payment flow
- `getFlowsByOwner(address _owner)` - Returns all flows created by an address
- `getAllFlows()` - Returns all flows created through the factory
- `getFlowCount()` - Returns the total number of flows

**Events:**
- `FlowCreated(address indexed flowAddress, address indexed owner, uint256 flowType, uint256 amount)`

### PaymentFlow.sol

Core contract managing individual payment flows. Each flow is a separate contract instance.

**Flow Types:**
- `Milestone` (0) - Milestone-based payments
- `Split` (1) - Revenue splits
- `Recurring` (2) - Recurring payments
- `Escrow` (3) - Escrow payments

**Flow Status:**
- `Active` (0) - Flow is active and accepting deposits
- `Paused` (1) - Flow is paused
- `Completed` (2) - All funds have been distributed
- `Cancelled` (3) - Flow was cancelled

**Key Functions:**

**Deposits:**
- `deposit(uint256 _amount)` - Deposit MNEE tokens into the flow

**Milestones:**
- `addMilestone(uint256 _amount, address _recipient)` - Add a milestone to the flow
- `markMilestoneComplete(uint256 _milestoneId)` - Mark a milestone as complete
- `executeMilestonePayment(uint256 _milestoneId)` - Execute payment for a completed milestone

**Splits:**
- `addSplit(address _recipient, uint256 _percentage)` - Add a recipient to revenue split
- `executeSplitPayment()` - Execute the split payment to all recipients

**Flow Management:**
- `pause()` - Pause the flow (owner only)
- `resume()` - Resume a paused flow (owner only)
- `cancel()` - Cancel the flow and refund remaining funds (owner only)

**View Functions:**
- `getMilestoneCount()` - Returns the number of milestones
- `getSplitCount()` - Returns the number of split recipients

**Events:**
- `FlowCreated(uint256 indexed flowId, FlowType flowType, address owner, uint256 amount)`
- `Deposit(address indexed depositor, uint256 amount)`
- `MilestoneCompleted(uint256 indexed milestoneId)`
- `PaymentExecuted(address indexed recipient, uint256 amount)`
- `FlowPaused()`
- `FlowResumed()`
- `FlowCancelled()`
- `FlowCompleted()`

### ApprovalManager.sol

Manages multi-party approval logic for payment flows.

**Key Functions:**
- `createApproval(address[] memory _approvers, uint256 _requiredApprovals)` - Create a new approval requirement
- `approve(uint256 _approvalId)` - Submit an approval (must be an approver)
- `isApproved(uint256 _approvalId)` - Check if approval threshold is met
- `getApprovalStatus(uint256 _approvalId)` - Get current approval status
- `resetApproval(uint256 _approvalId)` - Reset an approval (for reuse)

**Events:**
- `ApprovalCreated(uint256 indexed approvalId, address[] approvers, uint256 requiredApprovals)`
- `ApprovalGiven(uint256 indexed approvalId, address approver)`
- `ApprovalThresholdMet(uint256 indexed approvalId)`

## Security Features

- **ReentrancyGuard**: All payment functions use `nonReentrant` modifier
- **Ownable**: Flow ownership controlled via OpenZeppelin's Ownable
- **Input Validation**: All functions validate inputs (amounts, addresses, percentages)
- **Safe Math**: Solidity 0.8.20 has built-in overflow protection

## Usage Flow

1. **Create Flow**: Call `FlowFactory.createMilestoneFlow()` or similar
2. **Deposit Funds**: Call `PaymentFlow.deposit()` to add MNEE tokens
3. **Configure**: Add milestones or splits using owner functions
4. **Execute**: Mark milestones complete and execute payments
5. **Manage**: Pause, resume, or cancel as needed

## Interfaces

### IMNEE.sol

Interface for the MNEE ERC-20 token contract. Required functions:
- `transfer(address to, uint256 amount)`
- `transferFrom(address from, address to, uint256 amount)`
- `balanceOf(address account)`
- `approve(address spender, uint256 amount)`
- `allowance(address owner, address spender)`

## Testing

Contracts can be tested using Hardhat:

```bash
cd contracts
npm test
```

## Deployment

See the main [README.md](../../README.md) for deployment instructions.

## Links

- [Main README](../../README.md)
- [FlowFactory on Etherscan](https://sepolia.etherscan.io/address/0x0419AEb7916d951938acB45949Dc70460D25dc75)
- [PaymentFlow on Etherscan](https://sepolia.etherscan.io/address/0x5CC071537C35494b9FDFc74673065a579765F607)
- [ApprovalManager on Etherscan](https://sepolia.etherscan.io/address/0xF8e08Bc787b5418f6346a34DA003d05d33F1Af2b)
