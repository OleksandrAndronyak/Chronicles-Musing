import React, { useState } from "react";
import FacebookLogin from "react-facebook-login";
import "../App.css";

/* References to get app id and make all work 
    https://www.youtube.com/watch?v=8m1M3AW5bBE
*/
function FacebookLoginComponent(props) {
  const [login, setLogin] = useState(false);

  const responseFacebook = (response) => {
    console.log(response);
    // Login failed
    if (response.status === "unknown") {
      alert("Login failed!");
      setLogin(false);
      return false;
    }

    if (response.accessToken) {
      setLogin(true);
      props.handleFacebookLogin(response.name, true, response.userID);
    } else {
      setLogin(false);
    }
  };

  return (
    <div>
      {!login && (
        <FacebookLogin
          appId="1162082511122613"
          autoLoad={false}
          fields="name,picture"
          scope="public_profile"
          callback={responseFacebook}
          icon="fa-facebook"
        />
      )}
    </div>
  );
}

export default FacebookLoginComponent;
