// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";
import "../src/MockUSDT.sol";
import "../src/BracketNFT.sol";
import "../src/GoalPredictCore.sol";

contract GoalPredictTest is Test {
    MockUSDT    usdt;
    BracketNFT  bracketNFT;
    GoalPredictCore core;

    address alice = makeAddr("alice");
    address bob   = makeAddr("bob");

    uint256 constant ENTRY_FEE = 100e18;

    function setUp() public {
        usdt = new MockUSDT();
        bracketNFT = new BracketNFT();
        core = new GoalPredictCore(address(usdt), address(bracketNFT));
        bracketNFT.transferOwnership(address(core));

        usdt.mint(alice, 1000e18);
        usdt.mint(bob, 1000e18);

        uint256 startTime = block.timestamp + 10;
        uint256 endTime = block.timestamp + 86400;
        core.createTournament(startTime, endTime, ENTRY_FEE);

        for (uint8 i = 0; i < 8; i++) {
            core.addMatch(0, string(abi.encodePacked("T", uint256(i*2))), string(abi.encodePacked("T", uint256(i*2+1))), 0);
        }
    }

    function _enter(address user, uint256 tid) internal {
        vm.startPrank(user);
        usdt.approve(address(core), ENTRY_FEE);
        core.enterTournament(tid);
        vm.stopPrank();
    }

    function testEnterTournament() public {
        _enter(alice, 0);
        assertEq(usdt.balanceOf(alice), 900e18, "USDT not deducted");
        assertEq(core.getPoolSize(0), ENTRY_FEE, "Pool mismatch");
        assertEq(core.getEntrantsCount(0), 1, "Entrant count");
    }

    function testCannotDoubleEnter() public {
        _enter(alice, 0);
        vm.expectRevert();
        _enter(alice, 0);
    }

    function testPoolSplit() public {
        _enter(alice, 0);
        assertEq(core.getPoolSize(0), ENTRY_FEE);
        // Pool: R0=50%, R1=25%, R2=15%, R3=10% of each entry
        assertEq(core.getTournament(0).roundPrizePool[0], ENTRY_FEE * 5000 / 10000);
        assertEq(core.getTournament(0).roundPrizePool[1], ENTRY_FEE * 2500 / 10000);
        assertEq(core.getTournament(0).roundPrizePool[2], ENTRY_FEE * 1500 / 10000);
        assertEq(core.getTournament(0).roundPrizePool[3], ENTRY_FEE * 1000 / 10000);
    }

    function testResolveRound() public {
        _enter(alice, 0);
        _enter(bob, 0);

        uint8[8] memory picks = [0,0,0,0,0,0,0,0];
        vm.prank(alice);
        core.submitBracket(0, 0, picks);
        vm.prank(bob);
        core.submitBracket(0, 0, picks);

        uint8[8] memory winners = [0,0,0,0,0,0,0,0];
        core.resolveRound(0, 0, winners);

        assertEq(core.getEntrantsCount(0), 2);
    }

    function testClaimPayout() public {
        _enter(alice, 0);

        uint8[8] memory picks = [0,0,0,0,0,0,0,0];
        vm.prank(alice);
        core.submitBracket(0, 0, picks);

        uint8[8] memory winners = [0,0,0,0,0,0,0,0];
        core.resolveRound(0, 0, winners);

        uint256 before = usdt.balanceOf(alice);
        vm.prank(alice);
        core.claimPayout(0);
        assertGt(usdt.balanceOf(alice), before, "Should receive payout");
    }

    function testUnauthorizedResolve() public {
        _enter(alice, 0);
        uint8[8] memory winners = [0,0,0,0,0,0,0,0];
        vm.expectRevert();
        vm.prank(alice);
        core.resolveRound(0, 0, winners);
    }

    function testSubmitStoresPicks() public {
        _enter(alice, 0);

        uint8[8] memory picks = [0,1,0,0,0,1,0,1];
        vm.prank(alice);
        core.submitBracket(0, 0, picks);

        (uint8[8] memory r16,,,,) = core.getBracket(0, alice);
        for (uint256 i = 0; i < 8; i++) {
            assertEq(r16[i], picks[i]);
        }
    }

    function testClaimTwiceFails() public {
        _enter(alice, 0);
        _enter(bob, 0);

        uint8[8] memory picks = [0,0,0,0,0,0,0,0];
        vm.prank(alice);
        core.submitBracket(0, 0, picks);
        vm.prank(bob);
        core.submitBracket(0, 0, picks);

        uint8[8] memory winners = [0,0,0,0,0,0,0,0];
        core.resolveRound(0, 0, winners);

        vm.prank(alice);
        core.claimPayout(0);

        vm.expectRevert();
        vm.prank(alice);
        core.claimPayout(0);
    }

    function testEntrantsCount() public {
        assertEq(core.getEntrantsCount(0), 0);
        _enter(alice, 0);
        assertEq(core.getEntrantsCount(0), 1);
        _enter(bob, 0);
        assertEq(core.getEntrantsCount(0), 2);
    }
}