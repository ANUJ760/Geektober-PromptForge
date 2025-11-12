import Prompt from '../models/prompt.js';

export async function getTrendingPrompts(req, res) {
    const trendingPrompts = await Prompt.find().sort({ likes: -1 }).limit(9);
    res.json(trendingPrompts);
}

export async function getPromptById(req, res) {
    const id = req.params.id;
    const prompt = await Prompt.findOne({ _id: id });
    res.json(prompt);
}

export async function getAllPrompts(req, res) {
    const allPrompts = await Prompt.find().sort({ likes: -1 });
    res.json(allPrompts);
}