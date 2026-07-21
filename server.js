import http from 'http'
import app from "./src/app.js"

import  { config } from "./src/config/config.js"
import connectDB from "./src/config/db.js"
import { expirePendingBookings } from "./src/controllers/instantBooking.controller.js"

const server = http.createServer(app);

const PORT = config.PORT || 3000

connectDB()

setInterval(() => {
    expirePendingBookings().catch((error) => {
        console.error("Booking expiry check failed:", error);
    });
}, 60_000);

server.listen( PORT, ()=>{
    console.log(`server is running at port : ${PORT}`);
})


