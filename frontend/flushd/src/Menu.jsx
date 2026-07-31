import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Link } from "react-router-dom"
import {
  ArchiveBoxXMarkIcon,
  ChevronDownIcon,
  PencilIcon,
  Square2StackIcon,
  TrashIcon,
  HomeIcon,
} from '@heroicons/react/24/solid'

import "./css/menu.css"

import { useNavigate } from "react-router-dom";

export default function DropMenu() {

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const itemClass =
  "group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[#9ef7f7dd] hover:bg-white/10"
  const iconClass = "size-4 text-[#9ef7f7dd]"

  return (
    <div className="absolute top-6 right-6">
      <Menu>
        <MenuButton className="inline-flex items-center gap-2 rounded-md !border-3 !border-[#DAA520] bg-gray-800 px-3 py-1.5 text-sm font-semibold text-[#DAA520]">
          Menu
          <ChevronDownIcon className="size-4 text-[#DAA520]" />
        </MenuButton>

        <MenuItems className="w-52 rounded-xl bg-[goldenrod] p-1 text-[#9ef7f7dd]">

          <MenuItem>
            <Link to="/home" className={`${itemClass} menu-text`}>
              <HomeIcon className={iconClass} />
              Home
            </Link>
          </MenuItem>
          
          <MenuItem>
            <Link to="/edit-profile" className={`${itemClass} menu-text`}>
              <PencilIcon className={iconClass} />
              Edit Profile
            </Link>
          </MenuItem>

          <MenuItem>
            <Link to="/bathrooms" className={`${itemClass} menu-text`}>
              <Square2StackIcon className={iconClass} />
              Search
            </Link>
          </MenuItem>

          <div className="my-1 h-px bg-white/10" />

          <MenuItem>
            <button
    onClick={logout}
    className={`${itemClass} logout-button`}
  >
    <ArchiveBoxXMarkIcon className={iconClass} />
    Logout
  </button>
          </MenuItem>

          

        </MenuItems>
      </Menu>
    </div>
  )
}




