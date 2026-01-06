import Navbar from "../components/Navbar";
import ProfileGallery from "../components/ProfileGallery";

export default function Profile({isLoggedIn}) {
    if(!isLoggedIn) {
        window.location.href = "/login";
    }
    return (
        <>
            <Navbar isLoggedIn={isLoggedIn}/>
            <ProfileGallery />
        </>
    )
}