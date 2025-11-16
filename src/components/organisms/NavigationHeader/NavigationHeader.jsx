import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

const NavigationHeader = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  const headerStyle = {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e0e0e0",
    padding: "15px 20px",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const logoStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#007bff",
    textDecoration: "none",
  };

  const navLinksStyle = {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  };

  const linkStyle = {
    color: "#007bff",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "500",
    padding: "8px 12px",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  };

  const activeLinkStyle = {
    ...linkStyle,
    backgroundColor: "#007bff",
    color: "white",
  };

  const userInfoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    fontSize: "14px",
    color: "#666",
  };

  const avatarStyle = {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#007bff",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
  };

  const getInitials = (user) => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <Link to="/" style={logoStyle}>
          Daily Planner
        </Link>

        {currentUser && (
          <nav style={navLinksStyle}>
            <Link to="/" style={isActive("/") ? activeLinkStyle : linkStyle}>
              Daily
            </Link>
            <Link
              to="/weekly"
              style={isActive("/weekly") ? activeLinkStyle : linkStyle}
            >
              Weekly
            </Link>
            <Link
              to="/settings"
              style={isActive("/settings") ? activeLinkStyle : linkStyle}
            >
              Settings
            </Link>

            <div style={userInfoStyle}>
              <span>
                Welcome,{" "}
                {currentUser.displayName || currentUser.email?.split("@")[0]}
              </span>
              <div style={avatarStyle}>{getInitials(currentUser)}</div>
              <Link
                to="/account"
                style={isActive("/account") ? activeLinkStyle : linkStyle}
              >
                Account
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default NavigationHeader;
