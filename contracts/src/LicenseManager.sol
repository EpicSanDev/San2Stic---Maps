// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract LicenseManager is AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    enum LicenseType {
        ALL_RIGHTS_RESERVED,
        CC_BY,
        CC_BY_SA,
        CC_BY_NC,
        CC_BY_NC_SA,
        CC_BY_ND,
        CC_BY_NC_ND,
        PUBLIC_DOMAIN
    }
    
    struct LicenseInfo {
        string name;
        string description;
        string url;
        bool allowCommercialUse;
        bool allowDerivatives;
        bool requireShareAlike;
        bool requireAttribution;
        bool isActive;
    }
    
    mapping(LicenseType => LicenseInfo) public licenses;
    mapping(uint256 => LicenseType) public recordingLicenses;
    mapping(uint256 => string) public recordingAttributions;
    mapping(address => mapping(LicenseType => bool)) public userLicensePreferences;
    
    event LicenseUpdated(LicenseType indexed licenseType, string name, string description);
    event RecordingLicenseSet(uint256 indexed recordingId, LicenseType licenseType, string attribution);
    event LicenseViolationReported(uint256 indexed recordingId, address indexed reporter, string reason);
    event UserLicensePreferenceSet(address indexed user, LicenseType licenseType, bool preferred);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        _initializeLicenses();
    }
    
    function _initializeLicenses() internal {
        licenses[LicenseType.ALL_RIGHTS_RESERVED] = LicenseInfo({
            name: "All Rights Reserved",
            description: "Traditional copyright - no permissions granted without explicit license",
            url: "",
            allowCommercialUse: false,
            allowDerivatives: false,
            requireShareAlike: false,
            requireAttribution: false,
            isActive: true
        });
        
        licenses[LicenseType.CC_BY] = LicenseInfo({
            name: "Creative Commons Attribution 4.0",
            description: "Permits almost any use subject to providing credit and license notice",
            url: "https://creativecommons.org/licenses/by/4.0/",
            allowCommercialUse: true,
            allowDerivatives: true,
            requireShareAlike: false,
            requireAttribution: true,
            isActive: true
        });
        
        licenses[LicenseType.CC_BY_SA] = LicenseInfo({
            name: "Creative Commons Attribution-ShareAlike 4.0",
            description: "Permits almost any use subject to providing credit and license notice. Derivative works must be licensed under the same terms",
            url: "https://creativecommons.org/licenses/by-sa/4.0/",
            allowCommercialUse: true,
            allowDerivatives: true,
            requireShareAlike: true,
            requireAttribution: true,
            isActive: true
        });
        
        licenses[LicenseType.CC_BY_NC] = LicenseInfo({
            name: "Creative Commons Attribution-NonCommercial 4.0",
            description: "Permits use and derivatives for non-commercial purposes only",
            url: "https://creativecommons.org/licenses/by-nc/4.0/",
            allowCommercialUse: false,
            allowDerivatives: true,
            requireShareAlike: false,
            requireAttribution: true,
            isActive: true
        });
        
        licenses[LicenseType.CC_BY_NC_SA] = LicenseInfo({
            name: "Creative Commons Attribution-NonCommercial-ShareAlike 4.0",
            description: "Permits use and derivatives for non-commercial purposes only, with ShareAlike requirement",
            url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
            allowCommercialUse: false,
            allowDerivatives: true,
            requireShareAlike: true,
            requireAttribution: true,
            isActive: true
        });
        
        licenses[LicenseType.CC_BY_ND] = LicenseInfo({
            name: "Creative Commons Attribution-NoDerivatives 4.0",
            description: "Permits use for any purpose but prohibits creation of derivative works",
            url: "https://creativecommons.org/licenses/by-nd/4.0/",
            allowCommercialUse: true,
            allowDerivatives: false,
            requireShareAlike: false,
            requireAttribution: true,
            isActive: true
        });
        
        licenses[LicenseType.CC_BY_NC_ND] = LicenseInfo({
            name: "Creative Commons Attribution-NonCommercial-NoDerivatives 4.0",
            description: "Most restrictive CC license - only allows download and sharing with attribution for non-commercial purposes",
            url: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
            allowCommercialUse: false,
            allowDerivatives: false,
            requireShareAlike: false,
            requireAttribution: true,
            isActive: true
        });
        
        licenses[LicenseType.PUBLIC_DOMAIN] = LicenseInfo({
            name: "Public Domain (CC0)",
            description: "No rights reserved - work is in the public domain",
            url: "https://creativecommons.org/publicdomain/zero/1.0/",
            allowCommercialUse: true,
            allowDerivatives: true,
            requireShareAlike: false,
            requireAttribution: false,
            isActive: true
        });
    }
    
    function setRecordingLicense(
        uint256 _recordingId,
        LicenseType _licenseType,
        string calldata _attribution
    ) external whenNotPaused {
        require(licenses[_licenseType].isActive, "License type not active");
        require(_recordingId > 0, "Invalid recording ID");
        
        if (licenses[_licenseType].requireAttribution) {
            require(bytes(_attribution).length > 0, "Attribution required for this license");
        }
        
        recordingLicenses[_recordingId] = _licenseType;
        recordingAttributions[_recordingId] = _attribution;
        
        emit RecordingLicenseSet(_recordingId, _licenseType, _attribution);
    }
    
    function updateLicense(
        LicenseType _licenseType,
        string calldata _name,
        string calldata _description,
        string calldata _url,
        bool _allowCommercialUse,
        bool _allowDerivatives,
        bool _requireShareAlike,
        bool _requireAttribution,
        bool _isActive
    ) external onlyRole(ADMIN_ROLE) whenNotPaused {
        licenses[_licenseType] = LicenseInfo({
            name: _name,
            description: _description,
            url: _url,
            allowCommercialUse: _allowCommercialUse,
            allowDerivatives: _allowDerivatives,
            requireShareAlike: _requireShareAlike,
            requireAttribution: _requireAttribution,
            isActive: _isActive
        });
        
        emit LicenseUpdated(_licenseType, _name, _description);
    }
    
    function reportLicenseViolation(
        uint256 _recordingId,
        string calldata _reason
    ) external whenNotPaused {
        require(_recordingId > 0, "Invalid recording ID");
        require(bytes(_reason).length > 0, "Reason required");
        
        emit LicenseViolationReported(_recordingId, msg.sender, _reason);
    }
    
    function setUserLicensePreference(
        LicenseType _licenseType,
        bool _preferred
    ) external whenNotPaused {
        require(licenses[_licenseType].isActive, "License type not active");
        
        userLicensePreferences[msg.sender][_licenseType] = _preferred;
        
        emit UserLicensePreferenceSet(msg.sender, _licenseType, _preferred);
    }
    
    function checkLicenseCompatibility(
        LicenseType _originalLicense,
        LicenseType _derivativeLicense
    ) external view returns (bool compatible, string memory reason) {
        LicenseInfo memory original = licenses[_originalLicense];
        LicenseInfo memory derivative = licenses[_derivativeLicense];
        
        if (!original.allowDerivatives) {
            return (false, "Original license does not allow derivatives");
        }
        
        if (original.requireShareAlike && _originalLicense != _derivativeLicense) {
            return (false, "Original license requires ShareAlike - derivative must use same license");
        }
        
        if (!original.allowCommercialUse && derivative.allowCommercialUse) {
            return (false, "Original license is non-commercial but derivative allows commercial use");
        }
        
        return (true, "Licenses are compatible");
    }
    
    function getLicenseInfo(LicenseType _licenseType) external view returns (LicenseInfo memory) {
        return licenses[_licenseType];
    }
    
    function getRecordingLicense(uint256 _recordingId) external view returns (
        LicenseType licenseType,
        string memory attribution,
        LicenseInfo memory licenseInfo
    ) {
        licenseType = recordingLicenses[_recordingId];
        attribution = recordingAttributions[_recordingId];
        licenseInfo = licenses[licenseType];
    }
    
    function getUserLicensePreferences(address _user) external view returns (
        LicenseType[] memory preferredLicenses
    ) {
        uint256 count = 0;
        for (uint256 i = 0; i < 8; i++) {
            if (userLicensePreferences[_user][LicenseType(i)]) {
                count++;
            }
        }
        
        preferredLicenses = new LicenseType[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < 8; i++) {
            if (userLicensePreferences[_user][LicenseType(i)]) {
                preferredLicenses[index] = LicenseType(i);
                index++;
            }
        }
    }
    
    function getAllActiveLicenses() external view returns (LicenseType[] memory activeLicenses) {
        uint256 count = 0;
        for (uint256 i = 0; i < 8; i++) {
            if (licenses[LicenseType(i)].isActive) {
                count++;
            }
        }
        
        activeLicenses = new LicenseType[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < 8; i++) {
            if (licenses[LicenseType(i)].isActive) {
                activeLicenses[index] = LicenseType(i);
                index++;
            }
        }
    }
    
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
