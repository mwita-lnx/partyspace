# Quick Setup Guide 🚀

## Step-by-Step Instructions

### 1. Make sure MongoDB is installed and running

#### On Ubuntu/Linux:
```bash
# Install MongoDB (if not installed)
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongod

# Check status
sudo systemctl status mongod
```

#### On macOS:
```bash
# Install MongoDB (if not installed)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Check if running
brew services list
```

### 2. Install Dependencies
```bash
cd "/home/lnx/Desktop/projects/bet awards/bet-awards"
npm install
```

### 3. Check Environment Variables
The `.env.local` file should already exist with:
```
MONGODB_URI=mongodb://localhost:27017/bet-awards
```

If you're using MongoDB Atlas, replace with your connection string.

### 4. Seed the Database
```bash
npm run seed
```

You should see:
```
Connected to MongoDB
Cleared existing data
Seeded 8 participants
Seeded 6 awards
Database seeded successfully!
```

### 5. Start the Development Server
```bash
npm run dev
```

### 6. Test the Application

Open your browser and test these URLs:

1. **Login Page**: http://localhost:3000
   - Try code: `PARTY2024`

2. **Voting Page**: After login, you'll be redirected here
   - Vote for your favorites!

3. **Admin Dashboard**: http://localhost:3000/admin
   - View participants
   - See all votes
   - Check results

## Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# If not running, start it
sudo systemctl start mongod
```

### Issue: "Module not found"
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Invalid access code"
**Solution:**
```bash
# Re-seed the database
npm run seed
```

### Issue: Port 3000 is already in use
**Solution:**
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or run on a different port
PORT=3001 npm run dev
```

## Sample Data

### Participants & Access Codes:
- John Doe - `PARTY2024`
- Jane Smith - `COOL123`
- Mike Johnson - `FUN456`
- Sarah Williams - `STAR789`
- Chris Brown - `VOTE2024`
- Emily Davis - `GRAD2024`
- David Wilson - `BEST2024`
- Lisa Anderson - `AWARD123`

### Award Categories:
1. 🎉 Most Fun Person
2. 👔 Best Dressed
3. 🤡 Class Clown
4. 💼 Most Likely to Succeed
5. 🏆 MVP - Most Valuable Player
6. 😁 Best Smile

## Next Steps

1. **Customize participants**: Edit `data/participants.json` and re-run `npm run seed`
2. **Customize awards**: Edit `data/awards.json` and re-run `npm run seed`
3. **Add more participants**: Use the admin dashboard at `/admin`
4. **Share access codes**: Give participants their unique codes
5. **Have fun voting!** 🎉

## Pro Tips

- The admin page has no authentication by default - add security for production!
- Participants can update their votes before submitting
- Confetti triggers on successful login and vote submission
- The app is fully responsive - works great on mobile too!

---

**Need help?** Check the main [README.md](README.md) for more details!
