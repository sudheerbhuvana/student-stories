import mongoose from 'mongoose';

const StorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a title'],
            trim: true,
            maxlength: [200, 'Title cannot be more than 200 characters']
        },
        content: {
            type: String,
            required: [true, 'Please provide content'],
            minlength: [50, 'Content must be at least 50 characters']
        },
        excerpt: {
            type: String,
            required: [true, 'Please provide an excerpt'],
            maxlength: [300, 'Excerpt cannot be more than 300 characters']
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        category: {
            type: String,
            required: [true, 'Please provide a category'],
            enum: ['Personal Growth', 'Student Life', 'Academics', 'Wellness', 'Experience', 'Career', 'Other']
        },
        tags: [{
            type: String,
            trim: true
        }],
        images: [{
            type: String
        }],
        attachments: [{
            url: { type: String, required: true },
            originalName: { type: String, required: true },
            mimeType: { type: String, required: true }
        }],
        reactions: {
            hearts: {
                type: Number,
                default: 0
            },
            users: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }]
        },
        comments: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            text: {
                type: String,
                required: true,
                maxlength: [500, 'Comment cannot be more than 500 characters']
            },
            parentId: {
                type: mongoose.Schema.Types.ObjectId,
                default: null
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        published: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Index for better query performance
StorySchema.index({ author: 1, createdAt: -1 });
StorySchema.index({ category: 1, published: 1 });
StorySchema.index({ tags: 1 });

export default mongoose.model('Story', StorySchema);
