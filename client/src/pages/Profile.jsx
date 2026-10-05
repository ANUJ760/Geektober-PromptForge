import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProfileGallery from "../components/ProfileGallery";

export default function Profile({ isLoggedIn }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <ProfileGallery isLoggedIn={isLoggedIn} />
    </>
  );
}