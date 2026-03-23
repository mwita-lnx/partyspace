export interface GameQuestion {
  title: string;
  description: string;
  emoji: string;
  type?: 'voting' | 'opinion' | 'trivia' | 'multiple-choice' | 'ranking' | 'open-ended' | 'drawing' | 'photo-upload' | 'speed-challenge' | 'true-false';
  timeLimit?: number; // in seconds
  options?: string[]; // For multiple-choice and opinion questions
  correctAnswer?: string; // For trivia questions
}

export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  category: 'awards' | 'trivia' | 'icebreaker' | 'party' | 'team-building' | 'creative' | 'question-based' | 'reaction' | 'custom';
  emoji: string;
  color: string;
  questions: GameQuestion[];
  minPlayers: number;
  maxPlayers: number;
  duration: string;
}

export const GAME_TEMPLATES: Record<string, GameTemplate> = {
  // QUESTION-BASED GAMES
  'bet-awards': {
    id: 'bet-awards',
    name: 'BET Awards',
    description: 'Classic superlative awards for your group - who\'s the most likely to succeed, best dressed, and more!',
    category: 'question-based',
    emoji: '🏆',
    color: '#FFE66D',
    minPlayers: 3,
    maxPlayers: 100,
    duration: '15-20 min',
    questions: [
      { title: 'Best Dressed', description: 'Who always shows up looking like a runway model?', emoji: '👔', type: 'voting' },
      { title: 'Class Clown', description: 'Who keeps everyone laughing?', emoji: '🤡', type: 'voting' },
      { title: 'Most Likely to Be Famous', description: 'Who will we see on TV one day?', emoji: '⭐', type: 'voting' },
      { title: 'Life of the Party', description: 'Who brings the energy to every gathering?', emoji: '🎉', type: 'voting' },
      { title: 'Most Athletic', description: 'Who dominates on the field?', emoji: '🏅', type: 'voting' },
      { title: 'Best Smile', description: 'Whose smile lights up the room?', emoji: '😁', type: 'voting' }
    ]
  },
  'superlatives': {
    id: 'superlatives',
    name: 'Classic Superlatives',
    description: 'Traditional yearbook-style awards perfect for schools, teams, or friend groups',
    category: 'awards',
    emoji: '⭐',
    color: '#FF6B6B',
    minPlayers: 3,
    maxPlayers: 100,
    duration: '15-20 min',
    questions: [
      { title: 'Most Likely to Succeed', description: 'Who has the brightest future ahead?', emoji: '🚀' },
      { title: 'Best Hair', description: 'Who has the most enviable locks?', emoji: '💇' },
      { title: 'Most School Spirit', description: 'Who bleeds school colors?', emoji: '📣' },
      { title: 'Most Artistic', description: 'Who sees the world through a creative lens?', emoji: '🎨' },
      { title: 'Most Musical', description: 'Who always has a song in their heart?', emoji: '🎵' }
    ]
  },
  'office-awards': {
    id: 'office-awards',
    name: 'Office Awards',
    description: 'Fun workplace superlatives for team building and celebrations',
    category: 'awards',
    emoji: '💼',
    color: '#4ECDC4',
    minPlayers: 3,
    maxPlayers: 50,
    duration: '10-15 min',
    questions: [
      { title: 'Coffee Champion', description: 'Who runs on caffeine?', emoji: '☕', type: 'voting' },
      { title: 'Most Likely to Reply All', description: 'Email etiquette? Never heard of it!', emoji: '📧', type: 'voting' },
      { title: 'Meeting Meme Lord', description: 'Who has the perfect GIF for every situation?', emoji: '😂', type: 'voting' },
      { title: 'Zoom Background Champion', description: 'Always has the most creative background', emoji: '🖼️', type: 'voting' },
      { title: 'Snack Supplier', description: 'Keeps the team well-fed', emoji: '🍪', type: 'voting' }
    ]
  },
  'team-builder-awards': {
    id: 'team-builder-awards',
    name: 'Team Builder Awards',
    description: 'Recognition awards perfect for team bonding and morale',
    category: 'awards',
    emoji: '🤝',
    color: '#16A085',
    minPlayers: 3,
    maxPlayers: 50,
    duration: '10-15 min',
    questions: [
      { title: 'Best Problem Solver', description: 'Who always finds a solution?', emoji: '🧩', type: 'voting' },
      { title: 'Most Supportive', description: 'Always there for teammates', emoji: '💪', type: 'voting' },
      { title: 'Innovation Champion', description: 'Brings the best ideas', emoji: '💡', type: 'voting' },
      { title: 'Communication Pro', description: 'Keeps everyone in the loop', emoji: '📢', type: 'voting' },
      { title: 'Culture Carrier', description: 'Embodies team spirit', emoji: '⭐', type: 'voting' }
    ]
  },

  'most-likely-to': {
    id: 'most-likely-to',
    name: 'Most Likely To...',
    description: 'Hilarious predictions about your friends - who\'s most likely to do what?',
    category: 'question-based',
    emoji: '🤔',
    color: '#FF8C42',
    minPlayers: 3,
    maxPlayers: 50,
    duration: '10-15 min',
    questions: [
      { title: 'Most Likely to Become President', description: 'Who has political ambitions?', emoji: '🏛️' },
      { title: 'Most Likely to Win the Lottery', description: 'Lucky or just optimistic?', emoji: '💰' },
      { title: 'Most Likely to Travel the World', description: 'Wanderlust is real!', emoji: '✈️' },
      { title: 'Most Likely to Adopt 10 Dogs', description: 'Animal lover extraordinaire', emoji: '🐕' },
      { title: 'Most Likely to Sleep Through an Alarm', description: 'Chronic snoozer!', emoji: '⏰' },
      { title: 'Most Likely to Go Viral', description: 'Future internet sensation', emoji: '📱' }
    ]
  },
  'would-you-rather': {
    id: 'would-you-rather',
    name: 'Would You Rather',
    description: 'Vote on impossible choices and see what the group thinks!',
    category: 'question-based',
    emoji: '🤷',
    color: '#9B59B6',
    minPlayers: 2,
    maxPlayers: 100,
    duration: '10 min',
    questions: [
      { title: 'Time Travel', description: 'Visit the past or see the future?', emoji: '⏰' },
      { title: 'Superpower', description: 'Fly or be invisible?', emoji: '🦸' },
      { title: 'Location', description: 'Beach or mountains?', emoji: '🏖️' },
      { title: 'Food Forever', description: 'Pizza or tacos for life?', emoji: '🍕' },
      { title: 'Entertainment', description: 'Movies or music?', emoji: '🎬' }
    ]
  },
  'hot-takes': {
    id: 'hot-takes',
    name: 'Hot Takes',
    description: 'Share controversial opinions and see who agrees with you!',
    category: 'question-based',
    emoji: '🔥',
    color: '#E74C3C',
    minPlayers: 3,
    maxPlayers: 50,
    duration: '15 min',
    questions: [
      { title: 'Pineapple on Pizza', description: 'Is it acceptable?', emoji: '🍍', type: 'true-false' },
      { title: 'Cereal is Soup', description: 'Agree or disagree?', emoji: '🥣', type: 'true-false' },
      { title: 'Hot Dogs are Sandwiches', description: 'Settle this debate', emoji: '🌭', type: 'true-false' },
      { title: 'Die Hard is a Christmas Movie', description: 'What\'s the verdict?', emoji: '🎄', type: 'true-false' },
      { title: 'Toilet Paper Over or Under', description: 'There\'s only one right answer', emoji: '🧻', type: 'multiple-choice' }
    ]
  },
  'this-or-that': {
    id: 'this-or-that',
    name: 'This or That',
    description: 'Quick preference questions - swipe left or right on your choices!',
    category: 'question-based',
    emoji: '↔️',
    color: '#2ECC71',
    minPlayers: 2,
    maxPlayers: 100,
    duration: '10 min',
    questions: [
      { title: 'Coffee or Tea', description: 'Pick your morning drink', emoji: '☕', type: 'multiple-choice' },
      { title: 'Cats or Dogs', description: 'The ultimate pet debate', emoji: '🐱', type: 'multiple-choice' },
      { title: 'Sweet or Savory', description: 'What\'s your taste?', emoji: '🍰', type: 'multiple-choice' },
      { title: 'Morning or Night', description: 'When are you most alive?', emoji: '🌅', type: 'multiple-choice' },
      { title: 'Books or Movies', description: 'How do you like your stories?', emoji: '📚', type: 'multiple-choice' }
    ]
  },

  // PARTY GAMES
  'two-truths-one-lie': {
    id: 'two-truths-one-lie',
    name: 'Two Truths & A Lie',
    description: 'Everyone shares 3 statements - guess which one is the lie!',
    category: 'party',
    emoji: '🎭',
    color: '#3498DB',
    minPlayers: 3,
    maxPlayers: 20,
    duration: '20 min',
    questions: [
      { title: 'Share Your Stories', description: 'Write 2 truths and 1 lie about yourself', emoji: '✍️' },
      { title: 'Guess the Lie', description: 'Vote on which statement is false', emoji: '🤔' }
    ]
  },
  'never-have-i-ever': {
    id: 'never-have-i-ever',
    name: 'Never Have I Ever',
    description: 'Reveal experiences and see who\'s done what!',
    category: 'party',
    emoji: '🙈',
    color: '#1ABC9C',
    minPlayers: 3,
    maxPlayers: 30,
    duration: '15 min',
    questions: [
      { title: 'Never Have I Ever... Traveled Abroad', description: 'Have you left the country?', emoji: '✈️' },
      { title: 'Never Have I Ever... Met a Celebrity', description: 'Brushed with fame?', emoji: '⭐' },
      { title: 'Never Have I Ever... Gone Skydiving', description: 'Adrenaline junkie?', emoji: '🪂' },
      { title: 'Never Have I Ever... Been on TV', description: '15 minutes of fame?', emoji: '📺' },
      { title: 'Never Have I Ever... Broken a Bone', description: 'Accident prone?', emoji: '🩹' }
    ]
  },
  'ranking-game': {
    id: 'ranking-game',
    name: 'Rank It!',
    description: 'Rank your favorites and see if the group agrees with your taste',
    category: 'party',
    emoji: '📊',
    color: '#F39C12',
    minPlayers: 2,
    maxPlayers: 50,
    duration: '10 min',
    questions: [
      { title: 'Rank Fast Food Chains', description: 'Order your favorites', emoji: '🍔', type: 'ranking' },
      { title: 'Rank Seasons', description: 'Winter, Spring, Summer, Fall', emoji: '🍂', type: 'ranking' },
      { title: 'Rank Social Media Apps', description: 'What\'s your go-to?', emoji: '📱', type: 'ranking' },
      { title: 'Rank Pizza Toppings', description: 'The ultimate pizza hierarchy', emoji: '🍕', type: 'ranking' }
    ]
  },
  'scavenger-hunt': {
    id: 'scavenger-hunt',
    name: 'Scavenger Hunt',
    description: 'Find items and upload photos - fastest wins!',
    category: 'party',
    emoji: '🔍',
    color: '#27AE60',
    minPlayers: 2,
    maxPlayers: 20,
    duration: '20-30 min',
    questions: [
      { title: 'Something Red', description: 'Find and photograph something red in your space', emoji: '🔴', type: 'photo-upload', timeLimit: 120 },
      { title: 'Childhood Memory', description: 'Photo of something from your childhood', emoji: '🧸', type: 'photo-upload', timeLimit: 180 },
      { title: 'Creative Shadow', description: 'Take a creative shadow photo', emoji: '🌑', type: 'photo-upload', timeLimit: 120 },
      { title: 'Funny Face', description: 'Make the funniest face!', emoji: '😜', type: 'photo-upload', timeLimit: 60 },
      { title: 'Pet or Plant', description: 'Show us your pet or favorite plant', emoji: '🐾', type: 'photo-upload', timeLimit: 90 }
    ]
  },
  'caption-contest': {
    id: 'caption-contest',
    name: 'Caption This!',
    description: 'Write funny captions for images - vote on the best ones!',
    category: 'party',
    emoji: '💬',
    color: '#E67E22',
    minPlayers: 3,
    maxPlayers: 30,
    duration: '15-20 min',
    questions: [
      { title: 'Funny Animal Photo', description: 'Write the funniest caption for this animal', emoji: '🐱', type: 'open-ended' },
      { title: 'Awkward Moment', description: 'Caption this awkward situation', emoji: '😬', type: 'open-ended' },
      { title: 'Vintage Photo', description: 'What were they thinking?', emoji: '📸', type: 'open-ended' },
      { title: 'Random Object', description: 'Make this object interesting!', emoji: '🎲', type: 'open-ended' }
    ]
  },
  'charades-digital': {
    id: 'charades-digital',
    name: 'Digital Charades',
    description: 'Act it out on camera! Others guess what you\'re doing',
    category: 'party',
    emoji: '🎭',
    color: '#3498DB',
    minPlayers: 3,
    maxPlayers: 15,
    duration: '20-30 min',
    questions: [
      { title: 'Movie Titles', description: 'Act out famous movie titles', emoji: '🎬', type: 'voting', timeLimit: 60 },
      { title: 'Animals', description: 'Become the animal!', emoji: '🦁', type: 'voting', timeLimit: 45 },
      { title: 'Occupations', description: 'Show us what you do', emoji: '👷', type: 'voting', timeLimit: 60 },
      { title: 'Song Titles', description: 'Act out hit songs', emoji: '🎵', type: 'voting', timeLimit: 60 }
    ]
  },

  // TRIVIA
  'pop-culture-trivia': {
    id: 'pop-culture-trivia',
    name: 'Pop Culture Trivia',
    description: 'Test your knowledge of movies, music, and viral moments!',
    category: 'question-based',
    emoji: '🎬',
    color: '#E91E63',
    minPlayers: 2,
    maxPlayers: 50,
    duration: '15-20 min',
    questions: [
      { title: 'Movie Quotes', description: 'Can you name the film?', emoji: '🎥', type: 'multiple-choice' },
      { title: 'Music Lyrics', description: 'Finish the song!', emoji: '🎵', type: 'multiple-choice' },
      { title: 'Celebrity Facts', description: 'Who said what?', emoji: '⭐', type: 'multiple-choice' },
      { title: 'Viral Moments', description: 'Remember this trend?', emoji: '📱', type: 'multiple-choice' }
    ]
  },
  'speed-trivia': {
    id: 'speed-trivia',
    name: 'Speed Trivia',
    description: 'Quick-fire questions! First to answer correctly wins points',
    category: 'question-based',
    emoji: '⚡',
    color: '#F1C40F',
    minPlayers: 2,
    maxPlayers: 30,
    duration: '10-15 min',
    questions: [
      { title: 'Geography Speed Round', description: 'Name capital cities as fast as you can!', emoji: '🌍', type: 'speed-challenge', timeLimit: 10 },
      { title: 'Math Lightning', description: 'Solve quick calculations!', emoji: '🔢', type: 'speed-challenge', timeLimit: 15 },
      { title: 'Word Association', description: 'Type the first word that comes to mind!', emoji: '💭', type: 'speed-challenge', timeLimit: 5 },
      { title: 'True or False Blitz', description: 'Answer as many as you can!', emoji: '✅', type: 'true-false', timeLimit: 30 }
    ]
  },
  'guess-the-song': {
    id: 'guess-the-song',
    name: 'Guess the Song',
    description: 'Name that tune! Identify songs from lyrics or short clips',
    category: 'trivia',
    emoji: '🎵',
    color: '#8E44AD',
    minPlayers: 2,
    maxPlayers: 50,
    duration: '15 min',
    questions: [
      { title: 'Guess from Lyrics', description: 'Name the song from these lyrics', emoji: '📝', type: 'multiple-choice' },
      { title: 'Finish the Lyrics', description: 'Complete the next line', emoji: '🎤', type: 'open-ended' },
      { title: 'Artist Match', description: 'Who sang this song?', emoji: '🎸', type: 'multiple-choice' },
      { title: 'Year Challenge', description: 'What year was this released?', emoji: '📅', type: 'multiple-choice' }
    ]
  },

  // TEAM BUILDING
  'team-challenges': {
    id: 'team-challenges',
    name: 'Team Challenges',
    description: 'Collaborative games that bring your team closer together',
    category: 'team-building',
    emoji: '🎯',
    color: '#16A085',
    minPlayers: 4,
    maxPlayers: 30,
    duration: '20-30 min',
    questions: [
      { title: 'Team Trivia', description: 'Work together to answer questions', emoji: '🧠', type: 'multiple-choice' },
      { title: 'Group Consensus', description: 'Vote as a team on preferences', emoji: '🤝', type: 'ranking' },
      { title: 'Team Story Building', description: 'Each person adds one sentence', emoji: '📖', type: 'open-ended' },
      { title: 'Collective Memory', description: 'Remember team moments together', emoji: '💭', type: 'voting' }
    ]
  },
  'workplace-fun': {
    id: 'workplace-fun',
    name: 'Workplace Fun',
    description: 'Light-hearted games perfect for office morale and virtual teams',
    category: 'team-building',
    emoji: '🏢',
    color: '#2980B9',
    minPlayers: 3,
    maxPlayers: 50,
    duration: '15 min',
    questions: [
      { title: 'Desk Show & Tell', description: 'Show something unique from your workspace', emoji: '🖥️', type: 'photo-upload', timeLimit: 120 },
      { title: 'Coffee Break Chat', description: 'Share your favorite break time activity', emoji: '☕', type: 'open-ended' },
      { title: 'Office Playlist', description: 'What song pumps you up for work?', emoji: '🎵', type: 'open-ended' },
      { title: 'Remote Background Tour', description: 'Give us a tour of your workspace!', emoji: '🏠', type: 'photo-upload', timeLimit: 90 }
    ]
  },

  // CREATIVE CHALLENGES
  'draw-and-guess': {
    id: 'draw-and-guess',
    name: 'Draw & Guess',
    description: 'Sketch quick drawings and let others guess what they are!',
    category: 'creative',
    emoji: '✏️',
    color: '#E91E63',
    minPlayers: 3,
    maxPlayers: 20,
    duration: '20 min',
    questions: [
      { title: 'Draw an Animal', description: 'Sketch any animal in 60 seconds', emoji: '🦁', type: 'drawing', timeLimit: 60 },
      { title: 'Draw a Movie', description: 'Illustrate a famous film', emoji: '🎬', type: 'drawing', timeLimit: 90 },
      { title: 'Draw an Emotion', description: 'Express a feeling through art', emoji: '😊', type: 'drawing', timeLimit: 60 },
      { title: 'Draw Your Dream House', description: 'What does home look like?', emoji: '🏡', type: 'drawing', timeLimit: 120 }
    ]
  },
  'photo-challenges': {
    id: 'photo-challenges',
    name: 'Photo Challenges',
    description: 'Creative photography tasks with fun prompts',
    category: 'creative',
    emoji: '📸',
    color: '#9B59B6',
    minPlayers: 2,
    maxPlayers: 30,
    duration: '20-25 min',
    questions: [
      { title: 'From Your Perspective', description: 'Capture your unique view', emoji: '👁️', type: 'photo-upload', timeLimit: 120 },
      { title: 'Minimalist Shot', description: 'Less is more - simple beauty', emoji: '⚪', type: 'photo-upload', timeLimit: 150 },
      { title: 'Nature Close-Up', description: 'Macro photography of nature', emoji: '🌿', type: 'photo-upload', timeLimit: 180 },
      { title: 'Color Splash', description: 'Find the most colorful thing nearby', emoji: '🌈', type: 'photo-upload', timeLimit: 120 },
      { title: 'Symmetry Hunt', description: 'Find perfect symmetry', emoji: '🦋', type: 'photo-upload', timeLimit: 150 }
    ]
  },
  'story-time': {
    id: 'story-time',
    name: 'Story Time',
    description: 'Collaborative storytelling and creative writing challenges',
    category: 'creative',
    emoji: '📚',
    color: '#F39C12',
    minPlayers: 3,
    maxPlayers: 20,
    duration: '15-20 min',
    questions: [
      { title: 'Six-Word Story', description: 'Tell a story in exactly six words', emoji: '✍️', type: 'open-ended', timeLimit: 120 },
      { title: 'Plot Twist', description: 'Add an unexpected turn to the story', emoji: '🔄', type: 'open-ended', timeLimit: 150 },
      { title: 'Character Creation', description: 'Invent a memorable character', emoji: '🎭', type: 'open-ended', timeLimit: 180 },
      { title: 'Ending Vote', description: 'Choose the best story conclusion', emoji: '🏁', type: 'voting' }
    ]
  },

  // REACTION GAMES
  'color-match': {
    id: 'color-match',
    name: 'Color Match',
    description: 'Tap the correct color as fast as you can! Test your reflexes',
    category: 'reaction',
    emoji: '🎨',
    color: '#FF6B9D',
    minPlayers: 1,
    maxPlayers: 50,
    duration: '5-8 min',
    questions: [
      { title: 'Red Rush', description: 'Tap all red items!', emoji: '🔴', type: 'speed-challenge', timeLimit: 10 },
      { title: 'Blue Blitz', description: 'Find the blue ones!', emoji: '🔵', type: 'speed-challenge', timeLimit: 10 },
      { title: 'Green Go', description: 'Spot the green!', emoji: '🟢', type: 'speed-challenge', timeLimit: 10 },
      { title: 'Rainbow Round', description: 'Match all colors!', emoji: '🌈', type: 'speed-challenge', timeLimit: 15 },
      { title: 'Color Chaos', description: 'Random color challenge!', emoji: '🎯', type: 'speed-challenge', timeLimit: 12 }
    ]
  },
  'tap-battle': {
    id: 'tap-battle',
    name: 'Tap Battle',
    description: 'Who can tap the fastest? Speed vs accuracy challenge',
    category: 'reaction',
    emoji: '👆',
    color: '#FFA07A',
    minPlayers: 2,
    maxPlayers: 30,
    duration: '5-10 min',
    questions: [
      { title: 'Speed Tap', description: 'Tap as many times as you can!', emoji: '⚡', type: 'speed-challenge', timeLimit: 10 },
      { title: 'Accuracy Test', description: 'Tap only the correct targets!', emoji: '🎯', type: 'speed-challenge', timeLimit: 15 },
      { title: 'Rhythm Tap', description: 'Follow the rhythm pattern!', emoji: '🥁', type: 'speed-challenge', timeLimit: 20 },
      { title: 'Double Tap', description: 'Tap twice on each target!', emoji: '👆👆', type: 'speed-challenge', timeLimit: 12 },
      { title: 'Final Fury', description: 'Ultimate tapping challenge!', emoji: '💥', type: 'speed-challenge', timeLimit: 15 }
    ]
  },
  'quick-math': {
    id: 'quick-math',
    name: 'Quick Math',
    description: 'Lightning-fast mental math challenges. Can you calculate faster than your friends?',
    category: 'reaction',
    emoji: '🔢',
    color: '#20B2AA',
    minPlayers: 1,
    maxPlayers: 50,
    duration: '8-12 min',
    questions: [
      { title: 'Addition Sprint', description: 'Solve additions quickly!', emoji: '➕', type: 'speed-challenge', timeLimit: 8 },
      { title: 'Subtraction Speed', description: 'Fast subtraction problems!', emoji: '➖', type: 'speed-challenge', timeLimit: 8 },
      { title: 'Multiplication Madness', description: 'Times tables under pressure!', emoji: '✖️', type: 'speed-challenge', timeLimit: 10 },
      { title: 'Division Dash', description: 'Quick division challenges!', emoji: '➗', type: 'speed-challenge', timeLimit: 10 },
      { title: 'Mixed Operations', description: 'Random math problems!', emoji: '🧮', type: 'speed-challenge', timeLimit: 12 }
    ]
  },
  'word-race': {
    id: 'word-race',
    name: 'Word Race',
    description: 'Type words as fast as possible. Speed and spelling combined!',
    category: 'reaction',
    emoji: '⌨️',
    color: '#FFB347',
    minPlayers: 1,
    maxPlayers: 40,
    duration: '6-10 min',
    questions: [
      { title: 'Speed Type', description: 'Type the word before time runs out!', emoji: '💨', type: 'speed-challenge', timeLimit: 5 },
      { title: 'Scramble Solve', description: 'Unscramble the letters!', emoji: '🔤', type: 'speed-challenge', timeLimit: 10 },
      { title: 'Word Chain', description: 'Start with the last letter!', emoji: '🔗', type: 'speed-challenge', timeLimit: 8 },
      { title: 'Rhyme Time', description: 'Type a word that rhymes!', emoji: '🎵', type: 'speed-challenge', timeLimit: 7 },
      { title: 'Category Sprint', description: 'Name items in a category!', emoji: '📝', type: 'speed-challenge', timeLimit: 15 }
    ]
  },
  'memory-flash': {
    id: 'memory-flash',
    name: 'Memory Flash',
    description: 'Remember sequences and patterns shown briefly. Train your memory!',
    category: 'reaction',
    emoji: '🧠',
    color: '#BA55D3',
    minPlayers: 1,
    maxPlayers: 50,
    duration: '10-15 min',
    questions: [
      { title: 'Number Sequence', description: 'Remember the numbers!', emoji: '🔢', type: 'speed-challenge', timeLimit: 10 },
      { title: 'Pattern Match', description: 'Recall the pattern!', emoji: '🎨', type: 'speed-challenge', timeLimit: 12 },
      { title: 'Color Order', description: 'Remember the color sequence!', emoji: '🌈', type: 'speed-challenge', timeLimit: 8 },
      { title: 'Word List', description: 'How many words can you recall?', emoji: '📋', type: 'speed-challenge', timeLimit: 15 },
      { title: 'Image Memory', description: 'Remember the positions!', emoji: '🖼️', type: 'speed-challenge', timeLimit: 10 }
    ]
  },
  'reflex-test': {
    id: 'reflex-test',
    name: 'Reflex Test',
    description: 'Pure reaction speed. Click or tap as soon as you see the signal!',
    category: 'reaction',
    emoji: '⚡',
    color: '#FF4500',
    minPlayers: 1,
    maxPlayers: 30,
    duration: '5-8 min',
    questions: [
      { title: 'Green Light', description: 'React when it turns green!', emoji: '🟢', type: 'speed-challenge', timeLimit: 3 },
      { title: 'Sound Response', description: 'Tap when you hear the beep!', emoji: '🔊', type: 'speed-challenge', timeLimit: 3 },
      { title: 'Shape Shift', description: 'React to shape changes!', emoji: '🔷', type: 'speed-challenge', timeLimit: 4 },
      { title: 'Direction Change', description: 'Follow the arrow quickly!', emoji: '➡️', type: 'speed-challenge', timeLimit: 5 },
      { title: 'Multi-Stimulus', description: 'React to any signal!', emoji: '💫', type: 'speed-challenge', timeLimit: 6 }
    ]
  },

  // CUSTOM
  'custom': {
    id: 'custom',
    name: 'Custom Game',
    description: 'Start from scratch and create your own unique game with custom questions',
    category: 'custom',
    emoji: '✨',
    color: '#95A5A6',
    minPlayers: 2,
    maxPlayers: 500,
    duration: 'Your choice',
    questions: []
  }
};

export const GAME_CATEGORIES = [
  { id: 'question-based', name: 'Question-Based Games', emoji: '🏆', image: '/quiz.gif', color: '#FFE66D', description: 'Vote, answer, and decide on questions and scenarios' },
  { id: 'reaction', name: 'Reaction Games', emoji: '⚡', image: '/competition.gif', color: '#FF4500', description: 'Fast-paced speed and reflex challenges' },
  { id: 'awards', name: 'Awards & Superlatives', emoji: '🏆', image: '/podium.gif', color: '#FFE66D', description: 'Vote for the best, funniest, and most memorable people' },
  { id: 'icebreaker', name: 'Icebreakers', emoji: '🤔', image: '/declaration.gif', color: '#FF8C42', description: 'Break the ice and get to know each other better' },
  { id: 'party', name: 'Party Games', emoji: '🎉', image: '/festival.gif', color: '#4ECDC4', description: 'Interactive games with photos, captions, and challenges' },
  { id: 'trivia', name: 'Trivia & Quizzes', emoji: '🧠', image: '/quiz.gif', color: '#9B59B6', description: 'Test your knowledge with quick or deep trivia' },
  { id: 'team-building', name: 'Team Building', emoji: '🤝', image: '/office.png', color: '#16A085', description: 'Strengthen bonds with collaborative activities' },
  { id: 'creative', name: 'Creative Challenges', emoji: '🎨', image: '/idea.gif', color: '#E91E63', description: 'Express yourself through drawing, photos, and captions' },
  { id: 'custom', name: 'Custom', emoji: '✨', image: '/gaming.gif', color: '#95A5A6', description: 'Create your own unique game from scratch' }
];

export function getGameTemplate(templateId: string): GameTemplate | null {
  return GAME_TEMPLATES[templateId] || null;
}

export function getAllGameTemplates(): GameTemplate[] {
  return Object.values(GAME_TEMPLATES);
}

export function getGameTemplatesByCategory(category: string): GameTemplate[] {
  return Object.values(GAME_TEMPLATES).filter(t => t.category === category);
}

export function getGameCategories() {
  return GAME_CATEGORIES;
}
