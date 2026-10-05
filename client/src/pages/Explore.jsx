import Navbar from '../components/Navbar';
import ExploreGallery from '../components/ExploreGallery';
import Footer from '../components/Footer';

export default function Explore({ isLoggedIn }) {
  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <ExploreGallery isLoggedIn={isLoggedIn} />
      <Footer />
    </>
  );
}