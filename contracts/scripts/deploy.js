import hre from "hardhat";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, "../../.env") });

async function main() {
  const MNEE_ADDRESS = process.env.MNEE_TOKEN_ADDRESS || "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF";
  
  console.log("\n🚀 Starting contract deployment...\n");
  console.log("Network:", hre.network.name);
  console.log("MNEE Token Address:", MNEE_ADDRESS);
  
  if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === "your_private_key_here" || process.env.PRIVATE_KEY.length !== 66) {
    console.error("❌ Error: PRIVATE_KEY not set correctly in .env file");
    console.error("   Expected: 0x followed by 64 hex characters (66 total)");
    console.error("   Current length:", process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.length : 0);
    console.error("   Please update your .env file with a valid private key");
    process.exit(1);
  }

  if (hre.network.name !== "hardhat" && !process.env.RPC_URL && !process.env.SEPOLIA_RPC_URL) {
    console.error("❌ Error: RPC_URL or SEPOLIA_RPC_URL not set in .env file");
    process.exit(1);
  }

  try {
    console.log("\n📝 Deploying ApprovalManager...");
    const ApprovalManager = await hre.ethers.getContractFactory("ApprovalManager");
    const approvalManager = await ApprovalManager.deploy();
    await approvalManager.waitForDeployment();
    const approvalManagerAddress = await approvalManager.getAddress();
    console.log("✅ ApprovalManager deployed to:", approvalManagerAddress);

    console.log("\n📝 Deploying PaymentFlow...");
    const PaymentFlow = await hre.ethers.getContractFactory("PaymentFlow");
    const paymentFlow = await PaymentFlow.deploy(MNEE_ADDRESS);
    await paymentFlow.waitForDeployment();
    const paymentFlowAddress = await paymentFlow.getAddress();
    console.log("✅ PaymentFlow deployed to:", paymentFlowAddress);

    console.log("\n📝 Deploying FlowFactory...");
    const FlowFactory = await hre.ethers.getContractFactory("FlowFactory");
    const flowFactory = await FlowFactory.deploy(
      paymentFlowAddress,
      approvalManagerAddress
    );
    await flowFactory.waitForDeployment();
    const flowFactoryAddress = await flowFactory.getAddress();
    console.log("✅ FlowFactory deployed to:", flowFactoryAddress);

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(60));
    console.log("\n📋 Contract Addresses:\n");
    console.log(`ApprovalManager:  ${approvalManagerAddress}`);
    console.log(`PaymentFlow:      ${paymentFlowAddress}`);
    console.log(`FlowFactory:       ${flowFactoryAddress}`);
    
    console.log("\n📝 Update your root .env file with:\n");
    console.log(`NEXT_PUBLIC_APPROVAL_MANAGER_ADDRESS=${approvalManagerAddress}`);
    console.log(`NEXT_PUBLIC_PAYMENT_FLOW_ADDRESS=${paymentFlowAddress}`);
    console.log(`NEXT_PUBLIC_FLOW_FACTORY_ADDRESS=${flowFactoryAddress}`);
    console.log(`NEXT_PUBLIC_MNEE_TOKEN_ADDRESS=${MNEE_ADDRESS}`);
    
    if (hre.network.name === "sepolia") {
      console.log("\n🌐 View on Sepolia Etherscan:");
      console.log(`ApprovalManager:  https://sepolia.etherscan.io/address/${approvalManagerAddress}`);
      console.log(`PaymentFlow:      https://sepolia.etherscan.io/address/${paymentFlowAddress}`);
      console.log(`FlowFactory:       https://sepolia.etherscan.io/address/${flowFactoryAddress}`);
    } else if (hre.network.name === "mainnet") {
      console.log("\n🌐 View on Etherscan:");
      console.log(`ApprovalManager:  https://etherscan.io/address/${approvalManagerAddress}`);
      console.log(`PaymentFlow:      https://etherscan.io/address/${paymentFlowAddress}`);
      console.log(`FlowFactory:       https://etherscan.io/address/${flowFactoryAddress}`);
    }
    
    console.log("\n" + "=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
