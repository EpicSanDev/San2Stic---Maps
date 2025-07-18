// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract San2SticMap is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 private _userIdCounter;

    struct User {
        uint256 id;
        address walletAddress;
        string username;
        uint256 totalRecordings;
        uint256 totalVotes;
        uint256 reputation;
        bool isActive;
        uint256 registrationTimestamp;
    }

    mapping(address => User) public users;
    mapping(address => bool) public registeredUsers;

    event UserRegistered(address indexed user, uint256 userId, string username);
    event UserReputationUpdated(address indexed user, uint256 newReputation);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);
    }

    modifier onlyRegisteredUser() {
        require(registeredUsers[msg.sender], "User not registered");
        require(users[msg.sender].isActive, "User account inactive");
        _;
    }

    function registerUser(string calldata _username) external whenNotPaused {
        require(!registeredUsers[msg.sender], "User already registered");
        require(bytes(_username).length > 0 && bytes(_username).length <= 32, "Invalid username length");

        _userIdCounter++;

        users[msg.sender] = User({
            id: _userIdCounter,
            walletAddress: msg.sender,
            username: _username,
            totalRecordings: 0,
            totalVotes: 0,
            reputation: 100,
            isActive: true,
            registrationTimestamp: block.timestamp
        });

        registeredUsers[msg.sender] = true;

        emit UserRegistered(msg.sender, _userIdCounter, _username);
    }

    function updateUserReputation(address _user, uint256 _newReputation)
        external
        onlyRole(MODERATOR_ROLE)
        whenNotPaused
    {
        require(registeredUsers[_user], "User not registered");
        users[_user].reputation = _newReputation;
        emit UserReputationUpdated(_user, _newReputation);
    }

    function deactivateUser(address _user) external onlyRole(ADMIN_ROLE) whenNotPaused {
        require(registeredUsers[_user], "User not registered");
        users[_user].isActive = false;
    }

    function reactivateUser(address _user) external onlyRole(ADMIN_ROLE) whenNotPaused {
        require(registeredUsers[_user], "User not registered");
        users[_user].isActive = true;
    }

    function getUser(address _userAddress) external view returns (User memory) {
        require(registeredUsers[_userAddress], "User not registered");
        return users[_userAddress];
    }

    function isUserRegistered(address _userAddress) external view returns (bool) {
        return registeredUsers[_userAddress];
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function grantModeratorRole(address _moderator) external onlyRole(ADMIN_ROLE) {
        grantRole(MODERATOR_ROLE, _moderator);
    }

    function revokeModeratorRole(address _moderator) external onlyRole(ADMIN_ROLE) {
        revokeRole(MODERATOR_ROLE, _moderator);
    }

    function getTotalUsers() external view returns (uint256) {
        return _userIdCounter;
    }
}
