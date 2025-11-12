import Navbar from "../components/Navbar"
import Info from "../components/Info"
import Gallery from "../components/Gallery"
import Footer from "../components/Footer"

export default function Home({isLoggedIn}) {
    return (
        <>
            <Navbar isLoggedIn={isLoggedIn}/>
            <Info />
            <Gallery isLoggedIn={isLoggedIn}/>
            <Footer />
        </>
    )
}