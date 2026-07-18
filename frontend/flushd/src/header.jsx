import DropMenu from "./Menu";
import toilet from "./pics/toilet.png"
import "./css/header.css"

function Header() {
  return (
    <div className="header-shadow">
      <div id="header">
        <h1 className="flushed_h1">Flushed</h1>
        <img id="toilet_pic" src={toilet} alt="toilet" />
        <DropMenu />
      </div>
    </div>
  );
}

export default Header;