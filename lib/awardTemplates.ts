export interface AwardTemplate {
  title: string;
  description: string;
  emoji: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  awards: AwardTemplate[];
}

export const AWARD_TEMPLATES: Record<string, Template> = {
  'bet-awards': {
    id: 'bet-awards',
    name: 'BET Awards',
    description: 'Classic superlative awards for your group',
    awards: [
      {
        title: 'Best Dressed',
        description: 'Who always shows up looking like a runway model?',
        emoji: '👔'
      },
      {
        title: 'Class Clown',
        description: 'Who keeps everyone laughing?',
        emoji: '🤡'
      },
      {
        title: 'Most Likely to Be Famous',
        description: 'Who will we see on TV one day?',
        emoji: '⭐'
      },
      {
        title: 'Life of the Party',
        description: 'Who brings the energy to every gathering?',
        emoji: '🎉'
      },
      {
        title: 'Most Likely to Sleep Through Class',
        description: 'Who needs an extra-loud alarm?',
        emoji: '😴'
      },
      {
        title: 'Best Bromance/Friendship',
        description: 'Which duo is inseparable?',
        emoji: '👯'
      },
      {
        title: 'Most Athletic',
        description: 'Who dominates on the field?',
        emoji: '🏆'
      },
      {
        title: 'Most Dramatic',
        description: 'Who could win an Oscar for everyday life?',
        emoji: '🎭'
      },
      {
        title: 'Best Smile',
        description: 'Whose smile lights up the room?',
        emoji: '😁'
      },
      {
        title: 'Most Likely to Take Over the World',
        description: 'Who has big plans and the drive to achieve them?',
        emoji: '🌎'
      }
    ]
  },
  'superlatives': {
    id: 'superlatives',
    name: 'Classic Superlatives',
    description: 'Traditional yearbook-style awards',
    awards: [
      {
        title: 'Most Likely to Succeed',
        description: 'Who has the brightest future ahead?',
        emoji: '🚀'
      },
      {
        title: 'Best Hair',
        description: 'Who has the most enviable locks?',
        emoji: '💇'
      },
      {
        title: 'Teacher\'s Pet',
        description: 'Who always sits in the front row?',
        emoji: '📚'
      },
      {
        title: 'Most School Spirit',
        description: 'Who bleeds school colors?',
        emoji: '📣'
      },
      {
        title: 'Most Artistic',
        description: 'Who sees the world through a creative lens?',
        emoji: '🎨'
      },
      {
        title: 'Best Car',
        description: 'Who rolls up in style?',
        emoji: '🚗'
      },
      {
        title: 'Most Musical',
        description: 'Who always has a song in their heart?',
        emoji: '🎵'
      },
      {
        title: 'Best Eyes',
        description: 'Who has the most captivating gaze?',
        emoji: '👁️'
      },
      {
        title: 'Most Talkative',
        description: 'Who never runs out of things to say?',
        emoji: '💬'
      },
      {
        title: 'Most Changed Since Freshman Year',
        description: 'Who had the biggest glow-up?',
        emoji: '✨'
      }
    ]
  },
  'custom': {
    id: 'custom',
    name: 'Custom Awards',
    description: 'Start from scratch and create your own awards',
    awards: []
  }
};

export function getTemplate(templateId: string): Template | null {
  return AWARD_TEMPLATES[templateId] || null;
}

export function getAllTemplates(): Template[] {
  return Object.values(AWARD_TEMPLATES);
}
