// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/LicenseManager.sol";

contract LicenseManagerTest is Test {
    LicenseManager public licenseManager;
    address public admin;
    address public user1;
    address public user2;

    event LicenseUpdated(LicenseManager.LicenseType indexed licenseType, string name, string description);
    event RecordingLicenseSet(uint256 indexed recordingId, LicenseManager.LicenseType licenseType, string attribution);
    event LicenseViolationReported(uint256 indexed recordingId, address indexed reporter, string reason);
    event UserLicensePreferenceSet(address indexed user, LicenseManager.LicenseType licenseType, bool preferred);

    function setUp() public {
        admin = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        licenseManager = new LicenseManager();
    }

    function testInitialState() public {
        assertTrue(licenseManager.hasRole(licenseManager.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(licenseManager.hasRole(licenseManager.ADMIN_ROLE(), admin));

        // Check that all licenses are initialized
        LicenseManager.LicenseInfo memory ccBy = licenseManager.getLicenseInfo(LicenseManager.LicenseType.CC_BY);
        assertEq(ccBy.name, "Creative Commons Attribution 4.0");
        assertTrue(ccBy.allowCommercialUse);
        assertTrue(ccBy.allowDerivatives);
        assertFalse(ccBy.requireShareAlike);
        assertTrue(ccBy.requireAttribution);
        assertTrue(ccBy.isActive);

        LicenseManager.LicenseInfo memory allRights =
            licenseManager.getLicenseInfo(LicenseManager.LicenseType.ALL_RIGHTS_RESERVED);
        assertEq(allRights.name, "All Rights Reserved");
        assertFalse(allRights.allowCommercialUse);
        assertFalse(allRights.allowDerivatives);
        assertFalse(allRights.requireShareAlike);
        assertFalse(allRights.requireAttribution);
        assertTrue(allRights.isActive);

        LicenseManager.LicenseInfo memory publicDomain =
            licenseManager.getLicenseInfo(LicenseManager.LicenseType.PUBLIC_DOMAIN);
        assertEq(publicDomain.name, "Public Domain (CC0)");
        assertTrue(publicDomain.allowCommercialUse);
        assertTrue(publicDomain.allowDerivatives);
        assertFalse(publicDomain.requireShareAlike);
        assertFalse(publicDomain.requireAttribution);
        assertTrue(publicDomain.isActive);
    }

    function testSetRecordingLicense() public {
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit RecordingLicenseSet(1, LicenseManager.LicenseType.CC_BY, "Created by User1");
        licenseManager.setRecordingLicense(1, LicenseManager.LicenseType.CC_BY, "Created by User1");

        (
            LicenseManager.LicenseType licenseType,
            string memory attribution,
            LicenseManager.LicenseInfo memory licenseInfo
        ) = licenseManager.getRecordingLicense(1);

        assertEq(uint8(licenseType), uint8(LicenseManager.LicenseType.CC_BY));
        assertEq(attribution, "Created by User1");
        assertEq(licenseInfo.name, "Creative Commons Attribution 4.0");
    }

    function testSetRecordingLicenseWithoutAttribution() public {
        vm.prank(user1);
        licenseManager.setRecordingLicense(1, LicenseManager.LicenseType.PUBLIC_DOMAIN, "");

        (LicenseManager.LicenseType licenseType, string memory attribution,) = licenseManager.getRecordingLicense(1);

        assertEq(uint8(licenseType), uint8(LicenseManager.LicenseType.PUBLIC_DOMAIN));
        assertEq(attribution, "");
    }

    function testRequiredAttributionForCCLicenses() public {
        vm.prank(user1);
        vm.expectRevert("Attribution required for this license");
        licenseManager.setRecordingLicense(1, LicenseManager.LicenseType.CC_BY, "");
    }

    function testInvalidRecordingId() public {
        vm.prank(user1);
        vm.expectRevert("Invalid recording ID");
        licenseManager.setRecordingLicense(0, LicenseManager.LicenseType.CC_BY, "Test");
    }

    function testUpdateLicense() public {
        vm.prank(admin);
        vm.expectEmit(true, false, false, true);
        emit LicenseUpdated(LicenseManager.LicenseType.CC_BY, "Updated CC BY", "Updated description");

        licenseManager.updateLicense(
            LicenseManager.LicenseType.CC_BY,
            "Updated CC BY",
            "Updated description",
            "https://updated.url",
            true,
            true,
            false,
            true,
            true
        );

        LicenseManager.LicenseInfo memory updated = licenseManager.getLicenseInfo(LicenseManager.LicenseType.CC_BY);
        assertEq(updated.name, "Updated CC BY");
        assertEq(updated.description, "Updated description");
        assertEq(updated.url, "https://updated.url");
    }

    function testOnlyAdminCanUpdateLicense() public {
        vm.prank(user1);
        vm.expectRevert();
        licenseManager.updateLicense(
            LicenseManager.LicenseType.CC_BY, "Unauthorized Update", "Should fail", "", true, true, false, true, true
        );
    }

    function testReportLicenseViolation() public {
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit LicenseViolationReported(1, user1, "Unauthorized commercial use");
        licenseManager.reportLicenseViolation(1, "Unauthorized commercial use");
    }

    function testReportViolationRequiresReason() public {
        vm.prank(user1);
        vm.expectRevert("Reason required");
        licenseManager.reportLicenseViolation(1, "");
    }

    function testSetUserLicensePreference() public {
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit UserLicensePreferenceSet(user1, LicenseManager.LicenseType.CC_BY, true);
        licenseManager.setUserLicensePreference(LicenseManager.LicenseType.CC_BY, true);

        assertTrue(licenseManager.userLicensePreferences(user1, LicenseManager.LicenseType.CC_BY));
    }

    function testGetUserLicensePreferences() public {
        vm.startPrank(user1);
        licenseManager.setUserLicensePreference(LicenseManager.LicenseType.CC_BY, true);
        licenseManager.setUserLicensePreference(LicenseManager.LicenseType.CC_BY_SA, true);
        licenseManager.setUserLicensePreference(LicenseManager.LicenseType.PUBLIC_DOMAIN, true);
        vm.stopPrank();

        LicenseManager.LicenseType[] memory preferences = licenseManager.getUserLicensePreferences(user1);
        assertEq(preferences.length, 3);
        assertEq(uint8(preferences[0]), uint8(LicenseManager.LicenseType.CC_BY));
        assertEq(uint8(preferences[1]), uint8(LicenseManager.LicenseType.CC_BY_SA));
        assertEq(uint8(preferences[2]), uint8(LicenseManager.LicenseType.PUBLIC_DOMAIN));
    }

    function testCheckLicenseCompatibilitySuccess() public {
        (bool compatible, string memory reason) = licenseManager.checkLicenseCompatibility(
            LicenseManager.LicenseType.CC_BY, LicenseManager.LicenseType.CC_BY_SA
        );
        assertTrue(compatible);
        assertEq(reason, "Licenses are compatible");
    }

    function testCheckLicenseCompatibilityNoDerivatives() public {
        (bool compatible, string memory reason) = licenseManager.checkLicenseCompatibility(
            LicenseManager.LicenseType.CC_BY_ND, LicenseManager.LicenseType.CC_BY
        );
        assertFalse(compatible);
        assertEq(reason, "Original license does not allow derivatives");
    }

    function testCheckLicenseCompatibilityShareAlike() public {
        (bool compatible, string memory reason) = licenseManager.checkLicenseCompatibility(
            LicenseManager.LicenseType.CC_BY_SA, LicenseManager.LicenseType.CC_BY
        );
        assertFalse(compatible);
        assertEq(reason, "Original license requires ShareAlike - derivative must use same license");
    }

    function testCheckLicenseCompatibilityCommercial() public {
        (bool compatible, string memory reason) = licenseManager.checkLicenseCompatibility(
            LicenseManager.LicenseType.CC_BY_NC, LicenseManager.LicenseType.CC_BY
        );
        assertFalse(compatible);
        assertEq(reason, "Original license is non-commercial but derivative allows commercial use");
    }

    function testGetAllActiveLicenses() public {
        LicenseManager.LicenseType[] memory activeLicenses = licenseManager.getAllActiveLicenses();
        assertEq(activeLicenses.length, 8); // All 8 license types should be active by default

        // Deactivate one license
        vm.prank(admin);
        licenseManager.updateLicense(
            LicenseManager.LicenseType.ALL_RIGHTS_RESERVED,
            "All Rights Reserved",
            "Traditional copyright",
            "",
            false,
            false,
            false,
            false,
            false // Set to inactive
        );

        activeLicenses = licenseManager.getAllActiveLicenses();
        assertEq(activeLicenses.length, 7); // Should now be 7 active licenses
    }

    function testCannotSetInactiveLicensePreference() public {
        // First deactivate a license
        vm.prank(admin);
        licenseManager.updateLicense(
            LicenseManager.LicenseType.ALL_RIGHTS_RESERVED,
            "All Rights Reserved",
            "Traditional copyright",
            "",
            false,
            false,
            false,
            false,
            false // Set to inactive
        );

        vm.prank(user1);
        vm.expectRevert("License type not active");
        licenseManager.setUserLicensePreference(LicenseManager.LicenseType.ALL_RIGHTS_RESERVED, true);
    }

    function testCannotSetInactiveLicenseOnRecording() public {
        // First deactivate a license
        vm.prank(admin);
        licenseManager.updateLicense(
            LicenseManager.LicenseType.ALL_RIGHTS_RESERVED,
            "All Rights Reserved",
            "Traditional copyright",
            "",
            false,
            false,
            false,
            false,
            false // Set to inactive
        );

        vm.prank(user1);
        vm.expectRevert("License type not active");
        licenseManager.setRecordingLicense(1, LicenseManager.LicenseType.ALL_RIGHTS_RESERVED, "");
    }

    function testPauseUnpause() public {
        vm.prank(admin);
        licenseManager.pause();

        vm.prank(user1);
        vm.expectRevert();
        licenseManager.setRecordingLicense(1, LicenseManager.LicenseType.CC_BY, "Test");

        vm.prank(admin);
        licenseManager.unpause();

        vm.prank(user1);
        licenseManager.setRecordingLicense(1, LicenseManager.LicenseType.CC_BY, "Test");

        (LicenseManager.LicenseType licenseType,,) = licenseManager.getRecordingLicense(1);
        assertEq(uint8(licenseType), uint8(LicenseManager.LicenseType.CC_BY));
    }

    function testOnlyAdminCanPause() public {
        vm.prank(user1);
        vm.expectRevert();
        licenseManager.pause();
    }
}
