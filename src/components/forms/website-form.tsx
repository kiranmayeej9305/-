import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Trash2 } from 'lucide-react';

const WebsiteForm = ({ setValid, onFormChange }) => {
  const [urlType, setUrlType] = useState<'sitemap' | 'website' | 'url'>('website');
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState<{ link: string, charCount: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isValid, setIsValid] = useState(false);

  const handleUrlTypeChange = (e) => {
    const type = e.target.value;
    setUrlType(type);
    setLinks([]);
    setUrl('');
    setIsValid(false);
  };

  const handleUrlChange = (e) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    setIsValid(isValidURL(inputUrl));
  };

  const handleCrawl = async () => {
    if (!isValidURL(url)) return;
    setLoading(true);
    setProgress(0);

    const intervalId = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 500);

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        body: JSON.stringify({ url, type: urlType }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok && data.links) {
        const fetchedLinks = data.links.map(link => ({
          link,
          charCount: link.length, // Replace with actual content length if needed
        }));
        setLinks(fetchedLinks);
        onFormChange({ content: fetchedLinks }, 'website');
        setProgress(100);
      } else {
        setLinks([]);
        setProgress(0);
      }
    } catch (error) {
      console.error('Error during crawling:', error);
      setLinks([]);
      setProgress(0);
    } finally {
      clearInterval(intervalId);
      setLoading(false);
    }
  };

  const handleAddLink = () => {
    if (isValidURL(url)) {
      const newLink = { link: url, charCount: url.length }; // Replace with actual content length if needed
      setLinks([...links, newLink]);
      onFormChange({ content: [...links, newLink] }, 'website');
      setUrl('');
    }
  };

  const handleDeleteLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    onFormChange({ content: newLinks }, 'website');
  };

  const isValidURL = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select
          value={urlType}
          onChange={handleUrlTypeChange}
          className="border rounded p-2"
        >
          <option value="website">Website</option>
          <option value="sitemap">Sitemap</option>
          <option value="url">URL</option>
        </select>

        <Input
          value={url}
          onChange={handleUrlChange}
          placeholder={urlType === 'url' ? 'Enter a URL' : `Enter the ${urlType} URL`}
          className={isValid ? '' : 'border-red-500'}
        />

        <Button onClick={urlType === 'url' ? handleAddLink : handleCrawl} disabled={loading || !isValid}>
          {urlType === 'url' ? 'Add URL' : (loading ? 'Crawling...' : 'Crawl')}
        </Button>
      </div>

      {!isValid && url && (
        <p className="text-red-500 text-sm">Please enter a valid URL.</p>
      )}

      {loading && <Progress value={progress} />}

      {links.length > 0 && !loading && (
        <div className="mt-4">
          <h4 className="font-bold mb-2">Links Found:</h4>
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Link</th>
                <th className="py-2 px-4 border-b">Character Count</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b">{link.link}</td>
                  <td className="py-2 px-4 border-b text-center">{link.charCount}</td>
                  <td className="py-2 px-4 border-b text-center">
                    <Button variant="ghost" onClick={() => handleDeleteLink(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WebsiteForm;
