// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/VotingSystem.sol";

contract VotingSystemTest is Test {
    VotingSystem public votingSystem;
    address public admin;
    address public moderator;
    address public user1;
    address public user2;
    address public creator;
    
    event RecordingVoted(uint256 indexed recordingId, address indexed voter, bool isUpvote);
    event RecordingRated(uint256 indexed recordingId, address indexed rater, uint8 score);
    event RecordingModerated(uint256 indexed recordingId, address indexed moderator, VotingSystem.ModerationStatus status);
    event ReputationUpdated(address indexed user, uint256 newReputation);
    event ModerationActionTaken(uint256 indexed recordingId, address indexed moderator, VotingSystem.ModerationStatus action, string reason);
    
    function setUp() public {
        admin = address(this);
        moderator = makeAddr("moderator");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        creator = makeAddr("creator");
        
        votingSystem = new VotingSystem();
        votingSystem.grantRole(votingSystem.MODERATOR_ROLE(), moderator);
        
        // Set up a recording as approved for testing
        vm.prank(moderator);
        votingSystem.moderateRecording(1, VotingSystem.ModerationStatus.APPROVED, "Initial approval");
    }
    
    function testInitialState() public {
        assertTrue(votingSystem.hasRole(votingSystem.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(votingSystem.hasRole(votingSystem.ADMIN_ROLE(), admin));
        assertTrue(votingSystem.hasRole(votingSystem.MODERATOR_ROLE(), admin));
        assertEq(votingSystem.getTotalVotes(), 0);
        assertEq(votingSystem.getTotalRatings(), 0);
        assertEq(votingSystem.getTotalModerationActions(), 1); // Initial approval
    }
    
    function testVoteOnRecording() public {
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit RecordingVoted(1, user1, true);
        votingSystem.voteOnRecording(1, true, creator);
        
        assertTrue(votingSystem.hasVoted(1, user1));
        (uint256 upvotes, uint256 downvotes) = votingSystem.getRecordingVotes(1);
        assertEq(upvotes, 1);
        assertEq(downvotes, 0);
        assertEq(votingSystem.getTotalVotes(), 1);
        
        // Check creator reputation increased
        assertEq(votingSystem.userReputation(creator), 1);
    }
    
    function testDownvoteOnRecording() public {
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit RecordingVoted(1, user1, false);
        votingSystem.voteOnRecording(1, false, creator);
        
        assertTrue(votingSystem.hasVoted(1, user1));
        (uint256 upvotes, uint256 downvotes) = votingSystem.getRecordingVotes(1);
        assertEq(upvotes, 0);
        assertEq(downvotes, 1);
        
        // Check creator reputation decreased (but not below 0)
        assertEq(votingSystem.userReputation(creator), 0);
    }
    
    function testCannotVoteTwice() public {
        vm.startPrank(user1);
        votingSystem.voteOnRecording(1, true, creator);
        
        vm.expectRevert("Already voted on this recording");
        votingSystem.voteOnRecording(1, false, creator);
        vm.stopPrank();
    }
    
    function testCannotVoteOnOwnRecording() public {
        vm.prank(creator);
        vm.expectRevert("Cannot vote/rate own recording");
        votingSystem.voteOnRecording(1, true, creator);
    }
    
    function testCannotVoteOnUnapprovedRecording() public {
        // Recording 2 starts as PENDING by default (not approved)
        vm.prank(user1);
        vm.expectRevert("Recording not approved");
        votingSystem.voteOnRecording(2, true, creator);
    }
    
    function testRateRecording() public {
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit RecordingRated(1, user1, 5);
        votingSystem.rateRecording(1, 5, creator);
        
        assertTrue(votingSystem.hasRated(1, user1));
        (uint256 averageRating, uint256 ratingCount) = votingSystem.getRecordingRating(1);
        assertEq(averageRating, 5);
        assertEq(ratingCount, 1);
        assertEq(votingSystem.getTotalRatings(), 1);
        
        // High rating should increase creator reputation
        assertEq(votingSystem.userReputation(creator), 1);
    }
    
    function testLowRatingDecreasesReputation() public {
        vm.prank(user1);
        votingSystem.rateRecording(1, 2, creator);
        
        // Low rating should decrease creator reputation (but not below 0)
        assertEq(votingSystem.userReputation(creator), 0);
    }
    
    function testInvalidRating() public {
        vm.startPrank(user1);
        
        vm.expectRevert("Rating must be between 1 and 5");
        votingSystem.rateRecording(1, 0, creator);
        
        vm.expectRevert("Rating must be between 1 and 5");
        votingSystem.rateRecording(1, 6, creator);
        vm.stopPrank();
    }
    
    function testCannotRateTwice() public {
        vm.startPrank(user1);
        votingSystem.rateRecording(1, 4, creator);
        
        vm.expectRevert("Already rated this recording");
        votingSystem.rateRecording(1, 5, creator);
        vm.stopPrank();
    }
    
    function testAverageRatingCalculation() public {
        vm.prank(user1);
        votingSystem.rateRecording(1, 4, creator);
        
        vm.prank(user2);
        votingSystem.rateRecording(1, 2, creator);
        
        (uint256 averageRating, uint256 ratingCount) = votingSystem.getRecordingRating(1);
        assertEq(averageRating, 3); // (4 + 2) / 2 = 3
        assertEq(ratingCount, 2);
    }
    
    function testModerateRecording() public {
        vm.prank(moderator);
        vm.expectEmit(true, true, false, true);
        emit RecordingModerated(2, moderator, VotingSystem.ModerationStatus.APPROVED);
        votingSystem.moderateRecording(2, VotingSystem.ModerationStatus.APPROVED, "Looks good");
        
        assertEq(uint8(votingSystem.recordingStatus(2)), uint8(VotingSystem.ModerationStatus.APPROVED));
    }
    
    function testOnlyModeratorCanModerate() public {
        vm.prank(user1);
        vm.expectRevert();
        votingSystem.moderateRecording(2, VotingSystem.ModerationStatus.APPROVED, "Unauthorized");
    }
    
    function testCannotSetStatusToPending() public {
        vm.prank(moderator);
        vm.expectRevert("Cannot set status to pending");
        votingSystem.moderateRecording(1, VotingSystem.ModerationStatus.PENDING, "Invalid");
    }
    
    function testBatchModerateRecordings() public {
        uint256[] memory recordingIds = new uint256[](2);
        recordingIds[0] = 2;
        recordingIds[1] = 3;
        
        VotingSystem.ModerationStatus[] memory statuses = new VotingSystem.ModerationStatus[](2);
        statuses[0] = VotingSystem.ModerationStatus.APPROVED;
        statuses[1] = VotingSystem.ModerationStatus.REJECTED;
        
        string[] memory reasons = new string[](2);
        reasons[0] = "Good quality";
        reasons[1] = "Poor quality";
        
        vm.prank(moderator);
        votingSystem.batchModerateRecordings(recordingIds, statuses, reasons);
        
        assertEq(uint8(votingSystem.recordingStatus(2)), uint8(VotingSystem.ModerationStatus.APPROVED));
        assertEq(uint8(votingSystem.recordingStatus(3)), uint8(VotingSystem.ModerationStatus.REJECTED));
    }
    
    function testBatchModerationArrayLengthMismatch() public {
        uint256[] memory recordingIds = new uint256[](2);
        VotingSystem.ModerationStatus[] memory statuses = new VotingSystem.ModerationStatus[](1);
        string[] memory reasons = new string[](2);
        
        vm.prank(moderator);
        vm.expectRevert("Array length mismatch");
        votingSystem.batchModerateRecordings(recordingIds, statuses, reasons);
    }
    
    function testBatchModerationSizeLimit() public {
        uint256[] memory recordingIds = new uint256[](51);
        VotingSystem.ModerationStatus[] memory statuses = new VotingSystem.ModerationStatus[](51);
        string[] memory reasons = new string[](51);
        
        vm.prank(moderator);
        vm.expectRevert("Batch size too large");
        votingSystem.batchModerateRecordings(recordingIds, statuses, reasons);
    }
    
    function testProposeModeration() public {
        // Set user reputation high enough to propose moderation
        vm.prank(admin);
        votingSystem.setUserReputation(user1, 100);
        
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit ModerationActionTaken(1, user1, VotingSystem.ModerationStatus.FLAGGED, "Inappropriate content");
        votingSystem.proposeModeration(1, VotingSystem.ModerationStatus.FLAGGED, "Inappropriate content");
    }
    
    function testInsufficientReputationToPropose() public {
        vm.prank(user1);
        vm.expectRevert("Insufficient reputation to propose moderation");
        votingSystem.proposeModeration(1, VotingSystem.ModerationStatus.FLAGGED, "Test");
    }
    
    function testGetRecordingModerationHistory() public {
        vm.prank(moderator);
        votingSystem.moderateRecording(1, VotingSystem.ModerationStatus.FLAGGED, "Needs review");
        
        VotingSystem.ModerationAction[] memory history = votingSystem.getRecordingModerationHistory(1);
        assertEq(history.length, 2); // Initial approval + flagged
        assertEq(history[0].recordingId, 1);
        assertEq(uint8(history[0].action), uint8(VotingSystem.ModerationStatus.APPROVED));
        assertEq(history[1].recordingId, 1);
        assertEq(uint8(history[1].action), uint8(VotingSystem.ModerationStatus.FLAGGED));
    }
    
    function testGetUserVotingHistory() public {
        // Set up multiple recordings as approved
        vm.startPrank(moderator);
        votingSystem.moderateRecording(2, VotingSystem.ModerationStatus.APPROVED, "Approved");
        votingSystem.moderateRecording(3, VotingSystem.ModerationStatus.APPROVED, "Approved");
        vm.stopPrank();
        
        // User votes on multiple recordings
        vm.startPrank(user1);
        votingSystem.voteOnRecording(1, true, creator);
        votingSystem.voteOnRecording(2, false, creator);
        votingSystem.voteOnRecording(3, true, creator);
        vm.stopPrank();
        
        VotingSystem.Vote[] memory history = votingSystem.getUserVotingHistory(user1, 0, 10);
        assertEq(history.length, 3);
        assertEq(history[0].voter, user1);
        assertEq(history[0].recordingId, 1);
        assertTrue(history[0].isUpvote);
        assertEq(history[1].recordingId, 2);
        assertFalse(history[1].isUpvote);
    }
    
    function testSetUserReputation() public {
        vm.prank(admin);
        vm.expectEmit(true, false, false, true);
        emit ReputationUpdated(user1, 500);
        votingSystem.setUserReputation(user1, 500);
        
        assertEq(votingSystem.userReputation(user1), 500);
    }
    
    function testOnlyAdminCanSetReputation() public {
        vm.prank(user1);
        vm.expectRevert();
        votingSystem.setUserReputation(user2, 500);
    }
    
    function testPauseUnpause() public {
        vm.prank(admin);
        votingSystem.pause();
        
        vm.prank(user1);
        vm.expectRevert();
        votingSystem.voteOnRecording(1, true, creator);
        
        vm.prank(admin);
        votingSystem.unpause();
        
        vm.prank(user1);
        votingSystem.voteOnRecording(1, true, creator);
        assertTrue(votingSystem.hasVoted(1, user1));
    }
    
    function testInvalidRecordingId() public {
        vm.prank(user1);
        vm.expectRevert("Invalid recording ID");
        votingSystem.voteOnRecording(0, true, creator);
    }
}
