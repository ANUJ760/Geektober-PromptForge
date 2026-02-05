import Navbar from "../components/Navbar";
import ProfileGallery from "../components/ProfileGallery";

export default function Profile({isLoggedIn}) {
    return (
        <>
            <Navbar isLoggedIn={isLoggedIn}/>
            <ProfileGallery isLoggedIn={isLoggedIn}/>
        </>
    )
}