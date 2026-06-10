import { Outlet } from "react-router-dom";
import AudioPlayer from "./components/audio/AudioPlayer";
import { AudioPlayerProvider, useAudioPlayer } from "./context/AudioPlayerContext";
import { WishlistProvider } from "./context/WishlistContext";
import { FollowProvider } from "../contexts/FollowContext";
import { CollectionProvider } from "./context/CollectionContext";

function ShopContent() {
  const { isOpen } = useAudioPlayer();
  return (
    <div className={`transition-[padding] duration-300 ${isOpen ? "pr-75" : ""}`}>
      <Outlet />
      <AudioPlayer />
    </div>
  );
}

export default function ShopLayout() {
  return (
    <WishlistProvider>
      <FollowProvider>
        <CollectionProvider>
          <AudioPlayerProvider>
            <ShopContent />
          </AudioPlayerProvider>
        </CollectionProvider>
      </FollowProvider>
    </WishlistProvider>
  );
}
