const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitySchema = new Schema({
    dayOfWeek: {
        type: String,
        enum: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], 
        required: true,
        unique: true 
    },
    totalSteps: {
        type: Number,
        required: true
    },
    veryActiveMinutes: {
        type: Number,
        default: 0 
    },
    fairlyActiveMinutes: {
        type: Number,
        default: 0
    },
    lightlyActiveMinutes: {
        type: Number,
        default: 0
    },
    sedentaryMinutes: {
        type: Number,
        default: 0
    }
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
