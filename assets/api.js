const baseUrl = '';

//pas fonctionnel mais c'est un exemple.
const api = {
  // send gesture
  sendGesture: (type) => fetch(`${baseUrl}/api/v1/device/gesture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, timestamp: Date.now() })
  }),

  // get weather
  getWeather: () => fetch(`${baseUrl}/api/v1/widgets/weather?units=metric`, { 
    method: 'GET' 
  }),

  // get astronomy
  getAstronomy: () => fetch(`${baseUrl}/api/v1/widgets/astronomy`, { 
    method: 'GET' 
  }),

  // update widget
  updateWidget: (active_widget) => fetch(`${baseUrl}/api/v1/settings/widget`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active_widget })
  }),

  // update gesture
  updateGesture: (gesture, action) => fetch(`${baseUrl}/api/v1/settings/gestures/${gesture}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  }),

  // update audio
  updateAudio: (voice_id, wake_word_enabled) => fetch(`${baseUrl}/api/v1/settings/audio`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voice_id, wake_word_enabled })
  }),

  // set personality
  setPersonality: (trait) => fetch(`${baseUrl}/api/v1/ai/personality`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trait })
  }),

  // run script
  runSelfDrive: (action) => fetch(`${baseUrl}/api/v1/ai/selfdrive/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  }),

  // get history list
  getHistory: () => fetch(`${baseUrl}/api/v1/history/conversations`, { 
    method: 'GET' 
  }),

  // get conversation
  getConversation: (id) => fetch(`${baseUrl}/api/v1/history/conversations/${id}`, { 
    method: 'GET' 
  }),

  // sync workspace
  syncWorkspace: (token) => fetch(`${baseUrl}/api/v1/integrations/workspace/sync`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  }),

  // check firmware
  checkFirmware: () => fetch(`${baseUrl}/api/v1/system/firmware`, { 
    method: 'GET' 
  })
};

export default api;