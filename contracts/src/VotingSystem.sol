// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract VotingSystem is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    struct Vote {
        address voter;
        uint256 recordingId;
        bool isUpvote;
        uint256 timestamp;
    }
    
    struct Rating {
        address rater;
        uint256 recordingId;
        uint8 score;
        uint256 timestamp;
    }
    
    struct ModerationAction {
        uint256 recordingId;
        address moderator;
        ModerationStatus action;
        string reason;
        uint256 timestamp;
    }
    
    enum ModerationStatus {
        PENDING,
        APPROVED,
        REJECTED,
        FLAGGED
    }
    
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => bool)) public hasRated;
    mapping(uint256 => uint256) public recordingUpvotes;
    mapping(uint256 => uint256) public recordingDownvotes;
    mapping(uint256 => uint256) public recordingTotalRating;
    mapping(uint256 => uint256) public recordingRatingCount;
    mapping(uint256 => ModerationStatus) public recordingStatus;
    mapping(address => uint256) public userReputation;
    
    Vote[] public votes;
    Rating[] public ratings;
    ModerationAction[] public moderationActions;
    
    uint256 public constant MIN_RATING = 1;
    uint256 public constant MAX_RATING = 5;
    uint256 public constant REPUTATION_UPVOTE_REWARD = 1;
    uint256 public constant REPUTATION_DOWNVOTE_PENALTY = 1;
    uint256 public constant MIN_REPUTATION_TO_MODERATE = 100;
    
    event RecordingVoted(uint256 indexed recordingId, address indexed voter, bool isUpvote);
    event RecordingRated(uint256 indexed recordingId, address indexed rater, uint8 score);
    event RecordingModerated(uint256 indexed recordingId, address indexed moderator, ModerationStatus status);
    event ReputationUpdated(address indexed user, uint256 newReputation);
    event ModerationActionTaken(uint256 indexed recordingId, address indexed moderator, ModerationStatus action, string reason);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);
    }
    
    modifier recordingExists(uint256 _recordingId) {
        require(_recordingId > 0, "Invalid recording ID");
        _;
    }
    
    modifier notRecordingCreator(uint256 _recordingId, address _creator) {
        require(msg.sender != _creator, "Cannot vote/rate own recording");
        _;
    }
    
    function voteOnRecording(
        uint256 _recordingId, 
        bool _isUpvote,
        address _recordingCreator
    ) external recordingExists(_recordingId) notRecordingCreator(_recordingId, _recordingCreator) whenNotPaused nonReentrant {
        require(!hasVoted[_recordingId][msg.sender], "Already voted on this recording");
        require(recordingStatus[_recordingId] == ModerationStatus.APPROVED, "Recording not approved");
        
        hasVoted[_recordingId][msg.sender] = true;
        
        if (_isUpvote) {
            recordingUpvotes[_recordingId]++;
            _updateUserReputation(_recordingCreator, REPUTATION_UPVOTE_REWARD, true);
        } else {
            recordingDownvotes[_recordingId]++;
            _updateUserReputation(_recordingCreator, REPUTATION_DOWNVOTE_PENALTY, false);
        }
        
        votes.push(Vote({
            voter: msg.sender,
            recordingId: _recordingId,
            isUpvote: _isUpvote,
            timestamp: block.timestamp
        }));
        
        emit RecordingVoted(_recordingId, msg.sender, _isUpvote);
    }
    
    function rateRecording(
        uint256 _recordingId, 
        uint8 _score,
        address _recordingCreator
    ) external recordingExists(_recordingId) notRecordingCreator(_recordingId, _recordingCreator) whenNotPaused nonReentrant {
        require(_score >= MIN_RATING && _score <= MAX_RATING, "Rating must be between 1 and 5");
        require(!hasRated[_recordingId][msg.sender], "Already rated this recording");
        require(recordingStatus[_recordingId] == ModerationStatus.APPROVED, "Recording not approved");
        
        hasRated[_recordingId][msg.sender] = true;
        
        recordingTotalRating[_recordingId] += _score;
        recordingRatingCount[_recordingId]++;
        
        ratings.push(Rating({
            rater: msg.sender,
            recordingId: _recordingId,
            score: _score,
            timestamp: block.timestamp
        }));
        
        if (_score >= 4) {
            _updateUserReputation(_recordingCreator, 1, true);
        } else if (_score <= 2) {
            _updateUserReputation(_recordingCreator, 1, false);
        }
        
        emit RecordingRated(_recordingId, msg.sender, _score);
    }
    
    function moderateRecording(
        uint256 _recordingId, 
        ModerationStatus _status, 
        string calldata _reason
    ) external onlyRole(MODERATOR_ROLE) recordingExists(_recordingId) whenNotPaused {
        require(_status != ModerationStatus.PENDING, "Cannot set status to pending");
        require(bytes(_reason).length > 0, "Reason required");
        
        recordingStatus[_recordingId] = _status;
        
        moderationActions.push(ModerationAction({
            recordingId: _recordingId,
            moderator: msg.sender,
            action: _status,
            reason: _reason,
            timestamp: block.timestamp
        }));
        
        emit RecordingModerated(_recordingId, msg.sender, _status);
        emit ModerationActionTaken(_recordingId, msg.sender, _status, _reason);
    }
    
    function batchModerateRecordings(
        uint256[] calldata _recordingIds, 
        ModerationStatus[] calldata _statuses, 
        string[] calldata _reasons
    ) external onlyRole(MODERATOR_ROLE) whenNotPaused {
        require(_recordingIds.length == _statuses.length && _statuses.length == _reasons.length, "Array length mismatch");
        require(_recordingIds.length <= 50, "Batch size too large");
        
        for (uint256 i = 0; i < _recordingIds.length; i++) {
            if (_recordingIds[i] > 0 && _statuses[i] != ModerationStatus.PENDING) {
                recordingStatus[_recordingIds[i]] = _statuses[i];
                
                moderationActions.push(ModerationAction({
                    recordingId: _recordingIds[i],
                    moderator: msg.sender,
                    action: _statuses[i],
                    reason: _reasons[i],
                    timestamp: block.timestamp
                }));
                
                emit RecordingModerated(_recordingIds[i], msg.sender, _statuses[i]);
                emit ModerationActionTaken(_recordingIds[i], msg.sender, _statuses[i], _reasons[i]);
            }
        }
    }
    
    function proposeModeration(
        uint256 _recordingId,
        ModerationStatus _proposedStatus,
        string calldata _reason
    ) external recordingExists(_recordingId) whenNotPaused {
        require(userReputation[msg.sender] >= MIN_REPUTATION_TO_MODERATE, "Insufficient reputation to propose moderation");
        require(_proposedStatus != ModerationStatus.PENDING, "Cannot propose pending status");
        require(bytes(_reason).length > 0, "Reason required");
        
        moderationActions.push(ModerationAction({
            recordingId: _recordingId,
            moderator: msg.sender,
            action: _proposedStatus,
            reason: _reason,
            timestamp: block.timestamp
        }));
        
        emit ModerationActionTaken(_recordingId, msg.sender, _proposedStatus, _reason);
    }
    
    function _updateUserReputation(address _user, uint256 _amount, bool _increase) internal {
        if (_increase) {
            userReputation[_user] += _amount;
        } else {
            if (userReputation[_user] >= _amount) {
                userReputation[_user] -= _amount;
            } else {
                userReputation[_user] = 0;
            }
        }
        
        emit ReputationUpdated(_user, userReputation[_user]);
    }
    
    function getRecordingVotes(uint256 _recordingId) external view returns (uint256 upvotes, uint256 downvotes) {
        return (recordingUpvotes[_recordingId], recordingDownvotes[_recordingId]);
    }
    
    function getRecordingRating(uint256 _recordingId) external view returns (uint256 averageRating, uint256 ratingCount) {
        uint256 count = recordingRatingCount[_recordingId];
        if (count == 0) {
            return (0, 0);
        }
        return (recordingTotalRating[_recordingId] / count, count);
    }
    
    function getRecordingModerationHistory(uint256 _recordingId) external view returns (ModerationAction[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < moderationActions.length; i++) {
            if (moderationActions[i].recordingId == _recordingId) {
                count++;
            }
        }
        
        ModerationAction[] memory result = new ModerationAction[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < moderationActions.length; i++) {
            if (moderationActions[i].recordingId == _recordingId) {
                result[index] = moderationActions[i];
                index++;
            }
        }
        
        return result;
    }
    
    function getUserVotingHistory(address _user, uint256 _offset, uint256 _limit) external view returns (Vote[] memory) {
        require(_limit <= 100, "Limit too high");
        
        uint256 count = 0;
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].voter == _user) {
                count++;
            }
        }
        
        if (_offset >= count) {
            return new Vote[](0);
        }
        
        uint256 resultSize = count - _offset;
        if (resultSize > _limit) {
            resultSize = _limit;
        }
        
        Vote[] memory result = new Vote[](resultSize);
        uint256 index = 0;
        uint256 skipped = 0;
        
        for (uint256 i = 0; i < votes.length && index < resultSize; i++) {
            if (votes[i].voter == _user) {
                if (skipped >= _offset) {
                    result[index] = votes[i];
                    index++;
                } else {
                    skipped++;
                }
            }
        }
        
        return result;
    }
    
    function getTotalVotes() external view returns (uint256) {
        return votes.length;
    }
    
    function getTotalRatings() external view returns (uint256) {
        return ratings.length;
    }
    
    function getTotalModerationActions() external view returns (uint256) {
        return moderationActions.length;
    }
    
    function setUserReputation(address _user, uint256 _reputation) external onlyRole(ADMIN_ROLE) {
        userReputation[_user] = _reputation;
        emit ReputationUpdated(_user, _reputation);
    }
    
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
