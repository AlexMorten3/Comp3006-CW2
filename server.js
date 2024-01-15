const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const Movie = require("./models/movieModel");
const User = require("./models/userModel");
const Ticket = require("./models/ticketModel");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

const port = 3000;
mongoose.connect("mongodb://localhost:27017/cinemaDatabase");

mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
    console.error(`MongoDB connection error: ${err}`);
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));



// Registration route
app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already taken" });
        }

        const newUser = new User({
            username,
            password,
            isAdmin: false,
        });

        await newUser.save();

        res.status(200).json({ message: "Registration successful!" });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// Login route
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            res.status(401).json({ error: "User not found" });
            return;
        }

        if (user.password !== password) {
            res.status(401).json({ error: "Incorrect password" });
            return;
        }

        res.status(200).json({
            message: "Login successful!",
            user: {
                username: user.username,
                isAdmin: user.isAdmin,
            },
        });
        console.log("Logged in with:", { username, password });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Fetch all movies
app.get("/api/movies", async (req, res) => {
    try {
        const movies = await Movie.find();
        res.status(200).json(movies);
    } catch (error) {
        console.error("Error fetching movies:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Add a new movie
app.post("/api/movies", async (req, res) => {
    const movieData = req.body;

    try {
        const newMovie = new Movie(movieData);
        await newMovie.save();

        res.status(200).json({ message: "Movie added successfully" });
    } catch (error) {
        console.error("Error adding movie:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Remove a movie
app.delete("/api/movies/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const deletedMovie = await Movie.findByIdAndDelete(id);

        if (!deletedMovie) {
            return res.status(404).json({ error: "Movie not found" });
        }

        res.status(200).json({ message: "Movie deleted successfully" });
    } catch (error) {
        console.error("Error deleting movie:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Fetch all users
app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Remove a user
app.delete("/api/users/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Edit a user
app.put("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    const updatedUserData = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, {
            new: true,
        });

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", updatedUser });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Fetch user profile
app.get("/api/profile/:username", async (req, res) => {
    const { username } = req.params;

    try {
        const userProfile = await User.findOne(
            { username },
            "username email isAdmin"
        );

        if (!userProfile) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(userProfile);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});





// Remove a booking
app.delete("/api/tickets/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const deletedBooking = await Booking.findByIdAndDelete(id);

        if (!deletedBooking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

let selectedMovies = {
    A: null,
    B: null,
};



// book movie
app.post("/api/tickets", async (req, res) => {
    console.log("Request Payload:", req.body);
    const bookingData = req.body;

    try {
        if (!bookingData.selectedMovie) {
            return res.status(400).json({ error: "Movie is required for booking" });
        }

        // Fetch the movie data based on the selected movie title (added this part)
        const movie = await Movie.findOne({ title: bookingData.selectedMovie });

        if (!movie) {
            console.error("Movie not found");
            return res.status(404).json({ error: "Movie not found" });
        }

        // Create a new booking using the provided data
        const newBooking = new Booking({
            ...bookingData,
            user: req.body.user,
            movie: movie._id,
        });

        await newBooking.save();

        const userId = mongoose.Types.ObjectId.isValid(bookingData.user)
            ? mongoose.Types.ObjectId(bookingData.user)
            : null;

        // Add the booking information to the user's moviesBooked array
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    moviesBooked: {
                        movie: movie._id,
                    },
                },
            },
            { new: true }
        );

        res
            .status(200)
            .json({ message: "Booking added successfully", updatedUser });

    } catch (error) {
        console.error("Error adding booking:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.set("socketio", io);

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});



module.exports = app;