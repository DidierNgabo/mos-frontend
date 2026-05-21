import { createAsyncThunk } from '@reduxjs/toolkit';
import { TeamsSource } from '@/app/source';

export const fetchTeams = createAsyncThunk(
  'teams/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await TeamsSource.fetchTeamsRequest(params);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Request failed');
    }
  },
);

export const createTeam = createAsyncThunk(
  'teams/create',
  async (data: unknown, { rejectWithValue }) => {
    try {
      return await TeamsSource.createTeamRequest(data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Create failed');
    }
  },
);

export const updateTeam = createAsyncThunk(
  'teams/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try {
      return await TeamsSource.updateTeamRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Update failed');
    }
  },
);

export const deleteTeam = createAsyncThunk(
  'teams/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await TeamsSource.deleteTeamRequest(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Delete failed');
    }
  },
);
