import Prompt from '../models/prompt.js';
import getUserName from '../utils/getUserName.js';
import getImageUrl from '../utils/getImageUrl.js';

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

export async function createPrompt(req, res) {
    const file = req.file;
    const { title, userID, category, description, prompt } = req.body;
    if(!file) {
        return res.status(400).json({ message: "Image file is required" });
    }
    if(!title || !category || !description || !prompt) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const username = await getUserName(userID);
    const imageUrl = await getImageUrl(req.file);
    const newPrompt = new Prompt({
        title: title,
        description: description,
        category: category,
        promptText: prompt,
        author: username,
        imageUrl: imageUrl,
    });
    newPrompt.save();   
    res.status(200).json({
        message: "Prompt created successfully",
    });
}
