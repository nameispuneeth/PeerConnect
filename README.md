# PeerConnect

A cross-platform mobile peer-to-peer student marketplace built for residential university campuses — where students can book peer tutoring sessions or buy/sell secondhand items, with every transaction backed by OTP-verified physical delivery confirmation.

## Why PeerConnect

Campuses like RGUKT already have the ingredients for peer-to-peer exchange — students who can tutor, and students with notes, books, and gadgets to sell — but no trusted way to transact. WhatsApp groups and bulletin boards have no booking confirmation, no payment security, no delivery verification, and no reputation system. PeerConnect fixes this with a coin-based economy where money only moves once both parties have physically met and confirmed the exchange via OTP.

## Features

- Peer tutoring marketplace — list and book sessions by subject, location, timeslot, and cost
- Secondhand item store with real-time auction-style bidding
- OTP-based delivery confirmation for both courses and items — coins move only after physical handover
- Auto-refund for course bookings that expire without verification
- In-app coin economy — every new user starts with 200 coins
- Explore & search across users, courses, and items
- Seller/tutor profile view to check reputation before transacting
- JWT + bcrypt based authentication

## Tech Stack

- **Frontend:** React Native (Expo), TypeScript, NativeWind (Tailwind CSS)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Auth:** JWT, bcrypt
- **Other:** AsyncStorage, Expo Image Picker

## How It Works

**Course Marketplace**
1. A student lists a tutoring session with subject, topics, location, timeslot, duration, and cost.
2. Another student books it — coins are deducted immediately and a 6-digit OTP is generated.
3. The OTP is visible to the buyer 10 minutes before the session and for 60 minutes after.
4. The tutor enters the OTP after the session to confirm it happened, releasing the coins.
5. If the timeslot expires without verification, the tutor can trigger an auto-refund to the buyer.

**Student Store**
1. A seller lists an item with a starting price and up to 3 photos.
2. Other students place escalating bids.
3. The seller assigns the winner — coins are deducted and a delivery OTP is generated.
4. The buyer shows the OTP at pickup; the seller enters it to claim the coins.

## API Endpoints

| Endpoint | Description |
|---|---|
| `POST /api/auth/register` | Register a new student |
| `POST /api/auth/login` | Authenticate and return a JWT |
| `GET /api/user/profile` | Get profile with populated courses/items |
| `POST /api/user/addcourse` | Create a course listing |
| `GET /api/user/getallcourses` | Get all courses posted by others |
| `POST /api/user/buycourse` | Book a course, deduct coins, generate OTP |
| `GET /api/user/getotp/:courseId` | Get course OTP (within the visibility window) |
| `POST /api/user/verifyotp` | Tutor confirms session, receives coins |
| `POST /api/user/refundcourse` | Refund an expired, unverified course |
| `POST /api/user/additem` | Create a store item listing |
| `GET /api/user/getallitems` | Get all items posted by others |
| `POST /api/user/makebid` | Place a bid on an item |
| `POST /api/user/assignwinner` | Seller assigns the auction winner |
| `GET /api/user/getitemotp/:itemId` | Buyer gets the delivery OTP |
| `POST /api/user/verifyitemotp` | Seller verifies OTP at delivery, receives coins |
| `GET /api/user/search` | Search users, courses, and items by keyword |
| `GET /api/user/seller-details/:userId` | View a seller's profile and history |


## Future Enhancements

- Push notifications for bookings, bids, and OTP events
- Post-transaction ratings & reviews
- In-app chat between buyer and seller
- Scheduled, fully automated refund job
- Cloud deployment (AWS/Railway + MongoDB Atlas)
- Coin top-up via UPI/Razorpay
- Admin dashboard for marketplace analytics
