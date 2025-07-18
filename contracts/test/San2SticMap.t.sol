// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/San2SticMap.sol";

contract San2SticMapTest is Test {
    San2SticMap public userManager;
    address public admin;
    address public moderator;
    address public user1;
    address public user2;
    
    event UserRegistered(address indexed user, uint256 userId, string username);
    event UserReputationUpdated(address indexed user, uint256 newReputation);
    
    function setUp() public {
        admin = address(this);
        moderator = makeAddr("moderator");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        userManager = new San2SticMap();
        userManager.grantModeratorRole(moderator);
    }
    
    function testInitialState() public {
        assertTrue(userManager.hasRole(userManager.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(userManager.hasRole(userManager.ADMIN_ROLE(), admin));
        assertTrue(userManager.hasRole(userManager.MODERATOR_ROLE(), admin));
        assertEq(userManager.getTotalUsers(), 0);
    }
    
    function testUserRegistration() public {
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit UserRegistered(user1, 1, "testuser1");
        userManager.registerUser("testuser1");
        
        assertTrue(userManager.isUserRegistered(user1));
        assertEq(userManager.getTotalUsers(), 1);
        
        San2SticMap.User memory user = userManager.getUser(user1);
        assertEq(user.id, 1);
        assertEq(user.walletAddress, user1);
        assertEq(user.username, "testuser1");
        assertEq(user.totalRecordings, 0);
        assertEq(user.totalVotes, 0);
        assertEq(user.reputation, 100);
        assertTrue(user.isActive);
        assertGt(user.registrationTimestamp, 0);
    }
    
    function testCannotRegisterTwice() public {
        vm.startPrank(user1);
        userManager.registerUser("testuser1");
        
        vm.expectRevert("User already registered");
        userManager.registerUser("testuser1");
        vm.stopPrank();
    }
    
    function testInvalidUsernameLength() public {
        vm.startPrank(user1);
        
        vm.expectRevert("Invalid username length");
        userManager.registerUser("");
        
        vm.expectRevert("Invalid username length");
        userManager.registerUser("this_username_is_way_too_long_and_exceeds_the_32_character_limit");
        vm.stopPrank();
    }
    
    function testUpdateUserReputation() public {
        vm.prank(user1);
        userManager.registerUser("testuser1");
        
        vm.prank(moderator);
        vm.expectEmit(true, false, false, true);
        emit UserReputationUpdated(user1, 150);
        userManager.updateUserReputation(user1, 150);
        
        San2SticMap.User memory user = userManager.getUser(user1);
        assertEq(user.reputation, 150);
    }
    
    function testOnlyModeratorCanUpdateReputation() public {
        vm.prank(user1);
        userManager.registerUser("testuser1");
        
        vm.prank(user2);
        vm.expectRevert();
        userManager.updateUserReputation(user1, 150);
    }
    
    function testDeactivateUser() public {
        vm.prank(user1);
        userManager.registerUser("testuser1");
        
        vm.prank(admin);
        userManager.deactivateUser(user1);
        
        San2SticMap.User memory user = userManager.getUser(user1);
        assertFalse(user.isActive);
    }
    
    function testReactivateUser() public {
        vm.prank(user1);
        userManager.registerUser("testuser1");
        
        vm.prank(admin);
        userManager.deactivateUser(user1);
        userManager.reactivateUser(user1);
        
        San2SticMap.User memory user = userManager.getUser(user1);
        assertTrue(user.isActive);
    }
    
    function testOnlyAdminCanDeactivateReactivate() public {
        vm.prank(user1);
        userManager.registerUser("testuser1");
        
        vm.prank(user2);
        vm.expectRevert();
        userManager.deactivateUser(user1);
        
        vm.prank(user2);
        vm.expectRevert();
        userManager.reactivateUser(user1);
    }
    
    function testGetNonExistentUser() public {
        vm.expectRevert("User not registered");
        userManager.getUser(user1);
    }
    
    function testPauseUnpause() public {
        vm.prank(admin);
        userManager.pause();
        
        vm.prank(user1);
        vm.expectRevert();
        userManager.registerUser("testuser1");
        
        vm.prank(admin);
        userManager.unpause();
        
        vm.prank(user1);
        userManager.registerUser("testuser1");
        assertTrue(userManager.isUserRegistered(user1));
    }
    
    function testOnlyAdminCanPause() public {
        vm.prank(user1);
        vm.expectRevert();
        userManager.pause();
    }
    
    function testModeratorRoleManagement() public {
        address newModerator = makeAddr("newModerator");
        
        vm.prank(admin);
        userManager.grantModeratorRole(newModerator);
        assertTrue(userManager.hasRole(userManager.MODERATOR_ROLE(), newModerator));
        
        vm.prank(admin);
        userManager.revokeModeratorRole(newModerator);
        assertFalse(userManager.hasRole(userManager.MODERATOR_ROLE(), newModerator));
    }
    
    function testOnlyAdminCanManageModeratorRole() public {
        address newModerator = makeAddr("newModerator");
        
        vm.prank(user1);
        vm.expectRevert();
        userManager.grantModeratorRole(newModerator);
        
        vm.prank(user1);
        vm.expectRevert();
        userManager.revokeModeratorRole(newModerator);
    }
}
