import fs from "fs";
import {
  Account,
  Provider,
  json,
  stark,
  shortString,
  constants,
  CallData
} from "starknet";
import { createRequire } from 'module'; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
require('dotenv').config(); // use the require method

// SETUP
console.log("Reading ERC20 Contract...");
const compiledErc20 = json.parse(
  fs.readFileSync("./target/dev/l2_erc_20.sierra.json").toString("ascii")
);
const compiledCasm = json.parse(fs.readFileSync("./target/dev/l2_erc_20.casm.json").toString("ascii"));

// async function deploy(): Promise<Contract> {
//   // Declare & deploy contract
//   const compiledSierra = json.parse(fs.readFileSync("./src/target/dev/swap.sierra.json").toString("ascii"));
//   const deployResponse = await deployer.declare({ contract: compiledSierra, casm: compiledCasm });
//   const contractClassHash = deployResponse.class_hash;
//   await provider.waitForTransaction(deployResponse.transaction_hash);
//   const { transaction_hash: transaction_hash, address } = await deployer.deployContract({ classHash: contractClassHash, salt: "0" });
//   await provider.waitForTransaction(transaction_hash);

//   // Return the new contract instance
//   const contract = new Contract(compiledSierra.abi, address, provider);
//   return contract;
// }

// connect provider
const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });
const privateKeyAX = process.env.PKEY;
const publicKey = process.env.PUBKEY;
const account = new Account(provider, publicKey, privateKeyAX)

// 1. DEPLOY CONTRACT

// Deploy an ERC20 contract and wait for it to be verified on StarkNet.
console.log("Deployment Tx - ERC20 Contract to StarkNet...");

const salt = '900080545022'; // use some random salt

const erc20Response = await account.deploy({
  classHash: "0x11bfde76aff889bb51daa4bb28bd26e72d8617fe5494faaab133f05842a044b",
  constructorCalldata: CallData.compile({
    name: shortString.encodeShortString('Transmuted Ether'),
    symbol: shortString.encodeShortString('TETH'),
    decimals: 18,
  }),
  salt,
});


console.log("Waiting for Tx to be Accepted on Starknet - ERC20 Deployment...");
await provider.waitForTransaction(erc20Response.transaction_hash);

const txReceipt = await provider.getTransactionReceipt(erc20Response.transaction_hash);


///////////////////////////////
// Contract interaction
///////////////////////////////

// Get the erc20 contract address
const erc20Event = parseUDCEvent(txReceipt);
console.log("ERC20 Address: ", erc20Event.address);
