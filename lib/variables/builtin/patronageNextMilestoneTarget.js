"use strict";

const patronageManager = require("../../patronageManager");

const model = {
    definition: {
        handle: "patronageNextMilestoneTarget",
        description: "The next patronage milestone target."
    },
    evaluator: () => {
        let currentMilestone = patronageManager.getCurrentMilestone();
        if (currentMilestone) {
            return currentMilestone.target;
        }
        return null;
    }
};

module.exports = model;