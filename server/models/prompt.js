import mongoose from 'mongoose';

const PromptSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    author: {type: String, required: true, default: 'Anonymous'},
    category: {type: String, required: true},
    imageUrl: {type: String, required: true},
    promptText: {type: String, required: true},
    likes: {type: Number, default: 0},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
})

const Prompt = mongoose.model('Prompt', PromptSchema);

export default Prompt;