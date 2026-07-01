// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./interfaces/IGOalPredict.sol";
import "./BracketNFT.sol";

/**
 * @title GoalPredictCore
 * @notice Main tournament contract for the GoalPredict dApp.
 *         Users deposit USDT, receive a BracketNFT, submit picks, and
 *         claim USDT payouts after each round is resolved.
 *
 *         Prize pool split per round (R0..R3): 50 / 25 / 15 / 10 percent.
 *         Payout = roundPrizePool * userCorrectPicks / totalCorrectPicksInRound.
 */
contract GoalPredictCore is IGoalPredict, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ── Constants ────────────────────────────────────────────────────────
    uint8 public constant MAX_ROUND = 4;          // R16, QF, SF, Final
    uint8 public constant ROUND_SIZE_0 = 8;       // R16
    uint8 public constant ROUND_SIZE_1 = 4;       // QF
    uint8 public constant ROUND_SIZE_2 = 2;       // SF
    uint8 public constant ROUND_SIZE_3 = 1;       // Final

    // BPS that each round captures from the pool, in basis points (10_000 = 100%).
    uint16 public constant R0_BPS = 5000;  // 50%
    uint16 public constant R1_BPS = 2500;  // 25%
    uint16 public constant R2_BPS = 1500;  // 15%
    uint16 public constant R3_BPS = 1000;  // 10%
    uint16 public constant TOTAL_BPS = 10000;

    // ── Storage ──────────────────────────────────────────────────────────
    IERC20    public immutable usdt;
    BracketNFT public immutable bracketNFT;

    uint256 public nextTournamentId;

    // tournamentId => Tournament
    mapping(uint256 => Tournament) private _tournaments;
    // tournamentId => Match[]
    mapping(uint256 => Match[])    private _matches;
    // tournamentId => round => winners[]
    mapping(uint256 => mapping(uint8 => uint8[])) private _roundWinners;
    // tournamentId => round => total correct picks summed across all users
    mapping(uint256 => mapping(uint8 => uint256)) private _totalCorrectPicks;
    // tournamentId => round => user => correct picks
    mapping(uint256 => mapping(uint8 => mapping(address => uint256))) private _userCorrectPicks;
    // tournamentId => user => has the user claimed that round?
    mapping(uint256 => mapping(uint8 => mapping(address => bool))) private _hasClaimed;
    // tournamentId => round => resolved?
    mapping(uint256 => mapping(uint8 => bool)) private _roundResolved;
    // tournamentId => user => entered?
    mapping(uint256 => mapping(address => bool)) private _hasEntered;
    // tournamentId => entrant list (for enumeration during resolve)
    mapping(uint256 => address[]) private _entrantList;

    // ── Constructor ──────────────────────────────────────────────────────
    constructor(address _usdt, address _bracketNFT) Ownable(msg.sender) {
        require(_usdt != address(0), "GoalPredictCore: zero usdt");
        require(_bracketNFT != address(0), "GoalPredictCore: zero nft");
        usdt = IERC20(_usdt);
        bracketNFT = BracketNFT(_bracketNFT);
    }

    // ── Owner: create tournament ─────────────────────────────────────────
    function createTournament(
        uint256 startTime,
        uint256 endTime,
        uint256 entryFee
    ) external onlyOwner returns (uint256 tournamentId) {
        tournamentId = nextTournamentId++;
        _tournaments[tournamentId] = Tournament({
            id:            tournamentId,
            startTime:     startTime,
            endTime:       endTime,
            entryFee:      entryFee,
            status:        TournamentStatus.Active,
            totalPool:     0,
            roundPrizePool: [uint256(0), uint256(0), uint256(0), uint256(0)]
        });
    }

    // ── Owner: add match ─────────────────────────────────────────────────
    function addMatch(
        uint256 tournamentId,
        string calldata homeTeam,
        string calldata awayTeam,
        uint8 round
    ) external onlyOwner {
        _requireActive(tournamentId);
        require(round < MAX_ROUND, "GoalPredictCore: invalid round");
        _matches[tournamentId].push(Match({
            id:        _matches[tournamentId].length,
            homeTeam:  homeTeam,
            awayTeam:  awayTeam,
            round:     round,
            homeGoals: 0,
            awayGoals: 0,
            resolved:  false
        }));
    }

    // ── User: enter tournament ───────────────────────────────────────────
    function enterTournament(uint256 tournamentId) external override nonReentrant {
        Tournament storage t = _tournaments[tournamentId];
        _requireActive(tournamentId);
        require(block.timestamp < t.endTime, "GoalPredictCore: tournament ended");
        require(!_hasEntered[tournamentId][msg.sender], "GoalPredictCore: already entered");

        _hasEntered[tournamentId][msg.sender] = true;

        // Track entrant for enumeration
        _entrantList[tournamentId].push(msg.sender);

        // Pull USDT
        usdt.safeTransferFrom(msg.sender, address(this), t.entryFee);
        t.totalPool += t.entryFee;

        // Pre-allocate prize pools from this deposit (split by BPS).
        t.roundPrizePool[0] += (t.entryFee * R0_BPS) / TOTAL_BPS;
        t.roundPrizePool[1] += (t.entryFee * R1_BPS) / TOTAL_BPS;
        t.roundPrizePool[2] += (t.entryFee * R2_BPS) / TOTAL_BPS;
        t.roundPrizePool[3] += (t.entryFee * R3_BPS) / TOTAL_BPS;

        // Mint a BracketNFT for the user
        IGoalPredict.Bracket memory empty;
        bracketNFT.mintBracket(msg.sender, empty);
    }

    // ── User: submit picks ───────────────────────────────────────────────
    function submitBracket(
        uint256 tournamentId,
        uint8 round,
        uint8[] calldata picks
    ) external override {
        _requireActive(tournamentId);
        require(_hasEntered[tournamentId][msg.sender], "GoalPredictCore: not entered");
        require(round < MAX_ROUND, "GoalPredictCore: invalid round");
        require(
            _roundMatchesLength(tournamentId, round) == _expectedSize(round),
            "GoalPredictCore: round not fully seeded"
        );
        require(_expectedSize(round) == picks.length, "GoalPredictCore: bad picks length");
        require(!_roundResolved[tournamentId][round], "GoalPredictCore: round already resolved");

        uint256 tokenId = uint256(uint160(msg.sender));
        bracketNFT.updatePicks(tokenId, round, picks);
        emit BracketSubmitted(tournamentId, msg.sender, round);
    }

    // ── Owner: resolve round ─────────────────────────────────────────────
    function resolveRound(
        uint256 tournamentId,
        uint8 round,
        uint8[] calldata winners
    ) external override onlyOwner {
        _requireActive(tournamentId);
        require(round < MAX_ROUND, "GoalPredictCore: invalid round");
        require(!_roundResolved[tournamentId][round], "GoalPredictCore: already resolved");
        require(winners.length == _expectedSize(round), "GoalPredictCore: bad winners length");

        // Stash round winners
        delete _roundWinners[tournamentId][round];
        for (uint256 i = 0; i < winners.length; i++) {
            _roundWinners[tournamentId][round].push(winners[i]);
        }

        // Tally correct picks across all entrants
        address[] storage entrants = _entrantList[tournamentId];
        uint256 totalCorrect = 0;
        for (uint256 i = 0; i < entrants.length; i++) {
            address user = entrants[i];
            uint256 tokenId = uint256(uint160(user));
            IGoalPredict.Bracket memory br = bracketNFT.getBracket(tokenId);
            uint256 correct = _countCorrect(round, br, winners);
            _userCorrectPicks[tournamentId][round][user] = correct;
            totalCorrect += correct;
        }
        _totalCorrectPicks[tournamentId][round] = totalCorrect;
        _roundResolved[tournamentId][round] = true;

        emit RoundResolved(tournamentId, round);
    }

    // ── User: claim payout ───────────────────────────────────────────────
    function claimPayout(uint256 tournamentId) external override nonReentrant {
        Tournament storage t = _tournaments[tournamentId];
        require(_hasEntered[tournamentId][msg.sender], "GoalPredictCore: not entered");

        uint256 totalOwed = 0;
        for (uint8 r = 0; r < MAX_ROUND; r++) {
            if (!_roundResolved[tournamentId][r]) continue;
            if (_hasClaimed[tournamentId][r][msg.sender]) continue;

            uint256 userCorrect = _userCorrectPicks[tournamentId][r][msg.sender];
            if (userCorrect == 0) {
                _hasClaimed[tournamentId][r][msg.sender] = true;
                continue;
            }
            uint256 totalCorrect = _totalCorrectPicks[tournamentId][r];
            require(totalCorrect > 0, "GoalPredictCore: division by zero");

            uint256 payout = (t.roundPrizePool[r] * userCorrect) / totalCorrect;
            totalOwed += payout;
            _hasClaimed[tournamentId][r][msg.sender] = true;
        }

        require(totalOwed > 0, "GoalPredictCore: nothing to claim");
        usdt.safeTransfer(msg.sender, totalOwed);
        emit PayoutClaimed(tournamentId, msg.sender, totalOwed);

        _maybeMarkPaid(tournamentId);
    }

    // ── Views ────────────────────────────────────────────────────────────
    function getBracket(uint256 tournamentId, address user)
        external
        view
        override
        returns (Bracket memory)
    {
        uint256 tokenId = uint256(uint160(user));
        return bracketNFT.getBracket(tokenId);
    }

    function getMatch(uint256 tournamentId, uint256 matchIndex)
        external
        view
        override
        returns (Match memory)
    {
        return _matches[tournamentId][matchIndex];
    }

    function getPoolSize(uint256 tournamentId) external view override returns (uint256) {
        return _tournaments[tournamentId].totalPool;
    }

    function getTournament(uint256 tournamentId) external view returns (Tournament memory) {
        return _tournaments[tournamentId];
    }

    function getMatchesCount(uint256 tournamentId) external view returns (uint256) {
        return _matches[tournamentId].length;
    }

    function getEntrantsCount(uint256 tournamentId) external view returns (uint256) {
        return _entrantList[tournamentId].length;
    }

    // ── Internals ────────────────────────────────────────────────────────
    function _expectedSize(uint8 round) internal pure returns (uint8) {
        if (round == 0) return 8;
        if (round == 1) return 4;
        if (round == 2) return 2;
        return 1;
    }

    function _roundMatchesLength(uint256 tournamentId, uint8 round) internal view returns (uint8) {
        uint8 n = 0;
        Match[] storage ms = _matches[tournamentId];
        for (uint256 i = 0; i < ms.length; i++) {
            if (ms[i].round == round) n++;
        }
        return n;
    }

    function _countCorrect(
        uint8 round,
        Bracket memory br,
        uint8[] memory winners
    ) internal pure returns (uint256) {
        if (round == 0) {
            uint256 c;
            for (uint256 i = 0; i < 8; i++) if (br.picksR16[i] == winners[i]) c++;
            return c;
        } else if (round == 1) {
            uint256 c;
            for (uint256 i = 0; i < 4; i++) if (br.picksQF[i] == winners[i]) c++;
            return c;
        } else if (round == 2) {
            uint256 c;
            for (uint256 i = 0; i < 2; i++) if (br.picksSF[i] == winners[i]) c++;
            return c;
        } else {
            return br.picksFinal == winners[0] ? 1 : 0;
        }
    }

    function _requireActive(uint256 tournamentId) internal view {
        require(
            _tournaments[tournamentId].status == TournamentStatus.Active,
            "GoalPredictCore: not active"
        );
    }

    function _maybeMarkPaid(uint256 tournamentId) internal {
        Tournament storage t = _tournaments[tournamentId];
        if (t.status == TournamentStatus.Paid) return;
        bool all = true;
        for (uint8 r = 0; r < MAX_ROUND; r++) {
            if (!_roundResolved[tournamentId][r]) { all = false; break; }
        }
        if (all) t.status = TournamentStatus.Paid;
    }
}
