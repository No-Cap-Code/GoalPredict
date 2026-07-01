// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console} from "forge-std/Script.sol";
import {GoalPredictCore} from "../src/GoalPredictCore.sol";
import {BracketNFT} from "../src/BracketNFT.sol";
import {MockUSDT} from "../src/MockUSDT.sol";

contract Deploy is Script {
    function run() public {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerKey);

        // Deploy MockUSDT (testnet)
        MockUSDT usdt = new MockUSDT();

        // Deploy BracketNFT
        BracketNFT bracketNFT = new BracketNFT();

        // Deploy GoalPredictCore
        GoalPredictCore core = new GoalPredictCore(address(usdt), address(bracketNFT));

        // Transfer BracketNFT ownership to core
        bracketNFT.transferOwnership(address(core));

        // Mint test USDT
        usdt.mint(address(core), 1000e18);

        console.log("MockUSDT:", address(usdt));
        console.log("BracketNFT:", address(bracketNFT));
        console.log("GoalPredictCore:", address(core));

        vm.stopBroadcast();
    }
}
