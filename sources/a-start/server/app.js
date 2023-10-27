// if not production use dotenv
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Assume this is utils/jwt.js
const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET);
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
// End of Assumption

// Assume this is utils/bcrypt.js
const bcrypt = require("bcryptjs");

const comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};
// End of Assumption

// Assume this is middlewares/authenticate.js
// const { Credential } = require("../models");
const authentication = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    console.log(req.headers);

    if (!authorization) {
      throw new Error("NOT_AUTHENTICATED");
    }

    const bearerToken = authorization.split(" ")[1];
    const decoded = verifyToken(bearerToken);

    const foundUser = await Credential.findByPk(decoded.id);

    if (!foundUser) {
      throw new Error("NOT_AUTHENTICATED");
    }

    req.user = {
      id: foundUser.id,
      username: foundUser.username,
    };

    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// End of Assumption

// ?? New Middlewares: multer to handle file upload from client
const multer = require("multer");

// Now we will use diskStorage to store the file
// File will be stored at /uploads folder
const upload = multer({
  dest: "uploads/",
});

const middlewareUpload = upload.single("file");
// End of Assumption

// Main file start here
const cors = require("cors");
const express = require("express");
const { Credential, Todo } = require("./models");

const port = process.env.PORT || 3000;
const app = express();

// middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ?? Since we're using multer to /uploads folder
// ?? We need to open the folder to public and serve it as static
app.use("/uploads", express.static("uploads"));

// routes
app.get("/", (req, res) => {
  res.status(200).json({
    statusCode: 200,
    message: "Pong !",
  });
});

app.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const { password: newPassword, ...newUser } = (
      await Credential.create({
        username,
        email,
        password,
      })
    ).dataValues;

    res.status(201).json({
      statusCode: 201,
      message: "User created",
      data: newUser,
    });
  } catch (err) {
    next(err);
  }
});

app.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const foundUser = await Credential.findOne({
      where: {
        email,
      },
    });

    if (!foundUser || !comparePassword(password, foundUser.password)) {
      throw new Error("INVALID_EMAIL_OR_PASSWORD");
    }

    const payload = {
      id: foundUser.id,
    };

    const token = generateToken(payload);

    res.status(200).json({
      statusCode: 200,
      message: "Login success",
      data: {
        access_token: token,
      },
    });
  } catch (err) {
    next(err);
  }
});

app.get("/private", authentication, async (req, res, next) => {
  try {
    const todos = await Todo.findAll();

    res.status(200).json({
      statusCode: 200,
      message: "Data from private route !",
      data: {
        todos,
        user: req.user,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ?? New Routes: handle file upload
app.post(
  "/private",
  // We will include the authentication
  authentication,
  // We will include the middlewareUpload
  middlewareUpload,
  async (req, res, next) => {
    try {
      console.log(req.file);
      console.log(req.body);
    } catch (err) {
      next(err);
    }
  }
);

// error handler
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    statusCode = 400;
    message = err.errors[0].message;
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "You are not authenticated";
  } else if (err.message === "INVALID_EMAIL_OR_PASSWORD") {
    statusCode = 400;
    message = "Invalid email or password";
  } else if (err.message === "NOT_AUTHENTICATED") {
    statusCode = 401;
    message = "You are not authenticated";
  }

  res.status(statusCode).json({
    statusCode,
    error: {
      message,
    },
  });
});

// listener
app.listen(port, () => {
  console.log(`Apps is running on port ${port}`);
});
