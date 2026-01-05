import Navbar from "../components/Navbar";

export default function Profile({isLoggedIn}) {
    if(!isLoggedIn) {
        window.location.href = "/login";
    }
    return (
        <Navbar isLoggedIn={isLoggedIn}/>
    )
}