import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { SunIcon, MoonIcon, MenuIcon, XIcon } from "../Icons";
import { useUser } from "../hooks/useUser"; // your new hook
import { useQueryClient } from "@tanstack/react-query"; // Add this import

// --- Main Header Component ---
export default function Header() {
  const { userQuery } = useUser();
  const { data: user } = userQuery;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const queryClient = useQueryClient();
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
  );

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeMobileSubMenu, setActiveMobileSubMenu] = useState(null);

  // Effect to apply the theme class to the root <html> element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }
      if (dropdownOpen && !e.target.closest(".relative")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, dropdownOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dropdownOpen]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 2020 00:00:00 UTC; path=/";
    // Invalidate the user query to clear out the current user data
    queryClient.invalidateQueries({ queryKey: ["user"] });
    navigate("/login"); // Redirect to login
  };

  const buildMenuItems = (user) => [
    {
      name: "Visits",
      path: "/visits",
      subMenu: [
        { name: "View Visits", path: "/visits" },
        { name: "Create Visit", path: "/visits/create" },
      ],
    },
    {
      name: "Caregivers",
      path: "/caregivers",
      subMenu: [
        { name: "All Caregivers", path: "/caregivers" },
        { name: "Add New Caregiver", path: "/caregivers/create" },
      ],
    },
    {
      name: "Service Users",
      path: "/patients",
      subMenu: [
        { name: "All Service Users", path: "/patients" },
        ...(user?.role === "admin"
          ? [{ name: "Add New Service User", path: "/patients/new" }]
          : []),
      ],
    },
    {
      name: "Training",
      path: "/trainings",
      subMenu: [
        { name: "All Trainings", path: "/trainings" },
        ...(user?.role === "admin"
          ? [{ name: "Create Training", path: "/trainings/create" }]
          : []),
        { name: "Training History", path: "/trainings/history" },
      ],
    },
    {
      name: "Invoices",
      path: "/invoices",
      subMenu: [
        { name: "View Invoices", path: "/invoices" },
        { name: "Create Invoice", path: "/invoices/create" },
      ],
    },
    {
      name: "Wellness",
      path: "/wellness/plans",
      subMenu: [
        { name: "Wellness Plans", path: "/wellness/plans" },
        { name: "New Care Plan", path: "/wellness/plans/create" },
        { name: "Resources", path: "/wellness/resources" },
      ],
    },
  ];

  const menuItems = buildMenuItems(user);

  const filteredMenuItems =
    user?.role === "admin"
      ? menuItems
      : menuItems.filter(
          (item) =>
            item.name !== "Invoices" &&
            item.name !== "Visits" &&
            item.name !== "Caregivers"
        );

  const activeLinkStyle = {
    color: "#FE4982",
    fontWeight: "600",
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md transition-colors duration-300 dark:bg-[#1D2056]">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="flex flex-shrink-0 items-center">
          <img
            src="/logo3.png"
            alt="MindfulTrust Logo Light"
            className="block h-10 dark:hidden"
          />
          <img
            src="/logo2.png"
            alt="MindfulTrust Logo Dark"
            className="hidden h-10 dark:block"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-x-4">
          {filteredMenuItems.map((item, index) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => setActiveDropdown(index)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <NavLink
                to={item.path}
                style={({ isActive }) =>
                  isActive ? activeLinkStyle : undefined
                }
                className="flex items-center gap-1 whitespace-nowrap px-3 py-2 text-slate-600 transition-colors hover:text-[#FE4982] dark:text-slate-300 dark:hover:text-[#FE4982]"
              >
                {item.name}
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ease-out ${
                    activeDropdown === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </NavLink>
              {/* Dropdown Menu */}
              {activeDropdown === index && (
                <div className="absolute left-0 top-full w-48 rounded-md bg-white py-1 shadow-lg transition-all duration-300 dark:bg-[#2A2D6E]">
                  {item.subMenu.map((subItem) => (
                    <Link
                      key={subItem.name}
                      to={subItem.path}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 hover:cursor-pointer"
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 transition hover:opacity-80"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FE4982] font-bold text-white">
                {user?.avatar ? (
                  <img
                    className="h-full w-full rounded-full"
                    src={user.avatar}
                    alt={user.name || "User Avatar"}
                  />
                ) : (
                  <span className="text-xl font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
                  </span>
                )}
              </div>
              <span className="hidden font-[600] text-slate-700 sm:inline dark:text-slate-100">
                {user?.name || user?.role}
              </span>
            </button>
            {dropdownOpen && (
              <div className="absolute -right-5 sm:right-3 mt-2 w-28 rounded-md bg-white py-1 text-slate-700 shadow-lg dark:bg-[#1d2056] dark:text-white sm:w-32">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <div className="xl:hidden">
            <button
              ref={toggleRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300"
            >
              {isMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute w-full border-t border-slate-200 bg-white pl-1 dark:border-slate-700 dark:bg-[#1D2056] xl:hidden"
        >
          <nav className="flex flex-col space-y-1 p-4">
            {filteredMenuItems.map((item, index) => (
              <div key={item.name}>
                <div
                  onClick={() =>
                    activeMobileSubMenu === index
                      ? setActiveMobileSubMenu(null)
                      : setActiveMobileSubMenu(index)
                  }
                  className="flex cursor-pointer items-center justify-between rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  <NavLink to={item.path} onClick={(e) => e.stopPropagation()}>
                    {item.name}
                  </NavLink>
                  <svg
                    className={`h-5 w-5 transition-transform duration-300 ease-out ${
                      activeMobileSubMenu === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
                {activeMobileSubMenu === index && (
                  <div className="mt-1 space-y-1 pl-4">
                    {item.subMenu.map((subItem) => (
                      <NavLink
                        key={subItem.name}
                        to={subItem.path}
                        onClick={() => setIsMenuOpen(false)}
                        className="block rounded-md p-2 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-white/20"
                      >
                        {subItem.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
