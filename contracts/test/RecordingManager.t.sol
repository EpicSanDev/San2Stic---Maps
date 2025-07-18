// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/RecordingManager.sol";
import "../src/LicenseManager.sol";

contract RecordingManagerTest is Test {
    RecordingManager public recordingManager;
    address public admin;
    address public moderator;
    address public user1;
    address public user2;
    
    event RecordingAdded(uint256 indexed recordingId, address indexed creator, string ipfsHash);
    event RecordingUpdated(uint256 indexed recordingId, address indexed updater);
    
    function setUp() public {
        admin = address(this);
        moderator = makeAddr("moderator");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Set block timestamp to avoid anti-spam issues in tests
        vm.warp(1000);
        
        recordingManager = new RecordingManager();
        recordingManager.grantRole(recordingManager.MODERATOR_ROLE(), moderator);
    }
    
    function testInitialState() public {
        assertTrue(recordingManager.hasRole(recordingManager.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(recordingManager.hasRole(recordingManager.ADMIN_ROLE(), admin));
        assertTrue(recordingManager.hasRole(recordingManager.MODERATOR_ROLE(), admin));
        assertEq(recordingManager.getTotalRecordings(), 0);
    }
    
    function testAddRecording() public {
        string[] memory tags = new string[](2);
        tags[0] = "nature";
        tags[1] = "birds";
        
        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit RecordingAdded(1, user1, "QmTestHash123");
        
        recordingManager.addRecording(
            "Bird Song",
            "Beautiful morning bird song",
            "QmTestHash123",
            40000000, // 40.0 degrees latitude
            -74000000, // -74.0 degrees longitude
            tags,
            180, // 3 minutes
            RecordingManager.AudioQuality.HIGH,
            "Zoom H5",
            LicenseManager.LicenseType.CC_BY
        );
        
        assertEq(recordingManager.getTotalRecordings(), 1);
        
        RecordingManager.RecordingCore memory core = recordingManager.getRecordingCore(1);
        assertEq(core.id, 1);
        assertEq(core.creator, user1);
        assertEq(core.ipfsHash, "QmTestHash123");
        assertEq(core.latitude, 40000000);
        assertEq(core.longitude, -74000000);
        assertTrue(core.isActive);
        
        RecordingManager.RecordingMetadata memory metadata = recordingManager.getRecordingMetadata(1);
        assertEq(metadata.title, "Bird Song");
        assertEq(metadata.description, "Beautiful morning bird song");
        assertEq(metadata.tags.length, 2);
        assertEq(metadata.tags[0], "nature");
        assertEq(metadata.tags[1], "birds");
        assertEq(metadata.duration, 180);
        assertEq(uint8(metadata.quality), uint8(RecordingManager.AudioQuality.HIGH));
        assertEq(metadata.equipment, "Zoom H5");
        assertEq(uint8(metadata.license), uint8(LicenseManager.LicenseType.CC_BY));
        assertEq(uint8(metadata.status), uint8(RecordingManager.ModerationStatus.PENDING));
    }
    
    function testInvalidCoordinates() public {
        string[] memory tags = new string[](0);
        
        vm.startPrank(user1);
        
        vm.expectRevert("Invalid latitude");
        recordingManager.addRecording(
            "Test",
            "Test description",
            "QmTestHash123",
            91000000, // Invalid latitude > 90
            0,
            tags,
            180,
            RecordingManager.AudioQuality.HIGH,
            "Test",
            LicenseManager.LicenseType.CC_BY
        );
        
        vm.expectRevert("Invalid longitude");
        recordingManager.addRecording(
            "Test",
            "Test description",
            "QmTestHash123",
            0,
            181000000, // Invalid longitude > 180
            tags,
            180,
            RecordingManager.AudioQuality.HIGH,
            "Test",
            LicenseManager.LicenseType.CC_BY
        );
        vm.stopPrank();
    }
    
    function testRequiredFields() public {
        string[] memory tags = new string[](0);
        
        // Test IPFS hash required
        vm.prank(user1);
        vm.expectRevert("IPFS hash required");
        recordingManager.addRecording(
            "Test",
            "Test description",
            "",
            0,
            0,
            tags,
            180,
            RecordingManager.AudioQuality.HIGH,
            "Test",
            LicenseManager.LicenseType.CC_BY
        );
        
        // Test invalid description (use different user to avoid anti-spam)
        vm.prank(user2);
        vm.expectRevert("Invalid description");
        recordingManager.addRecording(
            "Test",
            "",
            "QmTestHash123",
            0,
            0,
            tags,
            180,
            RecordingManager.AudioQuality.HIGH,
            "Test",
            LicenseManager.LicenseType.CC_BY
        );
        
        // Test duration must be positive (use different coordinates to avoid duplicate)
        vm.prank(makeAddr("user3"));
        vm.expectRevert("Duration must be positive");
        recordingManager.addRecording(
            "Test",
            "Test description",
            "QmTestHash456",
            1000000,
            1000000,
            tags,
            0,
            RecordingManager.AudioQuality.HIGH,
            "Test",
            LicenseManager.LicenseType.CC_BY
        );
    }
    
    function testAntiSpamMechanism() public {
        string[] memory tags = new string[](0);
        
        // First recording should succeed
        vm.prank(user1);
        recordingManager.addRecording(
            "Test 1",
            "Test description 1",
            "QmTestHash123",
            0,
            0,
            tags,
            180,
            RecordingManager.AudioQuality.HIGH,
            "Test",
            LicenseManager.LicenseType.CC_BY
        );
        
        // Second recording immediately should fail due to anti-spam
        vm.prank(user1);
        vm.expectRevert("Recording too soon after last submission");
        recordingManager.addRecording(
            "Test 2",
            "Test description 2",
            "QmTestHash456",
            1000000,
            1000000,
            tags,
            180,
            RecordingManager.AudioQuality.HIGH,
            "Test",
            LicenseManager.LicenseType.CC_BY
        );
        
        // After waiting 301 seconds, should succeed
        vm.warp(block.timestamp + 301);
        vm.prank(user1);
        recordingManager.addRecording(
            "Test 2",
            "Test description 2",
            "QmTestHash456",
            1000000,
            1000000,
            tags,
            180,
            RecordingManager.AudioQuality.HIGH,
            "Test",
            LicenseManager.LicenseType.CC_BY
        );
        
        assertEq(recordingManager.getTotalRecordings(), 2);
    }
    
    function testDuplicatePrevention() public {
        string[] memory tags = new string[](0);
        
        // First recording by user1
        vm.prank(user1);
        recordingManager.addRecording(
            "Test 1",
            "Test description 1",
            "QmTestHash123",
            0,
            0,
            tags,
            180,
            RecordingManager.AudioQuality.HIGH,
            "Test",
            LicenseManager.LicenseType.CC_BY
        );
        
        // Wait to avoid anti-spam, then try duplicate by user2
        vm.warp(block.timestamp + 301);
        vm.prank(user2);
        vm.expectRevert("Duplicate recording at this location");
        recordingManager.addRecording(
            "Test 2",
            "Test description 2",
            "QmTestHash123", // Same IPFS hash
            0,               // Same coordinates
            0,
            tags,
            180,
            RecordingManager.AudioQuality.HIGH,
            "Test",
            LicenseManager.LicenseType.CC_BY
        );
    }
    
    function testUpdateRecordingMetadata() public {
        string[] memory tags = new string[](1);
        tags[0] = "nature";
        
        address testUser = makeAddr("testUser4");
        vm.prank(testUser);
        recordingManager.addRecording(
            "Original Title",
            "Original description",
            "QmTestHash123",
            0,
            0,
            tags,
            180,
            RecordingManager.AudioQuality.HIGH,
            "Original equipment",
            LicenseManager.LicenseType.CC_BY
        );
        
        string[] memory newTags = new string[](2);
        newTags[0] = "updated";
        newTags[1] = "nature";
        
        vm.prank(testUser);
        vm.expectEmit(true, true, false, false);
        emit RecordingUpdated(1, testUser);
        
        recordingManager.updateRecordingMetadata(
            1,
            "Updated Title",
            "Updated description",
            newTags,
            "Updated equipment",
            LicenseManager.LicenseType.CC_BY_SA
        );
        
        RecordingManager.RecordingMetadata memory metadata = recordingManager.getRecordingMetadata(1);
        assertEq(metadata.title, "Updated Title");
        assertEq(metadata.description, "Updated description");
        assertEq(metadata.tags.length, 2);
        assertEq(metadata.tags[0], "updated");
        assertEq(metadata.equipment, "Updated equipment");
        assertEq(uint8(metadata.license), uint8(LicenseManager.LicenseType.CC_BY_SA));
    }
    
    function testOnlyCreatorCanUpdate() public {
        string[] memory tags = new string[](0);
        
        address testUser = makeAddr("testUser3");
        vm.prank(testUser);
        recordingManager.addRecording(
            "Test",
            "Test description",
            "QmTestHash123",
            0,
            0,
            tags,
            180,
            RecordingManager.AudioQuality.HIGH,
            "Test",
            LicenseManager.LicenseType.CC_BY
        );
        
        vm.prank(user2);
        vm.expectRevert("Only creator can update");
        recordingManager.updateRecordingMetadata(
            1,
            "Updated Title",
            "Updated description",
            tags,
            "Updated equipment",
            LicenseManager.LicenseType.CC_BY_SA
        );
    }
    
    function testGetUserRecordings() public {
        string[] memory tags = new string[](0);
        
        address testUser = makeAddr("testUser5");
        
        // First recording by testUser
        vm.prank(testUser);
        recordingManager.addRecording(
            "Test 1",
            "Test description 1",
            "QmTestHash123",
            0,
            0,
            tags,
            180,
            RecordingManager.AudioQuality.HIGH,
            "Test",
            LicenseManager.LicenseType.CC_BY
        );
        
        // Wait to avoid anti-spam, then add second recording
        vm.warp(block.timestamp + 301);
        vm.prank(testUser);
        recordingManager.addRecording(
            "Test 2",
            "Test description 2",
            "QmTestHash456",
            1000000,
            1000000,
            tags,
            180,
            RecordingManager.AudioQuality.HIGH,
            "Test",
            LicenseManager.LicenseType.CC_BY
        );
        
        uint256[] memory userRecordings = recordingManager.getUserRecordings(testUser);
        assertEq(userRecordings.length, 2);
        assertEq(userRecordings[0], 1);
        assertEq(userRecordings[1], 2);
        
        uint256[] memory emptyRecordings = recordingManager.getUserRecordings(user2);
        assertEq(emptyRecordings.length, 0);
    }
    
    function testGetRecordingsByStatus() public {
        string[] memory tags = new string[](0);
        
        vm.prank(makeAddr("testUser1"));
        recordingManager.addRecording(
            "Test 1",
            "Test description 1",
            "QmTestHash123",
            0,
            0,
            tags,
            180,
            RecordingManager.AudioQuality.HIGH,
            "Test",
            LicenseManager.LicenseType.CC_BY
        );
        
        uint256[] memory pendingRecordings = recordingManager.getRecordingsByStatus(
            RecordingManager.ModerationStatus.PENDING,
            0,
            10
        );
        assertEq(pendingRecordings.length, 1);
        assertEq(pendingRecordings[0], 1);
        
        uint256[] memory approvedRecordings = recordingManager.getRecordingsByStatus(
            RecordingManager.ModerationStatus.APPROVED,
            0,
            10
        );
        assertEq(approvedRecordings.length, 0);
    }
    
    function testIsLocationUsed() public {
        string[] memory tags = new string[](0);
        
        assertFalse(recordingManager.isLocationUsed(0, 0, "QmTestHash123"));
        
        vm.prank(makeAddr("testUser2"));
        recordingManager.addRecording(
            "Test",
            "Test description",
            "QmTestHash123",
            0,
            0,
            tags,
            180,
            RecordingManager.AudioQuality.HIGH,
            "Test",
            LicenseManager.LicenseType.CC_BY
        );
        
        assertTrue(recordingManager.isLocationUsed(0, 0, "QmTestHash123"));
        assertFalse(recordingManager.isLocationUsed(0, 0, "QmDifferentHash"));
        assertFalse(recordingManager.isLocationUsed(1000000, 1000000, "QmTestHash123"));
    }
}
