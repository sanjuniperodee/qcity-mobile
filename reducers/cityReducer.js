
const initialState = {
  selectedCity: 'Весь Казахстан',
};

export default function cityReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_CITY':
      return {
        ...state,
        selectedCity: action.payload,
      };
    default:
      return state;
  }
}
