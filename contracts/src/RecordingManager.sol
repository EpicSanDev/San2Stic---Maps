// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./LicenseManager.sol";

contract RecordingManager is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    uint256 private _recordingIdCounter;
    
    enum AudioQuality { LOW, MEDIUM, HIGH, LOSSLESS }
    enum ModerationStatus { PENDING, APPROVED, REJECTED, FLAGGED }
    
    struct RecordingCore {
        uint256 id;
        address creator;
        string ipfsHash;
        int256 latitude;
        int256 longitude;
        uint256 timestamp;
        bool isActive;
    }
    
    struct RecordingMetadata {
        string title;
        string description;
        string[] tags;
        uint256 duration;
        AudioQuality quality;
        string equipment;
        LicenseManager.LicenseType license;
        ModerationStatus status;
    }
    
    struct RecordingStats {
        uint256 upvotes;
        uint256 downvotes;
        uint256 totalRating;
        uint256 ratingCount;
    }
    
    mapping(uint256 => RecordingCore) public recordingCore;
    mapping(uint256 => RecordingMetadata) public recordingMetadata;
    mapping(uint256 => RecordingStats) public recordingStats;
    mapping(bytes32 => bool) public locationHashes;
    mapping(address => uint256[]) public userRecordings;
    mapping(address => uint256) public userLastRecordingTime;
    
    uint256 public constant MIN_RECORDING_INTERVAL = 300;
    uint256 public constant MAX_TAGS = 10;
    uint256 public constant MAX_TITLE_LENGTH = 100;
    uint256 public constant MAX_DESCRIPTION_LENGTH = 500;
    uint256 public constant MAX_EQUIPMENT_LENGTH = 100;
    
    event RecordingAdded(uint256 indexed recordingId, address indexed creator, string ipfsHash);
    event RecordingUpdated(uint256 indexed recordingId, address indexed updater);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);
    }
    
    modifier validCoordinates(int256 _latitude, int256 _longitude) {
        require(_latitude >= -90000000 && _latitude <= 90000000, "Invalid latitude");
        require(_longitude >= -180000000 && _longitude <= 180000000, "Invalid longitude");
        _;
    }
    
    modifier recordingExists(uint256 _recordingId) {
        require(_recordingId > 0 && _recordingId <= _recordingIdCounter, "Recording does not exist");
        require(recordingCore[_recordingId].isActive, "Recording is inactive");
        _;
    }
    
    modifier antiSpam(address _user) {
        require(
            block.timestamp >= userLastRecordingTime[_user] + MIN_RECORDING_INTERVAL,
            "Recording too soon after last submission"
        );
        _;
    }
    
    function addRecording(
        string calldata _title,
        string calldata _description,
        string calldata _ipfsHash,
        int256 _latitude,
        int256 _longitude,
        string[] calldata _tags,
        uint256 _duration,
        AudioQuality _quality,
        string calldata _equipment,
        LicenseManager.LicenseType _license
    ) external validCoordinates(_latitude, _longitude) whenNotPaused nonReentrant antiSpam(msg.sender) {
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        require(bytes(_description).length > 0 && bytes(_description).length <= MAX_DESCRIPTION_LENGTH, "Invalid description");
        require(bytes(_title).length <= MAX_TITLE_LENGTH, "Title too long");
        require(bytes(_equipment).length <= MAX_EQUIPMENT_LENGTH, "Equipment description too long");
        require(_tags.length <= MAX_TAGS, "Too many tags");
        require(_duration > 0, "Duration must be positive");
        
        for (uint256 i = 0; i < _tags.length; i++) {
            require(bytes(_tags[i]).length > 0 && bytes(_tags[i]).length <= 32, "Invalid tag length");
        }
        
        bytes32 locationHash = keccak256(abi.encodePacked(_latitude, _longitude, _ipfsHash));
        require(!locationHashes[locationHash], "Duplicate recording at this location");
        
        _recordingIdCounter++;
        
        recordingCore[_recordingIdCounter] = RecordingCore({
            id: _recordingIdCounter,
            creator: msg.sender,
            ipfsHash: _ipfsHash,
            latitude: _latitude,
            longitude: _longitude,
            timestamp: block.timestamp,
            isActive: true
        });
        
        recordingMetadata[_recordingIdCounter] = RecordingMetadata({
            title: _title,
            description: _description,
            tags: _tags,
            duration: _duration,
            quality: _quality,
            equipment: _equipment,
            license: _license,
            status: ModerationStatus.PENDING
        });
        
        recordingStats[_recordingIdCounter] = RecordingStats({
            upvotes: 0,
            downvotes: 0,
            totalRating: 0,
            ratingCount: 0
        });
        
        locationHashes[locationHash] = true;
        userRecordings[msg.sender].push(_recordingIdCounter);
        userLastRecordingTime[msg.sender] = block.timestamp;
        
        emit RecordingAdded(_recordingIdCounter, msg.sender, _ipfsHash);
    }
    
    function updateRecordingMetadata(
        uint256 _recordingId,
        string calldata _title,
        string calldata _description,
        string[] calldata _tags,
        string calldata _equipment,
        LicenseManager.LicenseType _license
    ) external recordingExists(_recordingId) whenNotPaused nonReentrant {
        require(recordingCore[_recordingId].creator == msg.sender, "Only creator can update");
        require(recordingMetadata[_recordingId].status == ModerationStatus.PENDING, "Cannot update approved/rejected recordings");
        
        require(bytes(_description).length > 0 && bytes(_description).length <= MAX_DESCRIPTION_LENGTH, "Invalid description");
        require(bytes(_title).length <= MAX_TITLE_LENGTH, "Title too long");
        require(bytes(_equipment).length <= MAX_EQUIPMENT_LENGTH, "Equipment description too long");
        require(_tags.length <= MAX_TAGS, "Too many tags");
        
        for (uint256 i = 0; i < _tags.length; i++) {
            require(bytes(_tags[i]).length > 0 && bytes(_tags[i]).length <= 32, "Invalid tag length");
        }
        
        recordingMetadata[_recordingId].title = _title;
        recordingMetadata[_recordingId].description = _description;
        recordingMetadata[_recordingId].tags = _tags;
        recordingMetadata[_recordingId].equipment = _equipment;
        recordingMetadata[_recordingId].license = _license;
        
        emit RecordingUpdated(_recordingId, msg.sender);
    }
    
    
    function getRecording(uint256 _recordingId) external view returns (
        RecordingCore memory core,
        RecordingMetadata memory metadata,
        RecordingStats memory stats
    ) {
        require(_recordingId > 0 && _recordingId <= _recordingIdCounter, "Recording does not exist");
        return (recordingCore[_recordingId], recordingMetadata[_recordingId], recordingStats[_recordingId]);
    }
    
    function getRecordingCore(uint256 _recordingId) external view returns (RecordingCore memory) {
        require(_recordingId > 0 && _recordingId <= _recordingIdCounter, "Recording does not exist");
        return recordingCore[_recordingId];
    }
    
    function getRecordingMetadata(uint256 _recordingId) external view returns (RecordingMetadata memory) {
        require(_recordingId > 0 && _recordingId <= _recordingIdCounter, "Recording does not exist");
        return recordingMetadata[_recordingId];
    }
    
    function getRecordingStats(uint256 _recordingId) external view returns (RecordingStats memory) {
        require(_recordingId > 0 && _recordingId <= _recordingIdCounter, "Recording does not exist");
        return recordingStats[_recordingId];
    }
    
    function getUserRecordings(address _userAddress) external view returns (uint256[] memory) {
        return userRecordings[_userAddress];
    }
    
    function getRecordingsByStatus(ModerationStatus _status, uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (uint256[] memory) 
    {
        require(_limit <= 100, "Limit too high");
        
        uint256[] memory result = new uint256[](_limit);
        uint256 count = 0;
        uint256 skipped = 0;
        
        for (uint256 i = 1; i <= _recordingIdCounter && count < _limit; i++) {
            if (recordingCore[i].isActive && recordingMetadata[i].status == _status) {
                if (skipped >= _offset) {
                    result[count] = i;
                    count++;
                } else {
                    skipped++;
                }
            }
        }
        
        assembly {
            mstore(result, count)
        }
        
        return result;
    }
    
    function getRecordingsByLocation(
        int256 _minLat,
        int256 _maxLat,
        int256 _minLng,
        int256 _maxLng,
        uint256 _offset,
        uint256 _limit
    ) external view returns (uint256[] memory) {
        require(_limit <= 100, "Limit too high");
        require(_minLat <= _maxLat && _minLng <= _maxLng, "Invalid coordinate range");
        
        uint256[] memory result = new uint256[](_limit);
        uint256 count = 0;
        uint256 skipped = 0;
        
        for (uint256 i = 1; i <= _recordingIdCounter && count < _limit; i++) {
            RecordingCore storage core = recordingCore[i];
            if (core.isActive && 
                recordingMetadata[i].status == ModerationStatus.APPROVED &&
                core.latitude >= _minLat && 
                core.latitude <= _maxLat &&
                core.longitude >= _minLng && 
                core.longitude <= _maxLng) {
                
                if (skipped >= _offset) {
                    result[count] = i;
                    count++;
                } else {
                    skipped++;
                }
            }
        }
        
        assembly {
            mstore(result, count)
        }
        
        return result;
    }
    
    function getTotalRecordings() external view returns (uint256) {
        return _recordingIdCounter;
    }
    
    function isLocationUsed(int256 _latitude, int256 _longitude, string calldata _ipfsHash) external view returns (bool) {
        bytes32 locationHash = keccak256(abi.encodePacked(_latitude, _longitude, _ipfsHash));
        return locationHashes[locationHash];
    }
    
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
