import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Prompt from '../components/Prompt';
import Footer from '../components/Footer';
import { getPromptById } from '../utils/getPrompts.js'; 

export default function PromptPage({isLoggedIn}) {
    const { id } = useParams(); 
    const [promptData, setPromptData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            setIsLoading(true);
            getPromptById(id)
                .then(data => {
                    setPromptData(data);
                })
                .catch(error => {
                    console.error("Failed to fetch prompt:", error);
                    setPromptData(null);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [id]);

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="text-center p-10">Loading Prompt...</div>
                <Footer />
            </>
        );
    }
    
    if (!promptData) {
        return (
            <>
                <Navbar />
                <div className="text-center text-white p-10">Prompt not found or an error occurred.</div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar isLoggedIn={isLoggedIn}/>
            <Prompt 
                isLoggedIn={isLoggedIn}
                imageSrc={promptData.imageUrl} 
                title={promptData.title}
                category={promptData.category}
                likes={promptData.likes}
                updatedOn={promptData.updatedAt}
                promptText={promptData.promptText} 
                author={promptData.author || "Anonymous"}
            />
            <Footer />
        </>
    );
}