const express = require('express');
const connect = require("./db/connect")
const Patient = require("./models/Patient")
const HealthRecord = require("./models/HealthRecord")
const {web3,contract,account} = require("./lib/web3");
require('dotenv').config();
const PORT = 8000
const app = express();

//Mongodb SETUP
connect();
app.use(express.json());

// Define API Endpoints
app.post('/register-patient', async (req, res) => {
    const { patientAddress, name } = req.body;
    
    const receipt = await contract.methods.registerPatient(patientAddress, name)
        .send({ from: account.address, gas: 3000000 });

    const newPatient = new Patient({ address: patientAddress, name, healthRecordIds: [] });
    await newPatient.save();
    
    res.send({ message: 'Patient registered successfully', transactionHash: receipt.transactionHash });
});

app.post('/add-health-record', async (req, res) => {
    const { patientAddress, ipfsHash } = req.body;
    
    const receipt = await contract.methods.addHealthRecord(patientAddress, ipfsHash)
        .send({ from: account.address, gas: 3000000 });

    const recordId = receipt.events.HealthRecordAdded.returnValues.recordId;
    await Patient.findOneAndUpdate({ address: patientAddress }, { $push: { healthRecordIds: recordId } });
    
    const newRecord = new HealthRecord({ recordId, ipfsHash, verified: false });
    await newRecord.save();
    
    res.send({ message: 'Health record added successfully', transactionHash: receipt.transactionHash });
});

app.post('/authorize-doctor', async (req, res) => {
    const { patientAddress, doctorAddress } = req.body;

    const receipt = await contract.methods.authorizeDoctor(patientAddress, doctorAddress)
        .send({ from: account.address, gas: 3000000 });

    res.send({ message: 'Doctor authorized successfully', transactionHash: receipt.transactionHash });
});

app.post('/verify-health-record', async (req, res) => {
    const { recordId } = req.body;

    const receipt = await contract.methods.verifyHealthRecord(recordId)
        .send({ from: account.address, gas: 3000000 });

    await HealthRecord.findOneAndUpdate({ recordId }, { verified: true });

    res.send({ message: 'Health record verified successfully', transactionHash: receipt.transactionHash });
});

app.get('/get-health-records/:patientAddress', async (req, res) => {
    const { patientAddress } = req.params;
    const patient = await Patient.findOne({ address: patientAddress });
    res.send(patient.healthRecordIds);
});

app.get('/get-health-record/:recordId', async (req, res) => {
    const { recordId } = req.params;
    const record = await HealthRecord.findOne({ recordId });
    res.send(record);
});

app.listen( PORT , () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
