import * as functions from 'firebase-functions';
import * as EntryModel from '../../src/models/Entry';

export const scheduledFunctionCrontab = functions.pubsub
  .schedule('0 4 * * *')
  .timeZone('America/Los_Angeles')
  .onRun(async () => {
    const activeEntries = await EntryModel.getAllEntries(null, true);

    for (const entry of activeEntries) {
      console.log(
        `Signing out ${entry.accountId} for season ${entry.seasonId}`,
      );

      try {
        await EntryModel.signOut(entry.accountId, entry.seasonId, true);
      } catch (e) {
        console.error(
          `Failed to sign out ${entry.accountId} for season ${entry.seasonId}`,
        );
        console.error(e);
      }
    }

    return null;
  });
