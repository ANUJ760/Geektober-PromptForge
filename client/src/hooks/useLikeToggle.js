import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { updateLike } from '../utils/like';

const SYNC_DELAY_MS = 300;
const BOUNCE_MS = 150;

const useLikeToggle = ({ id, isLiked: serverLiked, likes: serverLikes }) => {
  const [isLiked, setIsLiked] = useState(serverLiked);
  const [likeCount, setLikeCount] = useState(serverLikes);
  const [isBouncing, setIsBouncing] = useState(false);

  // Last state confirmed by the server, used to roll back a failed request
  const confirmed = useRef({ isLiked: serverLiked, likes: serverLikes });
  // Latest state the user asked for; rapid clicks only move this value
  const desiredLiked = useRef(serverLiked);
  const isRequestInFlight = useRef(false);
  const syncTimer = useRef(null);
  const bounceTimer = useRef(null);

  useEffect(() => {
    confirmed.current = { isLiked: serverLiked, likes: serverLikes };
    desiredLiked.current = serverLiked;
    setIsLiked(serverLiked);
    setLikeCount(serverLikes);
  }, [serverLiked, serverLikes]);

  useEffect(() => {
    return () => {
      clearTimeout(syncTimer.current);
      clearTimeout(bounceTimer.current);
    };
  }, []);

  const sendDesiredState = async () => {
    if (isRequestInFlight.current || desiredLiked.current === confirmed.current.isLiked) return;

    const target = desiredLiked.current;
    isRequestInFlight.current = true;
    const data = await updateLike(id, target);
    isRequestInFlight.current = false;

    if (data?.success) {
      confirmed.current = { isLiked: target, likes: data.prompt?.likes ?? confirmed.current.likes };
      // Keep the optimistic count if the user clicked again while this request was in flight
      const pendingDelta = (desiredLiked.current ? 1 : 0) - (target ? 1 : 0);
      setLikeCount(confirmed.current.likes + pendingDelta);

      if (desiredLiked.current !== target) sendDesiredState();
    } else {
      desiredLiked.current = confirmed.current.isLiked;
      setIsLiked(confirmed.current.isLiked);
      setLikeCount(confirmed.current.likes);
      toast.error(data?.error || data?.message || 'Failed to update like');
    }
  };

  const toggleLike = () => {
    const nextLiked = !desiredLiked.current;
    desiredLiked.current = nextLiked;
    setIsLiked(nextLiked);
    setLikeCount((count) => count + (nextLiked ? 1 : -1));

    setIsBouncing(true);
    clearTimeout(bounceTimer.current);
    bounceTimer.current = setTimeout(() => setIsBouncing(false), BOUNCE_MS);

    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(sendDesiredState, SYNC_DELAY_MS);
  };

  return { isLiked, likeCount, isBouncing, toggleLike };
};

export default useLikeToggle;
