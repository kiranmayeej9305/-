import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

const WebsiteForm = ({ onFormChange, setValid }) => {
  const [websites, setWebsites] = useState([{ url: '', valid: true }]);

  const handleChange = (e, index) => {
    const newWebsites = [...websites];
    const url = e.target.value;
    const valid = isValidURL(url);
    newWebsites[index] = { url, valid };
    setWebsites(newWebsites);
    onFormChange(newWebsites.map((w) => w.url), 'website');
  };

  const handleAddWebsite = () => {
    const newWebsites = [...websites, { url: '', valid: false }];
    setWebsites(newWebsites);
    onFormChange(newWebsites.map((w) => w.url));
  };

  const handleRemoveWebsite = (index) => {
    const newWebsites = websites.filter((_, i) => i !== index);
    setWebsites(newWebsites);
    onFormChange(newWebsites.map((w) => w.url));
  };

  const isValidURL = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  useEffect(() => {
    const allValid = websites.every((website) => website.valid && website.url !== '');
    setValid(allValid && websites.length > 0);
  }, [websites, setValid]);

  return (
    <div className="space-y-4">
      {websites.map((website, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Input
            value={website.url}
            onChange={(e) => handleChange(e, index)}
            placeholder={`Website ${index + 1}`}
            className={website.valid ? '' : 'border-red-500'}
          />
          {!website.valid && (
            <p className="text-red-500 text-sm">Please enter a valid URL.</p>
          )}
          <div className="flex justify-end gap-2">
            <Button onClick={() => handleRemoveWebsite(index)} variant="ghost" type="button">
              <Trash2 className="h-4 w-4" />
              Remove Website
            </Button>
          </div>
        </div>
      ))}
      <div className="flex justify-end gap-2">
        <Button onClick={handleAddWebsite}>
          <Plus className="h-4 w-4" />
          Add Website
        </Button>
      </div>
    </div>
  );
};

export default WebsiteForm;
