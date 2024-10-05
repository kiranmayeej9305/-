import { useState, useEffect } from 'react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    sendEmailNotifications: false
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(response => response.json())
      .then(data => setSettings(data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings({ ...settings, [name]: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });
    alert('Settings updated');
  };

  return (
    <div>
      <h1>Settings</h1>
      <form onSubmit={handleSubmit}>
        <label>
          <input 
            type="checkbox" 
            name="sendEmailNotifications" 
            checked={settings.sendEmailNotifications} 
            onChange={handleChange} 
          />
          Send Email Notifications
        </label>
        <button type="submit">Save Settings</button>
      </form>
    </div>
  );
};

export default Settings;
