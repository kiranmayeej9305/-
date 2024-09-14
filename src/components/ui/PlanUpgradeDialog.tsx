// components/PlanUpgradeDialog.tsx
import React, { useState } from 'react';

const PlanUpgradeDialog: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);

  const handleUpgradeClick = () => {
    setShowDialog(true);
  };

  return (
    <>
      <button onClick={handleUpgradeClick}>Upgrade Plan</button>
      {showDialog && (
        <div className="dialog">
          <h2>Upgrade Your Plan</h2>
          <p>Upgrade to access more features.</p>
          <button>Upgrade Now</button>
          <button onClick={() => setShowDialog(false)}>Cancel</button>
        </div>
      )}
    </>
  );
};
