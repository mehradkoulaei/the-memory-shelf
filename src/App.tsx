import { BookshelfScene } from "./shaders/bookshelf/BookshelfScene";
import "./shaders/threeui.css";
import { BARAN_ALBUMS } from "./albums";
import MusicPlayer from "./MusicPlayer";

export default function App() {
  return (
    <div className="shader-frame">
      <BookshelfScene 
        albums={BARAN_ALBUMS} 
        onAlbumOpen={(idx) => console.log('Opened album', idx)}
        onPageTurn={(page, item) => console.log('Turned to page', page, item)}
      />
      <MusicPlayer />
    </div>
  );
}
