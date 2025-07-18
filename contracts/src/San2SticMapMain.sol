// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./San2SticMap.sol";
import "./RecordingManager.sol";
import "./VotingSystem.sol";
import "./LicenseManager.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract San2SticMapMain is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    San2SticMap public immutable userManager;
    RecordingManager public immutable recordingManager;
    VotingSystem public immutable votingSystem;
    LicenseManager public immutable licenseManager;

    uint256 public constant BATCH_SIZE_LIMIT = 50;
    uint256 public constant GAS_LIMIT_PER_OPERATION = 100000;

    struct BatchRecordingInput {
        string title;
        string description;
        string ipfsHash;
        int256 latitude;
        int256 longitude;
        string[] tags;
        uint256 duration;
        RecordingManager.AudioQuality quality;
        string equipment;
        LicenseManager.LicenseType license;
    }

    event ContractsDeployed(
        address userManager, address recordingManager, address votingSystem, address licenseManager
    );

    event BatchOperationCompleted(string operationType, uint256 successCount, uint256 totalCount, uint256 gasUsed);

    constructor(address _userManager, address _recordingManager, address _votingSystem, address _licenseManager) {
        require(_userManager != address(0), "Invalid user manager address");
        require(_recordingManager != address(0), "Invalid recording manager address");
        require(_votingSystem != address(0), "Invalid voting system address");
        require(_licenseManager != address(0), "Invalid license manager address");

        userManager = San2SticMap(_userManager);
        recordingManager = RecordingManager(_recordingManager);
        votingSystem = VotingSystem(_votingSystem);
        licenseManager = LicenseManager(_licenseManager);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);

        emit ContractsDeployed(_userManager, _recordingManager, _votingSystem, _licenseManager);
    }

    function registerUserAndAddRecording(
        string calldata _username,
        string calldata _title,
        string calldata _description,
        string calldata _ipfsHash,
        int256 _latitude,
        int256 _longitude,
        string[] calldata _tags,
        uint256 _duration,
        RecordingManager.AudioQuality _quality,
        string calldata _equipment,
        LicenseManager.LicenseType _license
    ) external whenNotPaused nonReentrant {
        uint256 gasStart = gasleft();

        if (!userManager.isUserRegistered(msg.sender)) {
            userManager.registerUser(_username);
        }

        recordingManager.addRecording(
            _title, _description, _ipfsHash, _latitude, _longitude, _tags, _duration, _quality, _equipment, _license
        );

        uint256 gasUsed = gasStart - gasleft();
        emit BatchOperationCompleted("registerAndRecord", 1, 1, gasUsed);
    }

    function batchVoteOnRecordings(uint256[] calldata _recordingIds, bool[] calldata _isUpvotes)
        external
        whenNotPaused
        nonReentrant
    {
        require(_recordingIds.length == _isUpvotes.length, "Array length mismatch");
        require(_recordingIds.length <= BATCH_SIZE_LIMIT, "Batch size too large");

        uint256 gasStart = gasleft();
        uint256 successCount = 0;

        for (uint256 i = 0; i < _recordingIds.length; i++) {
            try recordingManager.getRecordingCore(_recordingIds[i]) returns (RecordingManager.RecordingCore memory core)
            {
                if (core.creator != msg.sender && core.isActive) {
                    votingSystem.voteOnRecording(_recordingIds[i], _isUpvotes[i], core.creator);
                    successCount++;
                }
            } catch {
                continue;
            }
        }

        uint256 gasUsed = gasStart - gasleft();
        emit BatchOperationCompleted("batchVote", successCount, _recordingIds.length, gasUsed);
    }

    function batchRateRecordings(uint256[] calldata _recordingIds, uint8[] calldata _scores)
        external
        whenNotPaused
        nonReentrant
    {
        require(_recordingIds.length == _scores.length, "Array length mismatch");
        require(_recordingIds.length <= BATCH_SIZE_LIMIT, "Batch size too large");

        uint256 gasStart = gasleft();
        uint256 successCount = 0;

        for (uint256 i = 0; i < _recordingIds.length; i++) {
            if (_scores[i] >= 1 && _scores[i] <= 5) {
                try recordingManager.getRecordingCore(_recordingIds[i]) returns (
                    RecordingManager.RecordingCore memory core
                ) {
                    if (core.creator != msg.sender && core.isActive) {
                        votingSystem.rateRecording(_recordingIds[i], _scores[i], core.creator);
                        successCount++;
                    }
                } catch {
                    continue;
                }
            }
        }

        uint256 gasUsed = gasStart - gasleft();
        emit BatchOperationCompleted("batchRate", successCount, _recordingIds.length, gasUsed);
    }

    function batchSetRecordingLicenses(
        uint256[] calldata _recordingIds,
        LicenseManager.LicenseType[] calldata _licenseTypes,
        string[] calldata _attributions
    ) external whenNotPaused nonReentrant {
        require(
            _recordingIds.length == _licenseTypes.length && _licenseTypes.length == _attributions.length,
            "Array length mismatch"
        );
        require(_recordingIds.length <= BATCH_SIZE_LIMIT, "Batch size too large");

        uint256 gasStart = gasleft();
        uint256 successCount = 0;

        for (uint256 i = 0; i < _recordingIds.length; i++) {
            try recordingManager.getRecordingCore(_recordingIds[i]) returns (RecordingManager.RecordingCore memory core)
            {
                if (core.creator == msg.sender && core.isActive) {
                    licenseManager.setRecordingLicense(_recordingIds[i], _licenseTypes[i], _attributions[i]);
                    successCount++;
                }
            } catch {
                continue;
            }
        }

        uint256 gasUsed = gasStart - gasleft();
        emit BatchOperationCompleted("batchLicense", successCount, _recordingIds.length, gasUsed);
    }

    function getRecordingWithAllData(uint256 _recordingId)
        external
        view
        returns (
            RecordingManager.RecordingCore memory core,
            RecordingManager.RecordingMetadata memory metadata,
            RecordingManager.RecordingStats memory stats,
            uint256 upvotes,
            uint256 downvotes,
            uint256 averageRating,
            uint256 ratingCount,
            LicenseManager.LicenseType licenseType,
            string memory attribution
        )
    {
        (core, metadata, stats) = recordingManager.getRecording(_recordingId);
        (upvotes, downvotes) = votingSystem.getRecordingVotes(_recordingId);
        (averageRating, ratingCount) = votingSystem.getRecordingRating(_recordingId);
        (licenseType, attribution,) = licenseManager.getRecordingLicense(_recordingId);
    }

    function getRecordingsByLocationOptimized(
        int256 _minLat,
        int256 _maxLat,
        int256 _minLng,
        int256 _maxLng,
        uint256 _offset,
        uint256 _limit
    )
        external
        view
        returns (
            uint256[] memory recordingIds,
            RecordingManager.RecordingCore[] memory cores,
            uint256[] memory upvotes,
            uint256[] memory averageRatings
        )
    {
        recordingIds = recordingManager.getRecordingsByLocation(_minLat, _maxLat, _minLng, _maxLng, _offset, _limit);

        cores = new RecordingManager.RecordingCore[](recordingIds.length);
        upvotes = new uint256[](recordingIds.length);
        averageRatings = new uint256[](recordingIds.length);

        for (uint256 i = 0; i < recordingIds.length; i++) {
            if (recordingIds[i] > 0) {
                cores[i] = recordingManager.getRecordingCore(recordingIds[i]);
                (upvotes[i],) = votingSystem.getRecordingVotes(recordingIds[i]);
                (averageRatings[i],) = votingSystem.getRecordingRating(recordingIds[i]);
            }
        }
    }

    function getUserDashboard(address _user)
        external
        view
        returns (
            San2SticMap.User memory userInfo,
            uint256[] memory userRecordings,
            uint256 totalUpvotes,
            uint256 totalRatings,
            LicenseManager.LicenseType[] memory preferredLicenses
        )
    {
        if (userManager.isUserRegistered(_user)) {
            userInfo = userManager.getUser(_user);
            userRecordings = recordingManager.getUserRecordings(_user);

            for (uint256 i = 0; i < userRecordings.length; i++) {
                (uint256 recordingUpvotes,) = votingSystem.getRecordingVotes(userRecordings[i]);
                totalUpvotes += recordingUpvotes;
                (, uint256 recordingRatingCount) = votingSystem.getRecordingRating(userRecordings[i]);
                totalRatings += recordingRatingCount;
            }

            preferredLicenses = licenseManager.getUserLicensePreferences(_user);
        }
    }

    function getSystemStats()
        external
        view
        returns (
            uint256 totalUsers,
            uint256 totalRecordings,
            uint256 totalVotes,
            uint256 totalRatings,
            uint256 totalModerationActions
        )
    {
        totalUsers = userManager.getTotalUsers();
        totalRecordings = recordingManager.getTotalRecordings();
        totalVotes = votingSystem.getTotalVotes();
        totalRatings = votingSystem.getTotalRatings();
        totalModerationActions = votingSystem.getTotalModerationActions();
    }

    function emergencyPause() external onlyRole(ADMIN_ROLE) {
        _pause();
        userManager.pause();
        recordingManager.pause();
        votingSystem.pause();
        licenseManager.pause();
    }

    function emergencyUnpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        userManager.unpause();
        recordingManager.unpause();
        votingSystem.unpause();
        licenseManager.unpause();
    }

    function grantModeratorRoleAcrossContracts(address _moderator) external onlyRole(ADMIN_ROLE) {
        grantRole(MODERATOR_ROLE, _moderator);
        userManager.grantModeratorRole(_moderator);
        votingSystem.grantRole(MODERATOR_ROLE, _moderator);
    }

    function revokeModeratorRoleAcrossContracts(address _moderator) external onlyRole(ADMIN_ROLE) {
        revokeRole(MODERATOR_ROLE, _moderator);
        userManager.revokeModeratorRole(_moderator);
        votingSystem.revokeRole(MODERATOR_ROLE, _moderator);
    }
}
