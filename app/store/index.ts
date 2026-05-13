import { createSelector } from '@reduxjs/toolkit';

import auth from './auth';
import users from './users';
import roles from './roles';
import outreaches from './outreaches';
import patients from './patients';
import stations from './stations';
import vitalSigns from './vital-signs';
import outreachContext from './outreach-context';
import pharmacyStock from './pharmacy-stock';
import queueEntries from './queue-entries';
import observations from './observations';
import labResults from './lab-results';
import communicableDiseases from './communicable-diseases';
import transfers from './transfers';
import prescriptions from './prescriptions';
import phq9Screenings from './phq9-screenings';
import gad7Screenings from './gad7-screenings';
import pcl5Screenings from './pcl5-screenings';
import { RootState } from '../core/store';

export const appSelector = createSelector(
  (state: RootState) => state,
  (state) => state,
);

const storeModules = {
  auth,
  users,
  roles,
  outreaches,
  patients,
  stations,
  vitalSigns,
  outreachContext,
  pharmacyStock,
  queueEntries,
  observations,
  labResults,
  communicableDiseases,
  transfers,
  prescriptions,
  phq9Screenings,
  gad7Screenings,
  pcl5Screenings,
};

export default storeModules;
