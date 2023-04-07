import React from "react";

// Import component
import Menu from "./Menu";

// Import custom stylesheet
import "../App.css";

// Function to display header
function Header(props) {
  return (
    <header className="header">
      <div className="logoAndHeading">
        <h1>Chronicles & Musings</h1>
      </div>

      {/* Displays menu links */}
      <Menu loggedIn={props.loggedIn} adminStatus={props.adminStatus} />
    </header>
  );
}

// Export component to be used in other files
export default Header;
