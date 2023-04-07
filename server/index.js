// Require modules
const express = require("express");
const path = require("path");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const helmet = require("helmet");

const isDev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 3001;

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`
    );
  });
} else {
  const app = express();

  /* Use Helmet middleware to improve security

  All the custom Content security policy settings were necessary because the Google and Facebook login buttons were causing so many errors.

  https://stackoverflow.com/questions/70752770/helmet-express-err-blocked-by-response-notsameorigin-200

  https://helmetjs.github.io/

  https://drupal.stackexchange.com/questions/302192/
  how-do-i-configure-content-security-policy-for-base64-images

  
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors

  */
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          "script-src-elem": [
            "'self'",
            "https://connect.facebook.net",
            "https://www.facebook.com",
            "https://apis.google.com",
            "https://accounts.google.com",
          ],
          "frame-src": ["'self'", "https://accounts.google.com"],
          "connect-src": [
            "'self'",
            "https://www.facebook.com",
            "https://web.facebook.com",
            "https://z-p3-graph.facebook.com",
            "https://graph.facebook.com",
          ],
          "img-src": ["'self'", "data:", "https://web.facebook.com"],
          "frame-ancestors": ["'self'", "https://www.facebook.com"],
        },
      },
    })
  );

  // Use bodyparser to send data in body of http request
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Set path to .env file
  dotenv.config({ path: ".env" });

  // Priority serve any static files.
  app.use(express.static(path.resolve(__dirname, "../react-ui/build")));

  //Import routes
  require("../routes/api")(app);
  require("../routes/getposts")(app);
  require("../routes/getlogins")(app);
  require("../routes/login")(app);
  require("../routes/register")(app);
  require("../routes/resource")(app);
  require("../routes/addpost")(app);
  require("../routes/deletepost")(app);
  require("../routes/updatepost")(app);

  // MongoDB connection
  mongoose.set("strictQuery", false);

  mongoose.Promise = global.Promise;

  // Initial connection to db and error handling if initial connection fails
  mongoose
    .connect(process.env.DB_CONNECTION_STRING)
    .catch((error) =>
      console.log("Failed initial connection to db. Error is: " + error)
    );

  // process.env.MONGODB_URI ||

  // Message if success in connecting to db
  mongoose.connection.once("open", function () {
    console.log("Successfully connected to the database");
  });

  // Error handling if connection to db fails after an initially successful connection
  mongoose.connection.on("error", (error) => {
    if (error) {
      console.log("An error occurred after initial connection to db: " + error);
    } else {
      console.log("Connection Established");
    }
  });

  // All remaining requests return the React app, so it can handle routing.
  app.get("*", function (request, response) {
    response.sendFile(
      path.resolve(__dirname, "../react-ui", "build", "index.html")
    );
  });

  app.listen(PORT, () => {
    console.error(
      `Node ${
        isDev ? "dev server" : "cluster worker " + process.pid
      }: listening on port ${PORT}`
    );
  });
}
