import Navbar from "../components/Navbar"
import Gallery from "../components/ExploreGallery"

export default function Home({isLoggedIn}) {
    return (
        <>
            <Navbar isLoggedIn={isLoggedIn}/>
            <Gallery isLoggedIn={isLoggedIn}/>
        </>
    )
}