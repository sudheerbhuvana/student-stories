import mongoose from 'mongoose';

const BlacklistSchema = new mongoose.Schema(
    {
        word: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Blacklist', BlacklistSchema);
