const { default: mongoose } = require("mongoose");

const blacklistTokenSchema = new mongoose.Schema({
    token: { type: String, required: true }
})

const BlacklistToken = mongoose.model("blacklistToken", blacklistTokenSchema)

module.exports = BlacklistToken