const sessions = new Map();

const saveSession = (fingerprint, sessionData) => {
  sessions.set(fingerprint, sessionData);
};

const getSession = (fingerprint) => {
  return sessions.get(fingerprint);
};

const deleteSession = (fingerprint) => {
  sessions.delete(fingerprint);
};

const clearSessions = () => {
  sessions.clear();
};

module.exports = { saveSession, getSession, deleteSession, clearSessions };