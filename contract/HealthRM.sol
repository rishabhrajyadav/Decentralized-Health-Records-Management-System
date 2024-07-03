// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PatientContract {
    struct Patient {
        address patientAddress;
        string name;
        uint256[] healthRecordIds;
    }
    
    struct HealthRecord {
        uint256 recordId;
        string ipfsHash;
        bool verified;
    }
    
    mapping(address => Patient) public patients;
    mapping(uint256 => HealthRecord) public healthRecords;
    mapping(address => mapping(address => bool)) public authorizations;

    uint256 public recordCounter;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerPatient(address _patientAddress, string memory _name) public onlyOwner {
        patients[_patientAddress] = Patient(_patientAddress, _name, new uint256[](0));
    }

    function addHealthRecord(address _patientAddress, string memory _ipfsHash) public onlyOwner {
        recordCounter++;
        healthRecords[recordCounter] = HealthRecord(recordCounter, _ipfsHash, false);
        patients[_patientAddress].healthRecordIds.push(recordCounter);
    }

    function authorizeDoctor(address _patientAddress, address _doctorAddress) public {
        require(patients[_patientAddress].patientAddress == msg.sender, "Not authorized");
        authorizations[_patientAddress][_doctorAddress] = true;
    }

    function verifyHealthRecord(uint256 _recordId) public onlyOwner {
        healthRecords[_recordId].verified = true;
    }

    function getHealthRecords(address _patientAddress) public view returns (uint256[] memory) {
        require(patients[_patientAddress].patientAddress == msg.sender || authorizations[_patientAddress][msg.sender], "Not authorized");
        return patients[_patientAddress].healthRecordIds;
    }

    function getHealthRecordDetails(uint256 _recordId) public view returns (HealthRecord memory) {
        return healthRecords[_recordId];
    }
}
