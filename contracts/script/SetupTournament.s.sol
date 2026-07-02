// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console} from "forge-std/Script.sol";
import {GoalPredictCore} from "../src/GoalPredictCore.sol";
import {MockUSDT} from "../src/MockUSDT.sol";

contract SetupTournament is Script {
    function run() public {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address coreAddr = vm.envAddress("CORE_ADDRESS");
        address usdtAddr = vm.envAddress("USDT_ADDRESS");

        GoalPredictCore core = GoalPredictCore(payable(coreAddr));
        MockUSDT usdt = MockUSDT(usdtAddr);

        vm.startBroadcast(deployerKey);

        // ── Create tournament ──
        // Entry fee: 10 USDT (10 * 1e18)
        // Duration: 14 days
        uint256 entryFee = 10 ether;
        uint256 startTime = block.timestamp;
        uint256 endTime = block.timestamp + 14 days;
        uint256 tournamentId = core.createTournament(startTime, endTime, entryFee);
        console.log("Tournament created:", tournamentId);

        // ── Add knockout matches (World Cup 2026 structure) ──

        // === ROUND OF 32 (round 0) — 16 matches ===
        core.addMatch(tournamentId, "USA", "Mexico", 0);
        core.addMatch(tournamentId, "Spain", "Morocco", 0);
        core.addMatch(tournamentId, "France", "Ivory Coast", 0);
        core.addMatch(tournamentId, "Germany", "Japan", 0);
        core.addMatch(tournamentId, "England", "Paraguay", 0);
        core.addMatch(tournamentId, "Argentina", "Uruguay", 0);
        core.addMatch(tournamentId, "Brazil", "Jordan", 0);
        core.addMatch(tournamentId, "Portugal", "South Korea", 0);
        core.addMatch(tournamentId, "Netherlands", "Qatar", 0);
        core.addMatch(tournamentId, "Belgium", "Sweden", 0);
        core.addMatch(tournamentId, "Croatia", "Canada", 0);
        core.addMatch(tournamentId, "Senegal", "Tunisia", 0);
        core.addMatch(tournamentId, "Colombia", "Saudi Arabia", 0);
        core.addMatch(tournamentId, "Ecuador", "Iran", 0);
        core.addMatch(tournamentId, "Australia", "Ghana", 0);
        core.addMatch(tournamentId, "Norway", "Czech Republic", 0);
        console.log("R32: 16 matches added");

        // === ROUND OF 16 (round 1) — 8 matches ===
        core.addMatch(tournamentId, "Winner R32-1", "Winner R32-2", 1);
        core.addMatch(tournamentId, "Winner R32-3", "Winner R32-4", 1);
        core.addMatch(tournamentId, "Winner R32-5", "Winner R32-6", 1);
        core.addMatch(tournamentId, "Winner R32-7", "Winner R32-8", 1);
        core.addMatch(tournamentId, "Winner R32-9", "Winner R32-10", 1);
        core.addMatch(tournamentId, "Winner R32-11", "Winner R32-12", 1);
        core.addMatch(tournamentId, "Winner R32-13", "Winner R32-14", 1);
        core.addMatch(tournamentId, "Winner R32-15", "Winner R32-16", 1);
        console.log("R16: 8 matches added");

        // === QUARTERFINALS (round 2) — 4 matches ===
        core.addMatch(tournamentId, "Winner R16-1", "Winner R16-2", 2);
        core.addMatch(tournamentId, "Winner R16-3", "Winner R16-4", 2);
        core.addMatch(tournamentId, "Winner R16-5", "Winner R16-6", 2);
        core.addMatch(tournamentId, "Winner R16-7", "Winner R16-8", 2);
        console.log("QF: 4 matches added");

        // === SEMIFINALS (round 3) — 2 matches ===
        core.addMatch(tournamentId, "Winner QF-1", "Winner QF-2", 3);
        core.addMatch(tournamentId, "Winner QF-3", "Winner QF-4", 3);
        console.log("SF: 2 matches added");

        // === FINAL (round 4) — 1 match ===
        core.addMatch(tournamentId, "Winner SF-1", "Winner SF-2", 4);
        console.log("Final: 1 match added");

        // ── Mint USDT to test users ──
        usdt.mint(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 1000 ether); // Account 1
        usdt.mint(0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, 1000 ether); // Account 2
        usdt.mint(0x90F79bf6EB2c4f870365E785982E1f101E93b906, 1000 ether); // Account 3
        usdt.mint(0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65, 1000 ether); // Account 4
        console.log("Test USDT minted to 4 accounts");

        vm.stopBroadcast();

        console.log("=== Setup Complete ===");
        console.log("Tournament ID:", tournamentId);
        console.log("Entry Fee:", entryFee / 1e18, "USDT");
        console.log("Total Matches:", 16 + 8 + 4 + 2 + 1);
    }
}
