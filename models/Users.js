const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usersShecema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// genarated password
usersShecema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
})

module.exports = mongoose.model('Users', usersShecema);