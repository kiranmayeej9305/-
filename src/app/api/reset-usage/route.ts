import { resetUsageForAllAccounts } from '@/lib/queries'; // Import your reset function

export default async function handler(req, res) {
  try {
    const { features } = req.body; // Expects an array of feature identifiers

    if (!features || !Array.isArray(features)) {
      return res.status(400).json({ error: 'Feature identifiers are required.' });
    }

    // Reset usage for all accounts for the specified features
    await resetUsageForAllAccounts(features);

    res.status(200).json({ message: 'Usage reset successfully for specified features' });
  } catch (error) {
    console.error('Error resetting usage:', error);
    res.status(500).json({ error: 'Failed to reset usage' });
  }
}
