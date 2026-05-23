const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* ---------------- REGISTER ---------------- */
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashed = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO users (username, email, password, points, tier, bookings) VALUES ($1, $2, $3, $4, $5, $6)",
            [username, email, hashed, 0, "Bronze", 0]
        );

        res.json({ success: true });

    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
});
/* ---------------- LOGIN ---------------- */
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log("LOGIN ATTEMPT:", email);

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            console.log("NO USER FOUND");
            return res.json({ success: false, message: "User not found" });
        }

        const user = result.rows[0];

        console.log("USER FOUND:", user.email);

        const match = await bcrypt.compare(password, user.password);

        console.log("PASSWORD MATCH:", match);

        if (!match) {
            return res.json({
                success: false,
                message: "Wrong password"
            });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.json({
            success: true,
            token
        });



    } catch (err) {
        console.log(err);
        return res.json({ success: false, message: "Server error" });
    }
});

/* ---------------- GET USER ---------------- */
app.get("/me", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) return res.json({ success: false });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await pool.query(
            "SELECT username, email, points, tier, birthday, bookings FROM users WHERE id = $1",
            [decoded.id]
        );

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

