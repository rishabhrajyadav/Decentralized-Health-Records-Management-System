const mongoose = require('mongoose');

// Define Mongoose Schemas
const patientSchema = new mongoose.Schema({
    address: String,
    name: String,
    healthRecordIds: [Number],
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;