import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Appbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropDownRef = useRef();
  const navigate = useNavigate();

  if (!user) {
    return null; // or a loading spinner, or redirect to login
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="shadow h-14 flex justify-between items-center px-4 bg-white relative z-20">
      <div className="font-semibold text-lg">Payment Gateway</div>

      <div className="relative" ref={dropDownRef}>
        <div
          className="flex items-center space-x-2 cursor-pointer select-none"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          <span className="font-semibold">Hello {user.firstName}</span>
          <div className="rounded-full h-10 w-10 bg-slate-200 flex items-center justify-center text-lg font-bold">
            {user.firstName.charAt(0).toUpperCase()}
          </div>
        </div>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-2 text-sm animate-fade-in z-30">
            <button
              onClick={() => {
                logout();
                setDropdownOpen(false);
                navigate("/signup");
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appbar;
