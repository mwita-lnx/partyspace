export interface RoomHistory {
  roomId: string;
  roomCode: string;
  roomName: string;
  gameType: string;
  role: 'host' | 'participant';
  joinedAt: string;
  status?: string;
}

export function saveRoomToHistory(room: RoomHistory) {
  if (typeof window === 'undefined') return;

  const historyData = localStorage.getItem('roomHistory');
  let history: RoomHistory[] = [];

  if (historyData) {
    try {
      history = JSON.parse(historyData);
    } catch (error) {
      console.error('Error parsing room history:', error);
    }
  }

  // Check if room already exists
  const existingIndex = history.findIndex(h => h.roomId === room.roomId);
  if (existingIndex >= 0) {
    history[existingIndex] = room;
  } else {
    history.unshift(room);
  }

  // Keep only last 50 rooms
  history = history.slice(0, 50);

  localStorage.setItem('roomHistory', JSON.stringify(history));
}

export function getRoomHistory(): RoomHistory[] {
  if (typeof window === 'undefined') return [];

  const historyData = localStorage.getItem('roomHistory');
  if (!historyData) return [];

  try {
    return JSON.parse(historyData);
  } catch (error) {
    console.error('Error loading room history:', error);
    return [];
  }
}

export function clearRoomHistory() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('roomHistory');
}

export function removeRoomFromHistory(roomId: string) {
  if (typeof window === 'undefined') return;

  const history = getRoomHistory();
  const updated = history.filter(r => r.roomId !== roomId);
  localStorage.setItem('roomHistory', JSON.stringify(updated));
}
