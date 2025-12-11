# BET Awards 2024 - University Celebration 🎉

A fun, Kahoot-style voting application for your university's BET Awards ceremony! Vote for your favorite classmates in various categories with confetti, colorful animations, and a playful design.

## Features ✨

- **Kahoot-Style Login**: Participants enter with unique access codes
- **Fun Animations**: Confetti explosions, floating emojis, and smooth transitions
- **Multiple Award Categories**: Most Fun, Best Dressed, Class Clown, and more!
- **Real-Time Voting**: Vote for nominees in each category
- **Admin Dashboard**: Add participants, view all votes, and see results
- **MongoDB Database**: Persistent storage for participants, awards, and votes
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack 🛠️

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **Animations**: canvas-confetti
- **Icons**: react-icons
- **Language**: TypeScript

## Getting Started 🚀

### Prerequisites

- Node.js 18+ installed
- MongoDB installed and running locally (or a MongoDB Atlas connection)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:

   The `.env.local` file is already created with:
   ```
   MONGODB_URI=mongodb://localhost:27017/bet-awards
   ```

   If you're using MongoDB Atlas or a different connection, update this value.

3. **Start MongoDB** (if running locally):
   ```bash
   # On Linux/Mac
   sudo systemctl start mongod

   # Or if installed via brew on Mac
   brew services start mongodb-community
   ```

4. **Seed the database**:
   ```bash
   npm run seed
   ```

   This will populate the database with:
   - 8 sample participants with access codes
   - 6 award categories with nominees

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## Usage 📱

### For Participants

1. Go to `http://localhost:3000`
2. Enter your access code (e.g., `PARTY2024`, `COOL123`, etc.)
3. Vote for your favorite nominees in each category
4. Submit your votes and enjoy the confetti celebration! 🎊

### Sample Access Codes

The seeded database includes these participants and codes:

- John Doe - `PARTY2024`
- Jane Smith - `COOL123`
- Mike Johnson - `FUN456`
- Sarah Williams - `STAR789`
- Chris Brown - `VOTE2024`
- Emily Davis - `GRAD2024`
- David Wilson - `BEST2024`
- Lisa Anderson - `AWARD123`

### For Administrators

1. Go to `http://localhost:3000/admin`
2. View three tabs:
   - **Participants**: Add new participants, view voting status, delete participants
   - **All Votes**: See all votes cast by everyone
   - **Results**: View vote counts and winners for each award

**No authentication required for admin page** - make sure to protect this in production!

## Award Categories 🏆

The seeded database includes:

1. 🎉 Most Fun Person
2. 👔 Best Dressed
3. 🤡 Class Clown
4. 💼 Most Likely to Succeed
5. 🏆 MVP - Most Valuable Player
6. 😁 Best Smile

## Project Structure 📁

```
bet-awards/
├── app/
│   ├── api/
│   │   ├── auth/login/         # Login authentication
│   │   ├── awards/             # Fetch awards
│   │   ├── vote/               # Submit and fetch votes
│   │   ├── results/            # Get voting results
│   │   └── admin/              # Admin endpoints
│   ├── vote/                   # Voting page
│   ├── admin/                  # Admin dashboard
│   ├── thank-you/              # Thank you page
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Login page
├── models/
│   ├── Participant.ts          # Participant model
│   ├── Award.ts                # Award model
│   └── Vote.ts                 # Vote model
├── lib/
│   └── mongodb.ts              # MongoDB connection
├── data/
│   ├── participants.json       # Sample participants
│   └── awards.json             # Sample awards
└── scripts/
    └── seed.ts                 # Database seeding script
```

## Customization 🎨

### Add More Participants

You can add participants in two ways:

1. **Via Admin Dashboard**: Go to `/admin` and use the "Add New Participant" form

2. **Edit the seed data**:
   - Modify `data/participants.json`
   - Run `npm run seed` again

### Add More Award Categories

1. Edit `data/awards.json`
2. Add new award objects with:
   ```json
   {
     "title": "Award Title",
     "description": "Award description",
     "emoji": "🎯",
     "nominees": ["Person 1", "Person 2", "Person 3", "Person 4"]
   }
   ```
3. Run `npm run seed` again

### Change Colors

The app uses Tailwind CSS gradients. Main color schemes:

- **Login Page**: `from-purple-600 via-pink-500 to-orange-400`
- **Voting Page**: `from-blue-500 via-purple-500 to-pink-500`
- **Admin Page**: `from-gray-900 via-purple-900 to-blue-900`

Edit these in the respective page files to change the look!

## Production Deployment 🌐

### Important Security Notes

Before deploying to production:

1. **Add authentication to admin routes**
2. **Set secure environment variables**
3. **Use a production MongoDB database** (MongoDB Atlas recommended)
4. **Enable HTTPS**
5. **Add rate limiting to prevent spam voting**

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
4. Deploy!

## Scripts 📜

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Seed the database
- `npm run lint` - Run ESLint

## Troubleshooting 🔧

### MongoDB Connection Error

If you get a connection error:
- Make sure MongoDB is running
- Check that `MONGODB_URI` in `.env.local` is correct
- Try: `mongodb://127.0.0.1:27017/bet-awards` instead of localhost

### "Participant not found" on login

Run the seed script again:
```bash
npm run seed
```

### Confetti not showing

Make sure you're on a modern browser that supports canvas. Confetti uses the `canvas-confetti` library.

## Contributing 🤝

This is a fun university project! Feel free to:
- Add more award categories
- Improve the UI/UX
- Add more animations
- Implement voting limits or time restrictions

## License 📄

Free to use for educational and fun purposes!

## Credits 👏

Built with love for the Class of 2024! 🎓

---

**Have fun voting!** 🎉🏆✨
