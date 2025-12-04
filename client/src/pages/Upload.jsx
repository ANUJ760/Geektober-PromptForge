import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import createPost from "../utils/createPost.js";

export default function Upload({ isLoggedIn }) {
    const navigate = useNavigate();
    const [preview, setPreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) return;
        document.getElementById("image").files = e.dataTransfer.files;
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const result = await createPost(formData);
        if(result) {
            toast.success("Post created successfully!");
            toast.loading("Redirecting...Image may take a few seconds to load", { duration: 2000 });
            setTimeout(() => {
                navigate(`/prompt/${result}`);
            }, 3000);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-[#0e111b] flex items-center justify-center p-6 text-white">
                <div className="bg-[#111827] w-full max-w-md p-10 rounded-2xl shadow-xl border border-white/5 text-center space-y-6">
                    <h2 className="text-3xl font-semibold mb-2">Access Restricted</h2>
                    <p className="text-gray-400 text-base">You must be logged in to upload a post.</p>
                    <a href="/login" className="block w-full bg-[#5b85f9] hover:bg-[#6d92ff] text-white font-medium py-3 rounded-xl transition-all">
                        Go to Login
                    </a>
                    <p className="text-sm text-gray-400">
                        Don't have an account? <a href="/signup" className="text-[#5b85f9] hover:underline">Sign up</a>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#0e111b] flex items-center justify-center text-white px-6">
            <form
                onSubmit={handleSubmit}
                className="bg-[#111827] w-full max-w-6xl p-8 rounded-2xl shadow-xl border border-white/5"
            >
                <h2 className="text-3xl font-semibold text-center mb-6">Create New Post</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                className="w-full px-4 py-2.5 rounded-xl bg-[#1a2033] border border-white/10 focus:outline-none focus:border-[#5b85f9]"
                                placeholder="Enter title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                rows="2"
                                name="description"
                                className="w-full px-4 py-2.5 rounded-xl bg-[#1a2033] border border-white/10 focus:outline-none focus:border-[#5b85f9]"
                                placeholder="Enter description"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select
                                name="category"
                                className="w-full px-4 py-2.5 rounded-xl bg-[#1a2033] border border-white/10 focus:outline-none focus:border-[#5b85f9]"
                            >
                                <option>Photography</option>
                                <option>Concept Art</option>
                                <option>Graphic Design</option>
                                <option>Illustration</option>
                                <option>Digital Art</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Prompt</label>
                            <textarea
                                rows="2"
                                name="prompt"
                                className="w-full px-4 py-2.5 rounded-xl bg-[#1a2033] border border-white/10 focus:outline-none focus:border-[#5b85f9]"
                                placeholder="Enter the prompt used"
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between">
                        <label className="block text-sm font-medium mb-2">Upload Image</label>

                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="flex-1 border-2 border-dashed border-white/10 bg-[#1a2033] hover:border-[#5b85f9] transition rounded-xl flex flex-col items-center justify-center cursor-pointer p-6 min-h-[250px] overflow-hidden"
                            onClick={() => document.getElementById("image").click()}
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>

                                    <p className="text-gray-300 text-sm">Drag & drop your image here</p>
                                    <p className="text-gray-500 text-xs">or click to browse</p>
                                </>
                            )}

                            <input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>
                </div>
                <Toaster position="top-center" />
                <button
                    type="submit"
                    className="w-full mt-8 py-3 rounded-xl bg-[#5b85f9] hover:bg-[#6d92ff] font-semibold text-white transition"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}
