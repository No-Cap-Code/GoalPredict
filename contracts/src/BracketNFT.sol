// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IGOalPredict.sol";

/**
 * @title BracketNFT
 * @notice ERC-721 bracket ticket.  tokenId = uint256(user address).
 *         Only the GoalPredictCore contract (owner) may mint / update picks.
 */
contract BracketNFT is ERC721, Ownable {

    // ── Storage ──────────────────────────────────────────────────────────

    // user address => bracket picks (overwriting is fine — one bracket per user)
    mapping(uint256 => IGoalPredict.Bracket) private _brackets;

    // ── Events ───────────────────────────────────────────────────────────
    event BracketMinted(uint256 indexed tokenId, address indexed user);
    event PicksUpdated(uint256 indexed tokenId, uint8 round);

    // ── Constructor ──────────────────────────────────────────────────────
    constructor() ERC721("GoalPredict Bracket", "GPBRACKET") Ownable(msg.sender) {}

    // ── Mint ─────────────────────────────────────────────────────────────
    /**
     * @param user   Address of the bracket owner.
     * @param picks  Initial bracket picks (all rounds).
     */
    function mintBracket(address user, IGoalPredict.Bracket calldata picks) external onlyOwner {
        uint256 tokenId = uint256(uint160(user));
        _safeMint(user, tokenId);
        _brackets[tokenId] = picks;
        emit BracketMinted(tokenId, user);
    }

    // ── Update ───────────────────────────────────────────────────────────
    /**
     * @param tokenId  Token ID (user address cast to uint256).
     * @param round    Round index (0=R16, 1=QF, 2=SF, 3=Final).
     * @param picks    Array of winning-team indices for this round.
     *
     * Requirements:
     * - Caller must be the contract owner (GoalPredictCore).
     * - `picks` length must match the round size.
     */
    function updatePicks(uint256 tokenId, uint8 round, uint8[] calldata picks) external onlyOwner {
        require(round <= 3, "BracketNFT: invalid round");

        IGoalPredict.Bracket storage bracket = _brackets[tokenId];

        if (round == 0) {
            require(picks.length == 8, "BracketNFT: R16 needs 8 picks");
            for (uint256 i = 0; i < 8; i++) bracket.picksR16[i] = picks[i];
        } else if (round == 1) {
            require(picks.length == 4, "BracketNFT: QF needs 4 picks");
            for (uint256 i = 0; i < 4; i++) bracket.picksQF[i] = picks[i];
        } else if (round == 2) {
            require(picks.length == 2, "BracketNFT: SF needs 2 picks");
            for (uint256 i = 0; i < 2; i++) bracket.picksSF[i] = picks[i];
        } else if (round == 3) {
            require(picks.length == 1, "BracketNFT: Final needs 1 pick");
            bracket.picksFinal = picks[0];
        }

        emit PicksUpdated(tokenId, round);
    }

    // ── View ─────────────────────────────────────────────────────────────
    function getBracket(uint256 tokenId) external view returns (IGoalPredict.Bracket memory) {
        require(_ownerOf(tokenId) != address(0), "BracketNFT: token does not exist");
        return _brackets[tokenId];
    }

    // ── Overrides ────────────────────────────────────────────────────────
    function tokenURI(uint256 /* tokenId */) public pure override returns (string memory) {
        return ""; // no metadata for hackathon demo
    }
}
