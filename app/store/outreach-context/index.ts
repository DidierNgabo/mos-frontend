import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ActiveOutreach {
  id: string;
  name: string;
  location: string;
  status: string;
}

interface OutreachContextState {
  activeOutreachId: string | null;
  activeOutreach: ActiveOutreach | null;
  availableOutreaches: ActiveOutreach[];
}

const readSession = (): { outreach: ActiveOutreach | null; available: ActiveOutreach[] } => {
  if (typeof window === 'undefined') return { outreach: null, available: [] };
  try {
    const outreach = sessionStorage.getItem('activeOutreach');
    const available = sessionStorage.getItem('availableOutreaches');
    return {
      outreach: outreach ? JSON.parse(outreach) : null,
      available: available ? JSON.parse(available) : [],
    };
  } catch {
    return { outreach: null, available: [] };
  }
};

const session = readSession();

const initialState: OutreachContextState = {
  activeOutreachId: session.outreach?.id ?? null,
  activeOutreach: session.outreach,
  availableOutreaches: session.available,
};

const outreachContextSlice = createSlice({
  name: 'outreachContext',
  initialState,
  reducers: {
    setActiveOutreach(state, action: PayloadAction<ActiveOutreach | null>) {
      state.activeOutreach = action.payload;
      state.activeOutreachId = action.payload?.id ?? null;
      if (typeof window !== 'undefined') {
        if (action.payload) {
          sessionStorage.setItem('activeOutreach', JSON.stringify(action.payload));
        } else {
          sessionStorage.removeItem('activeOutreach');
        }
      }
    },
    setAvailableOutreaches(state, action: PayloadAction<ActiveOutreach[]>) {
      state.availableOutreaches = action.payload;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('availableOutreaches', JSON.stringify(action.payload));
      }
    },
    clearOutreachContext(state) {
      state.activeOutreach = null;
      state.activeOutreachId = null;
      state.availableOutreaches = [];
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('activeOutreach');
        sessionStorage.removeItem('availableOutreaches');
      }
    },
  },
});

export const { setActiveOutreach, setAvailableOutreaches, clearOutreachContext } =
  outreachContextSlice.actions;
export default outreachContextSlice.reducer;
