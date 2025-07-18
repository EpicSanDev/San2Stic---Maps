// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/San2SticMap.sol";
import "../src/RecordingManager.sol";
import "../src/VotingSystem.sol";
import "../src/LicenseManager.sol";
import "../src/San2SticMapMain.sol";

contract DeployMainnetScript is Script {
    function run() external {
        require(block.chainid == 8453, "This script is only for Base mainnet (chainid: 8453)");

        console.log("=== Deploying to Base Mainnet ===");
        console.log("Chain ID:", block.chainid);
        console.log("Block number:", block.number);
        console.log("WARNING: This is a mainnet deployment!");

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy core contracts
        San2SticMap userManager = new San2SticMap();
        console.log("San2SticMap deployed to:", address(userManager));

        RecordingManager recordingManager = new RecordingManager();
        console.log("RecordingManager deployed to:", address(recordingManager));

        VotingSystem votingSystem = new VotingSystem();
        console.log("VotingSystem deployed to:", address(votingSystem));

        LicenseManager licenseManager = new LicenseManager();
        console.log("LicenseManager deployed to:", address(licenseManager));

        // Deploy main orchestrator contract
        San2SticMapMain mainContract = new San2SticMapMain(
            address(userManager), address(recordingManager), address(votingSystem), address(licenseManager)
        );
        console.log("San2SticMapMain deployed to:", address(mainContract));

        // Grant necessary roles to main contract
        userManager.grantModeratorRole(address(mainContract));
        recordingManager.grantRole(recordingManager.MODERATOR_ROLE(), address(mainContract));
        votingSystem.grantRole(votingSystem.MODERATOR_ROLE(), address(mainContract));
        licenseManager.grantRole(licenseManager.ADMIN_ROLE(), address(mainContract));

        console.log("=== Base Mainnet Deployment Summary ===");
        console.log("San2SticMap:", address(userManager));
        console.log("RecordingManager:", address(recordingManager));
        console.log("VotingSystem:", address(votingSystem));
        console.log("LicenseManager:", address(licenseManager));
        console.log("San2SticMapMain:", address(mainContract));
        console.log("Deployer:", deployer);
        console.log("Network: Base Mainnet");

        vm.stopBroadcast();

        console.log("=== Base Mainnet Deployment Complete ===");
        console.log("Verify contracts on BaseScan:");
        console.log("https://basescan.org/");
    }
}
