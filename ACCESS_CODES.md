# Access Codes Reference 🎫

## Participant Access Codes

Share these codes with your participants:

| Participant Name | Access Code |
|-----------------|-------------|
| John Doe | `PARTY2024` |
| Jane Smith | `COOL123` |
| Mike Johnson | `FUN456` |
| Sarah Williams | `STAR789` |
| Chris Brown | `VOTE2024` |
| Emily Davis | `GRAD2024` |
| David Wilson | `BEST2024` |
| Lisa Anderson | `AWARD123` |

## How to Use

1. Go to http://localhost:3000
2. Enter one of the codes above
3. Start voting!

## Adding More Codes

### Option 1: Via Admin Dashboard
1. Visit http://localhost:3000/admin
2. Use the "Add New Participant" form
3. Enter name and create a unique code

### Option 2: Edit JSON File
1. Edit `data/participants.json`
2. Add new entry:
   ```json
   { "name": "New Person", "code": "UNIQUE123" }
   ```
3. Run `npm run seed`

## Code Rules

- Codes are **case-insensitive** (stored as uppercase)
- Must be **unique**
- Can contain letters and numbers
- Recommended: 6-10 characters
- Examples: `GRAD2024`, `BEST123`, `FUN456`

## Distribution Ideas

### For Print
Print this table and distribute to participants:

```
┌─────────────────────────────────────┐
│    BET AWARDS 2024 - YOUR CODE     │
├─────────────────────────────────────┤
│                                     │
│  Name: ____________________         │
│                                     │
│  Code: ____________________         │
│                                     │
│  Visit: localhost:3000              │
│                                     │
└─────────────────────────────────────┘
```

### For Digital
Send via email/message:

```
Hi [Name]!

You're invited to vote in the BET Awards 2024!

Your access code: YOURCODE123

Visit: http://localhost:3000
Enter your code and start voting!

Have fun! 🎉
```

### For Display
Create a QR code linking to:
```
http://localhost:3000
```

Then display the codes on a screen/projector.

---

**Remember**: Each code can only be used once for voting!
