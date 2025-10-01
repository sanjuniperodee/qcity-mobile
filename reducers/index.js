import { combineReducers } from 'redux';
import authReducer from './authReducer';
import { api } from '../api';
import cityReducer from './cityReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  city: cityReducer, 
  [api.reducerPath]: api.reducer,
});


export default rootReducer;