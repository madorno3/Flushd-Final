import { Outlet } from "react-router-dom";
import DropMenu from "./Menu";

function Layout() {
  return (
    <div>
     
      <header>
        <DropMenu />
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;