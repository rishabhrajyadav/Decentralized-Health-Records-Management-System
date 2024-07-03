const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
    recordId: Number,
    ipfsHash: String,
    verified: Boolean,
});

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);

module.exports = HealthRecord;